import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { serializeStoreWithSettings } from "@/lib/store-settings";
import { updateStoreSchema } from "@/lib/validations/store";
import { DEFAULT_SHIPPING_ZONES, DEFAULT_PAYMENT_GATEWAYS, DEFAULT_TICKET_PRINTERS, DEFAULT_MARKETING_INTEGRATIONS } from "@/lib/store-settings";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, category, currency } = body;

    if (!name || !category || !currency) {
      return NextResponse.json(
        { message: "Name, category, and currency are required" },
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

    return NextResponse.json(
      { store: serializeStoreWithSettings(store) },
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
      return NextResponse.json(
        { message: "Validation failed", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
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
            },
          });
        }
      }
    });

    const updated = await prisma.store.findFirst({
      where: { id: existing.id },
      include: { settings: true },
    });

    if (data.marketingIntegrations !== undefined) {
      revalidatePath("/dashboard/marketing");
      revalidatePath("/dashboard/marketing/[platform]", "page");
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
