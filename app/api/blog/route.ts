import { NextResponse } from "next/server";
import { getAuthenticatedStore } from "@/lib/products";
import { createBlogPost, deleteBlogPost, listBlogPosts, serializeBlogPost } from "@/lib/blog";

export async function GET() {
  try {
    const store = await getAuthenticatedStore();
    if (!store) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const posts = await listBlogPosts(store.id);
    return NextResponse.json({ posts: posts.map(serializeBlogPost) });
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

    const post = await createBlogPost(store.id, {
      title: body.title,
      content: body.content ?? "",
      excerpt: body.excerpt,
      status: body.status ?? "draft",
    });

    return NextResponse.json({ post: serializeBlogPost(post) }, { status: 201 });
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

    await deleteBlogPost(id, store.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ message }, { status: 400 });
  }
}
