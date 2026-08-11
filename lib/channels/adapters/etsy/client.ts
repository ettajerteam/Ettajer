/**
 * Thin, typed wrapper around the Etsy Open API v3 (https://openapi.etsy.com/v3).
 * Handles auth headers, JSON/multipart bodies, and 429 rate-limit backoff.
 * Never logs access/refresh tokens — only method, path, and status code.
 */

const ETSY_API_BASE = "https://openapi.etsy.com/v3";
const MAX_RETRIES = 4;
const DEFAULT_RETRY_DELAY_MS = 1000;

export class EtsyApiError extends Error {
  status: number;
  code?: string;
  endpoint: string;

  constructor(message: string, status: number, endpoint: string, code?: string) {
    super(message);
    this.name = "EtsyApiError";
    this.status = status;
    this.endpoint = endpoint;
    this.code = code;
  }
}

export interface EtsyApiClientOptions {
  clientId: string;
  accessToken: string;
}

interface EtsyErrorBody {
  error?: string;
  error_description?: string;
  message?: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function redactEndpointForLogs(path: string): string {
  // Etsy paths don't carry tokens, but strip query strings defensively.
  return path.split("?")[0];
}

export interface EtsyListingsQuery {
  state?: "active" | "inactive" | "draft" | "expired" | "sold_out";
  limit?: number;
  offset?: number;
  includes?: string[];
}

export interface EtsyReceiptsQuery {
  limit?: number;
  offset?: number;
  minCreated?: number;
  maxCreated?: number;
  wasPaid?: boolean;
  wasShipped?: boolean;
}

export class EtsyApiClient {
  private readonly clientId: string;
  private readonly accessToken: string;

  constructor(options: EtsyApiClientOptions) {
    if (!options.clientId) throw new Error("EtsyApiClient requires clientId");
    if (!options.accessToken) throw new Error("EtsyApiClient requires accessToken");
    this.clientId = options.clientId;
    this.accessToken = options.accessToken;
  }

  private async request<T>(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    path: string,
    options?: { query?: Record<string, string | number | boolean | undefined>; body?: unknown; formData?: FormData }
  ): Promise<T> {
    const url = new URL(`${ETSY_API_BASE}${path}`);
    for (const [key, value] of Object.entries(options?.query ?? {})) {
      if (value === undefined || value === null) continue;
      url.searchParams.set(key, String(value));
    }

    let attempt = 0;
    for (;;) {
      const headers: Record<string, string> = {
        "x-api-key": this.clientId,
        Authorization: `Bearer ${this.accessToken}`,
      };
      let body: BodyInit | undefined;
      if (options?.formData) {
        body = options.formData;
      } else if (options?.body !== undefined) {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify(options.body);
      }

      const res = await fetch(url.toString(), { method, headers, body, cache: "no-store" });

      if (res.status === 429 && attempt < MAX_RETRIES) {
        const retryAfterHeader = res.headers.get("retry-after");
        const retryAfterMs = retryAfterHeader
          ? Number(retryAfterHeader) * 1000
          : DEFAULT_RETRY_DELAY_MS * Math.pow(2, attempt);
        await sleep(Number.isFinite(retryAfterMs) ? retryAfterMs : DEFAULT_RETRY_DELAY_MS);
        attempt += 1;
        continue;
      }

      if (res.status >= 500 && attempt < MAX_RETRIES) {
        await sleep(DEFAULT_RETRY_DELAY_MS * Math.pow(2, attempt));
        attempt += 1;
        continue;
      }

      const endpoint = redactEndpointForLogs(path);
      if (!res.ok) {
        const errorBody = (await res.json().catch(() => ({}))) as EtsyErrorBody;
        throw new EtsyApiError(
          errorBody.error_description || errorBody.message || errorBody.error || `Etsy API error (${res.status}) at ${endpoint}`,
          res.status,
          endpoint
        );
      }

      if (res.status === 204) return undefined as T;
      return (await res.json()) as T;
    }
  }

