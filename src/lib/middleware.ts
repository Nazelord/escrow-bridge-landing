// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "eb_auth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    const token = req.cookies.get(AUTH_COOKIE);

    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
