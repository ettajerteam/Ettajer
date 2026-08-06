import {
  getPinterestCapiConfig,
  isPinterestCapiEventEnabled,
  sendPinterestCapiEvent,
  type PinterestCapiEventName,
  type PinterestCapiUserData,
  type PinterestCapiCustomData,
} from "@/lib/pinterest-capi";
import { extractRequestClientHints } from "@/lib/meta-capi";

/** Fire Pinterest CAPI when Tag + conversion token + ad account are configured. */
export async function maybeSendPinterestCapi(input: {
  marketingIntegrations: unknown;
  storeId: string;
  request: Request;
  eventName: PinterestCapiEventName;
  eventId: string;
  source: "storefront" | "cart" | "checkout";
  eventSourceUrl?: string | null;
  userData?: Omit<
    PinterestCapiUserData,
    "clientIpAddress" | "clientUserAgent"
  >;
  customData?: PinterestCapiCustomData;
}): Promise<void> {
  const config = getPinterestCapiConfig(input.marketingIntegrations);
  if (!config || !isPinterestCapiEventEnabled(config, input.eventName)) return;

  const hints = extractRequestClientHints(input.request);
  await sendPinterestCapiEvent({
    adAccountId: config.adAccountId,
    accessToken: config.accessToken,
    eventName: input.eventName,
    eventId: input.eventId,
    eventSourceUrl: input.eventSourceUrl ?? null,
    testMode: config.testMode,
    diagnostics: {
      storeId: input.storeId,
      source: input.source,
      testMode: config.testMode,
    },
    userData: {
      ...input.userData,
      clientIpAddress: hints.clientIpAddress,
      clientUserAgent: hints.clientUserAgent,
    },
    customData: input.customData,
  });
}
