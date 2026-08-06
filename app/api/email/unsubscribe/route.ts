import { NextResponse } from "next/server";
import { applyUnsubscribeFromToken } from "@/lib/email-marketing/compliance";

export const dynamic = "force-dynamic";

async function handleUnsubscribe(token: string | null) {
  if (!token?.trim()) {
    return NextResponse.json({ message: "Missing token" }, { status: 400 });
  }
  const result = await applyUnsubscribeFromToken(token);
  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: 400 });
  }
  return NextResponse.json({
    ok: true,
    message: result.message,
    email: result.email,
  });
}

/** One-click List-Unsubscribe (RFC 8058) */
export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    let token = url.searchParams.get("t");
    if (!token) {
      const contentType = request.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const body = (await request.json().catch(() => ({}))) as {
          t?: string;
          token?: string;
        };
        token = body.t || body.token || null;
      } else {
        const form = await request.formData().catch(() => null);
        token =
          (form?.get("t") as string | null) ||
          (form?.get("token") as string | null) ||
          null;
      }
    }
    return handleUnsubscribe(token);
  } catch (error) {
    console.error("[email/unsubscribe POST]", error);
    return NextResponse.json({ message: "Unsubscribe failed" }, { status: 500 });
  }
}

/** Browser / email client GET fallback */
export async function GET(request: Request) {
  try {
    const token = new URL(request.url).searchParams.get("t");
    const result = await applyUnsubscribeFromToken(token || "");
    const prefs = token
      ? `/email/preferences?t=${encodeURIComponent(token)}&unsubscribed=1`
      : "/email/preferences";
    if (!result.ok) {
      return NextResponse.redirect(
        new URL(
          `/email/preferences?error=${encodeURIComponent(result.message)}`,
          request.url
        )
      );
    }
    return NextResponse.redirect(new URL(prefs, request.url));
  } catch (error) {
    console.error("[email/unsubscribe GET]", error);
    return NextResponse.json({ message: "Unsubscribe failed" }, { status: 500 });
  }
}
