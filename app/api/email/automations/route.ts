import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedStore } from "@/lib/products";
import { prisma } from "@/lib/db";
import {
  ensureEmailAutomationsSeeded,
  listEmailAutomations,
  serializeEmailAutomation,
  setEmailAutomation,
} from "@/lib/email-marketing/automations";
import { isEmailAutomationTrigger } from "@/lib/email-marketing/triggers";
import { listEmailTemplates, serializeEmailTemplate } from "@/lib/email-marketing/templates";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const authStore = await getAuthenticatedStore();
    if (!authStore) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const store = await prisma.store.findUnique({
      where: { id: authStore.id },
      select: {
        id: true,
        name: true,
        settings: { select: { newsletterAutomations: true } },
      },
    });
    if (!store) {
      return NextResponse.json({ message: "Store not found" }, { status: 404 });
    }

    await ensureEmailAutomationsSeeded(store);

    const [automations, templates] = await Promise.all([
      listEmailAutomations(store.id),
      listEmailTemplates(store.id),
    ]);

    return NextResponse.json({
      automations: automations.map(serializeEmailAutomation),
      templates: templates.map(serializeEmailTemplate),
    });
  } catch (error) {
    console.error("[email/automations GET]", error);
    return NextResponse.json(
      { message: "Failed to load automations" },
      { status: 500 }
    );
  }
}

const putSchema = z.object({
  trigger: z.string().min(1),
  enabled: z.boolean(),
  templateId: z.string().min(1),
  name: z.string().trim().max(120).optional(),
});

export async function PUT(request: Request) {
  try {
    const authStore = await getAuthenticatedStore();
    if (!authStore) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const parsed = putSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }
    if (!isEmailAutomationTrigger(parsed.data.trigger)) {
      return NextResponse.json({ message: "Unknown trigger" }, { status: 400 });
    }

    const row = await setEmailAutomation({
      storeId: authStore.id,
      trigger: parsed.data.trigger,
      enabled: parsed.data.enabled,
      templateId: parsed.data.templateId,
      name: parsed.data.name,
    });

    return NextResponse.json({
      ok: true,
      automation: serializeEmailAutomation(row),
    });
  } catch (error) {
    console.error("[email/automations PUT]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to save automation",
      },
      { status: 500 }
    );
  }
}
