import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { serializeStoreWithSettings } from "@/lib/store-settings";
import { isPlatformHost, normalizeCustomDomain } from "@/lib/storefront-urls";
import {
  detectDomainMode,
  isApexHostname,
  isValidHostname,
} from "@/lib/domains/hostname";
import {
  addVercelDomain,
  addVercelWwwRedirect,
  isVercelDomainsConfigured,
  removeVercelDomain,
} from "@/lib/domains/vercel";
import { checkDomainDns, getDnsTargets } from "@/lib/domains/dns-check";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z.object({
  domain: z.string().max(253).nullable(),
});

async function getOwnedStore(userId: string) {
  return prisma.store.findFirst({
    where: { userId },
    include: { settings: true },
  });
}

/** Connect or remove a custom domain for the merchant store. */
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const store = await getOwnedStore(session.user.id);
    if (!store) {
      return NextResponse.json({ message: "Store not found" }, { status: 404 });
    }

    const previous = normalizeCustomDomain(store.settings?.customDomain);
    const nextRaw = parsed.data.domain;
    const next = nextRaw == null || nextRaw.trim() === ""
      ? null
      : normalizeCustomDomain(nextRaw);

    if (next) {
      if (!isValidHostname(next)) {
        return NextResponse.json(
          { message: "Enter a valid domain like shop.yourbrand.com" },
          { status: 400 }
        );
      }
      if (isPlatformHost(next)) {
        return NextResponse.json(
          { message: "That domain belongs to Ettajer and cannot be used" },
          { status: 400 }
        );
      }

      const taken = await prisma.storeSettings.findFirst({
        where: {
          OR: [{ customDomain: next }, { customDomain: `www.${next}` }],
          NOT: { storeId: store.id },
        },
        select: { storeId: true },
      });
      if (taken) {
        return NextResponse.json(
          { message: "That domain is already connected to another store" },
          { status: 409 }
        );
      }

      // Provision on Vercel first so traffic + SSL can work
      const added = await addVercelDomain(next);
      if (!added.ok) {
        return NextResponse.json(
          { message: added.error ?? "Could not provision domain" },
          { status: 502 }
        );
      }

      if (isApexHostname(next)) {
        // Best-effort www → apex redirect; don't fail the whole connect
        await addVercelWwwRedirect(next);
      }

      if (previous && previous !== next) {
        await removeVercelDomain(previous);
        if (isApexHostname(previous)) {
          await removeVercelDomain(`www.${previous}`);
        }
      }
    } else if (previous) {
      await removeVercelDomain(previous);
      if (isApexHostname(previous)) {
        await removeVercelDomain(`www.${previous}`);
      }
    }

    if (store.settings) {
      await prisma.storeSettings.update({
        where: { storeId: store.id },
        data: { customDomain: next },
      });
    } else {
      await prisma.storeSettings.create({
        data: {
          storeId: store.id,
          customDomain: next,
        },
      });
    }

    const updated = await prisma.store.findFirst({
      where: { id: store.id },
      include: { settings: true },
    });

    revalidatePath("/dashboard/domains");
    revalidatePath("/dashboard/settings");
    if (store.slug) {
      revalidatePath(`/store/${store.slug}`);
      revalidatePath(`/store/${store.slug}`, "layout");
    }

    const dns = next ? await checkDomainDns(next) : null;
    const targets = getDnsTargets();

    return NextResponse.json({
      store: serializeStoreWithSettings(updated!),
      vercelConfigured: isVercelDomainsConfigured(),
      mode: next ? detectDomainMode(next) : null,
      dns,
      expected: {
        ...targets,
        mode: next ? detectDomainMode(next) : null,
      },
    });
  } catch (error) {
    console.error("Domain connect error:", error);
    return NextResponse.json(
      { message: "Could not update domain" },
      { status: 500 }
    );
  }
}
