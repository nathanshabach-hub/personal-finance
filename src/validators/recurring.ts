import { z } from "zod";

export const frequencySchema = z.enum([
  "Daily",
  "Weekly",
  "Fortnightly",
  "Monthly",
  "Quarterly",
  "Yearly",
]);

export const createRecurringSchema = z.object({
  accountId: z.string().uuid(),
  categoryId: z.string().uuid().optional().nullable(),
  amount: z.string().regex(/^\d+(\.\d{1,4})?$/),
  transactionType: z.enum(["Income", "Expense", "Transfer"]),
  description: z.string().max(220).optional().nullable(),
  frequency: frequencySchema,
  nextOccurrence: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  isActive: z.boolean().default(true),
});
