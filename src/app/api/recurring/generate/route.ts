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
      RecurringTransactionId: string;
      AccountId: string;
      CategoryId: string | null;
      Amount: string;
      TransactionType: string;
      Description: string | null;
      Frequency:
        | "Daily"
        | "Weekly"
        | "Fortnightly"
        | "Monthly"
        | "Quarterly"
        | "Yearly";
      NextOccurrence: string;
      EndDate: string | null;
      LastGeneratedOn: string | null;
    }>(
      `SELECT RecurringTransactionId, AccountId, CategoryId, Amount, TransactionType, Description, Frequency, NextOccurrence, EndDate, LastGeneratedOn
       FROM dbo.RecurringTransactions
       WHERE UserId = @userId AND IsActive = 1 AND NextOccurrence <= CAST(SYSUTCDATETIME() AS date)`,
      { userId: user.userId },
    );

    let generatedCount = 0;

    for (const row of rows) {
      if (row.LastGeneratedOn === row.NextOccurrence) {
        continue;
      }

      if (row.EndDate && row.NextOccurrence > row.EndDate) {
        continue;
      }

      await createTransaction(user.userId, {
        accountId: row.AccountId,
        categoryId: row.CategoryId,
        transactionType: row.TransactionType,
        amount: row.Amount,
        currencyCode: "AUD",
        transactionDate: row.NextOccurrence,
        description: row.Description,
        merchant: null,
        notes: "Generated from recurring transaction",
        status: "Cleared",
      });

      const newDate = nextOccurrence(row.NextOccurrence, row.Frequency);
      await executeQuery(
        `UPDATE dbo.RecurringTransactions
          SET LastGeneratedOn = @lastGeneratedOn,
              NextOccurrence = @nextOccurrence,
              UpdatedAt = SYSUTCDATETIME()
         WHERE RecurringTransactionId = @recurringTransactionId AND UserId = @userId`,
        {
          recurringTransactionId: row.RecurringTransactionId,
          userId: user.userId,
          lastGeneratedOn: row.NextOccurrence,
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
