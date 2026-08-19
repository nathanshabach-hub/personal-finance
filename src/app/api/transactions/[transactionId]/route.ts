import { fail, ok } from "@/lib/response";
import { parseBody } from "@/lib/http";
import { requireUser } from "@/server/guards";
import {
  deleteTransaction,
  updateTransaction,
} from "@/services/transaction-service";
import { updateTransactionSchema } from "@/validators/transactions";
import { writeAuditLog } from "@/services/audit-service";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ transactionId: string }> },
) {
  try {
    const user = await requireUser();
    const payload = await parseBody(request, updateTransactionSchema);
    const { transactionId } = await context.params;

    await updateTransaction(user.userId, transactionId, payload);

    await writeAuditLog({
      userId: user.userId,
      action: "UPDATE_TRANSACTION",
      entityName: "Transactions",
      entityId: transactionId,
    });

    return ok({ success: true });
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ transactionId: string }> },
) {
  try {
    const user = await requireUser();
    const { transactionId } = await context.params;
    await deleteTransaction(user.userId, transactionId);

    await writeAuditLog({
      userId: user.userId,
      action: "DELETE_TRANSACTION",
      entityName: "Transactions",
      entityId: transactionId,
    });

    return ok({ success: true });
  } catch (error) {
    return fail(error);
  }
}