  async getMe(): Promise<{ user_id: number; primary_email?: string }> {
    return this.request("GET", "/application/users/me");
  }

  async getShopByOwnerUserId(userId: string | number): Promise<{
    results: Array<Record<string, unknown>>;
    count: number;
  }> {
    return this.request("GET", `/application/users/${userId}/shops`);
  }

  async getShop(shopId: string | number): Promise<Record<string, unknown>> {
    return this.request("GET", `/application/shops/${shopId}`);
  }

  async getListingsByShop(
    shopId: string | number,
    query?: EtsyListingsQuery
  ): Promise<{ results: Array<Record<string, unknown>>; count: number }> {
    return this.request("GET", `/application/shops/${shopId}/listings`, {
      query: {
        state: query?.state ?? "active",
        limit: query?.limit ?? 25,
        offset: query?.offset ?? 0,
        includes: query?.includes?.join(","),
      },
    });
  }

  async getListing(
    listingId: string | number,
    includes: string[] = ["Images", "Inventory", "Shipping"]
  ): Promise<Record<string, unknown>> {
    return this.request("GET", `/application/listings/${listingId}`, {
      query: { includes: includes.join(",") },
    });
  }

  async createDraftListing(
    shopId: string | number,
    payload: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    return this.request("POST", `/application/shops/${shopId}/listings`, { body: payload });
  }

  async updateListing(
    shopId: string | number,
    listingId: string | number,
    payload: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    return this.request("PATCH", `/application/shops/${shopId}/listings/${listingId}`, {
      body: payload,
    });
  }

  /** Update per-SKU/variant offering price + quantity via the Inventory endpoint. */
  async updateListingInventory(
    listingId: string | number,
    payload: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    return this.request("PUT", `/application/listings/${listingId}/inventory`, {
      body: payload,
    });
  }

  async uploadListingImage(
    shopId: string | number,
    listingId: string | number,
    file: { data: Buffer; filename: string; contentType: string; rank?: number }
  ): Promise<Record<string, unknown>> {
    const formData = new FormData();
    formData.append(
      "image",
      new Blob([new Uint8Array(file.data)], { type: file.contentType }),
      file.filename
    );
    if (file.rank !== undefined) formData.append("rank", String(file.rank));

    return this.request(
      "POST",
      `/application/shops/${shopId}/listings/${listingId}/images`,
      { formData }
    );
  }

  /** Shipping profiles required to activate most physical-goods listings. */
  async getShopShippingProfiles(
    shopId: string | number
  ): Promise<{ results: Array<Record<string, unknown>>; count: number }> {
    return this.request("GET", `/application/shops/${shopId}/shipping-profiles`);
  }

  /** Return policies — required for activation in some regions. */
  async getShopReturnPolicies(
    shopId: string | number
  ): Promise<{ results: Array<Record<string, unknown>>; count: number }> {
    return this.request("GET", `/application/shops/${shopId}/policies/return`);
  }

  async getShopReceipts(
    shopId: string | number,
    query?: EtsyReceiptsQuery
  ): Promise<{ results: Array<Record<string, unknown>>; count: number }> {
    return this.request("GET", `/application/shops/${shopId}/receipts`, {
      query: {
        limit: query?.limit ?? 25,
        offset: query?.offset ?? 0,
        min_created: query?.minCreated,
        max_created: query?.maxCreated,
        was_paid: query?.wasPaid,
        was_shipped: query?.wasShipped,
      },
    });
  }

  async getShopReceipt(
    shopId: string | number,
    receiptId: string | number
  ): Promise<Record<string, unknown>> {
    return this.request("GET", `/application/shops/${shopId}/receipts/${receiptId}`);
  }

  async createReceiptShipment(
    shopId: string | number,
    receiptId: string | number,
    payload: {
      tracking_code: string;
      carrier_name?: string;
      send_bcc?: boolean;
      note_to_buyer?: string;
    }
  ): Promise<Record<string, unknown>> {
    return this.request(
      "POST",
      `/application/shops/${shopId}/receipts/${receiptId}/tracking`,
      { body: payload }
    );
  }
}
