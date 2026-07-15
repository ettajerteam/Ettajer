import { NextResponse } from "next/server";
import { getAuthenticatedStore } from "@/lib/products";
import {
  createDraft,
  listDrafts,
  serializeDraftDetail,
  serializeDraftListItem,
} from "@/lib/drafts";
import { createDraftSchema } from "@/lib/validations/draft";

export async function GET(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() ?? "";

    const drafts = await listDrafts(store.id, search || undefined);

    return NextResponse.json({
      drafts: drafts.map(serializeDraftListItem),
      currency: store.currency,
    });
  } catch (error) {
    console.error("Drafts fetch error:", error);
    return NextResponse.json({ message: "Failed to fetch drafts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createDraftSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const draft = await createDraft(store.id, parsed.data);

    return NextResponse.json(
      { draft: serializeDraftDetail(draft) },
      { status: 201 }
    );
  } catch (error) {
    console.error("Draft create error:", error);
    const message = error instanceof Error ? error.message : "Failed to create draft";
    return NextResponse.json({ message }, { status: 400 });
  }
}
