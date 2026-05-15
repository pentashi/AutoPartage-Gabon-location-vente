import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import { Role } from "@prisma/client";
import csurf from "csurf";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { authenticate, authorize } from "./middleware/auth";
import { errorMiddleware } from "./middleware/error";
import { authRouter } from "./modules/auth/routes";
import { contractsRouter } from "./modules/contracts/routes";
import { driversRouter } from "./modules/drivers/routes";
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

const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd
  }
});

app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(apiLimiter);
app.use(csrfProtection);

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

app.use(errorMiddleware);
