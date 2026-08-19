CREATE TABLE [dbo].[AuditLogs] (
    [AuditLogId] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    [UserId] UNIQUEIDENTIFIER NOT NULL,
    [Action] NVARCHAR(120) NOT NULL,
    [EntityName] NVARCHAR(120) NOT NULL,
    [EntityId] NVARCHAR(120) NOT NULL,
    [Metadata] NVARCHAR(MAX) NULL,
    [CreatedAt] DATETIME2(0) NOT NULL,
    CONSTRAINT [FK_AuditLogs_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([UserId])
);
GO
CREATE INDEX [IX_AuditLogs_User_CreatedAt] ON [dbo].[AuditLogs] ([UserId], [CreatedAt] DESC);
