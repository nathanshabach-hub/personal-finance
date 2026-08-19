import { fail, ok } from "@/lib/response";
import { requireUser } from "@/server/guards";
import { listNotifications } from "@/services/notification-service";

export async function GET() {
  try {
    const user = await requireUser();
    return ok(await listNotifications(user.userId));
  } catch (error) {
    return fail(error);
  }
}
