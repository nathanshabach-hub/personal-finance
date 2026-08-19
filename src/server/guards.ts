import { UnauthorizedError } from "@/lib/errors";
import { getSessionUser } from "@/lib/session";

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) {
    throw new UnauthorizedError();
  }

  return user;
}
