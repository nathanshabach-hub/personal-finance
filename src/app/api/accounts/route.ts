import { fail, ok } from "@/lib/response";
import { parseBody } from "@/lib/http";
import { requireUser } from "@/server/guards";
import { createAccount, listAccounts } from "@/services/account-service";
import { writeAuditLog } from "@/services/audit-service";
import { createAccountSchema } from "@/validators/accounts";

export async function GET() {
  try {
    const user = await requireUser();
    const rows = await listAccounts(user.userId);
    return ok(rows);
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const payload = await parseBody(request, createAccountSchema);
    const created = await createAccount(user.userId, payload);

    await writeAuditLog({
      userId: user.userId,
      action: "CREATE_ACCOUNT",
      entityName: "FinancialAccounts",
      entityId: String(created.AccountId),
    });

    return ok(created, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
