import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import { Role } from "@prisma/client";
import rateLimit from "express-rate-limit";
import session from "express-session";
import { env } from "./config/env";
import { authenticate, authorize } from "./middleware/auth";
import { csrfMiddleware } from "./middleware/csrf";
import { errorMiddleware } from "./middleware/error";
import { authRouter } from "./modules/auth/routes";
import { contractsRouter } from "./modules/contracts/routes";
import { driversRouter } from "./modules/drivers/routes";
import { gpsRouter } from "./modules/gps/routes";
import { maintenanceRouter } from "./modules/maintenance/routes";
import { notificationsRouter } from "./modules/notifications/routes";
import { paymentsRouter } from "./modules/payments/routes";
import { usersRouter } from "./modules/users/routes";
import { vehiclesRouter } from "./modules/vehicles/routes";

export const app = express();
const isProd = env.NODE_ENV === "production";

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false
});

app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: env.JWT_REFRESH_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax"
    }
  })
);
app.use(apiLimiter);
app.use(csrfMiddleware);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authLimiter, authRouter);
app.use("/users", authenticate, authorize(Role.SUPER_ADMIN, Role.ADMIN), usersRouter);
app.use("/vehicles", authenticate, authorize(Role.SUPER_ADMIN, Role.ADMIN), vehiclesRouter);
app.use("/drivers", authenticate, authorize(Role.SUPER_ADMIN, Role.ADMIN), driversRouter);
app.use("/contracts", authenticate, authorize(Role.SUPER_ADMIN, Role.ADMIN), contractsRouter);
app.use(
  "/payments",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN, Role.ACCOUNTANT),
  paymentsRouter
);
app.use("/gps", authenticate, authorize(Role.SUPER_ADMIN, Role.ADMIN), gpsRouter);
app.use("/maintenance", authenticate, authorize(Role.SUPER_ADMIN, Role.ADMIN), maintenanceRouter);
app.use(
  "/notifications",
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.ADMIN, Role.ACCOUNTANT, Role.DRIVER, Role.GARAGE),
  notificationsRouter
);

app.use(errorMiddleware);
