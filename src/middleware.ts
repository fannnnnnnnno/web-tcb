import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role as string | undefined;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/admin")) {
      if (!role || !["ADMIN", "SUPERADMIN"].includes(role)) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }
    if (path.startsWith("/akun")) {
      if (!role) return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  },
  { callbacks: { authorized: ({ token }) => !!token } }
);

export const config = {
  matcher: ["/admin/:path*", "/akun/:path*"],
};
