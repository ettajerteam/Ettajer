import { NextResponse } from "next/server";
import { getAuthenticatedStore } from "@/lib/products";
import { getStorePageById, serializeStorePage, updateStorePage } from "@/lib/pages";

interface RouteParams {
  params: { id: string };
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const page = await updateStorePage(params.id, store.id, {
      title: body.title,
      content: body.content,
      status: body.status,
    });

    return NextResponse.json({ page: serializeStorePage(page) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update";
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const page = await getStorePageById(params.id, store.id);
    if (!page) return NextResponse.json({ message: "Not found" }, { status: 404 });

    return NextResponse.json({ page: serializeStorePage(page) });
  } catch {
    return NextResponse.json({ message: "Failed to fetch" }, { status: 500 });
  }
}
