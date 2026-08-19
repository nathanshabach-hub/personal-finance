DECLARE @DemoUserId UNIQUEIDENTIFIER = NEWID();
DECLARE @CheckingId UNIQUEIDENTIFIER = NEWID();
DECLARE @SavingsId UNIQUEIDENTIFIER = NEWID();
DECLARE @CreditId UNIQUEIDENTIFIER = NEWID();

INSERT INTO dbo.Users (UserId, Email, PasswordHash, FirstName, LastName, DefaultCurrency, TimeZone, CreatedAt, UpdatedAt, IsActive)
VALUES (@DemoUserId, 'demo@ledgeratlas.app', '$2a$12$q.rDydHYVMW0x09Y8v8JbOLskh.FfP1j2B9P2fQ8pK8wri2sMhiTG', 'Demo', 'User', 'AUD', 'Australia/Sydney', SYSUTCDATETIME(), SYSUTCDATETIME(), 1);

EXEC dbo.SeedDefaultCategories @userId = @DemoUserId;

INSERT INTO dbo.FinancialAccounts (AccountId, UserId, Name, AccountType, InstitutionName, CurrencyCode, OpeningBalance, CreatedAt, UpdatedAt, IsActive)
VALUES
(@CheckingId, @DemoUserId, 'Everyday Checking', 'Checking', 'Commonwealth Bank', 'AUD', 4200.00, SYSUTCDATETIME(), SYSUTCDATETIME(), 1),
(@SavingsId, @DemoUserId, 'Rainy Day Savings', 'Savings', 'ING', 'AUD', 12000.00, SYSUTCDATETIME(), SYSUTCDATETIME(), 1),
(@CreditId, @DemoUserId, 'Rewards Credit Card', 'CreditCard', 'ANZ', 'AUD', -1600.00, SYSUTCDATETIME(), SYSUTCDATETIME(), 1);

INSERT INTO dbo.Transactions (TransactionId, UserId, AccountId, CategoryId, TransactionType, Amount, CurrencyCode, TransactionDate, Description, Merchant, Notes, Status, RelatedTransferId, CreatedAt, UpdatedAt)
SELECT NEWID(), @DemoUserId, @CheckingId, c.CategoryId, 'Expense', 140.50, 'AUD', CAST(DATEADD(DAY, -7, GETDATE()) AS DATE), 'Weekly groceries', 'Woolworths', NULL, 'Cleared', NULL, SYSUTCDATETIME(), SYSUTCDATETIME()
FROM dbo.Categories c
WHERE c.UserId = @DemoUserId AND c.Name = 'Groceries' AND c.CategoryType = 'Expense';

INSERT INTO dbo.Budgets (BudgetId, UserId, BudgetMonth, Name, CreatedAt, UpdatedAt)
VALUES (NEWID(), @DemoUserId, FORMAT(GETDATE(), 'yyyy-MM'), 'Monthly Household Budget', SYSUTCDATETIME(), SYSUTCDATETIME());

INSERT INTO dbo.SavingsGoals (SavingsGoalId, UserId, Name, TargetAmount, CurrentAmount, TargetDate, Icon, Color, CreatedAt, UpdatedAt, IsActive)
VALUES (NEWID(), @DemoUserId, 'Holiday Fund', 8000.00, 2500.00, DATEADD(MONTH, 8, CAST(GETDATE() AS DATE)), 'plane', '#0284c7', SYSUTCDATETIME(), SYSUTCDATETIME(), 1);
