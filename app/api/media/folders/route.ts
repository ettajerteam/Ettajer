import { NextResponse } from "next/server";
import { createMediaFolder, listMediaFolders } from "@/lib/media/service";
import { getAuthenticatedStore } from "@/lib/products";
import type { MediaFolderCreatePayload } from "@/lib/media/types";

export async function GET(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const parentParam = searchParams.get("parentId");
    const parentId =
      parentParam === "root" ? null : parentParam === undefined ? null : parentParam;

    const folders = await listMediaFolders(store.id, parentId);
    return NextResponse.json({ folders });
  } catch (error) {
    console.error("Media folders list error:", error);
    return NextResponse.json({ message: "Failed to list folders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as MediaFolderCreatePayload;
    if (!body.name?.trim()) {
      return NextResponse.json({ message: "Folder name is required" }, { status: 400 });
    }

    const folder = await createMediaFolder(store.id, body);
    return NextResponse.json(folder);
  } catch (error) {
    console.error("Media folder create error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to create folder" },
      { status: 400 }
    );
  }
}
