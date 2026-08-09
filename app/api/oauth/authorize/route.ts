import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import {
  assertRedirectUriAllowed,
  createAuthorizationCode,
  getApplicationByClientId,
  parseScopes,
} from "@/lib/developer/oauth";
import {
  DeveloperApiError,
  fromDeveloperError,
} from "@/lib/developer/errors";
import { THEME_AI_DEFAULT_SCOPES } from "@/lib/developer/scopes";

export const dynamic = "force-dynamic";

/** Merchant confirms authorization (session required). */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new DeveloperApiError("UNAUTHORIZED", "Sign in required.");
    }

    const body = (await request.json()) as {
      client_id?: string;
      redirect_uri?: string;
      scope?: string;
      state?: string;
      code_challenge?: string;
      code_challenge_method?: string;
      deny?: boolean;
    };

    if (!body.client_id || !body.redirect_uri) {
      throw new DeveloperApiError(
        "INVALID_REQUEST",
        "client_id and redirect_uri are required.",
      );
    }
    if (!body.state || typeof body.state !== "string" || body.state.length < 8) {
      throw new DeveloperApiError(
        "INVALID_REQUEST",
        "state is required (min 8 characters) for CSRF protection.",
      );
    }
    if (
      body.code_challenge &&
      body.code_challenge_method &&
      body.code_challenge_method !== "S256"
    ) {
      throw new DeveloperApiError(
        "INVALID_REQUEST",
        "Only code_challenge_method=S256 is supported.",
      );
    }

    const app = await getApplicationByClientId(body.client_id);
    if (!app || app.status !== "active") {
      throw new DeveloperApiError("INVALID_CLIENT", "Unknown application.");
    }

    assertRedirectUriAllowed(app, body.redirect_uri);

    if (body.deny) {
      const url = new URL(body.redirect_uri);
      url.searchParams.set("error", "access_denied");
      if (body.state) url.searchParams.set("state", body.state);
      return NextResponse.json({ redirectTo: url.toString() });
    }

    const store = await prisma.store.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!store) {
      throw new DeveloperApiError(
        "INVALID_REQUEST",
        "Create a store before authorizing applications.",
      );
    }

    let scopes = parseScopes(body.scope);
    if (scopes.length === 0) scopes = [...THEME_AI_DEFAULT_SCOPES];

    const { code } = await createAuthorizationCode({
      applicationId: app.id,
      userId: session.user.id,
      storeId: store.id,
      scopes,
      redirectUri: body.redirect_uri,
      codeChallenge: body.code_challenge,
      codeChallengeMethod: body.code_challenge_method,
    });

    const { logDeveloperAction } = await import("@/lib/developer/audit");
    await logDeveloperAction({
      applicationId: app.id,
      userId: session.user.id,
      storeId: store.id,
      actorType: "merchant",
      action: "oauth.connected",
      resource: "application",
      resourceId: app.id,
      metadata: { scopes },
    });

    const url = new URL(body.redirect_uri);
    url.searchParams.set("code", code);
    if (body.state) url.searchParams.set("state", body.state);

    return NextResponse.json({ redirectTo: url.toString() });
  } catch (err) {
    return fromDeveloperError(err);
  }
}
