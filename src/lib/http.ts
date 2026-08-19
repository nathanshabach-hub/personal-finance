import { ZodType } from "zod";
import { AppError } from "@/lib/errors";

export async function parseBody<T>(request: Request, schema: ZodType<T>) {
  const body = await request.json().catch(() => {
    throw new AppError("Invalid JSON payload");
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message ?? "Validation failed", 400);
  }

  return parsed.data;
}

export function getPagination(searchParams: URLSearchParams) {
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "25");
  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: Number.isFinite(pageSize) && pageSize > 0 && pageSize <= 100 ? pageSize : 25,
  };
}
