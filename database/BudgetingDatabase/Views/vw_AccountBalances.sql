CREATE VIEW [dbo].[vw_AccountBalances]
AS
SELECT
    fa.AccountId,
    fa.UserId,
    fa.Name,
    fa.AccountType,
    fa.CurrencyCode,
    fa.OpeningBalance + COALESCE(SUM(t.Amount), 0) AS CurrentBalance
FROM dbo.FinancialAccounts fa
LEFT JOIN dbo.Transactions t ON t.AccountId = fa.AccountId AND t.UserId = fa.UserId AND t.Status <> 'Void'
GROUP BY fa.AccountId, fa.UserId, fa.Name, fa.AccountType, fa.CurrencyCode, fa.OpeningBalance;
