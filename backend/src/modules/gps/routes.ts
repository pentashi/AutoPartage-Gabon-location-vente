import { GpsCommandStatus, GpsCommandType, Prisma, VehicleStatus } from "@prisma/client";
import { randomUUID } from "crypto";
import { Router } from "express";
import { z } from "zod";
import { env } from "../../config/env";
import { prisma } from "../../config/prisma";
import { HttpError, asyncHandler } from "../../utils/http";
import { GpsService } from "./gps.service";

const commandSchema = z.object({
  idempotencyKey: z.string().min(8).max(120).optional(),
  reason: z.string().max(500).optional()
});

const ingestSchema = z.object({
  vehicleId: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  speedKph: z.number().nonnegative().optional(),
  ignitionOn: z.boolean().optional(),
  trackerOnline: z.boolean().optional(),
  recordedAt: z.coerce.date().optional()
});

const gpsRouter = Router();

// --- External API Proxies (39gps.com) ---

gpsRouter.get(
  "/external/location",
  asyncHandler(async (req, res) => {
    const ids = req.query.ids as string;
    if (!ids) throw new HttpError(400, "Device IDs required");
    const data = await GpsService.getDeviceLocations(ids);
    res.json(data);
  })
);

gpsRouter.get(
  "/external/playback",
  asyncHandler(async (req, res) => {
    const id = req.query.id as string;
    const date = req.query.date as string;
    if (!id) throw new HttpError(400, "Device ID required");
    const data = await GpsService.getPlayback(id, date);
    res.json(data);
  })
);

gpsRouter.get(
  "/external/alarms",
  asyncHandler(async (req, res) => {
    const id = req.query.id as string;
    const rows = Number(req.query.rows || 10);
    const page = Number(req.query.page || 1);
    if (!id) throw new HttpError(400, "Device ID required");
    const data = await GpsService.getAlarms(id, rows, page);
    res.json(data);
  })
);

gpsRouter.post(
  "/external/command",
  asyncHandler(async (req, res) => {
    const { devId, cmdType, cmdCategory, cmdBody } = req.body;
    if (!devId || !cmdType) throw new HttpError(400, "Missing parameters");
    const data = await GpsService.sendCommand(devId, cmdType, cmdCategory, cmdBody);
    res.json(data);
  })
);

gpsRouter.get(
  "/external/travel",
  asyncHandler(async (req, res) => {
    const id = req.query.id as string;
    const date = req.query.date as string;
    if (!id || !date) throw new HttpError(400, "ID and date required");
    const data = await GpsService.getTravel(id, date);
    res.json(data);
  })
);

gpsRouter.get(
  "/external/obd",
  asyncHandler(async (req, res) => {
    const id = req.query.id as string;
    if (!id) throw new HttpError(400, "Device ID required");
    const data = await GpsService.getObdData(id);
    res.json(data);
  })
);

// --- Local Data & Existing Logic ---

gpsRouter.post(
  "/locations/ingest",
  asyncHandler(async (req, res) => {
    const payload = ingestSchema.parse(req.body);

    const location = await prisma.gpsLocation.create({
      data: {
        ...payload,
        latitude: new Prisma.Decimal(payload.latitude),
        longitude: new Prisma.Decimal(payload.longitude),
        speedKph: payload.speedKph !== undefined ? new Prisma.Decimal(payload.speedKph) : undefined,
        recordedAt: payload.recordedAt ?? new Date()
      }
    });

    res.status(201).json(location);
  })
);

gpsRouter.get(
  "/commands/history",
  asyncHandler(async (req, res) => {
    const vehicleId = req.query.vehicleId as string | undefined;

    const history = await prisma.gpsCommand.findMany({
      where: vehicleId ? { vehicleId } : undefined,
      include: {
        requestedBy: { select: { id: true, fullName: true, role: true } },
        vehicle: { select: { id: true, plateNumber: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(history);
  })
);

gpsRouter.get(
  "/vehicles/:vehicleId/location/latest",
  asyncHandler(async (req, res) => {
    const vehicleId = String(req.params.vehicleId);

    const latest = await prisma.gpsLocation.findFirst({
      where: { vehicleId },
      orderBy: { recordedAt: "desc" }
    });

    if (!latest) {
      throw new HttpError(404, "No GPS location found for this vehicle");
    }

    res.json({
      ...latest,
      latitude: Number(latest.latitude),
      longitude: Number(latest.longitude),
      speedKph: latest.speedKph !== null ? Number(latest.speedKph) : null
    });
  })
);

async function createCommand(
  vehicleId: string,
  requestedById: string,
  command: GpsCommandType,
  idempotencyKey: string,
  reason?: string
) {
  const existing = await prisma.gpsCommand.findUnique({ where: { idempotencyKey } });
  if (existing) {
    return existing;
  }

  const now = new Date();
  const commandTimeoutMs = env.GPS_COMMAND_TIMEOUT_MS;
  const timeoutAt = new Date(now.getTime() + commandTimeoutMs);

  const created = await prisma.$transaction(async (tx) => {
    const commandEntry = await tx.gpsCommand.create({
      data: {
        vehicleId,
        requestedById,
        command,
        reason,
        idempotencyKey,
        status: GpsCommandStatus.SENT,
        sentAt: now,
        timeoutAt
      }
    });

    if (command === GpsCommandType.IMMOBILIZE) {
      await tx.vehicle.update({ where: { id: vehicleId }, data: { status: VehicleStatus.IMMOBILIZED } });
    }

    if (command === GpsCommandType.RELEASE) {
      await tx.vehicle.update({ where: { id: vehicleId }, data: { status: VehicleStatus.ACTIVE } });
    }

    return commandEntry;
  });

  return created;
}

gpsRouter.post(
  "/vehicles/:vehicleId/commands/immobilize",
  asyncHandler(async (req, res) => {
    const vehicleId = String(req.params.vehicleId);
    const { idempotencyKey, reason } = commandSchema.parse(req.body);

    const command = await createCommand(
      vehicleId,
      req.auth!.sub,
      GpsCommandType.IMMOBILIZE,
      idempotencyKey ?? `immobilize-${vehicleId}-${randomUUID()}`,
      reason
    );

    res.status(201).json(command);
  })
);

gpsRouter.post(
  "/vehicles/:vehicleId/commands/release",
  asyncHandler(async (req, res) => {
    const vehicleId = String(req.params.vehicleId);
    const { idempotencyKey, reason } = commandSchema.parse(req.body);

    const command = await createCommand(
      vehicleId,
      req.auth!.sub,
      GpsCommandType.RELEASE,
      idempotencyKey ?? `release-${vehicleId}-${randomUUID()}`,
      reason
    );

    res.status(201).json(command);
  })
);

export { gpsRouter };
