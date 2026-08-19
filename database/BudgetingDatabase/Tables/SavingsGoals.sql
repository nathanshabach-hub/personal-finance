CREATE TABLE [dbo].[SavingsGoals] (
    [SavingsGoalId] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    [UserId] UNIQUEIDENTIFIER NOT NULL,
    [Name] NVARCHAR(120) NOT NULL,
    [TargetAmount] DECIMAL(19,4) NOT NULL,
    [CurrentAmount] DECIMAL(19,4) NOT NULL,
    [TargetDate] DATE NULL,
    [Icon] NVARCHAR(64) NULL,
    [Color] NVARCHAR(20) NULL,
    [CreatedAt] DATETIME2(0) NOT NULL,
    [UpdatedAt] DATETIME2(0) NOT NULL,
    [IsActive] BIT NOT NULL CONSTRAINT [DF_SavingsGoals_IsActive] DEFAULT ((1)),
    CONSTRAINT [FK_SavingsGoals_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([UserId]),
    CONSTRAINT [CK_SavingsGoals_TargetAmount] CHECK ([TargetAmount] > 0)
);
GO
CREATE INDEX [IX_SavingsGoals_User] ON [dbo].[SavingsGoals] ([UserId], [IsActive]);
