import { NextResponse } from "next/server";
import { getAuthenticatedStore } from "@/lib/products";
import {
  createBlogPost,
  deleteBlogPost,
  listBlogPosts,
  serializeBlogPost,
  updateBlogPost,
} from "@/lib/blog";

export async function GET() {
  try {
    const store = await getAuthenticatedStore();
    if (!store) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const posts = await listBlogPosts(store.id);
    return NextResponse.json({ posts: posts.map(serializeBlogPost) });
  } catch {
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

    const status =
      body.status === "published" ? "published" : "draft";

    const post = await createBlogPost(store.id, {
      title: body.title,
      content: typeof body.content === "string" ? body.content : "",
      excerpt: typeof body.excerpt === "string" ? body.excerpt : undefined,
      image: typeof body.image === "string" ? body.image : undefined,
      status,
    });

    return NextResponse.json({ post: serializeBlogPost(post) }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Failed to create" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : null;
    if (!id) {
      return NextResponse.json({ message: "id required" }, { status: 400 });
    }

    const post = await updateBlogPost(id, store.id, {
      title: typeof body.title === "string" ? body.title : undefined,
      content: typeof body.content === "string" ? body.content : undefined,
      excerpt:
        body.excerpt === null
          ? null
          : typeof body.excerpt === "string"
            ? body.excerpt
            : undefined,
      image:
        body.image === null
          ? null
          : typeof body.image === "string"
            ? body.image
            : undefined,
      status:
        body.status === "published" || body.status === "draft"
          ? body.status
          : undefined,
    });

    return NextResponse.json({ post: serializeBlogPost(post) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update";
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ message: "id required" }, { status: 400 });

    await deleteBlogPost(id, store.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ message }, { status: 400 });
  }
}
