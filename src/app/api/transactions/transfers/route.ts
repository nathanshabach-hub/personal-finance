import { fail, ok } from "@/lib/response";
import { parseBody } from "@/lib/http";
import { requireUser } from "@/server/guards";
import { createTransferSchema } from "@/validators/transactions";
import { createTransfer } from "@/services/transaction-service";
import { writeAuditLog } from "@/services/audit-service";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const payload = await parseBody(request, createTransferSchema);
    const transfer = await createTransfer(user.userId, payload);

    await writeAuditLog({
      userId: user.userId,
      action: "CREATE_TRANSFER",
      entityName: "Transfers",
      entityId: transfer.transferId,
      metadata: payload,
    });

    return ok(transfer, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
