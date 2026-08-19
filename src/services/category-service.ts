import { executeQuery } from "@/lib/db";

export async function listCategories(userId: string) {
  return executeQuery(
    `SELECT id, user_id, name, category_type, parent_category_id, icon, color, is_active, created_at, updated_at
     FROM categories
     WHERE user_id = @userId
     ORDER BY category_type, name`,
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
    `INSERT INTO categories
      (user_id, name, category_type, parent_category_id, icon, color, is_active)
     VALUES
      (@userId, @name, @categoryType, @parentCategoryId, @icon, @color, true)
     RETURNING id`,
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
    `SELECT seed_default_categories_for_user(@userId)`,
    { userId },
  );
}
