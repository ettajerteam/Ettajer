import { createHash } from "crypto";
import {
  parseMarketingIntegrations,
  type MarketingPlatformLink,
} from "@/lib/marketing-integrations";

/**
 * Pinterest Conversions API (v5).
 * @see https://developers.pinterest.com/docs/api/v5/events-create/
 * @see https://developers.pinterest.com/docs/track-conversions/track-conversions-in-the-api/
 */

export type PinterestCapiEventName =
  | "PageView"
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "Purchase";

/** Maps Ettajer funnel names → Pinterest CAPI / Tag event names. */
export function toPinterestEventName(
  eventName: PinterestCapiEventName
): string {
  switch (eventName) {
    case "PageView":
      return "page_visit";
    case "ViewContent":
      return "view_content";
    case "AddToCart":
      return "add_to_cart";
    case "InitiateCheckout":
      return "initiate_checkout";
    case "Purchase":
      return "checkout";
    default:
      return "custom";
  }
}

/** Browser Tag track names (pintrk) — mostly same as CAPI with historical aliases. */
export function toPinterestTagEventName(
  eventName: PinterestCapiEventName
): string {
  switch (eventName) {
    case "PageView":
      return "pagevisit";
    case "ViewContent":
      return "pagevisit";
    case "AddToCart":
      return "addtocart";
    case "InitiateCheckout":
      return "initiatecheckout";
    case "Purchase":
      return "checkout";
    default:
      return "custom";
  }
}

export interface PinterestCapiUserData {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  city?: string | null;
  country?: string | null;
  zip?: string | null;
  clientIpAddress?: string | null;
  clientUserAgent?: string | null;
  externalId?: string | null;
  clickId?: string | null;
}

export interface PinterestCapiContentItem {
  id: string;
  quantity?: number;
  itemPrice?: number;
}

export interface PinterestCapiCustomData {
  value?: number;
  currency?: string;
  contentName?: string;
  contentIds?: string[];
  contentType?: string;
  contents?: PinterestCapiContentItem[];
  numItems?: number;
  orderId?: string;
}

export interface SendPinterestCapiEventInput {
  adAccountId: string;
  accessToken: string;
  eventName: PinterestCapiEventName;
  eventId: string;
  eventSourceUrl?: string | null;
  userData?: PinterestCapiUserData;
  customData?: PinterestCapiCustomData;
  /** When true, mark as partner test traffic where supported */
  testMode?: boolean;
  diagnostics?: {
    storeId: string;
    source: "storefront" | "cart" | "checkout";
    testMode?: boolean;
  };
}

export interface PinterestCapiConfig {
  tagId: string;
  adAccountId: string;
  accessToken: string;
  testMode: boolean;
  trackPageViews: boolean;
  trackViewContent: boolean;
  trackAddToCart: boolean;
  trackInitiateCheckout: boolean;
  trackPurchases: boolean;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function hashEmail(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized.includes("@")) return undefined;
  return sha256(normalized);
}

function hashPhone(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const digits = value.replace(/\D/g, "");
  if (digits.length < 7) return undefined;
  return sha256(digits);
}

function hashPlain(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  return sha256(normalized);
}

/** Normalize Pinterest ad account id (digits; strip act_ if pasted from Meta habit). */
export function normalizePinterestAdAccountId(
  raw: string | null | undefined
): string | null {
  if (!raw) return null;
  let trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("act_")) trimmed = trimmed.slice(4);
  if (!/^\d{5,}$/.test(trimmed)) return null;
  return trimmed;
}

function buildUserData(
  user?: PinterestCapiUserData
): Record<string, unknown> {
  if (!user) return {};
  const data: Record<string, unknown> = {};

  const em = hashEmail(user.email);
  if (em) data.em = [em];

  const ph = hashPhone(user.phone);
  if (ph) data.ph = [ph];

  const fn = hashPlain(user.firstName);
  if (fn) data.fn = [fn];

  const ln = hashPlain(user.lastName);
  if (ln) data.ln = [ln];

  const ct = hashPlain(user.city);
  if (ct) data.ct = [ct];

  const country = hashPlain(user.country);
  if (country) data.country = [country];

  const zip = hashPlain(user.zip?.replace(/\s+/g, ""));
  if (zip) data.zp = [zip];

  const externalId = hashPlain(user.externalId);
  if (externalId) data.external_id = [externalId];

  if (user.clientIpAddress?.trim()) {
    data.client_ip_address = user.clientIpAddress.trim();
  }
  if (user.clientUserAgent?.trim()) {
    data.client_user_agent = user.clientUserAgent.trim();
  }
  if (user.clickId?.trim()) {
    data.click_id = user.clickId.trim();
  }

  return data;
}

