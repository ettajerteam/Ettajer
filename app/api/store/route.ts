import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { serializeStoreWithSettings } from "@/lib/store-settings";
import { updateStoreSchema } from "@/lib/validations/store";
import { DEFAULT_SHIPPING_ZONES, DEFAULT_PAYMENT_GATEWAYS, DEFAULT_TICKET_PRINTERS, DEFAULT_MARKETING_INTEGRATIONS } from "@/lib/store-settings";
import { mergeSeoSettings, mergeShopPreferences } from "@/lib/shop-preferences";
import { isBusinessModel } from "@/lib/onboarding/business-models";
import {
  installWebsiteTemplateOnStore,
  parseWebsiteTemplateId,
} from "@/lib/website-templates/install-to-store";
import { isPlatformHost, normalizeCustomDomain } from "@/lib/storefront-urls";
import { isApexHostname, isValidHostname } from "@/lib/domains/hostname";
import {
  addVercelDomain,
  addVercelWwwRedirect,
  removeVercelDomain,
} from "@/lib/domains/vercel";
import type { StoreSeoSettings } from "@/lib/seo/storefront-metadata";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, category, currency, businessModel, websiteTemplateId } = body;

    if (!name || !category || !currency) {
      return NextResponse.json(
        { message: "Name, category, and currency are required" },
        { status: 400 }
      );
    }

    if (!businessModel || !isBusinessModel(businessModel)) {
      return NextResponse.json(
        { message: "A valid business model is required" },
        { status: 400 }
      );
    }

    const templateId = parseWebsiteTemplateId(websiteTemplateId);
    if (!templateId) {
      return NextResponse.json(
        { message: "A valid website template is required" },
        { status: 400 }
      );
    }

    const existingStore = await prisma.store.findFirst({
      where: { userId: session.user.id },
    });

    if (existingStore) {
      return NextResponse.json(
        { message: "You already have a store" },
        { status: 400 }
      );
    }

    let slug = slugify(name);
    const slugExists = await prisma.store.findUnique({ where: { slug } });
    if (slugExists) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const store = await prisma.store.create({
      data: {
        name,
        slug,
        category,
        currency,
        businessModel,
        websiteTemplateId: templateId,
        userId: session.user.id,
        settings: {
          create: {
            shippingZones: DEFAULT_SHIPPING_ZONES,
            paymentGateways: DEFAULT_PAYMENT_GATEWAYS,
            ticketPrinters: DEFAULT_TICKET_PRINTERS as unknown as Prisma.InputJsonValue,
            marketingIntegrations: DEFAULT_MARKETING_INTEGRATIONS as unknown as Prisma.InputJsonValue,
          },
        },
      },
      include: { settings: true },
    });

    await installWebsiteTemplateOnStore(store.id, templateId);

    const storeWithTemplate = await prisma.store.findFirst({
      where: { id: store.id },
      include: { settings: true },
    });

    return NextResponse.json(
      { store: serializeStoreWithSettings(storeWithTemplate!) },
      { status: 201 }
    );
  } catch (error) {
    console.error("Store creation error:", error);
    return NextResponse.json(
      { message: "Failed to create store" },
      { status: 500 }
    );
  }
}

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

    return NextResponse.json({ store: serializeStoreWithSettings(store) });
  } catch (error) {
    console.error("Store fetch error:", error);
    return NextResponse.json(
      { message: "Failed to fetch store" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.store.findFirst({
      where: { userId: session.user.id },
      include: { settings: true },
    });

    if (!existing) {
      return NextResponse.json({ message: "Store not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateStoreSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstField = Object.keys(fieldErrors)[0];
      const firstMsg = firstField
        ? fieldErrors[firstField as keyof typeof fieldErrors]?.[0]
        : undefined;
      return NextResponse.json(
        {
          message: firstMsg ?? "Validation failed",
          errors: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (
      data.paymentGateways !== undefined &&
      !data.paymentGateways.cashOnDelivery &&
      !data.paymentGateways.stripe
    ) {
      return NextResponse.json(
        { message: "Enable at least one payment method (COD or Stripe)" },
        { status: 400 }
      );
    }
    const storeUpdate: Record<string, unknown> = {};

    if (data.name !== undefined) storeUpdate.name = data.name;
    if (data.description !== undefined) storeUpdate.description = data.description;
    if (data.logo !== undefined) storeUpdate.logo = data.logo;
    if (data.contactEmail !== undefined) storeUpdate.contactEmail = data.contactEmail;
    if (data.phone !== undefined) storeUpdate.phone = data.phone;
    if (data.address !== undefined) storeUpdate.address = data.address;
    if (data.currency !== undefined) storeUpdate.currency = data.currency;
    if (data.language !== undefined) storeUpdate.language = data.language;
    if (data.theme !== undefined) storeUpdate.theme = data.theme;
    if (data.primaryColor !== undefined) storeUpdate.primaryColor = data.primaryColor;
    if (data.secondaryColor !== undefined) storeUpdate.secondaryColor = data.secondaryColor;
    if (data.font !== undefined) storeUpdate.font = data.font;

    if (data.slug !== undefined && data.slug !== existing.slug) {
      const slugTaken = await prisma.store.findFirst({
        where: { slug: data.slug, NOT: { id: existing.id } },
        select: { id: true },
      });
      if (slugTaken) {
        return NextResponse.json({ message: "That store URL is already taken" }, { status: 409 });
      }
      storeUpdate.slug = data.slug;
    }

    const settingsUpdate: Record<string, unknown> = {};
    if (data.shippingZones !== undefined) {
      settingsUpdate.shippingZones = data.shippingZones;
    }
    if (data.paymentGateways !== undefined) {
      settingsUpdate.paymentGateways = data.paymentGateways;
    }
    if (data.ticketPrinters !== undefined) {
      settingsUpdate.ticketPrinters = data.ticketPrinters as unknown as Prisma.InputJsonValue;
    }
    if (data.marketingIntegrations !== undefined) {
      settingsUpdate.marketingIntegrations = data.marketingIntegrations as unknown as Prisma.InputJsonValue;
    }
    if (data.customDomain !== undefined) {
      const previous = normalizeCustomDomain(existing.settings?.customDomain);
      const normalized = normalizeCustomDomain(data.customDomain);
      if (normalized && !isValidHostname(normalized)) {
        return NextResponse.json(
          { message: "Enter a valid domain like shop.yourbrand.com" },
          { status: 400 }
        );
      }
      if (normalized && isPlatformHost(normalized)) {
        return NextResponse.json(
          { message: "That domain belongs to Ettajer and cannot be used" },
          { status: 400 }
        );
      }
      if (normalized) {
        const domainTaken = await prisma.storeSettings.findFirst({
          where: {
            OR: [{ customDomain: normalized }, { customDomain: `www.${normalized}` }],
            NOT: { storeId: existing.id },
          },
          select: { storeId: true },
        });
        if (domainTaken) {
          return NextResponse.json(
            { message: "That custom domain is already connected to another store" },
            { status: 409 }
          );
        }
        const added = await addVercelDomain(normalized);
        if (!added.ok) {
          return NextResponse.json(
            { message: added.error ?? "Could not provision domain" },
            { status: 502 }
          );
        }
        if (isApexHostname(normalized)) {
          await addVercelWwwRedirect(normalized);
        }
        if (previous && previous !== normalized) {
          await removeVercelDomain(previous);
          if (isApexHostname(previous)) await removeVercelDomain(`www.${previous}`);
        }
      } else if (previous) {
        await removeVercelDomain(previous);
        if (isApexHostname(previous)) await removeVercelDomain(`www.${previous}`);
      }
      settingsUpdate.customDomain = normalized;
    }

    if (data.seo !== undefined || data.shop !== undefined) {
      let seoJson: unknown = existing.settings?.seo ?? {};
      if (data.seo !== undefined) {
        const seoPatch: StoreSeoSettings = {
          title: data.seo.title?.trim() ? data.seo.title.trim() : undefined,
          description: data.seo.description?.trim()
            ? data.seo.description.trim()
            : undefined,
          keywords: data.seo.keywords,
          noIndex: data.seo.noIndex,
        };
        // Explicit empty/null clears the field via mergeSeoSettings
        if (data.seo.title !== undefined && !data.seo.title?.trim()) {
          seoPatch.title = "";
        }
        if (data.seo.description !== undefined && !data.seo.description?.trim()) {
          seoPatch.description = "";
        }
        seoJson = mergeSeoSettings(seoJson, seoPatch);
      }
      if (data.shop !== undefined) {
        seoJson = mergeShopPreferences(seoJson, data.shop);
      }
      settingsUpdate.seo = seoJson as Prisma.InputJsonValue;
    }

    await prisma.$transaction(async (tx) => {
      if (Object.keys(storeUpdate).length > 0) {
        await tx.store.update({
          where: { id: existing.id },
          data: storeUpdate,
        });
      }

      if (Object.keys(settingsUpdate).length > 0) {
        if (existing.settings) {
          await tx.storeSettings.update({
            where: { storeId: existing.id },
            data: settingsUpdate,
          });
        } else {
          await tx.storeSettings.create({
            data: {
              storeId: existing.id,
              shippingZones: data.shippingZones ?? DEFAULT_SHIPPING_ZONES,
              paymentGateways: data.paymentGateways ?? DEFAULT_PAYMENT_GATEWAYS,
              ticketPrinters: (data.ticketPrinters ?? DEFAULT_TICKET_PRINTERS) as unknown as Prisma.InputJsonValue,
              marketingIntegrations: (data.marketingIntegrations ?? DEFAULT_MARKETING_INTEGRATIONS) as unknown as Prisma.InputJsonValue,
              customDomain:
                data.customDomain !== undefined
                  ? normalizeCustomDomain(data.customDomain)
                  : null,
              seo:
                (settingsUpdate.seo as Prisma.InputJsonValue | undefined) ??
                undefined,
            },
          });
        }
      }
    });

    const updated = await prisma.store.findFirst({
      where: { id: existing.id },
      include: { settings: true },
    });

    if (
      data.marketingIntegrations !== undefined ||
      data.slug !== undefined ||
      data.customDomain !== undefined ||
      data.seo !== undefined ||
      data.shop !== undefined ||
      data.contactEmail !== undefined ||
      data.phone !== undefined ||
      data.address !== undefined ||
      data.name !== undefined ||
      data.description !== undefined ||
      data.logo !== undefined ||
      data.currency !== undefined ||
      data.language !== undefined ||
      data.shippingZones !== undefined ||
      data.paymentGateways !== undefined ||
      data.ticketPrinters !== undefined
    ) {
      revalidatePath("/dashboard/marketing");
      revalidatePath("/dashboard/marketing/[platform]", "page");
      revalidatePath("/dashboard/settings");
      revalidatePath("/dashboard/domains");
      if (existing.slug) {
        revalidatePath(`/store/${existing.slug}`);
        revalidatePath(`/store/${existing.slug}`, "layout");
      }
      if (updated?.slug) {
        revalidatePath(`/store/${updated.slug}`);
        revalidatePath(`/store/${updated.slug}`, "layout");
      }
    }

    return NextResponse.json({ store: serializeStoreWithSettings(updated!) });
  } catch (error) {
    console.error("Store update error:", error);
    return NextResponse.json(
      { message: "Failed to update store" },
      { status: 500 }
    );
  }
}
