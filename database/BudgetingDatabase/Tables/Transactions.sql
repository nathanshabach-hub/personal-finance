CREATE TABLE [dbo].[Transactions] (
    [TransactionId] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    [UserId] UNIQUEIDENTIFIER NOT NULL,
    [AccountId] UNIQUEIDENTIFIER NOT NULL,
    [CategoryId] UNIQUEIDENTIFIER NULL,
    [TransactionType] NVARCHAR(10) NOT NULL,
    [Amount] DECIMAL(19,4) NOT NULL,
    [CurrencyCode] CHAR(3) NOT NULL,
    [TransactionDate] DATE NOT NULL,
    [Description] NVARCHAR(220) NULL,
    [Merchant] NVARCHAR(160) NULL,
    [Notes] NVARCHAR(4000) NULL,
    [Status] NVARCHAR(20) NOT NULL CONSTRAINT [DF_Transactions_Status] DEFAULT ('Cleared'),
    [RelatedTransferId] UNIQUEIDENTIFIER NULL,
    [CreatedAt] DATETIME2(0) NOT NULL,
    [UpdatedAt] DATETIME2(0) NOT NULL,
    CONSTRAINT [FK_Transactions_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([UserId]),
    CONSTRAINT [FK_Transactions_Accounts] FOREIGN KEY ([AccountId]) REFERENCES [dbo].[FinancialAccounts]([AccountId]),
    CONSTRAINT [FK_Transactions_Categories] FOREIGN KEY ([CategoryId]) REFERENCES [dbo].[Categories]([CategoryId]),
    CONSTRAINT [FK_Transactions_Transfers] FOREIGN KEY ([RelatedTransferId]) REFERENCES [dbo].[Transfers]([TransferId]),
    CONSTRAINT [CK_Transactions_Type] CHECK ([TransactionType] IN ('Income','Expense','Transfer')),
    CONSTRAINT [CK_Transactions_Status] CHECK ([Status] IN ('Pending','Cleared','Void')),
    CONSTRAINT [CK_Transactions_Transfer_Amount]
      CHECK (([TransactionType] <> 'Transfer') OR ([Amount] <> 0))
);
GO
CREATE INDEX [IX_Transactions_User_Date] ON [dbo].[Transactions] ([UserId], [TransactionDate] DESC);
GO
CREATE INDEX [IX_Transactions_User_Account] ON [dbo].[Transactions] ([UserId], [AccountId]);
GO
CREATE INDEX [IX_Transactions_User_Category] ON [dbo].[Transactions] ([UserId], [CategoryId]);
