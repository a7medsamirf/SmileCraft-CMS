import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Extract auth token from cookies (do this before intlMiddleware to decide if we need to redirect)
  const token = request.cookies.get("auth_token")?.value;

  // 2. Identify and handle auth/protected routes
  const pathnameIsMissingLocale = routing.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  const cleanPath = pathnameIsMissingLocale
    ? pathname
    : pathname.replace(/^\/(ar|en)/, "") || "/";

  // Check for login at both levels for safety
  const isAuthPage = cleanPath.startsWith("/login") || cleanPath.startsWith("/auth/login");
  const isPublicPage = cleanPath === "/" || cleanPath.startsWith("/landing");
  const isProtectedPage = !isAuthPage && !isPublicPage && !pathname.includes(".");

  // 3. Manual Redirect Logic BEFORE running intlMiddleware
  // (This handles the case where we don't want intlMiddleware to run if we're redirecting anyway)
  
  // Case A: User is NOT logged in and trying to access a protected page
  if (!token && isProtectedPage) {
    const locale = pathname.split("/")[1] || routing.defaultLocale;
    const loginUrl = new URL(`/${locale}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Case B: User IS logged in and trying to access login page
  if (token && isAuthPage) {
    const locale = pathname.split("/")[1] || routing.defaultLocale;
    const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // 4. Handle internationalization for other cases
  const response = intlMiddleware(request);

  return response;
}

export const config = {
  // Match all pathnames except for
  // - /api (API routes)
  // - /_next (Next.js internals)
  // - /_static (inside /public)
  // - all root files inside /public (e.g. /favicon.ico)
  matcher: ["/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)"],
};