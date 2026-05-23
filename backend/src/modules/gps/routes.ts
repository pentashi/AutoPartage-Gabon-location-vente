import { GpsCommandStatus, GpsCommandType, Prisma, VehicleStatus } from "@prisma/client";
import { randomUUID } from "crypto";
import { Router } from "express";
import { z } from "zod";
import { env } from "../../config/env";
import { prisma } from "../../config/prisma";
import { HttpError, asyncHandler } from "../../utils/http";

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
