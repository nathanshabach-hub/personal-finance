import { addDays, addMonths, addWeeks, addYears, parseISO } from "date-fns";
import { executeQuery } from "@/lib/db";
import type { RecurrenceFrequency } from "@/types/domain";

export async function listRecurringTransactions(userId: string) {
  return executeQuery(
    `SELECT id, user_id, account_id, category_id, amount, transaction_type, description,
            frequency, next_occurrence, start_date, end_date, is_active, created_at, updated_at
     FROM recurring_transactions
     WHERE user_id = @userId
     ORDER BY next_occurrence ASC`,
    { userId },
  );
}

export async function createRecurringTransaction(
  userId: string,
  input: {
    accountId: string;
    categoryId?: string | null;
    amount: string;
    transactionType: string;
    description?: string | null;
    frequency: RecurrenceFrequency;
    nextOccurrence: string;
    startDate: string;
    endDate?: string | null;
    isActive: boolean;
  },
) {
  const rows = await executeQuery<{ id: string }>(
    `INSERT INTO recurring_transactions
      (user_id, account_id, category_id, amount, transaction_type, description,
       frequency, next_occurrence, start_date, end_date, is_active)
     VALUES
      (@userId, @accountId, @categoryId, @amount::NUMERIC, @transactionType, @description,
       @frequency, @nextOccurrence::DATE, @startDate::DATE, @endDate::DATE, @isActive)
     RETURNING id`,
    {
      userId,
      accountId: input.accountId,
      categoryId: input.categoryId ?? null,
      amount: input.amount,
      transactionType: input.transactionType,
      description: input.description ?? null,
      frequency: input.frequency,
      nextOccurrence: input.nextOccurrence,
      startDate: input.startDate,
      endDate: input.endDate ?? null,
      isActive: input.isActive,
    },
  );

  return rows[0];
}

export function nextOccurrence(fromDateIso: string, frequency: RecurrenceFrequency) {
  const from = parseISO(fromDateIso);
  switch (frequency) {
    case "Daily":
      return addDays(from, 1);
    case "Weekly":
      return addWeeks(from, 1);
    case "Fortnightly":
      return addWeeks(from, 2);
    case "Monthly":
      return addMonths(from, 1);
    case "Quarterly":
      return addMonths(from, 3);
    case "Yearly":
      return addYears(from, 1);
  }
}
