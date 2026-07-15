"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CreditCard, Banknote, Truck, Zap, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCartStore } from "@/lib/cart-store";
import { formatCurrency, cn } from "@/lib/utils";
import {
  SHIPPING_OPTIONS,
  calculateCheckoutShipping,
  FREE_SHIPPING_THRESHOLD,
} from "@/lib/checkout";
import { getOrderConfirmationUrl } from "@/lib/storefront-urls";
import { trackInitiateCheckout } from "@/lib/marketing-events";
import { getStoredAttribution } from "@/lib/marketing-attribution";
import { CheckoutProgress } from "@/components/storefront/checkout/checkout-progress";
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
    x: direction > 0 ? 48 : -48,
    opacity: 0,
    filter: "blur(4px)",
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: { type: "spring" as const, damping: 28, stiffness: 320 },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 48 : -48,
    opacity: 0,
    filter: "blur(4px)",
    transition: { duration: 0.22, ease: [0.32, 0.72, 0, 1] as const },
  }),
};

export function CheckoutForm({ store }: CheckoutFormProps) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.getSubtotal());
  const clearCart = useCartStore((s) => s.clearCart);
  const setStore = useCartStore((s) => s.setStore);

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    paymentMethod: "cod",
  });

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

  const shipping = calculateCheckoutShipping(subtotal, form.shippingMethod);
  const discount = appliedCoupon?.discount ?? 0;
  const total = Math.max(subtotal - discount + shipping, 0);
  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

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
        setError("Valid email is required");
        return false;
      }
      if (!form.customerPhone.trim()) {
        setError("Phone number is required");
        return false;
      }
      if (!form.street.trim() || !form.city.trim() || !form.postalCode.trim() || !form.country.trim()) {
        setError("Complete shipping address is required");
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
      setError("Your cart is empty");
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
        throw new Error(data.message ?? "Checkout failed");
      }

      clearCart();
      router.push(getOrderConfirmationUrl(store.slug, data.order.orderNumber));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">Your cart is empty</p>
        <Button asChild className="rounded-xl" style={{ backgroundColor: "#007AFF" }}>
          <a href={`/store/${store.slug}`}>Continue shopping</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <CheckoutProgress currentStep={step} />

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>
      )}

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
        >
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold tracking-tight mb-6">Customer Information</h2>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={form.customerName}
                  onChange={(e) => updateField("customerName", e.target.value)}
                  placeholder="Ahmed Benali"
                  className="rounded-xl h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.customerEmail}
                  onChange={(e) => updateField("customerEmail", e.target.value)}
                  placeholder="ahmed@example.com"
                  className="rounded-xl h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.customerPhone}
                  onChange={(e) => updateField("customerPhone", e.target.value)}
                  placeholder="+212 6XX XXX XXX"
                  className="rounded-xl h-11"
                />
              </div>
              <div className="pt-4">
                <h3 className="font-medium mb-4">Shipping Address</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">Street *</Label>
                    <Input
                      id="street"
                      value={form.street}
                      onChange={(e) => updateField("street", e.target.value)}
                      placeholder="123 Rue Mohammed V"
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={form.city}
                        onChange={(e) => updateField("city", e.target.value)}
                        placeholder="Casablanca"
                        className="rounded-xl h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postal">Postal Code *</Label>
                      <Input
                        id="postal"
                        value={form.postalCode}
                        onChange={(e) => updateField("postalCode", e.target.value)}
                        placeholder="20000"
                        className="rounded-xl h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={form.country}
                      onChange={(e) => updateField("country", e.target.value)}
                      placeholder="Morocco"
                      className="rounded-xl h-11"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold tracking-tight mb-6">Shipping Method</h2>
              {freeShipping && (
                <div className="p-4 rounded-xl bg-green-50 text-green-700 text-sm mb-4">
                  Your order qualifies for free shipping!
                </div>
              )}
              {SHIPPING_OPTIONS.map((option) => {
                const rate = freeShipping ? 0 : option.rate;
                const selected = form.shippingMethod === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => updateField("shippingMethod", option.id)}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 text-left transition-all flex items-start gap-4",
                      selected ? "border-[#007AFF] bg-[#007AFF]/5" : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className={cn("mt-0.5", selected ? "text-[#007AFF]" : "text-gray-400")}>
                      {option.id === "express" ? (
                        <Zap className="h-5 w-5" />
                      ) : (
                        <Truck className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <span className="font-medium">{option.label}</span>
                        <span className="font-semibold text-sm">
                          {rate === 0 ? "Free" : formatCurrency(rate, store.currency)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{option.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold tracking-tight mb-6">Payment Method</h2>

              {store.checkout.cashOnDelivery && (
                <button
                  type="button"
                  onClick={() => updateField("paymentMethod", "cod")}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 text-left transition-all flex items-start gap-4",
                    form.paymentMethod === "cod"
                      ? "border-[#007AFF] bg-[#007AFF]/5"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <Banknote className={cn("h-5 w-5 mt-0.5", form.paymentMethod === "cod" ? "text-[#007AFF]" : "text-gray-400")} />
                  <div>
                    <span className="font-medium">Cash on Delivery</span>
                    <p className="text-sm text-gray-500 mt-0.5">Pay when your order arrives</p>
                  </div>
                </button>
              )}

              <div
                className={cn(
                  "w-full p-4 rounded-xl border-2 text-left flex items-start gap-4 opacity-60 cursor-not-allowed",
                  "border-gray-200 bg-gray-50"
                )}
              >
                <CreditCard className="h-5 w-5 mt-0.5 text-gray-400" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-500">Credit Card (Stripe)</span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-500">
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-0.5">Secure online payment</p>
                </div>
              </div>

              <div className="mt-6 p-5 rounded-2xl border border-gray-200 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Tag className="h-4 w-4 text-[#007AFF]" />
                  Discount code
                </div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-xl bg-green-50 px-4 py-3 text-sm">
                    <div>
                      <span className="font-semibold text-green-800">{appliedCoupon.code}</span>
                      <span className="text-green-700 ml-2">
                        −{formatCurrency(appliedCoupon.discount, store.currency)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-green-700 hover:text-green-900"
                      aria-label="Remove discount code"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="SUMMER20"
                      className="rounded-xl h-11 uppercase"
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
                      className="rounded-xl h-11 px-5 shrink-0"
                    >
                      {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                    </Button>
                  </div>
                )}
              </div>

              <div className="mt-6 p-5 rounded-2xl bg-gray-50 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatCurrency(subtotal, store.currency)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Discount{appliedCoupon ? ` (${appliedCoupon.code})` : ""}</span>
                    <span>−{formatCurrency(discount, store.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span>{shipping === 0 ? "Free" : formatCurrency(shipping, store.currency)}</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-[#007AFF]">{formatCurrency(total, store.currency)}</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3 mt-8">
        {step > 1 && (
          <Button variant="outline" onClick={goBack} className="flex-1 h-12 rounded-xl" disabled={loading}>
            Back
          </Button>
        )}
        {step < 3 ? (
          <Button
            onClick={goNext}
            className="flex-1 h-12 rounded-xl text-white"
            style={{ backgroundColor: "#007AFF" }}
          >
            Continue
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 h-12 rounded-xl text-white"
            style={{ backgroundColor: "#007AFF" }}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Placing order…
              </span>
            ) : (
              "Place Order"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
