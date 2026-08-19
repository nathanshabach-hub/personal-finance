import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  AUTH_SECRET: z.string().min(32).default("dev-secret-change-me-32-chars-long"),
  DATABASE_CONNECTION_STRING: z
    .string()
    .min(1)
    .default("Server=localhost,1433;Database=BudgetingDatabase;User Id=sa;Password=YourStrong!Passw0rd;TrustServerCertificate=true;Encrypt=False;"),
  DEFAULT_CURRENCY: z.string().length(3).default("AUD"),
});

let cache: z.infer<typeof envSchema> | null = null;

export function getEnv() {
  if (cache) {
    return cache;
  }

  const parsed = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    DATABASE_CONNECTION_STRING: process.env.DATABASE_CONNECTION_STRING,
    DEFAULT_CURRENCY: process.env.DEFAULT_CURRENCY,
  });

  cache = parsed.success ? parsed.data : envSchema.parse({
    NODE_ENV: process.env.NODE_ENV,
    APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    AUTH_SECRET: process.env.AUTH_SECRET ?? "dev-secret-change-me-32-chars-long",
    DATABASE_CONNECTION_STRING:
      process.env.DATABASE_CONNECTION_STRING ??
      "Server=localhost,1433;Database=BudgetingDatabase;User Id=sa;Password=YourStrong!Passw0rd;TrustServerCertificate=true;Encrypt=False;",
    DEFAULT_CURRENCY: process.env.DEFAULT_CURRENCY ?? "AUD",
  });

  return cache;
}
