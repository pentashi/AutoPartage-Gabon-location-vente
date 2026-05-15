import { ContractStatus, ContractType, Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/http";

const createSchema = z.object({
  driverId: z.string(),
  vehicleId: z.string(),
  type: z.nativeEnum(ContractType),
  status: z.nativeEnum(ContractStatus).optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  monthlyAmount: z.number().positive(),
  unpaidThreshold: z.number().positive().optional(),
  terms: z.string().optional(),
  pdfUrl: z.string().url().optional()
});

const updateSchema = createSchema.partial();

const contractsRouter = Router();

contractsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const contracts = await prisma.contract.findMany({
      include: { driver: true, vehicle: true, payments: true },
      orderBy: { createdAt: "desc" }
    });
    res.json(contracts);
  })
);

contractsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: { driver: true, vehicle: true, payments: true }
    });
    res.json(contract);
  })
);

contractsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const payload = createSchema.parse(req.body);
    const created = await prisma.contract.create({
      data: {
        ...payload,
        monthlyAmount: new Prisma.Decimal(payload.monthlyAmount),
        unpaidThreshold:
          payload.unpaidThreshold !== undefined
            ? new Prisma.Decimal(payload.unpaidThreshold)
            : undefined
      }
    });
    res.status(201).json(created);
  })
);

contractsRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const payload = updateSchema.parse(req.body);
    const updated = await prisma.contract.update({
      where: { id },
      data: {
        ...(payload.driverId ? { driverId: payload.driverId } : {}),
        ...(payload.vehicleId ? { vehicleId: payload.vehicleId } : {}),
        ...(payload.type ? { type: payload.type } : {}),
        ...(payload.status ? { status: payload.status } : {}),
        ...(payload.startDate ? { startDate: payload.startDate } : {}),
        ...(payload.endDate ? { endDate: payload.endDate } : {}),
        ...(payload.monthlyAmount !== undefined
          ? { monthlyAmount: new Prisma.Decimal(payload.monthlyAmount) }
          : {}),
        ...(payload.unpaidThreshold !== undefined
          ? { unpaidThreshold: new Prisma.Decimal(payload.unpaidThreshold) }
          : {}),
        ...(payload.terms ? { terms: payload.terms } : {}),
        ...(payload.pdfUrl ? { pdfUrl: payload.pdfUrl } : {})
      }
    });

    res.json(updated);
  })
);

contractsRouter.patch(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const { status } = z.object({ status: z.nativeEnum(ContractStatus) }).parse(req.body);
    const updated = await prisma.contract.update({ where: { id }, data: { status } });

    if (status === ContractStatus.SUSPENDED) {
      await prisma.vehicle.update({
        where: { id: updated.vehicleId },
        data: { status: "IMMOBILIZED" }
      });
    }

    res.json(updated);
  })
);

contractsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    await prisma.contract.delete({ where: { id } });
    res.status(204).send();
  })
);

export { contractsRouter };
