import { executeQuery } from "@/lib/db";

export async function listBudgets(userId: string) {
  return executeQuery(
    `SELECT id, user_id, budget_month, name, created_at, updated_at
     FROM budgets
     WHERE user_id = @userId
     ORDER BY budget_month DESC`,
    { userId },
  );
}

export async function createBudget(userId: string, budgetMonth: string, name: string) {
  const rows = await executeQuery<{ id: string }>(
    `INSERT INTO budgets (user_id, budget_month, name)
     VALUES (@userId, @budgetMonth::DATE, @name)
     RETURNING id`,
    { userId, budgetMonth, name },
  );

  return rows[0];
}

export async function upsertBudgetCategory(
  userId: string,
  budgetId: string,
  categoryId: string,
  plannedAmount: string,
  rolloverEnabled: boolean,
) {
  await executeQuery(
    `INSERT INTO budget_categories (budget_id, category_id, planned_amount, rollover_enabled)
     VALUES (@budgetId, @categoryId, @plannedAmount::NUMERIC, @rolloverEnabled)
     ON CONFLICT (budget_id, category_id) DO UPDATE
     SET planned_amount = @plannedAmount::NUMERIC, rollover_enabled = @rolloverEnabled`,
    { budgetId, categoryId, plannedAmount, rolloverEnabled },
  );

  await executeQuery(
    `UPDATE budgets SET updated_at = CURRENT_TIMESTAMP WHERE id = @budgetId AND user_id = @userId`,
    { budgetId, userId },
  );
}

export async function getBudgetPerformance(userId: string, budgetMonth: string) {
  return executeQuery(
    `SELECT *
     FROM budget_performance
     WHERE user_id = @userId AND budget_month = @budgetMonth::DATE
     ORDER BY category_name`,
    { userId, budgetMonth },
  );
}
