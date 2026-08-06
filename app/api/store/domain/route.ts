import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { serializeStoreWithSettings } from "@/lib/store-settings";
import { isPlatformHost, normalizeCustomDomain } from "@/lib/storefront-urls";
import {
  apexRoot,
  detectDomainMode,
  isValidHostname,
  parseDomainPrimary,
  type DomainPrimary,
} from "@/lib/domains/hostname";
import {
  addVercelDomain,
  isVercelDomainsConfigured,
  removeVercelDomain,
  syncApexWwwRedirect,
} from "@/lib/domains/vercel";
import { checkDomainDns, getDnsTargets } from "@/lib/domains/dns-check";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z
  .object({
    domain: z.string().max(253).nullable().optional(),
    domainPrimary: z.enum(["apex", "www"]).optional(),
  })
  .refine(
    (d) => d.domain !== undefined || d.domainPrimary !== undefined,
    { message: "Nothing to update" }
  );

async function getOwnedStore(userId: string) {
  return prisma.store.findFirst({
    where: { userId },
    include: { settings: true },
  });
}

function revalidateDomainPaths(store: { id: string; slug: string | null }) {
  revalidatePath("/dashboard/domains");
  revalidatePath("/dashboard/settings");
  if (store.slug) {
    revalidatePath(`/store/${store.slug}`);
    revalidatePath(`/store/${store.slug}`, "layout");
  }
}

/** Connect, remove, or update primary host preference for a custom domain. */
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
    const previousPrimary = parseDomainPrimary(store.settings?.domainPrimary);
    const updatingDomain = parsed.data.domain !== undefined;
    const next = updatingDomain
      ? parsed.data.domain == null || parsed.data.domain.trim() === ""
        ? null
        : normalizeCustomDomain(parsed.data.domain)
      : previous;

    let nextPrimary: DomainPrimary | null = previousPrimary;
    if (parsed.data.domainPrimary !== undefined) {
      nextPrimary = parsed.data.domainPrimary;
    }
    if (next && apexRoot(next)) {
      nextPrimary = nextPrimary ?? "apex";
    } else {
      nextPrimary = null;
    }

    if (updatingDomain && next) {
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

      const added = await addVercelDomain(next);
      if (!added.ok) {
        return NextResponse.json(
          { message: added.error ?? "Could not provision domain" },
          { status: 502 }
        );
      }

      const apex = apexRoot(next);
      if (apex) {
        await syncApexWwwRedirect(apex, nextPrimary ?? "apex");
      }

      if (previous && previous !== next) {
        await removeVercelDomain(previous);
        const prevApex = apexRoot(previous);
        if (prevApex) {
          await removeVercelDomain(`www.${prevApex}`);
          if (previous !== prevApex) await removeVercelDomain(prevApex);
        }
      }
    } else if (updatingDomain && previous && !next) {
      await removeVercelDomain(previous);
      const prevApex = apexRoot(previous);
      if (prevApex) {
        await removeVercelDomain(`www.${prevApex}`);
        if (previous !== prevApex) await removeVercelDomain(prevApex);
      }
      nextPrimary = null;
    } else if (!updatingDomain && next && apexRoot(next)) {
      // Preference-only update for an apex domain
      await syncApexWwwRedirect(apexRoot(next)!, nextPrimary ?? "apex");
    } else if (!updatingDomain && (!next || !apexRoot(next))) {
      return NextResponse.json(
        { message: "Primary redirect is only available for root domains" },
        { status: 400 }
      );
    }

    const settingsData = {
      customDomain: next,
      domainPrimary: next && apexRoot(next) ? nextPrimary ?? "apex" : null,
    };

    if (store.settings) {
      await prisma.storeSettings.update({
        where: { storeId: store.id },
        data: settingsData,
      });
    } else {
      await prisma.storeSettings.create({
        data: {
          storeId: store.id,
          ...settingsData,
        },
      });
    }

    const updated = await prisma.store.findFirst({
      where: { id: store.id },
      include: { settings: true },
    });

    revalidateDomainPaths(store);

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
