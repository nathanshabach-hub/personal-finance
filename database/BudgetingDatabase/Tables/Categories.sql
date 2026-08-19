CREATE TABLE [dbo].[Categories] (
    [CategoryId] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    [UserId] UNIQUEIDENTIFIER NOT NULL,
    [Name] NVARCHAR(120) NOT NULL,
    [CategoryType] NVARCHAR(10) NOT NULL,
    [ParentCategoryId] UNIQUEIDENTIFIER NULL,
    [Icon] NVARCHAR(64) NULL,
    [Color] NVARCHAR(20) NULL,
    [CreatedAt] DATETIME2(0) NOT NULL,
    [UpdatedAt] DATETIME2(0) NOT NULL,
    [IsActive] BIT NOT NULL CONSTRAINT [DF_Categories_IsActive] DEFAULT ((1)),
    CONSTRAINT [FK_Categories_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([UserId]),
    CONSTRAINT [FK_Categories_ParentCategory] FOREIGN KEY ([ParentCategoryId]) REFERENCES [dbo].[Categories]([CategoryId]),
    CONSTRAINT [CK_Categories_CategoryType] CHECK ([CategoryType] IN ('Income','Expense')),
    CONSTRAINT [UQ_Categories_User_Name_Type] UNIQUE ([UserId], [Name], [CategoryType])
);
GO
CREATE INDEX [IX_Categories_UserId] ON [dbo].[Categories] ([UserId], [CategoryType]);
