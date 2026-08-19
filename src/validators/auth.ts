import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(10).max(100),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  defaultCurrency: z.string().length(3).default("AUD"),
  timeZone: z.string().min(1).default("Australia/Sydney"),
});

export const loginSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(100),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().max(320),
});
