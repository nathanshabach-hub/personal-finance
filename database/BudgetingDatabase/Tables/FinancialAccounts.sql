CREATE TABLE [dbo].[FinancialAccounts] (
    [AccountId] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    [UserId] UNIQUEIDENTIFIER NOT NULL,
    [Name] NVARCHAR(120) NOT NULL,
    [AccountType] NVARCHAR(20) NOT NULL,
    [InstitutionName] NVARCHAR(160) NULL,
    [CurrencyCode] CHAR(3) NOT NULL,
    [OpeningBalance] DECIMAL(19,4) NOT NULL CONSTRAINT [DF_FinancialAccounts_OpeningBalance] DEFAULT (0),
    [CreatedAt] DATETIME2(0) NOT NULL,
    [UpdatedAt] DATETIME2(0) NOT NULL,
    [IsActive] BIT NOT NULL CONSTRAINT [DF_FinancialAccounts_IsActive] DEFAULT ((1)),
    CONSTRAINT [FK_FinancialAccounts_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([UserId]),
    CONSTRAINT [CK_FinancialAccounts_AccountType] CHECK ([AccountType] IN ('Checking','Savings','CreditCard','Cash','Investment','Loan','Other')),
    CONSTRAINT [CK_FinancialAccounts_CurrencyCode] CHECK (LEN([CurrencyCode]) = 3)
);
GO
CREATE INDEX [IX_FinancialAccounts_UserId] ON [dbo].[FinancialAccounts] ([UserId]);
