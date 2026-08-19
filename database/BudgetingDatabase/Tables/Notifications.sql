CREATE TABLE [dbo].[Notifications] (
    [NotificationId] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    [UserId] UNIQUEIDENTIFIER NOT NULL,
    [Type] NVARCHAR(50) NOT NULL,
    [Title] NVARCHAR(140) NOT NULL,
    [Message] NVARCHAR(1000) NOT NULL,
    [IsRead] BIT NOT NULL CONSTRAINT [DF_Notifications_IsRead] DEFAULT ((0)),
    [CreatedAt] DATETIME2(0) NOT NULL,
    CONSTRAINT [FK_Notifications_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([UserId])
);
GO
CREATE INDEX [IX_Notifications_User_Read] ON [dbo].[Notifications] ([UserId], [IsRead], [CreatedAt] DESC);
