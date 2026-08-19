import { cookies } from "next/headers";
import { sessionCookie } from "@/lib/auth";
import { fail, ok } from "@/lib/response";
import { requireUser } from "@/server/guards";
import { writeAuditLog } from "@/services/audit-service";

export async function POST() {
  try {
    const user = await requireUser();
    const cookieStore = await cookies();
    cookieStore.delete(sessionCookie.name);

    await writeAuditLog({
      userId: user.userId,
      action: "LOGOUT",
      entityName: "Users",
      entityId: user.userId,
    });

    return ok({ success: true });
  } catch (error) {
    return fail(error);
  }
}
