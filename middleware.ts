import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = [
  "/dashboard",
  "/transactions",
  "/budget",
  "/accounts",
  "/goals",
  "/reports",
  "/recurring",
  "/settings",
];

const AUTH_PATHS = ["/login", "/register", "/forgot-password"];

export function middleware(request: NextRequest) {
  const session = request.cookies.get("pf_session")?.value;
  const path = request.nextUrl.pathname;

  const isProtected = PROTECTED_PATHS.some((prefix) => path.startsWith(prefix));
  if (isProtected && !session) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  if (session && AUTH_PATHS.some((prefix) => path.startsWith(prefix))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/transactions/:path*",
    "/budget/:path*",
    "/accounts/:path*",
    "/goals/:path*",
    "/reports/:path*",
    "/recurring/:path*",
    "/settings/:path*",
    "/login",
    "/register",
    "/forgot-password",
  ],
};
