import { fail, ok } from "@/lib/response";
import { getPagination, parseBody } from "@/lib/http";
import { requireUser } from "@/server/guards";
import { createTransaction, listTransactions } from "@/services/transaction-service";
import { writeAuditLog } from "@/services/audit-service";
import { createTransactionSchema } from "@/validators/transactions";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const pagination = getPagination(searchParams);

    const rows = await listTransactions(user.userId, {
      ...pagination,
      accountId: searchParams.get("accountId") ?? undefined,
      categoryId: searchParams.get("categoryId") ?? undefined,
      transactionType: searchParams.get("transactionType") ?? undefined,
      fromDate: searchParams.get("fromDate") ?? undefined,
      toDate: searchParams.get("toDate") ?? undefined,
      merchant: searchParams.get("merchant") ?? undefined,
      minAmount: searchParams.get("minAmount") ?? undefined,
      maxAmount: searchParams.get("maxAmount") ?? undefined,
    });

    return ok(rows);
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const payload = await parseBody(request, createTransactionSchema);
    const created = await createTransaction(user.userId, payload);

    await writeAuditLog({
      userId: user.userId,
      action: "CREATE_TRANSACTION",
      entityName: "Transactions",
      entityId: String(created.TransactionId),
    });

    return ok(created, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
