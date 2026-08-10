"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getOrderConfirmationUrl } from "@/lib/storefront-urls";
import { getStorefrontCopy } from "@/lib/storefront/storefront-i18n";
import { getCitiesForCountry, resolveCountryCode } from "@/lib/shipping-destinations";
import { calculateShippingCost } from "@/lib/store-settings";
import type { ShippingZone } from "@/lib/store-settings";
import { cn } from "@/lib/utils";
import type { PublicProduct, PublicStore } from "@/types/storefront";

interface ProductCodOrderFormProps {
  store: PublicStore;
  product: PublicProduct;
  quantity: number;
  variant?: Record<string, string> | null;
  isBold?: boolean;
}

export function ProductCodOrderForm({
  store,
  product,
  quantity,
  variant = null,
  isBold = false,
}: ProductCodOrderFormProps) {
  const router = useRouter();
  const t = getStorefrontCopy(store.language);
  const fields = store.checkout.fields;
  const shippableCountries = store.checkout.shippableCountries ?? [];
  const defaultCountry =
    shippableCountries[0]?.name ?? shippableCountries[0]?.code ?? "Morocco";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const countryCode =
    resolveCountryCode(defaultCountry) ??
    shippableCountries.find((c) => c.name === defaultCountry)?.code ??
    "MA";
  const cityOptions = [...getCitiesForCountry(countryCode)];
  const showEmail = fields?.email !== "hidden";

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (product.inventory <= 0) return;

    setError(null);
    if (
      !name.trim() ||
      (fields?.phone !== "hidden" && fields?.phone !== "optional" && !phone.trim()) ||
      (fields?.city !== "hidden" && fields?.city !== "optional" && !city.trim()) ||
      (fields?.street !== "hidden" && fields?.street !== "optional" && !street.trim()) ||
      (showEmail &&
        fields?.email === "required" &&
        (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())))
    ) {
      setError(t.buy.codFormHint);
      return;
    }

    setLoading(true);
    try {
      const shippingZones = (store.checkout.shippingZones ?? []) as ShippingZone[];
      const shipping =
        calculateShippingCost(
          product.price * quantity,
          { city: city.trim(), country: defaultCountry },
          shippingZones
        ) ?? 0;

      const guestEmail =
        email.trim() || `guest@${store.slug}.local`;

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeSlug: store.slug,
          customerName: name.trim(),
          customerEmail: guestEmail,
          customerPhone: phone.trim() || null,
          shippingAddress: {
            street: street.trim() || "—",
            city: city.trim() || "—",
            postalCode: "",
            country: defaultCountry,
          },
          items: [
            {
              productId: product.id,
              quantity: Math.max(1, Math.min(quantity, product.inventory)),
              variant:
                variant && Object.keys(variant).length > 0 ? variant : null,
            },
          ],
          shipping,
          shippingMethod: "standard",
          paymentMethod: "cod",
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.message === "string"
            ? data.message
            : t.checkout.failed
        );
      }

      const orderNumber =
        data.order?.orderNumber ?? data.orderNumber ?? data.order?.number;
      if (orderNumber) {
        router.push(getOrderConfirmationUrl(store.slug, String(orderNumber)));
        return;
      }
      throw new Error(t.checkout.failed);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.checkout.failed);
    } finally {
      setLoading(false);
    }
  }

  const fieldClass = cn(
    "h-12 rounded-xl border px-3 text-[15px]",
    isBold
      ? "border-white/15 bg-white/[0.06] text-white placeholder:text-white/35"
      : "border-black/[0.08] bg-white text-neutral-900"
  );

  const labelClass = cn(
    "text-[12px] font-medium",
    isBold ? "text-white/55" : "text-neutral-500"
  );

  return (
    <form
      onSubmit={placeOrder}
      className={cn(
        "mt-5 space-y-3 rounded-2xl border p-4 sm:p-5",
        isBold
          ? "border-white/10 bg-white/[0.04]"
          : "border-black/[0.06] bg-neutral-50/80"
      )}
    >
      <div>
        <p
          className={cn(
            "text-[11px] font-medium uppercase tracking-[0.14em]",
            isBold ? "text-white/40" : "text-neutral-400"
          )}
        >
          {t.cart.cashOnDelivery}
        </p>
        <p
          className={cn(
            "mt-1 text-[15px] font-medium tracking-[-0.01em]",
            isBold ? "text-white" : "text-neutral-900"
          )}
        >
          {t.buy.codFormTitle}
        </p>
        <p
          className={cn(
            "mt-1 text-[13px] leading-relaxed",
            isBold ? "text-white/45" : "text-neutral-500"
          )}
        >
          {store.checkout.codMessage?.trim() || t.buy.codFormHint}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="cod-name" className={labelClass}>
            {t.checkout.name}
          </Label>
          <Input
            id="cod-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldClass}
            autoComplete="name"
            required
          />
        </div>
        {fields?.phone !== "hidden" ? (
          <div className="space-y-1.5">
            <Label htmlFor="cod-phone" className={labelClass}>
              {t.checkout.phone}
            </Label>
            <Input
              id="cod-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={fieldClass}
              placeholder={store.checkout.phonePlaceholder || undefined}
              autoComplete="tel"
              required={fields?.phone !== "optional"}
            />
          </div>
        ) : null}
        {showEmail ? (
          <div className="space-y-1.5">
            <Label htmlFor="cod-email" className={labelClass}>
              {t.checkout.email}
            </Label>
            <Input
              id="cod-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
              autoComplete="email"
              required={fields?.email === "required"}
            />
          </div>
        ) : null}
        {fields?.city !== "hidden" ? (
          <div className="space-y-1.5">
            <Label htmlFor="cod-city" className={labelClass}>
              {t.checkout.city}
            </Label>
            {cityOptions.length > 0 ? (
              <select
                id="cod-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={cn(fieldClass, "w-full")}
                required={fields?.city !== "optional"}
              >
                <option value="">{t.checkout.city}</option>
                {cityOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                id="cod-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={fieldClass}
                required={fields?.city !== "optional"}
              />
            )}
          </div>
        ) : null}
        {fields?.street !== "hidden" ? (
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="cod-street" className={labelClass}>
              {t.checkout.street}
            </Label>
            <Input
              id="cod-street"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className={fieldClass}
              autoComplete="street-address"
              required={fields?.street !== "optional"}
            />
          </div>
        ) : null}
      </div>

      {error ? (
        <p
          className={cn(
            "text-[13px]",
            isBold ? "text-red-300" : "text-red-600"
          )}
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading || product.inventory <= 0}
        className="pdp-cta w-full disabled:opacity-50"
        style={{ backgroundColor: "var(--store-cta, var(--store-primary))", color: "var(--store-on-cta, #fff)" }}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t.checkout.placingOrder}
          </span>
        ) : (
          t.buy.orderNowCod
        )}
      </button>
    </form>
  );
}
