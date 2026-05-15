import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/http";

const createSchema = z.object({
  userId: z.string().optional(),
  licenseNumber: z.string().min(1),
  cnssNumber: z.string().optional(),
  cnamgsNumber: z.string().optional(),
  riskScore: z.number().min(0).max(100).optional()
});

const updateSchema = createSchema.partial();

const driversRouter = Router();

driversRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const drivers = await prisma.driver.findMany({ include: { user: true, contracts: true, incidents: true } });
    res.json(drivers);
  })
);

driversRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const driver = await prisma.driver.findUnique({
      where: { id: req.params.id },
      include: {
        user: true,
        contracts: { include: { vehicle: true, payments: true } },
        incidents: true
      }
    });
    res.json(driver);
  })
);

driversRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const payload = createSchema.parse(req.body);
    const created = await prisma.driver.create({ data: payload });
    res.status(201).json(created);
  })
);

driversRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const payload = updateSchema.parse(req.body);
    const updated = await prisma.driver.update({ where: { id: req.params.id }, data: payload });
    res.json(updated);
  })
);

driversRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.driver.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);

export { driversRouter };
