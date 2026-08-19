CREATE TABLE [dbo].[Transfers] (
    [TransferId] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    [UserId] UNIQUEIDENTIFIER NOT NULL,
    [FromAccountId] UNIQUEIDENTIFIER NOT NULL,
    [ToAccountId] UNIQUEIDENTIFIER NOT NULL,
    [Amount] DECIMAL(19,4) NOT NULL,
    [CurrencyCode] CHAR(3) NOT NULL,
    [TransferDate] DATE NOT NULL,
    [Description] NVARCHAR(220) NULL,
    [Notes] NVARCHAR(4000) NULL,
    [CreatedAt] DATETIME2(0) NOT NULL,
    CONSTRAINT [FK_Transfers_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([UserId]),
    CONSTRAINT [FK_Transfers_FromAccount] FOREIGN KEY ([FromAccountId]) REFERENCES [dbo].[FinancialAccounts]([AccountId]),
    CONSTRAINT [FK_Transfers_ToAccount] FOREIGN KEY ([ToAccountId]) REFERENCES [dbo].[FinancialAccounts]([AccountId]),
    CONSTRAINT [CK_Transfers_Amount] CHECK ([Amount] > 0),
    CONSTRAINT [CK_Transfers_DifferentAccounts] CHECK ([FromAccountId] <> [ToAccountId])
);
GO
CREATE INDEX [IX_Transfers_User_Date] ON [dbo].[Transfers] ([UserId], [TransferDate]);
