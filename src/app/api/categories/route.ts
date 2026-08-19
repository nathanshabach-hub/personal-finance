import { fail, ok } from "@/lib/response";
import { parseBody } from "@/lib/http";
import { requireUser } from "@/server/guards";
import { createCategory, listCategories } from "@/services/category-service";
import { writeAuditLog } from "@/services/audit-service";
import { createCategorySchema } from "@/validators/categories";

export async function GET() {
  try {
    const user = await requireUser();
    return ok(await listCategories(user.userId));
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const payload = await parseBody(request, createCategorySchema);
    const created = await createCategory(user.userId, payload);

    await writeAuditLog({
      userId: user.userId,
      action: "CREATE_CATEGORY",
      entityName: "Categories",
      entityId: String(created.CategoryId),
    });

    return ok(created, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
