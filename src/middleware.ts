import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const isAuthPage = req.nextUrl.pathname.includes("/login");

    if (isAuthPage && req.nextauth.token) {
      // User is logged in, but requesting a login page -> redirect to dashboard
      return NextResponse.redirect(new URL("/ar/dashboard", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Only allow authenticated users to access specific paths
        const path = req.nextUrl.pathname;
        
        // Let public paths pass
        if (
          path.includes("/login") || 
          path.includes("/landing") ||
          path.startsWith("/api/auth") ||
          path.includes("/_next") ||
          path.includes("/favicon.ico") ||
          !path.includes("/dashboard") // assuming all protected routes contain 'dashboard' or we configure Matcher
          ) {
          return true;
        }

        // Return true if there is a token (authenticated)
        return !!token;
      },
    },
    pages: {
      signIn: "/ar/login",
    },
  }
);

// Protected routes configuration
export const config = {
  matcher: [
    // Protect these specific dashboards modules
    "/ar/dashboard/:path*",
    "/en/dashboard/:path*",
    "/dashboard/:path*",
    "/api/:path*" // Protect APIs, but authorized callback lets /api/auth pass
  ],
};