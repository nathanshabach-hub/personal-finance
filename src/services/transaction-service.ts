import { AppError } from "@/lib/errors";
import {
  executeInTransaction,
  executeQuery,
  executeTransactionQuery,
} from "@/lib/db";

interface TransactionListFilters {
  page: number;
  pageSize: number;
  accountId?: string;
  categoryId?: string;
  transactionType?: string;
  fromDate?: string;
  toDate?: string;
  merchant?: string;
  minAmount?: string;
  maxAmount?: string;
}

export async function listTransactions(userId: string, filters: TransactionListFilters) {
  const offset = (filters.page - 1) * filters.pageSize;

  return executeQuery(
    `SELECT t.id, t.user_id, t.account_id, a.name AS account_name, t.category_id, c.name AS category_name,
            t.transaction_type, t.amount, t.currency_code, t.transaction_date, t.description, t.merchant,
            t.notes, t.status, t.created_at, t.updated_at
     FROM transactions t
     INNER JOIN financial_accounts a ON a.id = t.account_id
     LEFT JOIN categories c ON c.id = t.category_id
     WHERE t.user_id = @userId
       AND (@accountId IS NULL OR t.account_id = @accountId)
       AND (@categoryId IS NULL OR t.category_id = @categoryId)
       AND (@transactionType IS NULL OR t.transaction_type = @transactionType)
       AND (@fromDate IS NULL OR t.transaction_date >= @fromDate::DATE)
       AND (@toDate IS NULL OR t.transaction_date <= @toDate::DATE)
       AND (@merchant IS NULL OR t.merchant ILIKE @merchantLike)
       AND (@minAmount IS NULL OR t.amount >= @minAmount::NUMERIC)
       AND (@maxAmount IS NULL OR t.amount <= @maxAmount::NUMERIC)
     ORDER BY t.transaction_date DESC, t.created_at DESC
     LIMIT @pageSize OFFSET @offset`,
    {
      userId,
      accountId: filters.accountId ?? null,
      categoryId: filters.categoryId ?? null,
      transactionType: filters.transactionType ?? null,
      fromDate: filters.fromDate ?? null,
      toDate: filters.toDate ?? null,
      merchant: filters.merchant ?? null,
      merchantLike: filters.merchant ? `%${filters.merchant}%` : null,
      minAmount: filters.minAmount ?? null,
      maxAmount: filters.maxAmount ?? null,
      offset,
      pageSize: filters.pageSize,
    },
  );
}

export async function createTransaction(
  userId: string,
  input: {
    accountId: string;
    categoryId?: string | null;
    transactionType: string;
    amount: string;
    currencyCode: string;
    transactionDate: string;
    description?: string | null;
    merchant?: string | null;
    notes?: string | null;
    status: string;
  },
) {
  const rows = await executeQuery(
    `INSERT INTO transactions
      (user_id, account_id, category_id, transaction_type, amount, currency_code, transaction_date, description, merchant, notes, status)
     VALUES
      (@userId, @accountId, @categoryId, @transactionType, @amount::NUMERIC, @currencyCode, @transactionDate::DATE, @description, @merchant, @notes, @status)
     RETURNING id`,
    {
      userId,
      accountId: input.accountId,
      categoryId: input.categoryId ?? null,
      transactionType: input.transactionType,
      amount: input.amount,
      currencyCode: input.currencyCode.toUpperCase(),
      transactionDate: input.transactionDate,
      description: input.description ?? null,
      merchant: input.merchant ?? null,
      notes: input.notes ?? null,
      status: input.status,
    },
  );

  return rows[0];
}

export async function updateTransaction(
  userId: string,
  transactionId: string,
  input: Record<string, unknown>,
) {
  await executeQuery(
    `UPDATE transactions
      SET account_id = COALESCE(@accountId, account_id),
          category_id = COALESCE(@categoryId, category_id),
          transaction_type = COALESCE(@transactionType, transaction_type),
          amount = COALESCE(@amount::NUMERIC, amount),
          currency_code = COALESCE(@currencyCode, currency_code),
          transaction_date = COALESCE(@transactionDate::DATE, transaction_date),
          description = COALESCE(@description, description),
          merchant = COALESCE(@merchant, merchant),
          notes = COALESCE(@notes, notes),
          status = COALESCE(@status, status),
          updated_at = CURRENT_TIMESTAMP
     WHERE id = @transactionId AND user_id = @userId`,
    {
      transactionId,
      userId,
      accountId: input.accountId ?? null,
      categoryId: input.categoryId ?? null,
      transactionType: input.transactionType ?? null,
      amount: input.amount ?? null,
      currencyCode:
        typeof input.currencyCode === "string" ? input.currencyCode.toUpperCase() : null,
      transactionDate: input.transactionDate ?? null,
      description: input.description ?? null,
      merchant: input.merchant ?? null,
      notes: input.notes ?? null,
      status: input.status ?? null,
    },
  );
}

