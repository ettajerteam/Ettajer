import type Stripe from "stripe";
import { getStripe } from "@/lib/payments/stripe";
import { getAppUrl } from "@/lib/app-url";
import {
  getOrderConfirmationUrl,
  getStoreCheckoutUrl,
} from "@/lib/storefront-urls";

/** Stripe expects amounts in the smallest currency unit (e.g. cents). */
export function toStripeAmount(total: number, currency: string): number {
  const code = currency.toUpperCase();
  // Zero-decimal currencies (Stripe list subset we might use)
  if (["JPY", "KRW", "VND", "CLP", "XOF", "XAF"].includes(code)) {
    return Math.max(1, Math.round(total));
  }
  return Math.max(1, Math.round(total * 100));
}

export async function createStripeCheckoutSession(params: {
  connectedAccountId: string;
  orderId: string;
  orderNumber: string;
  storeSlug: string;
  storeName: string;
  currency: string;
  amount: number;
  customerEmail: string;
  lineItems: { name: string; quantity: number; unitAmount: number }[];
}): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  const currency = params.currency.toLowerCase();
  const appUrl = getAppUrl();

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] =
    params.lineItems.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency,
        unit_amount: toStripeAmount(item.unitAmount, params.currency),
        product_data: {
          name: item.name.slice(0, 120) || "Item",
        },
      },
    }));

  // Ensure session total matches order when shipping/discount make line items diverge:
  // use a single line for the order total if needed for simplicity & accuracy.
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: params.customerEmail,
    line_items:
      line_items.length > 0
        ? [
            {
              quantity: 1,
              price_data: {
                currency,
                unit_amount: toStripeAmount(params.amount, params.currency),
                product_data: {
                  name: `${params.storeName} order ${params.orderNumber}`.slice(
                    0,
                    120
                  ),
                  description: "Store checkout",
                },
              },
            },
          ]
        : line_items,
    success_url: `${appUrl}${getOrderConfirmationUrl(
      params.storeSlug,
      params.orderNumber
    )}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}${getStoreCheckoutUrl(params.storeSlug)}?stripe=cancel`,
    client_reference_id: params.orderId,
    metadata: {
      orderId: params.orderId,
      orderNumber: params.orderNumber,
      storeSlug: params.storeSlug,
      provider: "stripe",
    },
    payment_intent_data: {
      transfer_data: {
        destination: params.connectedAccountId,
      },
      metadata: {
        orderId: params.orderId,
        orderNumber: params.orderNumber,
        storeSlug: params.storeSlug,
      },
    },
  });

  return session;
}

export async function retrieveStripeCheckoutSession(sessionId: string) {
  return getStripe().checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent"],
  });
}
