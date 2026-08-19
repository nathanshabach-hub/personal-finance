import { z } from "zod";

export const budgetSchema = z.object({
  budgetMonth: z.string().regex(/^\d{4}-\d{2}$/),
  name: z.string().min(1).max(120),
});

export const budgetCategorySchema = z.object({
  categoryId: z.string().uuid(),
  plannedAmount: z.string().regex(/^\d+(\.\d{1,4})?$/),
  rolloverEnabled: z.boolean().default(false),
});
