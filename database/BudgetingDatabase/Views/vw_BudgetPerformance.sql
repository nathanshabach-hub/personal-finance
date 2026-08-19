CREATE VIEW [dbo].[vw_BudgetPerformance]
AS
SELECT
    b.UserId,
    b.BudgetMonth,
    b.BudgetId,
    c.CategoryId,
    c.Name AS CategoryName,
    bc.PlannedAmount,
    COALESCE(SUM(CASE WHEN t.TransactionType = 'Expense' THEN ABS(t.Amount) ELSE 0 END), 0) AS SpentAmount,
    bc.PlannedAmount - COALESCE(SUM(CASE WHEN t.TransactionType = 'Expense' THEN ABS(t.Amount) ELSE 0 END), 0) AS RemainingAmount
FROM dbo.Budgets b
INNER JOIN dbo.BudgetCategories bc ON bc.BudgetId = b.BudgetId
INNER JOIN dbo.Categories c ON c.CategoryId = bc.CategoryId
LEFT JOIN dbo.Transactions t
    ON t.UserId = b.UserId
   AND t.CategoryId = c.CategoryId
   AND FORMAT(t.TransactionDate, 'yyyy-MM') = b.BudgetMonth
   AND t.Status <> 'Void'
GROUP BY b.UserId, b.BudgetMonth, b.BudgetId, c.CategoryId, c.Name, bc.PlannedAmount;
