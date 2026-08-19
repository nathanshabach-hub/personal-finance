import { fail, ok } from "@/lib/response";
import { parseBody } from "@/lib/http";
import { requireUser } from "@/server/guards";
import { budgetCategorySchema } from "@/validators/budgets";
import { upsertBudgetCategory } from "@/services/budget-service";

export async function PUT(
  request: Request,
  context: { params: Promise<{ budgetId: string }> },
) {
  try {
    const user = await requireUser();
    const { budgetId } = await context.params;
    const payload = await parseBody(request, budgetCategorySchema);

    await upsertBudgetCategory(
      user.userId,
      budgetId,
      payload.categoryId,
      payload.plannedAmount,
      payload.rolloverEnabled,
    );

    return ok({ success: true });
  } catch (error) {
    return fail(error);
  }
}
