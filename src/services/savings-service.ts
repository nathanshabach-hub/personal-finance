import { executeQuery } from "@/lib/db";

export async function listSavingsGoals(userId: string) {
  return executeQuery(
    `SELECT id, name, target_amount, current_amount, target_date, icon, color, created_at, updated_at, is_active
     FROM savings_goals
     WHERE user_id = @userId
     ORDER BY created_at DESC`,
    { userId },
  );
}

export async function createSavingsGoal(
  userId: string,
  input: {
    name: string;
    targetAmount: string;
    currentAmount: string;
    targetDate?: string | null;
    icon?: string | null;
    color?: string | null;
  },
) {
  const rows = await executeQuery<{ id: string }>(
    `INSERT INTO savings_goals
      (user_id, name, target_amount, current_amount, target_date, icon, color, is_active)
     VALUES
      (@userId, @name, @targetAmount::NUMERIC, @currentAmount::NUMERIC, @targetDate::DATE, @icon, @color, true)
     RETURNING id`,
    {
      userId,
      name: input.name,
      targetAmount: input.targetAmount,
      currentAmount: input.currentAmount,
      targetDate: input.targetDate ?? null,
      icon: input.icon ?? null,
      color: input.color ?? null,
    },
  );

  return rows[0];
}

export async function adjustSavingsGoal(userId: string, savingsGoalId: string, amount: string) {
  await executeQuery(
    `UPDATE savings_goals
      SET current_amount = current_amount + @amount::NUMERIC,
          updated_at = CURRENT_TIMESTAMP
     WHERE id = @savingsGoalId AND user_id = @userId`,
    { userId, savingsGoalId, amount },
  );
}
