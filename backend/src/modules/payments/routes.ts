import { ContractStatus, PaymentMethod, PaymentStatus, Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/http";

const createSchema = z.object({
  contractId: z.string(),
  amount: z.number().positive(),
  dueDate: z.coerce.date(),
  paidAt: z.coerce.date().optional(),
  method: z.nativeEnum(PaymentMethod).optional(),
  status: z.nativeEnum(PaymentStatus).optional(),
  penaltyAmount: z.number().nonnegative().optional()
});

const updateSchema = createSchema.partial();

const paymentsRouter = Router();

paymentsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const payments = await prisma.payment.findMany({ include: { contract: true }, orderBy: { createdAt: "desc" } });
    res.json(payments);
  })
);

paymentsRouter.get(
  "/summary/monthly",
  asyncHandler(async (_req, res) => {
    const paid = await prisma.payment.aggregate({
      where: { status: PaymentStatus.PAID },
      _sum: { amount: true }
    });

    const due = await prisma.payment.aggregate({
      _sum: { amount: true }
    });

    const paidAmount = Number(paid._sum.amount ?? 0);
    const dueAmount = Number(due._sum.amount ?? 0);
    const recoveryRate = dueAmount > 0 ? (paidAmount / dueAmount) * 100 : 0;

    res.json({ paidAmount, dueAmount, recoveryRate: Number(recoveryRate.toFixed(2)) });
  })
);

paymentsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const payload = createSchema.parse(req.body);
    const created = await prisma.payment.create({
      data: {
        contractId: payload.contractId,
        amount: new Prisma.Decimal(payload.amount),
        dueDate: payload.dueDate,
        paidAt: payload.paidAt,
        method: payload.method,
        status: payload.status,
        penaltyAmount:
          payload.penaltyAmount !== undefined ? new Prisma.Decimal(payload.penaltyAmount) : undefined
      }
    });
    res.status(201).json(created);
  })
);

paymentsRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const payload = updateSchema.parse(req.body);
    const updated = await prisma.payment.update({
      where: { id },
      data: {
        ...(payload.contractId ? { contractId: payload.contractId } : {}),
        ...(payload.amount !== undefined ? { amount: new Prisma.Decimal(payload.amount) } : {}),
        ...(payload.dueDate ? { dueDate: payload.dueDate } : {}),
        ...(payload.paidAt ? { paidAt: payload.paidAt } : {}),
        ...(payload.method ? { method: payload.method } : {}),
        ...(payload.status ? { status: payload.status } : {}),
        ...(payload.penaltyAmount !== undefined
          ? { penaltyAmount: new Prisma.Decimal(payload.penaltyAmount) }
          : {})
      }
    });

    res.json(updated);
  })
);

paymentsRouter.patch(
  "/detect-late",
  asyncHandler(async (_req, res) => {
    const now = new Date();

    const result = await prisma.payment.updateMany({
      where: {
        status: PaymentStatus.PENDING,
        dueDate: { lt: now }
      },
      data: { status: PaymentStatus.OVERDUE }
    });

    const overdueContracts = await prisma.payment.groupBy({
      by: ["contractId"],
      where: { status: PaymentStatus.OVERDUE },
      _count: { _all: true }
    });

    for (const group of overdueContracts) {
      if (group._count._all >= 2) {
        await prisma.contract.update({
          where: { id: group.contractId },
          data: { status: ContractStatus.SUSPENDED }
        });
      }
    }

    res.json({ updatedPayments: result.count, suspendedContracts: overdueContracts.length });
  })
);

paymentsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    await prisma.payment.delete({ where: { id } });
    res.status(204).send();
  })
);

export { paymentsRouter };
