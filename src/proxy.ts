import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  // Viva sends every paying customer back here, including guests who checked
  // out from the landing page without an account — the page itself copes
  // with a missing session.
  if (pathname === "/dashboard/funds/callback") return;

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/dashboard")) {
    if (!req.auth) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (!req.auth.user.verified) {
      return NextResponse.redirect(new URL("/verify-email/pending", req.url));
    }
  }
});

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
