import { cookies } from "next/headers";
import { createSessionToken, hashPassword, sessionCookie } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { parseBody } from "@/lib/http";
import { fail, ok } from "@/lib/response";
import { writeAuditLog } from "@/services/audit-service";
import { seedDefaultCategories } from "@/services/category-service";
import { createUser, findUserByEmail } from "@/services/user-service";
import { registerSchema } from "@/validators/auth";

export async function POST(request: Request) {
  try {
    const payload = await parseBody(request, registerSchema);
    const existing = await findUserByEmail(payload.email);
    if (existing) {
      throw new AppError("Email already registered", 409);
    }

    const passwordHash = await hashPassword(payload.password);
    const user = await createUser({
      email: payload.email,
      passwordHash,
      firstName: payload.firstName,
      lastName: payload.lastName,
      defaultCurrency: payload.defaultCurrency,
      timeZone: payload.timeZone,
    });

    await seedDefaultCategories(user.id as string);
    await writeAuditLog({
      userId: user.id as string,
      action: "REGISTER",
      entityName: "Users",
      entityId: user.id as string,
    });

    const token = await createSessionToken({ userId: user.id as string, email: user.email as string });
    const cookieStore = await cookies();
    cookieStore.set(sessionCookie.name, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: sessionCookie.maxAge,
      path: "/",
    });

    return ok({ userId: user.id, email: user.email }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
