import { executeQuery } from "@/lib/db";

export async function dashboardSummary(userId: string, monthStart: string, monthEnd: string) {
  const [summary] = await executeQuery(
    `SELECT
       COALESCE(SUM(CASE WHEN account_type NOT IN ('Loan','CreditCard') THEN current_balance ELSE 0 END), 0) AS "totalAssets",
       COALESCE(SUM(CASE WHEN account_type IN ('Loan','CreditCard') THEN current_balance ELSE 0 END), 0) AS "totalLiabilities",
       COALESCE(SUM(current_balance), 0) AS "netWorth"
     FROM account_balances
     WHERE user_id = @userId`,
    { userId },
  );

  const [monthly] = await executeQuery(
    `SELECT
       COALESCE(SUM(CASE WHEN transaction_type = 'Income' THEN amount ELSE 0 END), 0) AS "monthlyIncome",
       COALESCE(SUM(CASE WHEN transaction_type = 'Expense' THEN amount ELSE 0 END), 0) AS "monthlyExpenses"
     FROM transactions
     WHERE user_id = @userId
       AND transaction_date >= @monthStart::DATE
       AND transaction_date <= @monthEnd::DATE
       AND transaction_type <> 'Transfer'`,
    { userId, monthStart, monthEnd },
  );

  return { ...summary, ...monthly };
}

export async function spendingByCategory(userId: string, fromDate: string, toDate: string) {
  return executeQuery(
    `SELECT c.name AS "categoryName", SUM(ABS(t.amount)) AS "amount"
     FROM transactions t
     INNER JOIN categories c ON c.id = t.category_id
     WHERE t.user_id = @userId
       AND t.transaction_type = 'Expense'
       AND t.transaction_date >= @fromDate::DATE
       AND t.transaction_date <= @toDate::DATE
     GROUP BY c.name
     ORDER BY "amount" DESC`,
    { userId, fromDate, toDate },
  );
}
