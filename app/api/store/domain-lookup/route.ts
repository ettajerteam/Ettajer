import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  alternateHostname,
  domainLookupCandidates,
  parseDomainPrimary,
  preferredHostname,
} from "@/lib/domains/hostname";
import { isPlatformHost, normalizeCustomDomain } from "@/lib/storefront-urls";

export const dynamic = "force-dynamic";

/** Public lookup: custom domain hostname → store slug (for middleware rewrites). */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hostParam = searchParams.get("host");
    const host = normalizeCustomDomain(hostParam);
    if (!host || isPlatformHost(host)) {
      return NextResponse.json({ slug: null, canonicalHost: null, aliasHosts: [] });
    }

    const candidates = domainLookupCandidates(host);
    const settings = await prisma.storeSettings.findFirst({
      where: {
        OR: candidates.map((customDomain) => ({ customDomain })),
      },
      select: {
        customDomain: true,
        domainPrimary: true,
        store: { select: { slug: true } },
      },
    });

    const slug = settings?.store.slug ?? null;
    if (!slug || !settings?.customDomain) {
      return NextResponse.json({ slug: null, canonicalHost: null, aliasHosts: [] });
    }

    const primary = parseDomainPrimary(settings.domainPrimary);
    const canonicalHost = preferredHostname(settings.customDomain, primary);
    const alias = alternateHostname(settings.customDomain, primary);
    const aliasHosts = alias ? [alias] : [];

    return NextResponse.json({ slug, canonicalHost, aliasHosts });
  } catch (error) {
    console.error("Domain lookup error:", error);
    return NextResponse.json(
      { slug: null, canonicalHost: null, aliasHosts: [] },
      { status: 500 }
    );
  }
}
