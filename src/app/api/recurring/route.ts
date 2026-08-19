import { fail, ok } from "@/lib/response";
import { parseBody } from "@/lib/http";
import { requireUser } from "@/server/guards";
import { createRecurringSchema } from "@/validators/recurring";
import {
  createRecurringTransaction,
  listRecurringTransactions,
} from "@/services/recurring-service";

export async function GET() {
  try {
    const user = await requireUser();
    return ok(await listRecurringTransactions(user.userId));
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const payload = await parseBody(request, createRecurringSchema);
    const created = await createRecurringTransaction(user.userId, payload);
    return ok(created, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
