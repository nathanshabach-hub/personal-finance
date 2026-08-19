import { cookies } from "next/headers";
import { sessionCookie, verifySessionToken } from "@/lib/auth";
import type { SessionUser } from "@/types/domain";

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookie.name)?.value;
  if (!token) {
    return null;
  }

  try {
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}
