import { MaintenanceTaskStatus, VehicleStatus } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { env } from "../../config/env";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/http";

const createTaskSchema = z.object({
  vehicleId: z.string(),
  assignedToId: z.string().optional(),
  title: z.string().min(3),
  description: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  dueMileageKm: z.number().int().positive().optional(),
  escalationLvl: z.number().int().min(1).max(3).optional(),
  justification: z.string().max(500).optional()
});

const updateStatusSchema = z.object({
  status: z.nativeEnum(MaintenanceTaskStatus),
  justification: z.string().max(500).optional()
});

const maintenanceRouter = Router();

maintenanceRouter.get(
  "/tasks",
  asyncHandler(async (req, res) => {
    const status = req.query.status as MaintenanceTaskStatus | undefined;
    const vehicleId = req.query.vehicleId as string | undefined;

    const tasks = await prisma.maintenanceTask.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(vehicleId ? { vehicleId } : {})
      },
      include: {
        vehicle: true,
        createdBy: { select: { id: true, fullName: true, role: true } },
        assignedTo: { select: { id: true, fullName: true, role: true } }
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }]
    });

    res.json(tasks);
  })
);

maintenanceRouter.post(
  "/tasks",
  asyncHandler(async (req, res) => {
    const payload = createTaskSchema.parse(req.body);

    const task = await prisma.maintenanceTask.create({
      data: {
        ...payload,
        createdById: req.auth!.sub
      }
    });

    res.status(201).json(task);
  })
);

maintenanceRouter.patch(
  "/tasks/:id/status",
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const payload = updateStatusSchema.parse(req.body);

    const updated = await prisma.$transaction(async (tx) => {
      const task = await tx.maintenanceTask.update({
        where: { id },
        data: {
          status: payload.status,
          justification: payload.justification,
          ...(payload.status === MaintenanceTaskStatus.COMPLETED ? { completedAt: new Date() } : {})
        }
      });

      const shouldAutoImmobilize =
        payload.status === MaintenanceTaskStatus.OVERDUE &&
        task.escalationLvl >= env.MAINTENANCE_AUTO_IMMOBILIZATION_MIN_ESCALATION;

      if (shouldAutoImmobilize) {
        await tx.vehicle.update({ where: { id: task.vehicleId }, data: { status: VehicleStatus.IMMOBILIZED } });
      }

      return task;
    });

    res.json(updated);
  })
);

export { maintenanceRouter };
