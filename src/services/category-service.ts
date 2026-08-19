import { executeQuery } from "@/lib/db";

export async function listCategories(userId: string) {
  return executeQuery(
    `SELECT CategoryId, UserId, Name, CategoryType, ParentCategoryId, Icon, Color, IsActive, CreatedAt, UpdatedAt
     FROM dbo.Categories
     WHERE UserId = @userId
     ORDER BY CategoryType, Name`,
    { userId },
  );
}

export async function createCategory(
  userId: string,
  input: {
    name: string;
    categoryType: string;
    parentCategoryId?: string | null;
    icon?: string | null;
    color?: string | null;
  },
) {
  const rows = await executeQuery(
    `INSERT INTO dbo.Categories
      (CategoryId, UserId, Name, CategoryType, ParentCategoryId, Icon, Color, CreatedAt, UpdatedAt, IsActive)
     OUTPUT inserted.CategoryId
     VALUES
      (NEWID(), @userId, @name, @categoryType, @parentCategoryId, @icon, @color, SYSUTCDATETIME(), SYSUTCDATETIME(), 1)`,
    {
      userId,
      name: input.name,
      categoryType: input.categoryType,
      parentCategoryId: input.parentCategoryId ?? null,
      icon: input.icon ?? null,
      color: input.color ?? null,
    },
  );

  return rows[0];
}

export async function seedDefaultCategories(userId: string) {
  await executeQuery(
    `EXEC dbo.SeedDefaultCategories @userId`,
    { userId },
  );
}
