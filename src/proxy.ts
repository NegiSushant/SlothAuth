import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, AUTH_COOKIE } from "@/lib/auth/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE.name)?.value;

  const isAuth = token ? await verifySessionToken(token) : null;

  // Protected routes: /dashboard and its sub-paths
  const isProtectedRoute = pathname.startsWith("/dashboard");

  // Auth pages: /signin, /signup
  const isAuthRoute = pathname === "/signin" || pathname === "/signup";

  if (isProtectedRoute) {
    if (!isAuth) {
      const signInUrl = new URL("/signin", request.url);
      signInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  }

  if (isAuthRoute) {
    if (isAuth) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/signin", "/signup"],
};
