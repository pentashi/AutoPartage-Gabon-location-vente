import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/http";

const createUserSchema = z.object({
  email: z.email(),
  fullName: z.string().min(2),
  password: z.string().min(8),
  role: z.enum(Role)
});

const updateUserSchema = createUserSchema.partial().omit({ password: true }).extend({
  password: z.string().min(8).optional(),
  isActive: z.boolean().optional()
});

const usersRouter = Router();

usersRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({
      select: { id: true, fullName: true, email: true, role: true, isActive: true, createdAt: true }
    });

    res.json(users);
  })
);

usersRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const payload = createUserSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(payload.password, 12);

    const user = await prisma.user.create({
      data: {
        email: payload.email,
        fullName: payload.fullName,
        role: payload.role,
        passwordHash
      },
      select: { id: true, fullName: true, email: true, role: true, isActive: true }
    });

    res.status(201).json(user);
  })
);

usersRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const payload = updateUserSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...(payload.email ? { email: payload.email } : {}),
        ...(payload.fullName ? { fullName: payload.fullName } : {}),
        ...(payload.role ? { role: payload.role } : {}),
        ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
        ...(payload.password ? { passwordHash: await bcrypt.hash(payload.password, 12) } : {})
      },
      select: { id: true, fullName: true, email: true, role: true, isActive: true }
    });

    res.json(user);
  })
);

usersRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);

export { usersRouter };
