import type { PaymentGateways } from "@/lib/store-settings";

type PaypalMode = "sandbox" | "live";

function apiBase(mode: PaypalMode) {
  return mode === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export function getPaypalMode(gateways: PaymentGateways): PaypalMode {
  return gateways.paypalMode === "live" ? "live" : "sandbox";
}

export async function getPaypalAccessToken(
  clientId: string,
  clientSecret: string,
  mode: PaypalMode
): Promise<string> {
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`${apiBase(mode)}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    error_description?: string;
    error?: string;
  };
  if (!res.ok || !data.access_token) {
    throw new Error(
      data.error_description ||
        data.error ||
        "Could not authenticate with PayPal — check Client ID and Secret"
    );
  }
  return data.access_token;
}

export async function createPaypalOrder(params: {
  clientId: string;
  clientSecret: string;
  mode: PaypalMode;
  amount: number;
  currency: string;
  description?: string;
  customId?: string;
}): Promise<{ id: string }> {
  const token = await getPaypalAccessToken(
    params.clientId,
    params.clientSecret,
    params.mode
  );
  const value = params.amount.toFixed(2);
  const currency = params.currency.toUpperCase();

  const res = await fetch(`${apiBase(params.mode)}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value,
          },
          description: (params.description || "Store order").slice(0, 127),
          custom_id: params.customId?.slice(0, 127),
        },
      ],
      application_context: {
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
      },
    }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    id?: string;
    message?: string;
    details?: { description?: string }[];
  };

  if (!res.ok || !data.id) {
    const detail = data.details?.[0]?.description || data.message;
    throw new Error(detail || "Could not create PayPal order");
  }

  return { id: data.id };
}

export async function capturePaypalOrder(params: {
  clientId: string;
  clientSecret: string;
  mode: PaypalMode;
  orderId: string;
}): Promise<{ id: string; status: string }> {
  const token = await getPaypalAccessToken(
    params.clientId,
    params.clientSecret,
    params.mode
  );

  const res = await fetch(
    `${apiBase(params.mode)}/v2/checkout/orders/${encodeURIComponent(params.orderId)}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = (await res.json().catch(() => ({}))) as {
    id?: string;
    status?: string;
    message?: string;
    details?: { description?: string }[];
  };

  if (!res.ok) {
    const detail = data.details?.[0]?.description || data.message;
    throw new Error(detail || "PayPal capture failed");
  }

  return {
    id: data.id || params.orderId,
    status: data.status || "UNKNOWN",
  };
}
