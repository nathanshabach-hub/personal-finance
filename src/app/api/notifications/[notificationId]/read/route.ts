import { fail, ok } from "@/lib/response";
import { requireUser } from "@/server/guards";
import { markNotificationRead } from "@/services/notification-service";

export async function POST(
  _request: Request,
  context: { params: Promise<{ notificationId: string }> },
) {
  try {
    const user = await requireUser();
    const { notificationId } = await context.params;
    await markNotificationRead(user.userId, notificationId);
    return ok({ success: true });
  } catch (error) {
    return fail(error);
  }
}
