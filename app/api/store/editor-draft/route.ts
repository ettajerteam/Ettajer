import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getAuthenticatedStore } from "@/lib/products";
import { prisma } from "@/lib/db";
import type { LayoutDraftBundle } from "@/lib/builder/layout-draft-storage";
import {
  EDITOR_DRAFT_MAX_BYTES,
  estimateJsonBytes,
  mergeSeoWithEditorDraft,
  parseEditorDraft,
} from "@/lib/builder/editor-draft-seo";

export async function GET() {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id },
      select: { seo: true },
    });
    const draft = parseEditorDraft(settings?.seo);
    return NextResponse.json({ draft });
  } catch (error) {
    console.error("Editor draft fetch error:", error);
    return NextResponse.json({ message: "Failed to fetch draft" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const clear = body.clear === true;
    const draft = clear ? null : (body.draft as LayoutDraftBundle | null);

    if (!clear) {
      if (!draft || typeof draft !== "object" || typeof draft.updatedAt !== "number") {
        return NextResponse.json({ message: "Invalid draft" }, { status: 400 });
      }
      const bytes = estimateJsonBytes(draft);
      if (bytes > EDITOR_DRAFT_MAX_BYTES) {
        return NextResponse.json(
          {
            message: `Draft is too large to sync to the cloud (~${Math.round(bytes / 1024)}KB). Local draft is still kept.`,
            code: "DRAFT_TOO_LARGE",
          },
          { status: 413 }
        );
      }
    }

    const existing = await prisma.storeSettings.findUnique({
      where: { storeId: store.id },
      select: { seo: true },
    });
    const current = parseEditorDraft(existing?.seo);
    if (
      draft &&
      current &&
      typeof body.expectedUpdatedAt === "number" &&
      current.updatedAt > body.expectedUpdatedAt &&
      current.updatedAt !== draft.updatedAt
    ) {
      return NextResponse.json(
        {
          message: "A newer cloud draft exists",
          code: "DRAFT_CONFLICT",
          draft: current,
        },
        { status: 409 }
      );
    }

    const seo = mergeSeoWithEditorDraft(existing?.seo, draft);
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      create: {
        storeId: store.id,
        seo: seo as Prisma.InputJsonValue,
      },
      update: {
        seo: seo as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({ ok: true, draft });
  } catch (error) {
    console.error("Editor draft save error:", error);
    return NextResponse.json({ message: "Failed to save draft" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.storeSettings.findUnique({
      where: { storeId: store.id },
      select: { seo: true },
    });
    const seo = mergeSeoWithEditorDraft(existing?.seo, null);
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      create: { storeId: store.id, seo: seo as Prisma.InputJsonValue },
      update: { seo: seo as Prisma.InputJsonValue },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Editor draft clear error:", error);
    return NextResponse.json({ message: "Failed to clear draft" }, { status: 500 });
  }
}
