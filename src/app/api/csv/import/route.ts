import { parse } from "csv-parse/sync";
import { fail, ok } from "@/lib/response";
import { requireUser } from "@/server/guards";
import { createTransaction } from "@/services/transaction-service";

interface CsvRow {
  date: string;
  description: string;
  amount: string;
  merchant?: string;
  categoryId?: string;
  accountId: string;
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return ok({ importedRows: 0, skippedRows: 0, invalidRows: 0, duplicateRows: 0 });
    }

    const content = await file.text();
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as CsvRow[];

    let importedRows = 0;
    let skippedRows = 0;
    let invalidRows = 0;

    for (const row of records) {
      if (!row.date || !row.amount || !row.accountId) {
        invalidRows += 1;
        continue;
      }

      try {
        await createTransaction(user.userId, {
          accountId: row.accountId,
          categoryId: row.categoryId ?? null,
          transactionType: row.amount.startsWith("-") ? "Expense" : "Income",
          amount: row.amount.replace("-", ""),
          currencyCode: "AUD",
          transactionDate: row.date,
          description: row.description ?? null,
          merchant: row.merchant ?? null,
          notes: "Imported from CSV",
          status: "Cleared",
        });
        importedRows += 1;
      } catch {
        skippedRows += 1;
      }
    }

    return ok({ importedRows, skippedRows, invalidRows, duplicateRows: 0 });
  } catch (error) {
    return fail(error);
  }
}
