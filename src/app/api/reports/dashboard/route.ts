import { endOfMonth, format, startOfMonth } from "date-fns";
import { fail, ok } from "@/lib/response";
import { requireUser } from "@/server/guards";
import { dashboardSummary } from "@/services/report-service";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const pivotDate = month ? new Date(`${month}-01`) : new Date();

    const monthStart = format(startOfMonth(pivotDate), "yyyy-MM-dd");
    const monthEnd = format(endOfMonth(pivotDate), "yyyy-MM-dd");

    return ok(await dashboardSummary(user.userId, monthStart, monthEnd));
  } catch (error) {
    return fail(error);
  }
}
