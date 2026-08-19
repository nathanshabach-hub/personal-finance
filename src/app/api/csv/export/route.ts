import { stringify } from "csv-stringify/sync";
import { fail } from "@/lib/response";
import { requireUser } from "@/server/guards";
import { listTransactions } from "@/services/transaction-service";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);

    const transactions = await listTransactions(user.userId, {
      page: 1,
      pageSize: 5000,
      accountId: searchParams.get("accountId") ?? undefined,
      categoryId: searchParams.get("categoryId") ?? undefined,
      transactionType: searchParams.get("transactionType") ?? undefined,
      fromDate: searchParams.get("fromDate") ?? undefined,
      toDate: searchParams.get("toDate") ?? undefined,
      merchant: undefined,
      minAmount: undefined,
      maxAmount: undefined,
    });

    const content = stringify(
      transactions.map((row) => ({
        date: row.TransactionDate,
        account: row.AccountName,
        category: row.CategoryName,
        type: row.TransactionType,
        amount: row.Amount,
        currency: row.CurrencyCode,
        description: row.Description,
        merchant: row.Merchant,
      })),
      { header: true },
    );

    return new Response(content, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="transactions.csv"',
      },
    });
  } catch (error) {
    return fail(error);
  }
}
