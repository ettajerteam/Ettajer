import { withAuth } from "next-auth/middleware";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { USER_STATUS } from "@/lib/founder/constants";
import { USER_ROLE } from "@/lib/admin/constants";
import { isPlatformHost } from "@/lib/storefront-urls";
import { isPlatformLaunched } from "@/lib/founder/launch-date";

const authMiddleware = withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const isAdmin = token?.role === USER_ROLE.ADMIN;
    const launched = isPlatformLaunched();

    if (path.startsWith("/admin") || path.startsWith("/api/admin")) {
      if (!isAdmin) {
        if (token) {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
        return NextResponse.redirect(new URL("/login", req.url));
      }
      return NextResponse.next();
    }

    // Pre-launch: waiting founders stay on early-access.
    // After launch: send them to their dashboard home.
    if (
      !isAdmin &&
      !launched &&
      token?.status === USER_STATUS.WAITING &&
      token?.founderNumber
    ) {
      if (path.startsWith("/dashboard") || path === "/onboarding") {
        return NextResponse.redirect(new URL("/early-access", req.url));
      }
    }

    // After launch: leave the waiting room. Prefer /opening so the JWT can
    // refresh, then land on dashboard (or onboarding if no store yet).
    // Do NOT bounce /opening — that bridge must run once.
    if (
      !isAdmin &&
      launched &&
      token?.status === USER_STATUS.WAITING &&
      token?.founderNumber &&
      path === "/early-access"
    ) {
      return NextResponse.redirect(
        new URL("/opening?next=%2Fdashboard", req.url)
      );
    }

    if (
      !isAdmin &&
      token?.status === USER_STATUS.ACTIVE &&
      token?.founderNumber &&
      path === "/early-access"
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        if (path.startsWith("/admin") || path.startsWith("/api/admin")) {
          return token?.role === USER_ROLE.ADMIN;
        }

        const isProtected =
          path.startsWith("/dashboard") ||
          path.startsWith("/themes") ||
          path === "/onboarding" ||
          path === "/welcome" ||
          path === "/early-access" ||
          path === "/opening";

        if (!isProtected) return true;
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  },
);

async function tryCustomDomainRewrite(req: NextRequest) {
  const host = req.headers.get("host")?.split(":")[0]?.toLowerCase();
  if (!host || isPlatformHost(host)) return null;

  const pathname = req.nextUrl.pathname;
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname === "/favicon.ico"
  ) {
    return null;
  }

  try {
    const lookupUrl = new URL("/api/store/domain-lookup", req.nextUrl.origin);
    lookupUrl.searchParams.set("host", host);
    const res = await fetch(lookupUrl.toString(), {
      headers: { "x-middleware-domain-lookup": "1" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { slug?: string | null };
    const slug = data.slug;
    if (!slug) return null;

    if (pathname === `/store/${slug}` || pathname.startsWith(`/store/${slug}/`)) {
      return NextResponse.next();
    }

    const url = req.nextUrl.clone();
    url.pathname = pathname === "/" ? `/store/${slug}` : `/store/${slug}${pathname}`;
    return NextResponse.rewrite(url);
  } catch {
    return null;
  }
}

function needsAuthMiddleware(pathname: string) {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/themes") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin") ||
    pathname === "/onboarding" ||
    pathname === "/welcome" ||
    pathname === "/early-access" ||
    pathname === "/opening"
  );
}

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  const rewrite = await tryCustomDomainRewrite(req);
  if (rewrite) return rewrite;

  if (!needsAuthMiddleware(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  return authMiddleware(req as never, event);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
