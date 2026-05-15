import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Response, Router } from "express";
import jwt from "jsonwebtoken";
import ms, { StringValue } from "ms";
import { z } from "zod";
import { env } from "../../config/env";
import { prisma } from "../../config/prisma";
import { authenticate } from "../../middleware/auth";
import { asyncHandler, HttpError } from "../../utils/http";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const authRouter = Router();

const ttlStringToSeconds = (ttl: string) => Math.floor(ms(ttl as StringValue) / 1000);

const signAccessToken = (userId: string, role: Role) =>
  jwt.sign(
    { sub: userId, role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: ttlStringToSeconds(env.ACCESS_TOKEN_TTL) }
  );

const signRefreshToken = (userId: string, role: Role) =>
  jwt.sign(
    { sub: userId, role },
    env.JWT_REFRESH_SECRET,
    { expiresIn: ttlStringToSeconds(env.REFRESH_TOKEN_TTL) }
  );

const applyAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  const isProd = env.NODE_ENV === "production";
  const base = { httpOnly: true, secure: isProd, sameSite: "lax" as const };

  res.cookie("accessToken", accessToken, { ...base, maxAge: 15 * 60 * 1000 });
  res.cookie("refreshToken", refreshToken, { ...base, maxAge: 7 * 24 * 60 * 60 * 1000 });
};

authRouter.get(
  "/csrf-token",
  asyncHandler(async (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
  })
);

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      throw new HttpError(401, "Invalid credentials");
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      throw new HttpError(401, "Invalid credentials");
    }

    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = signRefreshToken(user.id, user.role);
    applyAuthCookies(res, accessToken, refreshToken);

    res.json({ id: user.id, fullName: user.fullName, email: user.email, role: user.role });
  })
);

authRouter.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken;
    if (!token) {
      throw new HttpError(401, "Missing refresh token");
    }

    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub: string; role: Role };
    const accessToken = signAccessToken(payload.sub, payload.role);
    const refreshToken = signRefreshToken(payload.sub, payload.role);

    applyAuthCookies(res, accessToken, refreshToken);
    res.json({ message: "Token refreshed" });
  })
);

authRouter.post(
  "/logout",
  authenticate,
  asyncHandler(async (_req, res) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(204).send();
  })
);

export { authRouter };
