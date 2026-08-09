import { NextResponse } from "next/server";
import { revokeToken } from "@/lib/developer/oauth";
import { fromDeveloperError, DeveloperApiError } from "@/lib/developer/errors";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let body: Record<string, string> = {};
    if (contentType.includes("application/json")) {
      const json = (await request.json()) as Record<string, unknown>;
      for (const [k, v] of Object.entries(json)) {
        if (v != null) body[k] = String(v);
      }
    } else {
      const form = await request.formData();
      form.forEach((value, key) => {
        if (typeof value === "string") body[key] = value;
      });
    }

    if (!body.client_id || !body.token) {
      throw new DeveloperApiError(
        "INVALID_REQUEST",
        "client_id and token are required.",
      );
    }

    const result = await revokeToken({
      clientId: body.client_id,
      clientSecret: body.client_secret,
      token: body.token,
    });
    return NextResponse.json(result, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (err) {
    return fromDeveloperError(err);
  }
}
