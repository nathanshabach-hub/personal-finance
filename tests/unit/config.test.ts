import { afterEach, describe, expect, it } from "vitest";
import { getEnv } from "../../src/lib/config";

describe("getEnv", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("uses development defaults when required env vars are missing", () => {
    delete process.env.AUTH_SECRET;
    delete process.env.DATABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.DEFAULT_CURRENCY;
    process.env = { ...process.env, NODE_ENV: "development" };

    const env = getEnv();

    expect(env.AUTH_SECRET).toBeTruthy();
    expect(env.DATABASE_URL).toBeTruthy();
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBeTruthy();
    expect(env.DEFAULT_CURRENCY).toBe("AUD");
  });
});
