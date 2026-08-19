import { fail, ok } from "@/lib/response";
import { parseBody } from "@/lib/http";
import { requireUser } from "@/server/guards";
import { adjustSavingsGoalSchema } from "@/validators/goals";
import { adjustSavingsGoal } from "@/services/savings-service";

export async function POST(
  request: Request,
  context: { params: Promise<{ goalId: string }> },
) {
  try {
    const user = await requireUser();
    const { goalId } = await context.params;
    const payload = await parseBody(request, adjustSavingsGoalSchema);
    await adjustSavingsGoal(user.userId, goalId, payload.amount);
    return ok({ success: true });
  } catch (error) {
    return fail(error);
  }
}
