import { executeQuery } from "@/lib/db";

export async function listSavingsGoals(userId: string) {
  return executeQuery(
    `SELECT SavingsGoalId, Name, TargetAmount, CurrentAmount, TargetDate, Icon, Color, CreatedAt, UpdatedAt, IsActive
     FROM dbo.SavingsGoals
     WHERE UserId = @userId
     ORDER BY CreatedAt DESC`,
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
  const rows = await executeQuery<{ SavingsGoalId: string }>(
    `INSERT INTO dbo.SavingsGoals
      (SavingsGoalId, UserId, Name, TargetAmount, CurrentAmount, TargetDate, Icon, Color, CreatedAt, UpdatedAt, IsActive)
     OUTPUT inserted.SavingsGoalId
     VALUES
      (NEWID(), @userId, @name, @targetAmount, @currentAmount, @targetDate, @icon, @color, SYSUTCDATETIME(), SYSUTCDATETIME(), 1)`,
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
    `UPDATE dbo.SavingsGoals
      SET CurrentAmount = CurrentAmount + @amount,
          UpdatedAt = SYSUTCDATETIME()
     WHERE SavingsGoalId = @savingsGoalId AND UserId = @userId`,
    { userId, savingsGoalId, amount },
  );
}
