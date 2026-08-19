import { fail, ok } from "@/lib/response";
import { requireUser } from "@/server/guards";
import { getBudgetPerformance } from "@/services/budget-service";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const budgetMonth = searchParams.get("budgetMonth");
    if (!budgetMonth) {
      return ok([]);
    }

    return ok(await getBudgetPerformance(user.userId, budgetMonth));
  } catch (error) {
    return fail(error);
  }
}
