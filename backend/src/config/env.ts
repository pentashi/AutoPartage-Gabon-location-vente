import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL: z.string().default("7d"),
  FRONTEND_ORIGIN: z.string().default("http://localhost:3000"),
  GPS_COMMAND_TIMEOUT_MS: z.coerce.number().int().positive().default(120000),
  MAINTENANCE_AUTO_IMMOBILIZATION_MIN_ESCALATION: z.coerce.number().int().min(1).max(3).default(3)
});

export const env = envSchema.parse(process.env);
