import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/dashboard", "/routines", "/measurements", "/goals", "/protocols", "/payments", "/profile", "/settings"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));

  if (isProtected) {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*", "/routines/:path*", "/measurements/:path*",
    "/goals/:path*", "/protocols/:path*", "/payments/:path*",
    "/profile/:path*", "/settings/:path*",
  ],
};
