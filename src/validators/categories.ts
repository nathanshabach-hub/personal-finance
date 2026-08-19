import { z } from "zod";

export const categoryTypeSchema = z.enum(["Income", "Expense"]);

export const createCategorySchema = z.object({
  name: z.string().min(1).max(120),
  categoryType: categoryTypeSchema,
  parentCategoryId: z.string().uuid().optional().nullable(),
  icon: z.string().max(64).optional().nullable(),
  color: z.string().max(20).optional().nullable(),
});
