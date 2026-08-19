import { executeQuery } from "@/lib/db";

export async function dashboardSummary(userId: string, monthStart: string, monthEnd: string) {
  const [summary] = await executeQuery(
    `SELECT
       COALESCE(SUM(CASE WHEN AccountType IN ('Loan','CreditCard') THEN 0 ELSE CurrentBalance END), 0) AS TotalAssets,
       COALESCE(SUM(CASE WHEN AccountType IN ('Loan','CreditCard') THEN CurrentBalance ELSE 0 END), 0) AS TotalLiabilities,
       COALESCE(SUM(CurrentBalance), 0) AS NetWorth
     FROM dbo.vw_AccountBalances
     WHERE UserId = @userId`,
    { userId },
  );

  const [monthly] = await executeQuery(
    `SELECT
       COALESCE(SUM(CASE WHEN TransactionType = 'Income' THEN Amount ELSE 0 END), 0) AS MonthlyIncome,
       COALESCE(SUM(CASE WHEN TransactionType = 'Expense' THEN Amount ELSE 0 END), 0) AS MonthlyExpenses
     FROM dbo.Transactions
     WHERE UserId = @userId
       AND TransactionDate >= @monthStart
       AND TransactionDate <= @monthEnd
       AND TransactionType <> 'Transfer'`,
    { userId, monthStart, monthEnd },
  );

  return { ...summary, ...monthly };
}

export async function spendingByCategory(userId: string, fromDate: string, toDate: string) {
  return executeQuery(
    `SELECT c.Name AS CategoryName, SUM(ABS(t.Amount)) AS Amount
     FROM dbo.Transactions t
     INNER JOIN dbo.Categories c ON c.CategoryId = t.CategoryId
     WHERE t.UserId = @userId
       AND t.TransactionType = 'Expense'
       AND t.TransactionDate >= @fromDate
       AND t.TransactionDate <= @toDate
     GROUP BY c.Name
     ORDER BY Amount DESC`,
    { userId, fromDate, toDate },
  );
}
