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

    if (!user || !user.IsActive) {
      throw new AppError("Invalid email or password", 401);
    }

    const validPassword = await verifyPassword(payload.password, user.PasswordHash);
    if (!validPassword) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = await createSessionToken({ userId: user.UserId, email: user.Email });
    const cookieStore = await cookies();
    cookieStore.set(sessionCookie.name, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: sessionCookie.maxAge,
      path: "/",
    });

    await writeAuditLog({
      userId: user.UserId,
      action: "LOGIN",
      entityName: "Users",
      entityId: user.UserId,
    });

    return ok({ userId: user.UserId, email: user.Email });
  } catch (error) {
    return fail(error);
  }
}
