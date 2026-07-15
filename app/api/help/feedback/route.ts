import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      slug?: string;
      helpful?: boolean;
    };

    if (!body.slug || typeof body.helpful !== "boolean") {
      return NextResponse.json({ message: "Invalid feedback" }, { status: 400 });
    }

    console.info("[help-feedback]", {
      slug: body.slug,
      helpful: body.helpful,
      at: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Failed to record feedback" }, { status: 500 });
  }
}
