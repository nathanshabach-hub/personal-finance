import bcrypt from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";
import { getEnv } from "@/lib/config";
import type { SessionUser } from "@/types/domain";

const SESSION_COOKIE_NAME = "pf_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function getSecretKey() {
  return new TextEncoder().encode(getEnv().AUTH_SECRET);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT({ email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .setSubject(user.userId)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, getSecretKey(), { algorithms: ["HS256"] });

  if (!payload.sub || typeof payload.email !== "string") {
    throw new Error("Invalid session payload");
  }

  return { userId: payload.sub, email: payload.email } satisfies SessionUser;
}

export const sessionCookie = {
  name: SESSION_COOKIE_NAME,
  maxAge: SESSION_TTL_SECONDS,
};
