export type AccountType =
  | "Checking"
  | "Savings"
  | "CreditCard"
  | "Cash"
  | "Investment"
  | "Loan"
  | "Other";

export type CategoryType = "Income" | "Expense";
export type TransactionType = "Income" | "Expense" | "Transfer";
export type TransactionStatus = "Pending" | "Cleared" | "Void";
export type RecurrenceFrequency =
  | "Daily"
  | "Weekly"
  | "Fortnightly"
  | "Monthly"
  | "Quarterly"
  | "Yearly";

export interface SessionUser {
  userId: string;
  email: string;
}
