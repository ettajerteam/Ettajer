import { createHash } from "crypto";
import {
  parseMarketingIntegrations,
  type MarketingPlatformLink,
} from "@/lib/marketing-integrations";

const META_GRAPH_VERSION = "v21.0";

export type MetaCapiEventName =
  | "PageView"
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "Purchase";

export interface MetaCapiUserData {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  city?: string | null;
  country?: string | null;
  zip?: string | null;
  clientIpAddress?: string | null;
  clientUserAgent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  externalId?: string | null;
}

export interface MetaCapiContentItem {
  id: string;
  quantity?: number;
  itemPrice?: number;
}

export interface MetaCapiCustomData {
  value?: number;
  currency?: string;
  contentName?: string;
  contentIds?: string[];
  contentType?: string;
  contents?: MetaCapiContentItem[];
  numItems?: number;
  orderId?: string;
}

export interface SendMetaCapiEventInput {
  pixelId: string;
  accessToken: string;
  eventName: MetaCapiEventName;
  eventId: string;
  eventSourceUrl?: string | null;
  actionSource?: "website";
  userData?: MetaCapiUserData;
  customData?: MetaCapiCustomData;
  testEventCode?: string | null;
  /** When set, records delivery in MarketingEventLog for the merchant dashboard */
  diagnostics?: {
    storeId: string;
    source: "storefront" | "cart" | "checkout";
    testMode?: boolean;
  };
}

