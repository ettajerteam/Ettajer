"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  CreditCard,
  Banknote,
  Truck,
  Zap,
  Tag,
  X,
  ChevronDown,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCartStore } from "@/lib/cart-store";
import { formatCurrency, cn } from "@/lib/utils";
import {
  SHIPPING_OPTIONS,
  calculateCheckoutShipping,
} from "@/lib/checkout";
import { getOrderConfirmationUrl, getStoreProductsUrl, getStoreUrl } from "@/lib/storefront-urls";
import { trackInitiateCheckout } from "@/lib/marketing-events";
import { getStoredAttribution } from "@/lib/marketing-attribution";
import { CheckoutProgress } from "@/components/storefront/checkout/checkout-progress";
import { formatCartVariant } from "@/components/storefront/cart/cart-line-item";
import { StorefrontQuietState } from "@/components/storefront/storefront-quiet-state";
import { getStorefrontCopy } from "@/lib/storefront/storefront-i18n";
import type { PublicStore } from "@/types/storefront";
import type { PaymentMethod, ShippingMethod } from "@/types/cart";

interface CheckoutFormProps {
  store: PublicStore;
}

interface FormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 28 : -28,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { type: "spring" as const, damping: 30, stiffness: 340 },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 28 : -28,
    opacity: 0,
    transition: { duration: 0.18 },
  }),
};

function fieldClass() {
  return "h-12 rounded-xl border-neutral-200 bg-white text-[15px] shadow-none focus-visible:ring-[var(--store-primary)]";
}

