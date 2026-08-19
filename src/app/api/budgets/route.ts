import { fail, ok } from "@/lib/response";
import { parseBody } from "@/lib/http";
import { requireUser } from "@/server/guards";
import { budgetSchema } from "@/validators/budgets";
import { createBudget, listBudgets } from "@/services/budget-service";

export async function GET() {
  try {
    const user = await requireUser();
    return ok(await listBudgets(user.userId));
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const payload = await parseBody(request, budgetSchema);
    const created = await createBudget(user.userId, payload.budgetMonth, payload.name);
    return ok(created, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
