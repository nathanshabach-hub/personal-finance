CREATE TABLE [dbo].[BudgetCategories] (
    [BudgetCategoryId] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    [BudgetId] UNIQUEIDENTIFIER NOT NULL,
    [CategoryId] UNIQUEIDENTIFIER NOT NULL,
    [PlannedAmount] DECIMAL(19,4) NOT NULL,
    [RolloverEnabled] BIT NOT NULL CONSTRAINT [DF_BudgetCategories_RolloverEnabled] DEFAULT ((0)),
    CONSTRAINT [FK_BudgetCategories_Budgets] FOREIGN KEY ([BudgetId]) REFERENCES [dbo].[Budgets]([BudgetId]),
    CONSTRAINT [FK_BudgetCategories_Categories] FOREIGN KEY ([CategoryId]) REFERENCES [dbo].[Categories]([CategoryId]),
    CONSTRAINT [CK_BudgetCategories_PlannedAmount] CHECK ([PlannedAmount] >= 0),
    CONSTRAINT [UQ_BudgetCategories_Budget_Category] UNIQUE ([BudgetId], [CategoryId])
);