export function CheckoutForm({ store }: CheckoutFormProps) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.getSubtotal());
  const clearCart = useCartStore((s) => s.clearCart);
  const setStore = useCartStore((s) => s.setStore);
  const t = getStorefrontCopy(store.language);

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);

  const [form, setForm] = useState<FormData>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    street: "",
    city: "",
    postalCode: "",
    country: "Morocco",
    shippingMethod: "standard",
    paymentMethod: store.checkout.cashOnDelivery ? "cod" : "cod",
  });

  const freeThreshold = store.checkout.freeShippingThreshold;
  const primary = "var(--store-primary)";

  useEffect(() => {
    setStore(store.slug, store.currency);
  }, [store.slug, store.currency, setStore]);

  useEffect(() => {
    if (items.length === 0) return;
    trackInitiateCheckout(store.marketing, {
      value: subtotal,
      currency: store.currency,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shipping = calculateCheckoutShipping(subtotal, form.shippingMethod, freeThreshold);
  const discount = appliedCoupon?.discount ?? 0;
  const total = Math.max(subtotal - discount + shipping, 0);
  const freeShipping = freeThreshold > 0 && subtotal >= freeThreshold;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  async function applyCoupon() {
    const code = couponInput.trim();
    if (!code) return;

    setCouponLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeSlug: store.slug,
          code,
          subtotal,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message ?? "Invalid discount code");
      }

      setAppliedCoupon({ code: data.code, discount: data.discount });
      setCouponInput("");
    } catch (err) {
      setAppliedCoupon(null);
      setError(err instanceof Error ? err.message : "Invalid discount code");
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponInput("");
    setError(null);
  }

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  function validateStep(): boolean {
    if (step === 1) {
      if (!form.customerName.trim()) {
        setError("Full name is required");
        return false;
      }
      if (!form.customerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) {
        setError("A valid email is required");
        return false;
      }
      if (!form.customerPhone.trim()) {
        setError("Phone number is required for delivery");
        return false;
      }
      if (!form.street.trim() || !form.city.trim() || !form.postalCode.trim() || !form.country.trim()) {
        setError("Please complete your shipping address");
        return false;
      }
    }
    return true;
  }

  function goNext() {
    if (!validateStep()) return;
    if (step === 1 && items.length > 0) {
      fetch("/api/abandoned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeSlug: store.slug,
          email: form.customerEmail.trim(),
          customerName: form.customerName.trim(),
          phone: form.customerPhone.trim(),
          items: items.map((i) => ({
            productId: i.productId,
            title: i.title,
            quantity: i.quantity,
            price: i.price,
          })),
          subtotal,
        }),
      }).catch(() => {});
    }
    setDirection(1);
    setStep((s) => Math.min(s + 1, 3));
  }

  function goBack() {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
    setError(null);
  }

  async function handleSubmit() {
    if (items.length === 0) {
      setError(t.checkout.emptyCart);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const attribution = getStoredAttribution();
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeSlug: store.slug,
          customerName: form.customerName.trim(),
          customerEmail: form.customerEmail.trim(),
          customerPhone: form.customerPhone.trim(),
          shippingAddress: {
            street: form.street.trim(),
            city: form.city.trim(),
            postalCode: form.postalCode.trim(),
            country: form.country.trim(),
          },
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            variant: i.variant,
          })),
          shippingMethod: form.shippingMethod,
          paymentMethod: form.paymentMethod,
          couponCode: appliedCoupon?.code ?? null,
          utmSource: attribution?.utmSource ?? null,
          utmMedium: attribution?.utmMedium ?? null,
          utmCampaign: attribution?.utmCampaign ?? null,
          utmTerm: attribution?.utmTerm ?? null,
          utmContent: attribution?.utmContent ?? null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message ?? t.checkout.failed);
      }

      clearCart();
      router.push(getOrderConfirmationUrl(store.slug, data.order.orderNumber));
    } catch (err) {
      setError(err instanceof Error ? err.message : t.checkout.failed);
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <StorefrontQuietState
        eyebrow={t.checkout.eyebrow}
        title="Your bag is empty"
        description="Add a few pieces before checking out — the catalog is ready when you are."
        primaryAction={{
          label: "Shop the catalog",
          href: getStoreProductsUrl(store.slug),
        }}
        secondaryAction={{
          label: "Back to store",
          href: getStoreUrl(store.slug),
        }}
        isModern={store.theme === "modern"}
        isBold={store.theme === "bold"}
      />
    );
  }

  const totalsBlock = (
    <div className="space-y-2 text-[13px]">
      <div className="flex justify-between text-neutral-500">
        <span>Subtotal</span>
        <span className="tabular-nums text-neutral-800">
          {formatCurrency(subtotal, store.currency)}
        </span>
      </div>
      {discount > 0 ? (
        <div className="flex justify-between text-emerald-700">
          <span>Discount{appliedCoupon ? ` (${appliedCoupon.code})` : ""}</span>
          <span className="tabular-nums">−{formatCurrency(discount, store.currency)}</span>
        </div>
      ) : null}
      <div className="flex justify-between text-neutral-500">
        <span>Shipping</span>
        <span className="tabular-nums text-neutral-800">
          {shipping === 0 ? "Free" : formatCurrency(shipping, store.currency)}
        </span>
      </div>
      <div className="flex justify-between border-t border-neutral-200/80 pt-2.5 text-[15px] font-semibold text-neutral-900">
        <span>Total</span>
        <span className="tabular-nums" style={{ color: primary }}>
          {formatCurrency(total, store.currency)}
        </span>
      </div>
    </div>
  );

  const lineList = (
    <ul className="divide-y divide-neutral-100">
      {items.map((item) => {
        const variantLabel = formatCartVariant(item.variant);
        return (
          <li key={item.id} className="flex gap-3 py-3.5 first:pt-0 last:pb-0">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
              {item.image ? (
                <Image src={item.image} alt={item.title} fill className="object-cover" sizes="56px" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-neutral-900">{item.title}</p>
              {variantLabel ? (
                <p className="mt-0.5 text-[11px] text-neutral-500">{variantLabel}</p>
              ) : null}
              <p className="mt-0.5 text-[11px] text-neutral-400">Qty {item.quantity}</p>
            </div>
            <p className="shrink-0 text-[13px] font-medium tabular-nums text-neutral-900">
              {formatCurrency(item.price * item.quantity, store.currency)}
            </p>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-12 xl:gap-16">
      {/* Mobile order summary accordion */}
      <div className="mb-6 border-y border-neutral-100 bg-neutral-50/80 lg:hidden">
        <button
          type="button"
          onClick={() => setSummaryOpen((o) => !o)}
          className="flex w-full items-center justify-between px-1 py-3.5 text-left"
          aria-expanded={summaryOpen}
        >
          <span className="inline-flex items-center gap-2 text-[13px] font-medium text-neutral-800">
            Order summary
            <ChevronDown
              className={cn("h-4 w-4 text-neutral-400 transition", summaryOpen && "rotate-180")}
            />
            <span className="font-normal text-neutral-400">
              · {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          </span>
          <span className="text-[14px] font-semibold tabular-nums" style={{ color: primary }}>
            {formatCurrency(total, store.currency)}
          </span>
        </button>
        <AnimatePresence initial={false}>
          {summaryOpen ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="border-t border-neutral-100 px-1 pb-4 pt-2">
                {lineList}
                <div className="mt-3 border-t border-neutral-100 pt-3">{totalsBlock}</div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="min-w-0">
        <CheckoutProgress currentStep={step} language={store.language} />

        {error ? (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        ) : null}

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
                    Your details
                  </h2>
                  <p className="mt-1 text-sm text-neutral-500">
                    We’ll use these to confirm and deliver your order.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">{t.checkout.name}</Label>
                  <Input
                    id="name"
                    name="name"
                    autoComplete="name"
                    value={form.customerName}
                    onChange={(e) => updateField("customerName", e.target.value)}
                    placeholder="Ahmed Benali"
                    className={fieldClass()}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      value={form.customerEmail}
                      onChange={(e) => updateField("customerEmail", e.target.value)}
                      placeholder="you@example.com"
                      className={fieldClass()}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      value={form.customerPhone}
                      onChange={(e) => updateField("customerPhone", e.target.value)}
                      placeholder="+212 6XX XXX XXX"
                      className={fieldClass()}
                    />
                  </div>
                </div>

                <div className="border-t border-neutral-100 pt-5">
                  <h3 className="mb-4 text-[15px] font-medium text-neutral-900">
                    Shipping address
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="street">Street address</Label>
                      <Input
                        id="street"
                        name="street"
                        autoComplete="street-address"
                        value={form.street}
                        onChange={(e) => updateField("street", e.target.value)}
                        placeholder="123 Rue Mohammed V"
                        className={fieldClass()}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          autoComplete="address-level2"
                          value={form.city}
                          onChange={(e) => updateField("city", e.target.value)}
                          placeholder="Casablanca"
                          className={fieldClass()}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postal">Postal code</Label>
                        <Input
                          id="postal"
                          name="postal"
                          autoComplete="postal-code"
                          value={form.postalCode}
                          onChange={(e) => updateField("postalCode", e.target.value)}
                          placeholder="20000"
                          className={fieldClass()}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        autoComplete="country-name"
                        value={form.country}
                        onChange={(e) => updateField("country", e.target.value)}
                        placeholder="Morocco"
                        className={fieldClass()}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
                    Delivery
                  </h2>
                  <p className="mt-1 text-sm text-neutral-500">
                    Choose how you’d like your order to arrive.
                  </p>
                </div>

                {freeShipping ? (
                  <p className="rounded-xl bg-emerald-50 px-4 py-3 text-[13px] font-medium text-emerald-800">
                    Free shipping unlocked on this order
                  </p>
                ) : freeThreshold > 0 ? (
                  <p className="text-[13px] text-neutral-500">
                    Free shipping from{" "}
                    {formatCurrency(freeThreshold, store.currency)}
                  </p>
                ) : null}

                {SHIPPING_OPTIONS.map((option) => {
                  const rate = freeShipping ? 0 : option.rate;
                  const selected = form.shippingMethod === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => updateField("shippingMethod", option.id)}
                      className={cn(
                        "flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition",
                        selected
                          ? "border-[var(--store-primary)] bg-[color-mix(in_srgb,var(--store-primary)_6%,white)]"
                          : "border-neutral-200 hover:border-neutral-300"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5",
                          selected ? "text-[var(--store-primary)]" : "text-neutral-400"
                        )}
                      >
                        {option.id === "express" ? (
                          <Zap className="h-5 w-5" />
                        ) : (
                          <Truck className="h-5 w-5" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-3">
                          <span className="font-medium text-neutral-900">{option.label}</span>
                          <span className="shrink-0 text-[13px] font-semibold tabular-nums">
                            {rate === 0 ? "Free" : formatCurrency(rate, store.currency)}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-sm text-neutral-500">
                          {option.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
                    Payment
                  </h2>
                  <p className="mt-1 text-sm text-neutral-500">
                    {store.checkout.cashOnDelivery
                      ? "Pay when your order arrives — simple and secure."
                      : "Choose how you’d like to pay."}
                  </p>
                </div>

                {store.checkout.cashOnDelivery ? (
                  <button
                    type="button"
                    onClick={() => updateField("paymentMethod", "cod")}
                    className={cn(
                      "flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition",
                      form.paymentMethod === "cod"
                        ? "border-[var(--store-primary)] bg-[color-mix(in_srgb,var(--store-primary)_6%,white)]"
                        : "border-neutral-200 hover:border-neutral-300"
                    )}
                  >
                    <Banknote
                      className={cn(
                        "mt-0.5 h-5 w-5",
                        form.paymentMethod === "cod"
                          ? "text-[var(--store-primary)]"
                          : "text-neutral-400"
                      )}
                    />
                    <span>
                      <span className="font-medium text-neutral-900">Cash on delivery</span>
                      <span className="mt-0.5 block text-sm text-neutral-500">
                        Pay the courier when your package arrives. No card needed.
                      </span>
                    </span>
                  </button>
                ) : null}

                <div className="flex w-full cursor-not-allowed items-start gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 opacity-70">
                  <CreditCard className="mt-0.5 h-5 w-5 text-neutral-400" />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-neutral-500">Card payment</span>
                      <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                        Coming soon
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-neutral-400">Secure online checkout</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-neutral-200 p-4">
                  <div className="mb-3 flex items-center gap-2 text-[13px] font-medium text-neutral-800">
                    <Tag className="h-3.5 w-3.5 text-neutral-400" />
                    Discount code
                  </div>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 text-sm">
                      <div>
                        <span className="font-semibold text-emerald-800">{appliedCoupon.code}</span>
                        <span className="ml-2 text-emerald-700">
                          −{formatCurrency(appliedCoupon.discount, store.currency)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-emerald-700 hover:text-emerald-900"
                        aria-label="Remove discount code"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        id="checkout-coupon"
                        name="coupon"
                        autoComplete="off"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="CODE"
                        aria-label="Discount code"
                        className={cn(fieldClass(), "uppercase")}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            void applyCoupon();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => void applyCoupon()}
                        disabled={couponLoading || !couponInput.trim()}
                        className="h-12 shrink-0 rounded-xl px-5"
                      >
                        {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl bg-neutral-50 p-4 sm:p-5 lg:hidden">{totalsBlock}</div>

                <ul className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-neutral-400">
                  <li className="inline-flex items-center gap-1.5">
                    <Lock className="h-3 w-3" />
                    Encrypted checkout
                  </li>
                  <li className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-3 w-3" />
                    Order confirmation by email
                  </li>
                  {store.checkout.cashOnDelivery ? (
                    <li className="inline-flex items-center gap-1.5">
                      <Banknote className="h-3 w-3" />
                      Pay on delivery
                    </li>
                  ) : null}
                </ul>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="sticky bottom-0 z-10 -mx-4 mt-8 border-t border-neutral-100 bg-white/95 px-4 py-4 backdrop-blur-md sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:backdrop-blur-none pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-0">
          <div className="flex gap-3">
            {step > 1 ? (
              <Button
                variant="outline"
                onClick={goBack}
                className="h-12 flex-1 rounded-full border-neutral-200"
                disabled={loading}
              >
                {t.checkout.back}
              </Button>
            ) : null}
            {step < 3 ? (
              <Button
                onClick={goNext}
                className="h-12 flex-[1.4] rounded-full text-white"
                style={{ backgroundColor: primary }}
              >
                {t.checkout.continue}
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="h-12 flex-[1.4] rounded-full text-white"
                style={{ backgroundColor: primary }}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t.checkout.placingOrder}
                  </span>
                ) : (
                  `${t.checkout.placeOrder} · ${formatCurrency(total, store.currency)}`
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop sticky summary */}
      <aside className="sticky top-8 hidden rounded-2xl border border-neutral-200 bg-neutral-50/60 p-5 lg:block">
        <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
          Order summary
        </h2>
        {lineList}
        <div className="mt-4 border-t border-neutral-200/80 pt-4">{totalsBlock}</div>
        {store.checkout.cashOnDelivery ? (
          <p className="mt-4 flex items-start gap-2 text-[12px] leading-relaxed text-neutral-500">
            <Banknote className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Cash on delivery available — pay when your order arrives.
          </p>
        ) : null}
      </aside>
    </div>
  );
}