export async function deleteTransaction(userId: string, transactionId: string) {
  await executeQuery(
    `DELETE FROM transactions WHERE id = @transactionId AND user_id = @userId`,
    { userId, transactionId },
  );
}

export async function duplicateTransaction(userId: string, transactionId: string) {
  const rows = await executeQuery<{ id: string }>(
    `INSERT INTO transactions
      (user_id, account_id, category_id, transaction_type, amount, currency_code, transaction_date, description, merchant, notes, status)
     SELECT user_id, account_id, category_id, transaction_type, amount, currency_code,
            transaction_date, description, merchant, notes, status
     FROM transactions
     WHERE id = @transactionId AND user_id = @userId
     RETURNING id`,
    { transactionId, userId },
  );

  return rows[0] ?? null;
}

export async function createTransfer(
  userId: string,
  input: {
    fromAccountId: string;
    toAccountId: string;
    amount: string;
    currencyCode: string;
    transactionDate: string;
    description?: string | null;
    notes?: string | null;
  },
) {
  if (input.fromAccountId === input.toAccountId) {
    throw new AppError("Transfer accounts must be different");
  }

  return executeInTransaction(async (transaction) => {
    const fromRows = await executeTransactionQuery<{ id: string }>(
      transaction,
      `SELECT id FROM financial_accounts WHERE id = @accountId AND user_id = @userId AND is_active = true`,
      { accountId: input.fromAccountId, userId },
    );

    const toRows = await executeTransactionQuery<{ id: string }>(
      transaction,
      `SELECT id FROM financial_accounts WHERE id = @accountId AND user_id = @userId AND is_active = true`,
      { accountId: input.toAccountId, userId },
    );

    if (!fromRows[0] || !toRows[0]) {
      throw new AppError("Invalid transfer accounts", 400);
    }

    const transferRows = await executeTransactionQuery<{ id: string }>(
      transaction,
      `INSERT INTO transfers
        (user_id, from_account_id, to_account_id, amount, currency_code, transfer_date, description, notes)
       VALUES
        (@userId, @fromAccountId, @toAccountId, @amount::NUMERIC, @currencyCode, @transferDate::DATE, @description, @notes)
       RETURNING id`,
      {
        userId,
        fromAccountId: input.fromAccountId,
        toAccountId: input.toAccountId,
        amount: input.amount,
        currencyCode: input.currencyCode.toUpperCase(),
        transferDate: input.transactionDate,
        description: input.description ?? null,
        notes: input.notes ?? null,
      },
    );

    const transferId = transferRows[0].id;

    await executeTransactionQuery(
      transaction,
      `INSERT INTO transactions
        (user_id, account_id, category_id, transaction_type, amount, currency_code, transaction_date, description, merchant, notes, status, related_transfer_id)
       VALUES
        (@userId, @fromAccountId, NULL, 'Transfer', @negativeAmount::NUMERIC, @currencyCode, @transferDate::DATE, @description, NULL, @notes, 'Cleared', @transferId),
        (@userId, @toAccountId, NULL, 'Transfer', @positiveAmount::NUMERIC, @currencyCode, @transferDate::DATE, @description, NULL, @notes, 'Cleared', @transferId)`,
      {
        userId,
        fromAccountId: input.fromAccountId,
        toAccountId: input.toAccountId,
        negativeAmount: `-${input.amount}`,
        positiveAmount: input.amount,
        currencyCode: input.currencyCode.toUpperCase(),
        transferDate: input.transactionDate,
        description: input.description ?? "Transfer",
        notes: input.notes ?? null,
        transferId,
      },
    );

    return { transferId };
  });
}
