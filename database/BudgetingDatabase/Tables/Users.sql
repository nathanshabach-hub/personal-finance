CREATE TABLE [dbo].[Users] (
    [UserId] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    [Email] NVARCHAR(320) NOT NULL,
    [PasswordHash] NVARCHAR(255) NOT NULL,
    [FirstName] NVARCHAR(80) NOT NULL,
    [LastName] NVARCHAR(80) NOT NULL,
    [DefaultCurrency] CHAR(3) NOT NULL CONSTRAINT [DF_Users_DefaultCurrency] DEFAULT ('AUD'),
    [TimeZone] NVARCHAR(100) NOT NULL CONSTRAINT [DF_Users_TimeZone] DEFAULT ('Australia/Sydney'),
    [CreatedAt] DATETIME2(0) NOT NULL,
    [UpdatedAt] DATETIME2(0) NOT NULL,
    [IsActive] BIT NOT NULL CONSTRAINT [DF_Users_IsActive] DEFAULT ((1)),
    CONSTRAINT [UQ_Users_Email] UNIQUE ([Email]),
    CONSTRAINT [CK_Users_DefaultCurrency] CHECK (LEN([DefaultCurrency]) = 3)
);
GO
CREATE INDEX [IX_Users_IsActive] ON [dbo].[Users] ([IsActive]);
