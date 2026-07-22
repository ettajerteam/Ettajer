import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isPlatformHost, normalizeCustomDomain } from "@/lib/storefront-urls";

export const dynamic = "force-dynamic";

/** Public lookup: custom domain hostname → store slug (for middleware rewrites). */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hostParam = searchParams.get("host");
    const host = normalizeCustomDomain(hostParam);
    if (!host || isPlatformHost(host)) {
      return NextResponse.json({ slug: null });
    }

    const settings = await prisma.storeSettings.findFirst({
      where: {
        OR: [{ customDomain: host }, { customDomain: `www.${host}` }],
      },
      select: {
        store: { select: { slug: true } },
      },
    });

    return NextResponse.json({ slug: settings?.store.slug ?? null });
  } catch (error) {
    console.error("Domain lookup error:", error);
    return NextResponse.json({ slug: null }, { status: 500 });
  }
}
