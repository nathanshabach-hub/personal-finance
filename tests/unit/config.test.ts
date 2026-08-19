import { afterEach, describe, expect, it } from "vitest";
import { getEnv } from "@/lib/config";

describe("getEnv", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    delete (globalThis as { __ENV_CACHE__?: unknown }).__ENV_CACHE__;
  });

  it("uses development defaults when required env vars are missing", () => {
    delete process.env.AUTH_SECRET;
    delete process.env.DATABASE_CONNECTION_STRING;
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.DEFAULT_CURRENCY;
    process.env = { ...process.env, NODE_ENV: "development" };

    const env = getEnv();

    expect(env.AUTH_SECRET).toBeTruthy();
    expect(env.DATABASE_CONNECTION_STRING).toBeTruthy();
    expect(env.DEFAULT_CURRENCY).toBe("AUD");
  });
});
