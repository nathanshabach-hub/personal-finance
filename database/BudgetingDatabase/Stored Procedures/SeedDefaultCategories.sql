CREATE PROCEDURE [dbo].[SeedDefaultCategories]
    @userId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.Categories (CategoryId, UserId, Name, CategoryType, ParentCategoryId, Icon, Color, CreatedAt, UpdatedAt, IsActive)
    SELECT NEWID(), @userId, v.Name, v.CategoryType, NULL, NULL, NULL, SYSUTCDATETIME(), SYSUTCDATETIME(), 1
    FROM (VALUES
        ('Salary','Income'),
        ('Freelance','Income'),
        ('Interest','Income'),
        ('Investments','Income'),
        ('Other Income','Income'),
        ('Housing','Expense'),
        ('Rent/Mortgage','Expense'),
        ('Groceries','Expense'),
        ('Dining','Expense'),
        ('Transport','Expense'),
        ('Fuel','Expense'),
        ('Utilities','Expense'),
        ('Insurance','Expense'),
        ('Healthcare','Expense'),
        ('Entertainment','Expense'),
        ('Shopping','Expense'),
        ('Subscriptions','Expense'),
        ('Travel','Expense'),
        ('Education','Expense'),
        ('Personal','Expense'),
        ('Other','Expense')
    ) v(Name, CategoryType)
    WHERE NOT EXISTS (
        SELECT 1
        FROM dbo.Categories c
        WHERE c.UserId = @userId
          AND c.Name = v.Name
          AND c.CategoryType = v.CategoryType
    );
END;
