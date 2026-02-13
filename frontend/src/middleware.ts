import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/logout",
  "/auth/callback",
  "/mfa-verify",
  "/mfa-setup",
];

/**
 * Next.js middleware for route protection.
 * Checks for the auth_session cookie set during the OAuth callback.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (
    PUBLIC_ROUTES.some(
      (route) => pathname === route || pathname.startsWith("/api/"),
    )
  ) {
    return NextResponse.next();
  }

  // Allow static assets and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check for auth session cookie (set during callback)
  const hasSession = request.cookies.has("auth_session");

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
