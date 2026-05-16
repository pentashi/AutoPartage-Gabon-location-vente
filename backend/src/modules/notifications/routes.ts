import { NotificationChannel, NotificationPriority, Role } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { HttpError, asyncHandler } from "../../utils/http";

const dispatchSchema = z.object({
  userIds: z.array(z.string()).min(1),
  title: z.string().min(3),
  message: z.string().min(3),
  channel: z.nativeEnum(NotificationChannel).optional(),
  priority: z.nativeEnum(NotificationPriority).optional()
});

const notificationsRouter = Router();

notificationsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const adminRoles: Role[] = [Role.SUPER_ADMIN, Role.ADMIN, Role.ACCOUNTANT];
    const isAdminView = adminRoles.includes(req.auth!.role);
    const userIdQuery = req.query.userId as string | undefined;
    const unreadOnly = req.query.unreadOnly === "true";
    const priority = req.query.priority as NotificationPriority | undefined;

    const notifications = await prisma.notification.findMany({
      where: {
        userId: isAdminView ? (userIdQuery ?? undefined) : req.auth!.sub,
        ...(unreadOnly ? { isRead: false } : {}),
        ...(priority ? { priority } : {})
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(notifications);
  })
);

notificationsRouter.patch(
  "/:id/read",
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);

    const existing = await prisma.notification.findUnique({ where: { id } });
    if (!existing) {
      throw new HttpError(404, "Notification not found");
    }

    if (req.auth!.role === Role.DRIVER || req.auth!.role === Role.GARAGE) {
      if (existing.userId !== req.auth!.sub) {
        throw new HttpError(403, "Forbidden");
      }
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() }
    });

    res.json(updated);
  })
);

notificationsRouter.post(
  "/dispatch",
  asyncHandler(async (req, res) => {
    const payload = dispatchSchema.parse(req.body);

    const created = await prisma.notification.createManyAndReturn({
      data: payload.userIds.map((userId) => ({
        userId,
        title: payload.title,
        message: payload.message,
        channel: payload.channel,
        priority: payload.priority
      }))
    });

    res.status(201).json(created);
  })
);

export { notificationsRouter };
