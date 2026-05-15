import Tokens from "csrf";
import { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/http";

const tokens = new Tokens();
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export const csrfMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.session.csrfSecret) {
    req.session.csrfSecret = tokens.secretSync();
  }

  req.csrfToken = () => tokens.create(req.session.csrfSecret!);

  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  const token = req.get("x-csrf-token") ?? req.body?._csrf;
  if (!token || !tokens.verify(req.session.csrfSecret!, token)) {
    throw new HttpError(403, "Invalid CSRF token");
  }

  next();
};
