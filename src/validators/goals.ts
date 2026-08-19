import { z } from "zod";

export const createSavingsGoalSchema = z.object({
  name: z.string().min(1).max(120),
  targetAmount: z.string().regex(/^\d+(\.\d{1,4})?$/),
  currentAmount: z.string().regex(/^\d+(\.\d{1,4})?$/).default("0"),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  icon: z.string().max(64).optional().nullable(),
  color: z.string().max(20).optional().nullable(),
});

export const adjustSavingsGoalSchema = z.object({
  amount: z.string().regex(/^[-+]?\d+(\.\d{1,4})?$/),
});