function buildCustomData(
  custom?: PinterestCapiCustomData
): Record<string, unknown> | undefined {
  if (!custom) return undefined;
  const data: Record<string, unknown> = {};
  if (typeof custom.value === "number") {
    data.value = String(custom.value);
  }
  if (custom.currency) data.currency = custom.currency;
  if (custom.contentName) data.content_name = custom.contentName;
  if (custom.contentIds?.length) data.content_ids = custom.contentIds;
  if (custom.contentType) data.content_brand = custom.contentType;
  if (typeof custom.numItems === "number") data.num_items = custom.numItems;
  if (custom.orderId) data.order_id = custom.orderId;
  if (custom.contents?.length) {
    data.contents = custom.contents.map((item) => ({
      id: item.id,
      quantity: item.quantity ?? 1,
      ...(typeof item.itemPrice === "number"
        ? { item_price: String(item.itemPrice) }
        : {}),
    }));
  }
  return Object.keys(data).length > 0 ? data : undefined;
}

export function getPinterestCapiConfig(
  marketingIntegrations: unknown
): PinterestCapiConfig | null {
  const integrations = parseMarketingIntegrations(marketingIntegrations);
  const pin = integrations.pinterest;
  const adAccountId = normalizePinterestAdAccountId(pin.accountId);
  if (
    !pin.enabled ||
    !pin.connected ||
    !pin.pixelId ||
    !pin.accessToken?.trim() ||
    !adAccountId
  ) {
    return null;
  }
  return {
    tagId: pin.pixelId,
    adAccountId,
    accessToken: pin.accessToken.trim(),
    testMode: pin.testMode,
    trackPageViews: pin.trackPageViews,
    trackViewContent: pin.trackViewContent,
    trackAddToCart: pin.trackAddToCart,
    trackInitiateCheckout: pin.trackInitiateCheckout,
    trackPurchases: pin.trackPurchases,
  };
}

export function isPinterestCapiEventEnabled(
  config: PinterestCapiConfig,
  eventName: PinterestCapiEventName
): boolean {
  switch (eventName) {
    case "PageView":
      return config.trackPageViews;
    case "ViewContent":
      return config.trackViewContent;
    case "AddToCart":
      return config.trackAddToCart;
    case "InitiateCheckout":
      return config.trackInitiateCheckout;
    case "Purchase":
      return config.trackPurchases;
    default:
      return false;
  }
}

export function pinterestLinkHasCapi(link: MarketingPlatformLink): boolean {
  return Boolean(
    link.enabled &&
      link.connected &&
      link.pixelId &&
      link.accessToken?.trim() &&
      normalizePinterestAdAccountId(link.accountId)
  );
}

export async function sendPinterestCapiEvent(
  input: SendPinterestCapiEventInput
): Promise<{ ok: boolean; status?: number; error?: string }> {
  const adAccountId = normalizePinterestAdAccountId(input.adAccountId);
  if (!adAccountId) {
    return { ok: false, error: "invalid_ad_account_id" };
  }

  const url = `https://api.pinterest.com/v5/ad_accounts/${encodeURIComponent(adAccountId)}/events`;

  const event: Record<string, unknown> = {
    event_name: toPinterestEventName(input.eventName),
    action_source: "web",
    event_time: Math.floor(Date.now() / 1000),
    event_id: input.eventId,
    user_data: buildUserData(input.userData),
  };

  if (input.eventSourceUrl) {
    event.event_source_url = input.eventSourceUrl;
  }

  const customData = buildCustomData(input.customData);
  if (customData) event.custom_data = customData;

  const body: Record<string, unknown> = {
    data: [event],
  };

  let result: { ok: boolean; status?: number; error?: string };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${input.accessToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[pinterest-capi] send failed", res.status, text.slice(0, 500));
      result = {
        ok: false,
        status: res.status,
        error: text.slice(0, 200) || res.statusText,
      };
    } else {
      result = { ok: true, status: res.status };
    }
  } catch (error) {
    console.error("[pinterest-capi] send error", error);
    result = {
      ok: false,
      error: error instanceof Error ? error.message : "CAPI request failed",
    };
  }

  if (input.diagnostics?.storeId) {
    const shouldLog = input.eventName !== "PageView" || !result.ok;
    if (shouldLog) {
      const { recordMarketingEventDiagnostic, diagnosticMetadataFromCapi } =
        await import("@/lib/marketing-event-diagnostics");
      void recordMarketingEventDiagnostic({
        storeId: input.diagnostics.storeId,
        platform: "pinterest",
        channel: "capi",
        eventName: toPinterestEventName(input.eventName),
        eventId: input.eventId,
        status: result.ok ? "ok" : "error",
        source: input.diagnostics.source,
        httpStatus: result.status ?? null,
        error: result.error ?? null,
        testMode: Boolean(input.diagnostics.testMode || input.testMode),
        metadata: diagnosticMetadataFromCapi({
          value: input.customData?.value,
          currency: input.customData?.currency,
          orderId: input.customData?.orderId,
          contentIds: input.customData?.contentIds,
          numItems: input.customData?.numItems,
        }),
      });
    }
  }

  return result;
}
