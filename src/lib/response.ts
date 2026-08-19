import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export function fail(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: { message: error.message, code: error.name } },
      { status: error.statusCode },
    );
  }

  const message = error instanceof Error ? error.message : "Unexpected server error";
  console.error("Unexpected error", error);
  return NextResponse.json(
    { error: { message, code: "InternalServerError" } },
    { status: 500 },
  );
}
