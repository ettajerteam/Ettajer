import { EtsyAdapter, type EtsyAdapterOptions, type EtsyAdapterTokens } from "@/lib/channels/adapters/etsy/adapter";
import type { ChannelAdapter } from "@/lib/channels/adapters/types";

export type { ChannelAdapter } from "@/lib/channels/adapters/types";
export { EtsyAdapter } from "@/lib/channels/adapters/etsy/adapter";

export interface GetAdapterCredentials extends EtsyAdapterTokens, EtsyAdapterOptions {}

/**
 * Resolve the ChannelAdapter implementation for a channel id.
 * Only "etsy" is implemented today; other channel ids throw so callers fail
 * loudly instead of silently no-op-ing.
 */
export function getAdapter(
  channel: string,
  credentials: GetAdapterCredentials
): ChannelAdapter {
  switch (channel) {
    case "etsy":
      return new EtsyAdapter(
        { accessToken: credentials.accessToken, refreshToken: credentials.refreshToken },
        { shopId: credentials.shopId, onTokenRefreshed: credentials.onTokenRefreshed }
      );
    default:
      throw new Error(`No channel adapter implemented for "${channel}"`);
  }
}
