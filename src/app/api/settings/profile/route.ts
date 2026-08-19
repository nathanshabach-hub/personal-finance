import { fail, ok } from "@/lib/response";
import { requireUser } from "@/server/guards";
import { executeQuery } from "@/lib/db";

export async function GET() {
  try {
    const user = await requireUser();
    const rows = await executeQuery(
      `SELECT id, email, first_name, last_name, default_currency, time_zone
       FROM users
       WHERE id = @userId`,
      { userId: user.userId },
    );
    return ok(rows[0] ?? null);
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    const payload = (await request.json()) as {
      firstName?: string;
      lastName?: string;
      defaultCurrency?: string;
      timeZone?: string;
    };

    await executeQuery(
      `UPDATE users
        SET first_name = COALESCE(@firstName, first_name),
            last_name = COALESCE(@lastName, last_name),
            default_currency = COALESCE(@defaultCurrency, default_currency),
            time_zone = COALESCE(@timeZone, time_zone),
            updated_at = CURRENT_TIMESTAMP
       WHERE id = @userId`,
      {
        userId: user.userId,
        firstName: payload.firstName ?? null,
        lastName: payload.lastName ?? null,
        defaultCurrency: payload.defaultCurrency?.toUpperCase() ?? null,
        timeZone: payload.timeZone ?? null,
      },
    );

    return ok({ success: true });
  } catch (error) {
    return fail(error);
  }
}
