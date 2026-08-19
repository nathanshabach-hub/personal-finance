import { format } from "date-fns";
import { fail, ok } from "@/lib/response";
import { executeQuery } from "@/lib/db";
import { requireUser } from "@/server/guards";
import { createTransaction } from "@/services/transaction-service";
import { nextOccurrence } from "@/services/recurring-service";

export async function POST() {
  try {
    const user = await requireUser();
    const rows = await executeQuery<{
      id: string;
      account_id: string;
      category_id: string | null;
      amount: string;
      transaction_type: string;
      description: string | null;
      frequency:
        | "Daily"
        | "Weekly"
        | "Fortnightly"
        | "Monthly"
        | "Quarterly"
        | "Yearly";
      next_occurrence: string;
      end_date: string | null;
      last_generated_on: string | null;
    }>(
      `SELECT id, account_id, category_id, amount, transaction_type, description, frequency, next_occurrence, end_date, last_generated_on
       FROM recurring_transactions
       WHERE user_id = @userId AND is_active = true AND next_occurrence <= CURRENT_DATE`,
      { userId: user.userId },
    );

    let generatedCount = 0;

    for (const row of rows) {
      if (row.last_generated_on === row.next_occurrence) {
        continue;
      }

      if (row.end_date && row.next_occurrence > row.end_date) {
        continue;
      }

      await createTransaction(user.userId, {
        accountId: row.account_id,
        categoryId: row.category_id,
        transactionType: row.transaction_type,
        amount: row.amount,
        currencyCode: "AUD",
        transactionDate: row.next_occurrence,
        description: row.description,
        merchant: null,
        notes: "Generated from recurring transaction",
        status: "Cleared",
      });

      const newDate = nextOccurrence(row.next_occurrence, row.frequency);
      await executeQuery(
        `UPDATE recurring_transactions
          SET last_generated_on = @lastGeneratedOn,
              next_occurrence = @nextOccurrence,
              updated_at = CURRENT_TIMESTAMP
         WHERE id = @recurringTransactionId AND user_id = @userId`,
        {
          recurringTransactionId: row.id,
          userId: user.userId,
          lastGeneratedOn: row.next_occurrence,
          nextOccurrence: format(newDate, "yyyy-MM-dd"),
        },
      );

      generatedCount += 1;
    }

    return ok({ generatedCount });
  } catch (error) {
    return fail(error);
  }
}
