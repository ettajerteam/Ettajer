import { NextResponse } from "next/server";
import { getAuthenticatedStore } from "@/lib/products";
import { createStorePage, deleteStorePage, listStorePages, serializeStorePage } from "@/lib/pages";

export async function GET() {
  try {
    const store = await getAuthenticatedStore();
    if (!store) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const pages = await listStorePages(store.id);
    return NextResponse.json({ pages: pages.map(serializeStorePage) });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    if (!body.title?.trim()) {
      return NextResponse.json({ message: "Title required" }, { status: 400 });
    }

    const page = await createStorePage(store.id, {
      title: body.title,
      content: body.content ?? "",
      status: body.status ?? "draft",
      slug: typeof body.slug === "string" ? body.slug : undefined,
    });

    return NextResponse.json({ page: serializeStorePage(page) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to create" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ message: "id required" }, { status: 400 });

    await deleteStorePage(id, store.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ message }, { status: 400 });
  }
}
