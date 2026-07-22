import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { isPlatformHost, normalizeCustomDomain } from "@/lib/storefront-urls";
import { detectDomainMode, isApexHostname, subdomainLabel } from "@/lib/domains/hostname";
import { checkDomainDns, getDnsTargets } from "@/lib/domains/dns-check";
import {
  getVercelDnsRecommendations,
  getVercelDomainConfig,
  isVercelDomainsConfigured,
} from "@/lib/domains/vercel";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Authenticated: verify this store’s custom domain mapping + DNS (+ Vercel). */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const store = await prisma.store.findFirst({
      where: { userId: session.user.id },
      include: { settings: true },
    });
    if (!store) {
      return NextResponse.json({ message: "Store not found" }, { status: 404 });
    }

    const domain = normalizeCustomDomain(store.settings?.customDomain);
    const targets = getDnsTargets();
    const vercelConfigured = isVercelDomainsConfigured();

    if (!domain || isPlatformHost(domain)) {
      return NextResponse.json({
        connected: false,
        domain: null,
        mapped: false,
        dns: null,
        httpsUrl: null,
        vercelConfigured,
        vercel: null,
        recommendations: null,
        steps: {
          saved: false,
          provisioned: false,
          dns: false,
          ssl: false,
        },
        live: false,
        expected: {
          ...targets,
          mode: null,
          host: null,
        },
      });
    }

    const mapped = Boolean(store.settings?.customDomain);
    const mode = detectDomainMode(domain);
    const dns = await checkDomainDns(domain);
    const vercel = await getVercelDomainConfig(domain);
    const recommendations = await getVercelDnsRecommendations(domain);

    let wwwDns = null;
    if (isApexHostname(domain)) {
      wwwDns = await checkDomainDns(`www.${domain}`);
    }

    const provisioned = Boolean(vercel.found || !vercelConfigured);
    const ssl = Boolean(vercel.verified || (dns.ok && provisioned));
    const live = Boolean(mapped && (vercel.verified || dns.ok));

    const cnameTarget =
      recommendations.recommendedCNAME || targets.cnameTarget;
    const aTarget =
      recommendations.recommendedIPv4?.[0] || targets.aTarget;

    return NextResponse.json({
      connected: true,
      domain,
      mapped,
      dns,
      wwwDns,
      httpsUrl: `https://${domain}`,
      vercelConfigured,
      vercel: vercelConfigured
        ? {
            found: vercel.found,
            verified: vercel.verified,
            error: vercel.error ?? null,
            verification: vercel.verification ?? null,
          }
        : null,
      recommendations: recommendations.configured
        ? {
            cnameTarget,
            aTarget,
            misconfigured: Boolean(recommendations.misconfigured),
            currentCnames: recommendations.cnames ?? [],
            currentA: recommendations.aValues ?? [],
          }
        : null,
      steps: {
        saved: mapped,
        provisioned: vercelConfigured ? Boolean(vercel.found) : mapped,
        dns: dns.ok,
        ssl,
      },
      live,
      expected: {
        cnameTarget,
        aTarget,
        mode,
        host: mode === "apex" ? "@" : subdomainLabel(domain),
      },
    });
  } catch (error) {
    console.error("Domain verify error:", error);
    return NextResponse.json({ message: "Verification failed" }, { status: 500 });
  }
}
