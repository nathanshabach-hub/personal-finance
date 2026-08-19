import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  AUTH_SECRET: z.string().min(32).default("dev-secret-change-me-32-chars-long"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().default("https://example-project.supabase.co"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).default("anon-key-placeholder"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).default("service-role-placeholder"),
  DATABASE_URL: z
    .string()
    .min(1)
    .default("postgresql://postgres:postgres@localhost:54322/postgres"),
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
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    DEFAULT_CURRENCY: process.env.DEFAULT_CURRENCY,
  });

  cache = parsed.success ? parsed.data : envSchema.parse({
    NODE_ENV: process.env.NODE_ENV,
    APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    AUTH_SECRET: process.env.AUTH_SECRET ?? "dev-secret-change-me-32-chars-long",
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://example-project.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "anon-key-placeholder",
    SUPABASE_SERVICE_ROLE_KEY:
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? "service-role-placeholder",
    DATABASE_URL:
      process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:54322/postgres",
    DEFAULT_CURRENCY: process.env.DEFAULT_CURRENCY ?? "AUD",
  });

  return cache;
}
