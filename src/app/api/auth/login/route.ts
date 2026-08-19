import { cookies } from "next/headers";
import { createSessionToken, sessionCookie, verifyPassword } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { parseBody } from "@/lib/http";
import { fail, ok } from "@/lib/response";
import { writeAuditLog } from "@/services/audit-service";
import { findUserByEmail } from "@/services/user-service";
import { loginSchema } from "@/validators/auth";

export async function POST(request: Request) {
  try {
    const payload = await parseBody(request, loginSchema);
    const user = await findUserByEmail(payload.email);

    if (!user || !user.is_active) {
      throw new AppError("Invalid email or password", 401);
    }

    const validPassword = await verifyPassword(payload.password, user.password_hash as string);
    if (!validPassword) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = await createSessionToken({ userId: user.id as string, email: user.email as string });
    const cookieStore = await cookies();
    cookieStore.set(sessionCookie.name, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: sessionCookie.maxAge,
      path: "/",
    });

    await writeAuditLog({
      userId: user.id as string,
      action: "LOGIN",
      entityName: "Users",
      entityId: user.id as string,
    });

    return ok({ userId: user.id, email: user.email });
  } catch (error) {
    return fail(error);
  }
}
