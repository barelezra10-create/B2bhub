import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url(),
  SESSION_SECRET: z.string().min(32),
  SESSION_COOKIE_NAME: z.string().default("b2bhub_session"),
  ADMIN_EMAIL: z.email(),
  ADMIN_PASSWORD: z.string().min(8),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.email().optional(),
});

export const env = envSchema.parse(process.env);
