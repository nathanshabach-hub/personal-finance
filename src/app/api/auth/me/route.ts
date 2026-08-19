import { fail, ok } from "@/lib/response";
import { requireUser } from "@/server/guards";
import { findUserById } from "@/services/user-service";

export async function GET() {
  try {
    const session = await requireUser();
    const user = await findUserById(session.userId);
    return ok(user);
  } catch (error) {
    return fail(error);
  }
}
