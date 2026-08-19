import { z } from "zod";

export const transactionTypeSchema = z.enum(["Income", "Expense", "Transfer"]);

export const createTransactionSchema = z.object({
  accountId: z.string().uuid(),
  categoryId: z.string().uuid().optional().nullable(),
  transactionType: transactionTypeSchema,
  amount: z.string().regex(/^\d+(\.\d{1,4})?$/),
  currencyCode: z.string().length(3),
  transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().max(220).optional().nullable(),
  merchant: z.string().max(160).optional().nullable(),
  notes: z.string().max(4000).optional().nullable(),
  status: z.enum(["Pending", "Cleared", "Void"]).default("Cleared"),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const createTransferSchema = z.object({
  fromAccountId: z.string().uuid(),
  toAccountId: z.string().uuid(),
  amount: z.string().regex(/^\d+(\.\d{1,4})?$/),
  currencyCode: z.string().length(3),
  transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().max(220).optional().nullable(),
  notes: z.string().max(4000).optional().nullable(),
});
