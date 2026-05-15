import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import { Role } from "@prisma/client";
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

app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRouter);
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
