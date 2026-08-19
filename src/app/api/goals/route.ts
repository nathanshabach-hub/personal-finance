import { fail, ok } from "@/lib/response";
import { parseBody } from "@/lib/http";
import { requireUser } from "@/server/guards";
import { createSavingsGoalSchema } from "@/validators/goals";
import { createSavingsGoal, listSavingsGoals } from "@/services/savings-service";

export async function GET() {
  try {
    const user = await requireUser();
    return ok(await listSavingsGoals(user.userId));
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const payload = await parseBody(request, createSavingsGoalSchema);
    return ok(await createSavingsGoal(user.userId, payload), { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
