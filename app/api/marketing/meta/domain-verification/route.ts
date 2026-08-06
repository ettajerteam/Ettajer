import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import {
  buildFacebookDomainVerificationMetaTag,
  checkFacebookDomainVerificationTag,
  getMetaDomainVerificationTargets,
} from "@/lib/meta-domain-verification";
import { parseMarketingIntegrations } from "@/lib/marketing-integrations";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Domain verification guide payload + optional live meta-tag check. */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
    include: { settings: { select: { marketingIntegrations: true, customDomain: true } } },
  });

  if (!store) {
    return NextResponse.json({ message: "Store not found" }, { status: 404 });
  }

  const meta = parseMarketingIntegrations(store.settings?.marketingIntegrations).meta;
  const targets = getMetaDomainVerificationTargets({
    storeSlug: store.slug,
    customDomain: store.settings?.customDomain ?? null,
  });

  const code = meta.domainVerificationCode;
  const url = new URL(request.url);
  const shouldCheck = url.searchParams.get("check") === "1";

  let live: Awaited<ReturnType<typeof checkFacebookDomainVerificationTag>> | null =
    null;
  if (shouldCheck && code) {
    live = await checkFacebookDomainVerificationTag({
      url: targets.storefrontUrl,
      expectedCode: code,
    });
  }

  return NextResponse.json({
    storeSlug: store.slug,
    storeName: store.name,
    ...targets,
    code,
    metaTag: code ? buildFacebookDomainVerificationMetaTag(code) : null,
    markedVerifiedAt: meta.domainVerifiedAt,
    live,
    guide: {
      businessDomainsUrl: "https://business.facebook.com/settings/owned-domains",
      helpUrl: "https://www.facebook.com/business/help/321167023127050",
      steps: [
        "Open Meta Business Settings → Brand safety → Domains.",
        targets.rootDomain
          ? `Add domain “${targets.rootDomain}” (root only — no www or https).`
          : "Connect a custom domain first, then add that root domain in Meta.",
        "Choose “Add a meta-tag to your HTML source code” and copy the content value.",
        "Paste the code here, save, then click Verify in Meta.",
      ],
    },
  });
}
