import Tokens from "csrf";
import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { HttpError } from "../utils/http";

const tokens = new Tokens();
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export const csrfMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const isProd = env.NODE_ENV === "production";
  const csrfSecret = req.cookies?.csrfSecret ?? tokens.secretSync();

  if (!req.cookies?.csrfSecret) {
    res.cookie("csrfSecret", csrfSecret, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax"
    });
  }

  req.csrfToken = () => tokens.create(csrfSecret);

  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  const token = req.get("x-csrf-token") ?? req.body?._csrf;
  if (!token || !tokens.verify(csrfSecret, token)) {
    throw new HttpError(403, "Invalid CSRF token");
  }

  next();
};
