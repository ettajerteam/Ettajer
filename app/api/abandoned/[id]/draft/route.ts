import { NextResponse } from "next/server";
import { getAuthenticatedStore } from "@/lib/products";
import { createDraftFromAbandoned } from "@/lib/abandoned";
import { serializeDraftDetail } from "@/lib/drafts";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const draft = await createDraftFromAbandoned(store.id, params.id);

    return NextResponse.json(
      { draft: serializeDraftDetail(draft) },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create draft";
    return NextResponse.json({ message }, { status: 400 });
  }
}