export interface MetaCapiConfig {
  pixelId: string;
  accessToken: string;
  testMode: boolean;
  testEventCode: string | null;
  trackPageViews: boolean;
  trackViewContent: boolean;
  trackAddToCart: boolean;
  trackInitiateCheckout: boolean;
  trackPurchases: boolean;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/** Normalize + hash a string for Meta advanced matching. */
export function hashMetaUserValue(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  return sha256(normalized);
}

function hashPhone(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const digits = value.replace(/\D/g, "");
  if (digits.length < 7) return undefined;
  return sha256(digits);
}

function buildUserData(user?: MetaCapiUserData): Record<string, string> {
  if (!user) return {};
  const data: Record<string, string> = {};

  const email = hashMetaUserValue(user.email);
  if (email) data.em = email;

  const phone = hashPhone(user.phone);
  if (phone) data.ph = phone;

  const fn = hashMetaUserValue(user.firstName);
  if (fn) data.fn = fn;

  const ln = hashMetaUserValue(user.lastName);
  if (ln) data.ln = ln;

  const ct = hashMetaUserValue(user.city);
  if (ct) data.ct = ct;

  const country = hashMetaUserValue(user.country);
  if (country) data.country = country;

  const zip = hashMetaUserValue(user.zip?.replace(/\s+/g, ""));
  if (zip) data.zp = zip;

  if (user.clientIpAddress?.trim()) data.client_ip_address = user.clientIpAddress.trim();
  if (user.clientUserAgent?.trim()) data.client_user_agent = user.clientUserAgent.trim();
  if (user.fbp?.trim()) data.fbp = user.fbp.trim();
  if (user.fbc?.trim()) data.fbc = user.fbc.trim();

  const externalId = hashMetaUserValue(user.externalId);
  if (externalId) data.external_id = externalId;

  return data;
}

function buildCustomData(custom?: MetaCapiCustomData): Record<string, unknown> | undefined {
  if (!custom) return undefined;
  const data: Record<string, unknown> = {};
  if (typeof custom.value === "number") data.value = custom.value;
  if (custom.currency) data.currency = custom.currency;
  if (custom.contentName) data.content_name = custom.contentName;
  if (custom.contentIds?.length) data.content_ids = custom.contentIds;
  if (custom.contentType) data.content_type = custom.contentType;
  if (typeof custom.numItems === "number") data.num_items = custom.numItems;
  if (custom.orderId) data.order_id = custom.orderId;
  if (custom.contents?.length) {
    data.contents = custom.contents.map((item) => ({
      id: item.id,
      quantity: item.quantity ?? 1,
      ...(typeof item.itemPrice === "number" ? { item_price: item.itemPrice } : {}),
    }));
  }
  return Object.keys(data).length > 0 ? data : undefined;
}

export function getMetaCapiConfig(marketingIntegrations: unknown): MetaCapiConfig | null {
  const integrations = parseMarketingIntegrations(marketingIntegrations);
  const meta = integrations.meta;
  if (!meta.enabled || !meta.connected || !meta.pixelId || !meta.accessToken) {
    return null;
  }
  return {
    pixelId: meta.pixelId,
    accessToken: meta.accessToken,
    testMode: meta.testMode,
    testEventCode: meta.testEventCode ?? null,
    trackPageViews: meta.trackPageViews,
    trackViewContent: meta.trackViewContent,
    trackAddToCart: meta.trackAddToCart,
    trackInitiateCheckout: meta.trackInitiateCheckout,
    trackPurchases: meta.trackPurchases,
  };
}

export function isMetaCapiEventEnabled(
  config: MetaCapiConfig,
  eventName: MetaCapiEventName
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

export async function sendMetaCapiEvent(
  input: SendMetaCapiEventInput
): Promise<{ ok: boolean; status?: number; error?: string }> {
  const url = `https://graph.facebook.com/${META_GRAPH_VERSION}/${encodeURIComponent(input.pixelId)}/events?access_token=${encodeURIComponent(input.accessToken)}`;

  const event: Record<string, unknown> = {
    event_name: input.eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: input.eventId,
    action_source: input.actionSource ?? "website",
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

  if (input.testEventCode?.trim()) {
    body.test_event_code = input.testEventCode.trim();
  }

  let result: { ok: boolean; status?: number; error?: string };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[meta-capi] send failed", res.status, text.slice(0, 500));
      result = {
        ok: false,
        status: res.status,
        error: text.slice(0, 200) || res.statusText,
      };
    } else {
      result = { ok: true, status: res.status };
    }
  } catch (error) {
    console.error("[meta-capi] send error", error);
    result = {
      ok: false,
      error: error instanceof Error ? error.message : "CAPI request failed",
    };
  }

  if (input.diagnostics?.storeId) {
    const shouldLog =
      input.eventName !== "PageView" || !result.ok;
    if (shouldLog) {
      const { recordMarketingEventDiagnostic, diagnosticMetadataFromCapi } =
        await import("@/lib/marketing-event-diagnostics");
      void recordMarketingEventDiagnostic({
        storeId: input.diagnostics.storeId,
        eventName: input.eventName,
        eventId: input.eventId,
        status: result.ok ? "ok" : "error",
        source: input.diagnostics.source,
        httpStatus: result.status ?? null,
        error: result.error ?? null,
        testMode: Boolean(input.diagnostics.testMode || input.testEventCode),
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

export function extractRequestClientHints(request: Request): {
  clientIpAddress: string | null;
  clientUserAgent: string | null;
  fbp: string | null;
  fbc: string | null;
} {
  const headers = request.headers;
  const forwarded = headers.get("x-forwarded-for");
  const clientIpAddress =
    forwarded?.split(",")[0]?.trim() ||
    headers.get("x-real-ip")?.trim() ||
    null;
  const clientUserAgent = headers.get("user-agent");
  const cookie = headers.get("cookie") ?? "";
  const fbp = cookie.match(/(?:^|;\s*)_fbp=([^;]+)/)?.[1] ?? null;
  const fbc = cookie.match(/(?:^|;\s*)_fbc=([^;]+)/)?.[1] ?? null;

  return {
    clientIpAddress,
    clientUserAgent,
    fbp: fbp ? decodeURIComponent(fbp) : null,
    fbc: fbc ? decodeURIComponent(fbc) : null,
  };
}

export function metaLinkHasCapi(link: MarketingPlatformLink): boolean {
  return Boolean(link.enabled && link.connected && link.pixelId && link.accessToken);
}
