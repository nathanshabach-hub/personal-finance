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
    `SELECT t.TransactionId, t.UserId, t.AccountId, a.Name AS AccountName, t.CategoryId, c.Name AS CategoryName,
            t.TransactionType, t.Amount, t.CurrencyCode, t.TransactionDate, t.Description, t.Merchant,
            t.Notes, t.Status, t.CreatedAt, t.UpdatedAt
     FROM dbo.Transactions t
     INNER JOIN dbo.FinancialAccounts a ON a.AccountId = t.AccountId
     LEFT JOIN dbo.Categories c ON c.CategoryId = t.CategoryId
     WHERE t.UserId = @userId
       AND (@accountId IS NULL OR t.AccountId = @accountId)
       AND (@categoryId IS NULL OR t.CategoryId = @categoryId)
       AND (@transactionType IS NULL OR t.TransactionType = @transactionType)
       AND (@fromDate IS NULL OR t.TransactionDate >= @fromDate)
       AND (@toDate IS NULL OR t.TransactionDate <= @toDate)
       AND (@merchant IS NULL OR t.Merchant LIKE @merchantLike)
       AND (@minAmount IS NULL OR t.Amount >= @minAmount)
       AND (@maxAmount IS NULL OR t.Amount <= @maxAmount)
     ORDER BY t.TransactionDate DESC, t.CreatedAt DESC
     OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`,
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
    `INSERT INTO dbo.Transactions
      (TransactionId, UserId, AccountId, CategoryId, TransactionType, Amount, CurrencyCode, TransactionDate, Description, Merchant, Notes, Status, CreatedAt, UpdatedAt)
     OUTPUT inserted.TransactionId
     VALUES
      (NEWID(), @userId, @accountId, @categoryId, @transactionType, @amount, @currencyCode, @transactionDate, @description, @merchant, @notes, @status, SYSUTCDATETIME(), SYSUTCDATETIME())`,
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
    `UPDATE dbo.Transactions
      SET AccountId = COALESCE(@accountId, AccountId),
          CategoryId = COALESCE(@categoryId, CategoryId),
          TransactionType = COALESCE(@transactionType, TransactionType),
          Amount = COALESCE(@amount, Amount),
          CurrencyCode = COALESCE(@currencyCode, CurrencyCode),
          TransactionDate = COALESCE(@transactionDate, TransactionDate),
          Description = COALESCE(@description, Description),
          Merchant = COALESCE(@merchant, Merchant),
          Notes = COALESCE(@notes, Notes),
          Status = COALESCE(@status, Status),
          UpdatedAt = SYSUTCDATETIME()
     WHERE TransactionId = @transactionId AND UserId = @userId`,
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
    `DELETE FROM dbo.Transactions WHERE TransactionId = @transactionId AND UserId = @userId`,
    { userId, transactionId },
  );
}

export async function duplicateTransaction(userId: string, transactionId: string) {
  const rows = await executeQuery<{ TransactionId: string }>(
    `INSERT INTO dbo.Transactions
      (TransactionId, UserId, AccountId, CategoryId, TransactionType, Amount, CurrencyCode, TransactionDate, Description, Merchant, Notes, Status, CreatedAt, UpdatedAt)
     OUTPUT inserted.TransactionId
     SELECT NEWID(), UserId, AccountId, CategoryId, TransactionType, Amount, CurrencyCode,
            TransactionDate, Description, Merchant, Notes, Status, SYSUTCDATETIME(), SYSUTCDATETIME()
     FROM dbo.Transactions
     WHERE TransactionId = @transactionId AND UserId = @userId`,
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
    const fromRows = await executeTransactionQuery<{ AccountId: string }>(
      transaction,
      `SELECT AccountId FROM dbo.FinancialAccounts WHERE AccountId = @accountId AND UserId = @userId AND IsActive = 1`,
      { accountId: input.fromAccountId, userId },
    );

    const toRows = await executeTransactionQuery<{ AccountId: string }>(
      transaction,
      `SELECT AccountId FROM dbo.FinancialAccounts WHERE AccountId = @accountId AND UserId = @userId AND IsActive = 1`,
      { accountId: input.toAccountId, userId },
    );

    if (!fromRows[0] || !toRows[0]) {
      throw new AppError("Invalid transfer accounts", 400);
    }

    const transferRows = await executeTransactionQuery<{ TransferId: string }>(
      transaction,
      `INSERT INTO dbo.Transfers
        (TransferId, UserId, FromAccountId, ToAccountId, Amount, CurrencyCode, TransferDate, Description, Notes, CreatedAt)
       OUTPUT inserted.TransferId
       VALUES
        (NEWID(), @userId, @fromAccountId, @toAccountId, @amount, @currencyCode, @transferDate, @description, @notes, SYSUTCDATETIME())`,
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

    const transferId = transferRows[0].TransferId;

    await executeTransactionQuery(
      transaction,
      `INSERT INTO dbo.Transactions
        (TransactionId, UserId, AccountId, CategoryId, TransactionType, Amount, CurrencyCode, TransactionDate, Description, Merchant, Notes, Status, RelatedTransferId, CreatedAt, UpdatedAt)
       VALUES
        (NEWID(), @userId, @fromAccountId, NULL, 'Transfer', @negativeAmount, @currencyCode, @transferDate, @description, NULL, @notes, 'Cleared', @transferId, SYSUTCDATETIME(), SYSUTCDATETIME()),
        (NEWID(), @userId, @toAccountId, NULL, 'Transfer', @positiveAmount, @currencyCode, @transferDate, @description, NULL, @notes, 'Cleared', @transferId, SYSUTCDATETIME(), SYSUTCDATETIME())`,
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
