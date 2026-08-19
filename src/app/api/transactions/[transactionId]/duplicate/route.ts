import { fail, ok } from "@/lib/response";
import { requireUser } from "@/server/guards";
import { duplicateTransaction } from "@/services/transaction-service";
import { writeAuditLog } from "@/services/audit-service";

export async function POST(
  _request: Request,
  context: { params: Promise<{ transactionId: string }> },
) {
  try {
    const user = await requireUser();
    const { transactionId } = await context.params;
    const created = await duplicateTransaction(user.userId, transactionId);

    if (!created) {
      return ok({ success: false });
    }

    await writeAuditLog({
      userId: user.userId,
      action: "DUPLICATE_TRANSACTION",
      entityName: "Transactions",
      entityId: String(created.TransactionId),
    });

    return ok(created, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
