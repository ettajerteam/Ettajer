import { NextResponse } from "next/server";
import { getAuthenticatedStore } from "@/lib/products";
import { prisma } from "@/lib/db";
import {
  installWebsiteTemplateOnStore,
  parseWebsiteTemplateId,
} from "@/lib/website-templates/install-to-store";
import { getTemplate } from "@/lib/website-templates/registry";

export async function POST(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const templateId = parseWebsiteTemplateId(body.templateId);
    if (!templateId) {
      return NextResponse.json({ message: "Invalid website template" }, { status: 400 });
    }

    const template = getTemplate(templateId);
    if (!template) {
      return NextResponse.json({ message: "Template not found" }, { status: 404 });
    }

    await installWebsiteTemplateOnStore(store.id, templateId);

    const updated = await prisma.store.findFirst({
      where: { id: store.id },
      include: { settings: true },
    });

    return NextResponse.json({
      store: {
        id: updated!.id,
        slug: updated!.slug,
        theme: updated!.theme,
        primaryColor: updated!.primaryColor,
        secondaryColor: updated!.secondaryColor,
        font: updated!.font,
        websiteTemplateId: updated!.websiteTemplateId,
        businessModel: updated!.businessModel,
      },
      template: {
        id: template.id,
        name: template.name,
      },
    });
  } catch (error) {
    console.error("Website template apply error:", error);
    return NextResponse.json(
      { message: "Failed to apply website template" },
      { status: 500 },
    );
  }
}
