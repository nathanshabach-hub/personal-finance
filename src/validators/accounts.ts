import { z } from "zod";

export const accountTypeSchema = z.enum([
  "Checking",
  "Savings",
  "CreditCard",
  "Cash",
  "Investment",
  "Loan",
  "Other",
]);

export const createAccountSchema = z.object({
  name: z.string().min(1).max(120),
  accountType: accountTypeSchema,
  institutionName: z.string().max(160).optional().nullable(),
  currencyCode: z.string().length(3).default("AUD"),
  openingBalance: z.string().regex(/^[-+]?\d+(\.\d{1,4})?$/),
});

export const updateAccountSchema = createAccountSchema.partial().extend({
  isActive: z.boolean().optional(),
});
