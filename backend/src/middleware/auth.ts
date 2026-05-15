import { Role } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { HttpError } from "../utils/http";

type AccessPayload = {
  sub: string;
  role: Role;
};

declare global {
  namespace Express {
    interface Request {
      auth?: AccessPayload;
    }
  }
}

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    throw new HttpError(401, "Unauthorized");
  }

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessPayload;
    req.auth = payload;
  } catch {
    throw new HttpError(401, "Invalid or expired token");
  }

  next();
};

export const authorize = (...roles: Role[]) => (req: Request, _res: Response, next: NextFunction) => {
  if (!req.auth) {
    throw new HttpError(401, "Unauthorized");
  }

  if (!roles.includes(req.auth.role)) {
    throw new HttpError(403, "Forbidden");
  }

  next();
};
