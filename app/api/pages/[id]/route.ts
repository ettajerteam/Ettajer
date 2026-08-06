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
      title: typeof body.title === "string" ? body.title : undefined,
      content: typeof body.content === "string" ? body.content : undefined,
      status:
        body.status === "published" || body.status === "draft"
          ? body.status
          : undefined,
      slug: typeof body.slug === "string" ? body.slug : undefined,
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
