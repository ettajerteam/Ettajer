import { NextResponse } from "next/server";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { getAppUrl } from "@/lib/app-url";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Meta / Facebook Data Deletion Request Callback.
 * Docs: https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback
 *
 * Configure in Meta app → Facebook Login → Settings:
 * Data Deletion Request Callback URL =
 *   https://www.ettajer.com/api/meta/data-deletion
 */

function getMetaAppSecret(): string | null {
  return (
    process.env.META_APP_SECRET?.trim() ||
    process.env.FACEBOOK_APP_SECRET?.trim() ||
    null
  );
}

function parseSignedRequest(
  signedRequest: string,
  appSecret: string
): { user_id?: string } | null {
  const [encodedSig, payload] = signedRequest.split(".", 2);
  if (!encodedSig || !payload) return null;

  const sig = Buffer.from(encodedSig.replace(/-/g, "+").replace(/_/g, "/"), "base64");
  const expected = createHmac("sha256", appSecret).update(payload).digest();
  if (sig.length !== expected.length || !timingSafeEqual(sig, expected)) {
    return null;
  }

  try {
    const json = Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString(
      "utf8"
    );
    return JSON.parse(json) as { user_id?: string };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const appSecret = getMetaAppSecret();
  if (!appSecret) {
    return NextResponse.json(
      { message: "Meta app secret is not configured" },
      { status: 503 }
    );
  }

  const contentType = request.headers.get("content-type") || "";
  let signedRequest: string | null = null;

  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => null)) as {
      signed_request?: string;
    } | null;
    signedRequest = body?.signed_request ?? null;
  } else {
    const form = await request.formData().catch(() => null);
    const value = form?.get("signed_request");
    signedRequest = typeof value === "string" ? value : null;
  }

  if (!signedRequest) {
    return NextResponse.json({ message: "Missing signed_request" }, { status: 400 });
  }

  const data = parseSignedRequest(signedRequest, appSecret);
  if (!data?.user_id) {
    return NextResponse.json({ message: "Invalid signed_request" }, { status: 400 });
  }

  const confirmationCode = randomBytes(12).toString("hex");
  console.info("[meta/data-deletion] request", {
    facebookUserId: data.user_id,
    confirmationCode,
    at: new Date().toISOString(),
  });

  const statusUrl = `${getAppUrl()}/data-deletion?code=${encodeURIComponent(confirmationCode)}`;

  return NextResponse.json({
    url: statusUrl,
    confirmation_code: confirmationCode,
  });
}

/** Health / docs probe for Meta dashboard validators. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    instructions: `${getAppUrl()}/data-deletion`,
    callback: `${getAppUrl()}/api/meta/data-deletion`,
  });
}
