import { addDays, addMonths, addWeeks, addYears, parseISO } from "date-fns";
import { executeQuery } from "@/lib/db";
import type { RecurrenceFrequency } from "@/types/domain";

export async function listRecurringTransactions(userId: string) {
  return executeQuery(
    `SELECT RecurringTransactionId, UserId, AccountId, CategoryId, Amount, TransactionType, Description,
            Frequency, NextOccurrence, StartDate, EndDate, IsActive, CreatedAt, UpdatedAt
     FROM dbo.RecurringTransactions
     WHERE UserId = @userId
     ORDER BY NextOccurrence ASC`,
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
  const rows = await executeQuery<{ RecurringTransactionId: string }>(
    `INSERT INTO dbo.RecurringTransactions
      (RecurringTransactionId, UserId, AccountId, CategoryId, Amount, TransactionType, Description,
       Frequency, NextOccurrence, StartDate, EndDate, IsActive, CreatedAt, UpdatedAt)
     OUTPUT inserted.RecurringTransactionId
     VALUES
      (NEWID(), @userId, @accountId, @categoryId, @amount, @transactionType, @description,
       @frequency, @nextOccurrence, @startDate, @endDate, @isActive, SYSUTCDATETIME(), SYSUTCDATETIME())`,
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
