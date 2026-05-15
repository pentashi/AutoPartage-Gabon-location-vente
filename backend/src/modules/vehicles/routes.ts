import { VehicleStatus } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/http";

const createSchema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
  plateNumber: z.string().min(1),
  year: z.number().int().min(1990),
  status: z.enum(VehicleStatus).optional(),
  photoUrl: z.url().optional()
});

const updateSchema = createSchema.partial();

const vehiclesRouter = Router();

vehiclesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const search = req.query.search as string | undefined;

    const vehicles = await prisma.vehicle.findMany({
      where: search
        ? {
            OR: [
              { brand: { contains: search, mode: "insensitive" } },
              { model: { contains: search, mode: "insensitive" } },
              { plateNumber: { contains: search, mode: "insensitive" } }
            ]
          }
        : undefined,
      orderBy: { createdAt: "desc" }
    });

    res.json(vehicles);
  })
);

vehiclesRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: req.params.id },
      include: { contracts: true, incidents: true }
    });

    res.json(vehicle);
  })
);

vehiclesRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const payload = createSchema.parse(req.body);
    const created = await prisma.vehicle.create({ data: payload });
    res.status(201).json(created);
  })
);

vehiclesRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const payload = updateSchema.parse(req.body);
    const updated = await prisma.vehicle.update({ where: { id: req.params.id }, data: payload });
    res.json(updated);
  })
);

vehiclesRouter.patch(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const { status } = z.object({ status: z.enum(VehicleStatus) }).parse(req.body);
    const updated = await prisma.vehicle.update({ where: { id: req.params.id }, data: { status } });
    res.json(updated);
  })
);

vehiclesRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.vehicle.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);

export { vehiclesRouter };
