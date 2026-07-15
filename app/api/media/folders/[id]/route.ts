import { NextResponse } from "next/server";
import { deleteMediaFolder, updateMediaFolder } from "@/lib/media/service";
import { getAuthenticatedStore } from "@/lib/products";
import type { MediaFolderUpdatePayload } from "@/lib/media/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = (await request.json()) as MediaFolderUpdatePayload;

    const folder = await updateMediaFolder(store.id, id, body);
    if (!folder) {
      return NextResponse.json({ message: "Folder not found" }, { status: 404 });
    }

    return NextResponse.json(folder);
  } catch (error) {
    console.error("Media folder update error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to update folder" },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const deleted = await deleteMediaFolder(store.id, id);
    if (!deleted) {
      return NextResponse.json({ message: "Folder not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Media folder delete error:", error);
    return NextResponse.json({ message: "Failed to delete folder" }, { status: 500 });
  }
}
