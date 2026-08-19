CREATE TABLE [dbo].[Budgets] (
    [BudgetId] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    [UserId] UNIQUEIDENTIFIER NOT NULL,
    [BudgetMonth] CHAR(7) NOT NULL,
    [Name] NVARCHAR(120) NOT NULL,
    [CreatedAt] DATETIME2(0) NOT NULL,
    [UpdatedAt] DATETIME2(0) NOT NULL,
    CONSTRAINT [FK_Budgets_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([UserId]),
    CONSTRAINT [CK_Budgets_Month] CHECK ([BudgetMonth] LIKE '[1-2][0-9][0-9][0-9]-[0-1][0-9]'),
    CONSTRAINT [UQ_Budgets_User_Month] UNIQUE ([UserId], [BudgetMonth])
);
