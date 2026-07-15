import { NextResponse } from "next/server";
import { getAuthenticatedStore } from "@/lib/products";
import {
  convertDraftToOrder,
  deleteDraft,
  getDraftForStore,
  serializeDraftDetail,
  updateDraft,
} from "@/lib/drafts";
import { serializeOrderDetail } from "@/lib/orders";
import { updateDraftSchema } from "@/lib/validations/draft";

interface RouteContext {
  params: { id: string };
}

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const draft = await getDraftForStore(params.id, store.id);
    if (!draft) {
      return NextResponse.json({ message: "Draft not found" }, { status: 404 });
    }

    return NextResponse.json({
      draft: serializeDraftDetail(draft),
      currency: store.currency,
    });
  } catch (error) {
    console.error("Draft fetch error:", error);
    return NextResponse.json({ message: "Failed to fetch draft" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateDraftSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const draft = await updateDraft(params.id, store.id, parsed.data);

    return NextResponse.json({ draft: serializeDraftDetail(draft) });
  } catch (error) {
    console.error("Draft update error:", error);
    const message = error instanceof Error ? error.message : "Failed to update draft";
    const status = message === "Draft not found" ? 404 : 400;
    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await deleteDraft(params.id, store.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Draft delete error:", error);
    const message = error instanceof Error ? error.message : "Failed to delete draft";
    const status = message === "Draft not found" ? 404 : 400;
    return NextResponse.json({ message }, { status });
  }
}
