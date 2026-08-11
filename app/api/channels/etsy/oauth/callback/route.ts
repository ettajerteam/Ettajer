import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAppUrl } from "@/lib/app-url";
import {
  ETSY_OAUTH_SCOPES,
  exchangeEtsyCode,
  getEtsyClientId,
  parseEtsyOAuthState,
} from "@/lib/channels/adapters/etsy/oauth";
import { EtsyApiClient } from "@/lib/channels/adapters/etsy/client";
import { upsertConnectedEtsyConnection } from "@/lib/channels/connection-service";
import { appendChannelSyncLog } from "@/lib/channels/sync-log";
import type { EtsyShopMetadata } from "@/lib/channels/types";

export const dynamic = "force-dynamic";

const RETURN_PATH = "/dashboard/channels/etsy";

function redirectWithError(message: string): NextResponse {
  const url = new URL(RETURN_PATH, getAppUrl());
  url.searchParams.set("error", message.slice(0, 300));
  return NextResponse.redirect(url);
}

function redirectConnected(): NextResponse {
  const url = new URL(RETURN_PATH, getAppUrl());
  url.searchParams.set("connected", "1");
  return NextResponse.redirect(url);
}

/** Etsy redirects here after the merchant approves (or denies) the connection request. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error_description") || url.searchParams.get("error");

  if (oauthError) {
    return redirectWithError(oauthError);
  }
  if (!code || !state) {
    return redirectWithError("Missing authorization code from Etsy");
  }

  const parsedState = parseEtsyOAuthState(state);
  if (!parsedState) {
    return redirectWithError("This connection request expired or is invalid. Please try again.");
  }

  try {
    const store = await prisma.store.findFirst({
      where: { id: parsedState.storeId, userId: parsedState.userId },
    });
    if (!store) throw new Error("Store not found for this connection request");

    const tokens = await exchangeEtsyCode({ code, codeVerifier: parsedState.codeVerifier });

    const clientId = getEtsyClientId();
    if (!clientId) throw new Error("ETSY_CLIENT_ID is not configured");
    const client = new EtsyApiClient({ clientId, accessToken: tokens.accessToken });

    const shopsResponse = await client.getShopByOwnerUserId(tokens.etsyUserId);
    const shopRaw = shopsResponse.results[0];
    if (!shopRaw) throw new Error("This Etsy account has no shop to connect");

    const shopMetadata: EtsyShopMetadata = {
      shopId: String(shopRaw.shop_id),
      shopName: typeof shopRaw.shop_name === "string" ? shopRaw.shop_name : "Etsy shop",
      shopUrl: typeof shopRaw.url === "string" ? shopRaw.url : null,
      currencyCode: typeof shopRaw.currency_code === "string" ? shopRaw.currency_code : null,
      countryCode: typeof shopRaw.country_iso === "string" ? shopRaw.country_iso : null,
      listingActiveCount:
        typeof shopRaw.listing_active_count === "number" ? shopRaw.listing_active_count : null,
    };

    try {
      const profiles = await client.getShopShippingProfiles(shopMetadata.shopId);
      const first = profiles.results?.[0];
      const preferred =
        profiles.results?.find((p) => p.is_default === true) ?? first;
      if (preferred?.shipping_profile_id != null) {
        shopMetadata.shippingProfileId = String(preferred.shipping_profile_id);
      }
    } catch (profileError) {
      console.warn("[etsy/oauth/callback] shipping profiles", profileError);
    }

    try {
      const policies = await client.getShopReturnPolicies(shopMetadata.shopId);
      const firstPolicy = policies.results?.[0];
      if (firstPolicy?.return_policy_id != null) {
        shopMetadata.returnPolicyId = String(firstPolicy.return_policy_id);
      }
    } catch {
      // Return policies are not available for every shop / region.
    }

    await upsertConnectedEtsyConnection({
      storeId: store.id,
      externalAccountId: tokens.etsyUserId,
      externalShopId: String(shopRaw.shop_id),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
      scopes: [...ETSY_OAUTH_SCOPES],
      shopMetadata,
    });

    await appendChannelSyncLog({
      storeId: store.id,
      channel: "etsy",
      operation: "connect",
      status: "success",
      message: `Connected Etsy shop "${shopMetadata.shopName}"`,
    });

    return redirectConnected();
  } catch (error) {
    console.error("[etsy/oauth/callback]", error);
    const message = error instanceof Error ? error.message : "Failed to connect Etsy account";
    return redirectWithError(message);
  }
}
