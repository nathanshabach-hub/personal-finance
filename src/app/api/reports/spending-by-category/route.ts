import { endOfMonth, format, startOfMonth } from "date-fns";
import { fail, ok } from "@/lib/response";
import { requireUser } from "@/server/guards";
import { spendingByCategory } from "@/services/report-service";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    const now = new Date();
    const effectiveFromDate = fromDate ?? format(startOfMonth(now), "yyyy-MM-dd");
    const effectiveToDate = toDate ?? format(endOfMonth(now), "yyyy-MM-dd");

    return ok(await spendingByCategory(user.userId, effectiveFromDate, effectiveToDate));
  } catch (error) {
    return fail(error);
  }
}
