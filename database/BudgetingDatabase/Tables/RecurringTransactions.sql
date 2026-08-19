CREATE TABLE [dbo].[RecurringTransactions] (
    [RecurringTransactionId] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    [UserId] UNIQUEIDENTIFIER NOT NULL,
    [AccountId] UNIQUEIDENTIFIER NOT NULL,
    [CategoryId] UNIQUEIDENTIFIER NULL,
    [Amount] DECIMAL(19,4) NOT NULL,
    [TransactionType] NVARCHAR(10) NOT NULL,
    [Description] NVARCHAR(220) NULL,
    [Frequency] NVARCHAR(20) NOT NULL,
    [NextOccurrence] DATE NOT NULL,
    [StartDate] DATE NOT NULL,
    [EndDate] DATE NULL,
    [LastGeneratedOn] DATE NULL,
    [IsActive] BIT NOT NULL CONSTRAINT [DF_RecurringTransactions_IsActive] DEFAULT ((1)),
    [CreatedAt] DATETIME2(0) NOT NULL,
    [UpdatedAt] DATETIME2(0) NOT NULL,
    CONSTRAINT [FK_RecurringTransactions_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([UserId]),
    CONSTRAINT [FK_RecurringTransactions_Accounts] FOREIGN KEY ([AccountId]) REFERENCES [dbo].[FinancialAccounts]([AccountId]),
    CONSTRAINT [FK_RecurringTransactions_Categories] FOREIGN KEY ([CategoryId]) REFERENCES [dbo].[Categories]([CategoryId]),
    CONSTRAINT [CK_RecurringTransactions_Type] CHECK ([TransactionType] IN ('Income','Expense','Transfer')),
    CONSTRAINT [CK_RecurringTransactions_Frequency] CHECK ([Frequency] IN ('Daily','Weekly','Fortnightly','Monthly','Quarterly','Yearly')),
    CONSTRAINT [CK_RecurringTransactions_Amount] CHECK ([Amount] > 0)
);
GO
CREATE INDEX [IX_RecurringTransactions_User_NextOccurrence] ON [dbo].[RecurringTransactions] ([UserId], [NextOccurrence]);
