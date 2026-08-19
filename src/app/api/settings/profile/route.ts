import { fail, ok } from "@/lib/response";
import { requireUser } from "@/server/guards";
import { executeQuery } from "@/lib/db";

export async function GET() {
  try {
    const user = await requireUser();
    const rows = await executeQuery(
      `SELECT UserId, Email, FirstName, LastName, DefaultCurrency, TimeZone
       FROM dbo.Users
       WHERE UserId = @userId`,
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
      `UPDATE dbo.Users
        SET FirstName = COALESCE(@firstName, FirstName),
            LastName = COALESCE(@lastName, LastName),
            DefaultCurrency = COALESCE(@defaultCurrency, DefaultCurrency),
            TimeZone = COALESCE(@timeZone, TimeZone),
            UpdatedAt = SYSUTCDATETIME()
       WHERE UserId = @userId`,
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
