import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });
  const role  = token?.role as string | undefined;
  const path  = req.nextUrl.pathname;

  // Proteksi /admin
  if (path.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (!["ADMIN", "SUPERADMIN"].includes((role ?? "").toUpperCase())) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Proteksi /akun
  if (path.startsWith("/akun")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/akun/:path*"],
};