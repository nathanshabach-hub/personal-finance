import { cookies } from "next/headers";
import { createSessionToken, hashPassword, sessionCookie } from "@/lib/auth";
import { executeInTransaction, executeTransactionQuery } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { parseBody } from "@/lib/http";
import { fail, ok } from "@/lib/response";
import { registerSchema } from "@/validators/auth";

export async function POST(request: Request) {
  try {
    const payload = await parseBody(request, registerSchema);
    const passwordHash = await hashPassword(payload.password);

    const user = await executeInTransaction(async (transaction) => {
      const existing = await executeTransactionQuery(
        transaction,
        `SELECT id
         FROM users
         WHERE LOWER(email) = LOWER(@email)
         LIMIT 1`,
        { email: payload.email },
      );
      if (existing[0]) {
        throw new AppError("Email already registered", 409);
      }

      const rows = await executeTransactionQuery<{ id: string; email: string }>(
        transaction,
        `INSERT INTO users
          (email, password_hash, first_name, last_name, default_currency, time_zone, is_active)
         VALUES
          (@email, @passwordHash, @firstName, @lastName, @defaultCurrency, @timeZone, true)
         RETURNING id, email`,
        {
          email: payload.email.toLowerCase(),
          passwordHash,
          firstName: payload.firstName,
          lastName: payload.lastName,
          defaultCurrency: payload.defaultCurrency.toUpperCase(),
          timeZone: payload.timeZone,
        },
      );
      const createdUser = rows[0];

      await executeTransactionQuery(
        transaction,
        `SELECT seed_default_categories_for_user(@userId)`,
        { userId: createdUser.id },
      );
      await executeTransactionQuery(
        transaction,
        `INSERT INTO audit_logs (user_id, action, entity_name, entity_id, metadata)
         VALUES (@userId, 'REGISTER', 'Users', @userId, NULL)`,
        { userId: createdUser.id },
      );

      return createdUser;
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
