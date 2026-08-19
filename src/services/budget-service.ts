import { executeQuery } from "@/lib/db";

export async function listBudgets(userId: string) {
  return executeQuery(
    `SELECT BudgetId, UserId, BudgetMonth, Name, CreatedAt, UpdatedAt
     FROM dbo.Budgets
     WHERE UserId = @userId
     ORDER BY BudgetMonth DESC`,
    { userId },
  );
}

export async function createBudget(userId: string, budgetMonth: string, name: string) {
  const rows = await executeQuery<{ BudgetId: string }>(
    `INSERT INTO dbo.Budgets (BudgetId, UserId, BudgetMonth, Name, CreatedAt, UpdatedAt)
     OUTPUT inserted.BudgetId
     VALUES (NEWID(), @userId, @budgetMonth, @name, SYSUTCDATETIME(), SYSUTCDATETIME())`,
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
    `MERGE dbo.BudgetCategories AS target
     USING (SELECT @budgetId AS BudgetId, @categoryId AS CategoryId) AS source
     ON target.BudgetId = source.BudgetId AND target.CategoryId = source.CategoryId
     WHEN MATCHED THEN
       UPDATE SET PlannedAmount = @plannedAmount, RolloverEnabled = @rolloverEnabled
     WHEN NOT MATCHED THEN
       INSERT (BudgetCategoryId, BudgetId, CategoryId, PlannedAmount, RolloverEnabled)
       VALUES (NEWID(), @budgetId, @categoryId, @plannedAmount, @rolloverEnabled);`,
    { userId, budgetId, categoryId, plannedAmount, rolloverEnabled },
  );

  await executeQuery(
    `UPDATE dbo.Budgets SET UpdatedAt = SYSUTCDATETIME() WHERE BudgetId = @budgetId AND UserId = @userId`,
    { budgetId, userId },
  );
}

export async function getBudgetPerformance(userId: string, budgetMonth: string) {
  return executeQuery(
    `SELECT *
     FROM dbo.vw_BudgetPerformance
     WHERE UserId = @userId AND BudgetMonth = @budgetMonth
     ORDER BY CategoryName`,
    { userId, budgetMonth },
  );
}
