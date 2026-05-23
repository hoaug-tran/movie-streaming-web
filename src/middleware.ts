import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const GATE_COOKIE_NAME = "gp_gate";
const ACCESS_COOKIE_NAME = "accessToken";
const REFRESH_COOKIE_NAME = "refreshToken";
const ADMIN_ROLE = "ROLE_ADMIN";
const MODERATOR_ROLE = "ROLE_MODERATOR";

const MODERATOR_ALLOWED_PREFIXES = ["/admin/moderation", "/admin/reports"];

const GATE_BYPASS_PREFIXES = [
  "/access",
  "/api",
  "/auth",
  "/_next",
  "/icons",
  "/images",
  "/favicon",
  "/manifest",
  "/sw.js",
  "/robots.txt",
  "/sitemap",
];

const PROTECTED_PREFIXES = [
  "/profile",
  "/watchlist",
  "/favorites",
  "/history",
  "/account",
  "/admin",
];

type JwtPayload = {
  sub?: string;
  role?: string;
  exp?: number;
};

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload + "===".slice((payload.length + 3) % 4);
    const json = atob(padded);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

function isExpired(payload: JwtPayload): boolean {
  if (!payload.exp) return false;
  return payload.exp * 1000 <= Date.now();
}

function redirectToLogin(request: NextRequest, pathname: string, search: string) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/auth/login";

  const returnTo = pathname + search;
  loginUrl.searchParams.set("returnTo", returnTo);
  loginUrl.searchParams.set("next", returnTo);

  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete(ACCESS_COOKIE_NAME);

  return response;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isBypass = GATE_BYPASS_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
  const hasFileExt = /\.[a-z0-9]+$/i.test(pathname);
  const skipGate = isBypass || hasFileExt;

  const gatePassed = request.cookies.get(GATE_COOKIE_NAME)?.value === "1";

  if (!skipGate && !gatePassed) {
    const url = request.nextUrl.clone();
    url.pathname = "/access";
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  const rawToken = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const hasRefreshToken = Boolean(request.cookies.get(REFRESH_COOKIE_NAME)?.value);
  const payload = rawToken ? decodeJwtPayload(rawToken) : null;
  const tokenValid = payload !== null && !isExpired(payload);
  const canAttemptRefresh = !tokenValid && hasRefreshToken;

  if (tokenValid && (pathname === "/auth/login" || pathname === "/auth/register")) {
    const returnTo = request.nextUrl.searchParams.get("returnTo") || "/";
    const safeReturnTo =
      returnTo.startsWith("/") && !returnTo.startsWith("//") && !returnTo.startsWith("/auth/")
        ? returnTo
        : "/";

    const url = request.nextUrl.clone();
    url.pathname = safeReturnTo;
    url.search = "";
    return NextResponse.redirect(url);
  }

  const isProtected = PROTECTED_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isProtected && !tokenValid && !canAttemptRefresh) {
    return redirectToLogin(request, pathname, search);
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!tokenValid) {
      if (canAttemptRefresh) {
        return NextResponse.next();
      }
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = "/";
      homeUrl.search = "";
      return NextResponse.redirect(homeUrl);
    }
    const role = payload?.role ?? "";
    const isAdmin = role === ADMIN_ROLE;
    const isModerator = role === MODERATOR_ROLE;
    if (!isAdmin && !isModerator) {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = "/";
      homeUrl.search = "";
      return NextResponse.redirect(homeUrl);
    }
    if (isModerator) {
      const allowedExact = pathname === "/admin";
      const allowedPrefix = MODERATOR_ALLOWED_PREFIXES.some(
        (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
      );
      if (!allowedExact && !allowedPrefix) {
        const homeUrl = request.nextUrl.clone();
        homeUrl.pathname = "/admin";
        homeUrl.search = "";
        return NextResponse.redirect(homeUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
