import { Router } from "express";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/http";
import { NotificationPriority, PaymentStatus, VehicleStatus } from "@prisma/client";

const dashboardRouter = Router();

dashboardRouter.get(
  "/stats",
  asyncHandler(async (req, res) => {
    const role = req.auth!.role;
    const isAdmin = role === "SUPER_ADMIN" || role === "ADMIN";
    const isFleet = role === "FLEET";
    const isAccountant = role === "ACCOUNTANT";

    const [vehiclesCount, driversCount, paymentsSum, notificationsCount, incidentsCount] = await Promise.all([
      (isAdmin || isFleet) ? prisma.vehicle.groupBy({ by: ["status"], _count: { _all: true } }) : Promise.resolve([]),
      (isAdmin || isFleet) ? prisma.driver.count() : Promise.resolve(0),
      (isAdmin || isAccountant) ? prisma.payment.aggregate({ _sum: { amount: true }, where: { status: PaymentStatus.PAID } }) : Promise.resolve({ _sum: { amount: 0 } }),
      prisma.notification.count({ where: { userId: req.auth!.sub, isRead: false } }),
      (isAdmin || isFleet) ? prisma.incident.count({ where: { status: { not: "RESOLVED" } } }) : Promise.resolve(0)
    ]);

    const totalDue = (isAdmin || isAccountant) 
      ? await prisma.payment.aggregate({ _sum: { amount: true } }) 
      : { _sum: { amount: 0 } };

    const vehicleStats = vehiclesCount.reduce((acc, curr) => {
      acc[curr.status] = curr._count._all;
      return acc;
    }, {} as Record<string, number>);

    const paidAmount = Number(paymentsSum._sum.amount ?? 0);
    const dueAmount = Number(totalDue._sum.amount ?? 0);
    const recoveryRate = dueAmount > 0 ? (paidAmount / dueAmount) * 100 : 0;

    res.json({
      vehicles: (isAdmin || isFleet) ? {
        total: Object.values(vehicleStats).reduce((a, b) => a + b, 0),
        ...vehicleStats
      } : { total: 0 },
      drivers: driversCount,
      finance: (isAdmin || isAccountant) ? {
        paidAmount,
        dueAmount,
        recoveryRate: Number(recoveryRate.toFixed(2))
      } : { paidAmount: 0, dueAmount: 0, recoveryRate: 0 },
      alerts: {
        criticalNotifications: notificationsCount,
        activeIncidents: incidentsCount
      }
    });
  })
);

dashboardRouter.get(
  "/audit-logs",
  asyncHandler(async (_req, res) => {
    const [gpsCommands, incidentUpdates, notifications] = await Promise.all([
      prisma.gpsCommand.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { requestedBy: { select: { fullName: true } }, vehicle: { select: { plateNumber: true } } }
      }),
      prisma.incident.findMany({
        take: 10,
        orderBy: { updatedAt: "desc" },
        where: { status: { not: "OPEN" } }
      }),
      prisma.notification.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        where: { priority: NotificationPriority.CRITICAL }
      })
    ]);

    const logs = [
      ...gpsCommands.map((c) => ({
        id: c.id,
        timestamp: c.createdAt,
        type: "GPS_COMMAND",
        message: `${c.command} command for ${c.vehicle.plateNumber} by ${c.requestedBy.fullName}`,
        status: c.status
      })),
      ...incidentUpdates.map((i) => ({
        id: i.id,
        timestamp: i.updatedAt,
        type: "INCIDENT_UPDATE",
        message: `Incident ${i.title} updated to ${i.status}`,
        status: i.status
      })),
      ...notifications.map((n) => ({
        id: n.id,
        timestamp: n.createdAt,
        type: "CRITICAL_ALERT",
        message: n.message,
        status: "ALERT"
      }))
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    res.json(logs.slice(0, 20));
  })
);

export { dashboardRouter };
