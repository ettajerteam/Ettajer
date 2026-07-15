import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { USER_STATUS } from "@/lib/founder/constants";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (token?.status === USER_STATUS.WAITING && token?.founderNumber) {
      if (path.startsWith("/dashboard") || path === "/onboarding") {
        return NextResponse.redirect(new URL("/early-access", req.url));
      }
    }

    if (token?.status === USER_STATUS.ACTIVE && path === "/early-access") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        const isProtected =
          path.startsWith("/dashboard") ||
          path.startsWith("/themes") ||
          path === "/onboarding" ||
          path === "/welcome" ||
          path === "/early-access";

        if (!isProtected) return true;
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  },
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/themes/:path*",
    "/onboarding",
    "/welcome",
    "/early-access",
  ],
};
