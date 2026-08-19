import { fail, ok } from "@/lib/response";
import { parseBody } from "@/lib/http";
import { requireUser } from "@/server/guards";
import { softDeleteAccount, updateAccount } from "@/services/account-service";
import { writeAuditLog } from "@/services/audit-service";
import { updateAccountSchema } from "@/validators/accounts";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ accountId: string }> },
) {
  try {
    const user = await requireUser();
    const { accountId } = await context.params;
    const payload = await parseBody(request, updateAccountSchema);
    await updateAccount(user.userId, accountId, payload);

    await writeAuditLog({
      userId: user.userId,
      action: "UPDATE_ACCOUNT",
      entityName: "FinancialAccounts",
      entityId: accountId,
    });

    return ok({ success: true });
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ accountId: string }> },
) {
  try {
    const user = await requireUser();
    const { accountId } = await context.params;
    await softDeleteAccount(user.userId, accountId);

    await writeAuditLog({
      userId: user.userId,
      action: "DELETE_ACCOUNT",
      entityName: "FinancialAccounts",
      entityId: accountId,
    });

    return ok({ success: true });
  } catch (error) {
    return fail(error);
  }
}
