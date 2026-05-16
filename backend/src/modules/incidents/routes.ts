import { IncidentStatus, NotificationPriority, Role } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { HttpError, asyncHandler } from "../../utils/http";

const createIncidentSchema = z.object({
  driverId: z.string().optional(),
  vehicleId: z.string().optional(),
  title: z.string().min(3),
  description: z.string().min(3),
  occurredAt: z.coerce.date().optional()
});

const updateIncidentStatusSchema = z.object({
  status: z.nativeEnum(IncidentStatus),
  note: z.string().max(500).optional()
});

const incidentsRouter = Router();

function buildIncidentStatusTraceMessage(incidentId: string, status: IncidentStatus, actorId: string, note?: string) {
  return note
    ? `Incident ${incidentId} -> ${status} par ${actorId} (${note})`
    : `Incident ${incidentId} -> ${status} par ${actorId}`;
}

incidentsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const status = req.query.status as IncidentStatus | undefined;
    const incidents = await prisma.incident.findMany({
      where: status ? { status } : undefined,
      include: {
        driver: true,
        vehicle: true
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(incidents);
  })
);

incidentsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const payload = createIncidentSchema.parse(req.body);
    const occurredAt = payload.occurredAt ?? new Date();

    const created = await prisma.$transaction(async (tx) => {
      const incident = await tx.incident.create({
        data: {
          driverId: payload.driverId,
          vehicleId: payload.vehicleId,
          title: payload.title,
          description: payload.description,
          occurredAt
        }
      });

      const adminUsers = await tx.user.findMany({
        where: {
          role: {
            in: [Role.SUPER_ADMIN, Role.ADMIN]
          },
          isActive: true
        },
        select: { id: true }
      });

      if (adminUsers.length > 0) {
        await tx.notification.createMany({
          data: adminUsers.map((user) => ({
            userId: user.id,
            title: "Incident sécurité critique",
            message: `Incident ${incident.id}: ${incident.title}`,
            priority: NotificationPriority.CRITICAL
          }))
        });
      }

      return incident;
    });

    res.status(201).json(created);
  })
);

incidentsRouter.patch(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const payload = updateIncidentStatusSchema.parse(req.body);
    const actorId = req.auth?.sub;
    if (!actorId) {
      throw new HttpError(401, "Unauthorized");
    }

    const existing = await prisma.incident.findUnique({ where: { id } });
    if (!existing) {
      throw new HttpError(404, "Incident not found");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const incident = await tx.incident.update({
        where: { id },
        data: {
          status: payload.status,
          ...(payload.status === IncidentStatus.RESOLVED ? { resolvedAt: new Date() } : {})
        }
      });

      const adminUsers = await tx.user.findMany({
        where: {
          role: {
            in: [Role.SUPER_ADMIN, Role.ADMIN]
          },
          isActive: true
        },
        select: { id: true }
      });

      if (adminUsers.length > 0) {
        await tx.notification.createMany({
          data: adminUsers.map((user) => ({
            userId: user.id,
            title: "Traçabilité d'incident admin",
            message: buildIncidentStatusTraceMessage(incident.id, payload.status, actorId, payload.note),
            priority: payload.status === IncidentStatus.RESOLVED ? NotificationPriority.HIGH : NotificationPriority.NORMAL
          }))
        });
      }

      return incident;
    });

    res.json(updated);
  })
);

export { incidentsRouter };
