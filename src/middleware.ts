import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const GATE_COOKIE_NAME = "gp_gate";

const GATE_BYPASS_PREFIXES = [
  "/access",
  "/api/access",
  "/_next",
  "/icons",
  "/images",
  "/favicon",
  "/manifest",
  "/sw.js",
  "/robots.txt",
  "/sitemap",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isBypass = GATE_BYPASS_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/") || pathname === prefix
  );
  const hasFileExt = /\.[a-z0-9]+$/i.test(pathname);
  const skipGate = isBypass || hasFileExt;

  const gatePassed = request.cookies.get(GATE_COOKIE_NAME)?.value === "1";

  if (!skipGate && !gatePassed) {
    const url = request.nextUrl.clone();
    url.pathname = "/access";
    url.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  const token = request.cookies.get("accessToken")?.value;

  const protectedRoutes = ["/profile", "/watchlist", "/favorites", "/admin"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (request.nextUrl.pathname.startsWith("/admin") && token) {
    // TODO: Verify user role from JWT token
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
