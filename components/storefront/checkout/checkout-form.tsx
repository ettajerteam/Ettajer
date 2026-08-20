"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { AppImage as Image } from "@/components/shared/app-image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  CreditCard,
  Banknote,
  Truck,
  Tag,
  X,
  ChevronDown,
  ShieldCheck,
  Lock,
  Wallet,
  UserRound,
  Mail,
  Phone,
  MapPin,
  StickyNote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCartStore } from "@/lib/cart-store";
import { formatCurrency, cn } from "@/lib/utils";
import {
  calculateShippingCost,
  findShippingZone,
  type ShippingZone,
} from "@/lib/store-settings";
import { getCitiesForCountry, resolveCountryCode } from "@/lib/shipping-destinations";
import { getOrderConfirmationUrl, getStoreProductsUrl, getStoreUrl } from "@/lib/storefront-urls";
import { trackInitiateCheckout } from "@/lib/marketing-events";
import { getStoredAttribution } from "@/lib/marketing-attribution";
import { CheckoutProgress } from "@/components/storefront/checkout/checkout-progress";
import { CheckoutEmptyBag } from "@/components/storefront/checkout/checkout-empty-bag";
import { formatCartVariant } from "@/components/storefront/cart/cart-line-item";
import { getStorefrontCopy } from "@/lib/storefront/storefront-i18n";
import { PaypalCheckoutButtons } from "@/components/storefront/checkout/paypal-checkout-buttons";
import type { PublicStore } from "@/types/storefront";
import type { PaymentMethod, ShippingMethod } from "@/types/cart";
import { DEFAULT_CHECKOUT_FIELDS } from "@/lib/shop-preferences";
import { calculateOrderTax } from "@/lib/tax";
import {
  cnSelectable,
  getCheckoutThemeStyles,
  type CheckoutThemeStyles,
} from "@/lib/checkout-theme-styles";

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
  customerNote: string;
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

function FieldMeta({
  styles,
  mode,
  label,
  htmlFor,
}: {
  styles: CheckoutThemeStyles;
  mode?: string;
  label: string;
  htmlFor: string;
}) {
  const optional = mode === "optional";
  return (
    <div className="mb-1.5 flex items-center justify-between gap-2">
      <Label htmlFor={htmlFor} className={cn(styles.fieldLabel, "mb-0")}>
        {label}
        {mode === "required" ? (
          <span className={cn("ml-0.5", styles.requiredMark)} aria-hidden>
            *
          </span>
        ) : null}
      </Label>
      {optional ? <span className={styles.optionalBadge}>Optional</span> : null}
    </div>
  );
}

function InfoPanelHeader({
  styles,
  icon: Icon,
  title,
  subtitle,
}: {
  styles: CheckoutThemeStyles;
  icon: typeof UserRound;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span className={styles.infoIcon}>
        <Icon
          className={cn(
            styles.id === "compact" ? "h-3.5 w-3.5" : "h-4 w-4"
          )}
          strokeWidth={2}
        />
      </span>
      <div className="min-w-0 pt-0.5">
        <h3 className={styles.sectionTitle}>{title}</h3>
        {subtitle ? (
          <p className="mt-0.5 text-[12px] leading-snug text-neutral-500">
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
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
  const [summaryOpen, setSummaryOpen] = useState(
    Boolean(store.checkout.summaryOpenByDefault)
  );
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const initiateCheckoutSent = useRef(false);

  const shippableCountries = store.checkout.shippableCountries ?? [];
  const shippingZones = (store.checkout.shippingZones ?? []) as ShippingZone[];
  const defaultCountry =
    shippableCountries[0]?.name ??
    shippableCountries[0]?.code ??
    "Morocco";

  const [form, setForm] = useState<FormData>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    street: "",
    city: "",
    postalCode: "",
    country: defaultCountry,
    customerNote: "",
    shippingMethod: "standard",
    paymentMethod: store.checkout.cashOnDelivery
      ? "cod"
      : store.checkout.paypal
        ? "paypal"
        : store.checkout.stripe
          ? "stripe"
          : "cod",
  });

  const freeThreshold = store.checkout.freeShippingThreshold;
  const minOrder = store.checkout.minOrderAmount ?? 0;
  const belowMinOrder = minOrder > 0 && subtotal < minOrder;
  const primary = "var(--store-primary)";
  const ctaBg = "var(--store-cta, var(--store-primary, #0a0a0a))";
  const ctaFg = "var(--store-on-cta, #ffffff)";
  const fields = store.checkout.fields ?? DEFAULT_CHECKOUT_FIELDS;
  const theme = store.checkout.checkoutTheme ?? "classic";
  const styles = getCheckoutThemeStyles(theme);
  const inputClass = styles.input;
  const sectionGap = styles.sectionGap;
  const fieldGap = styles.fieldGap;
  const codBlurb =
    store.checkout.codMessage?.trim() ||
    "Pay the courier when your package arrives. No card needed.";
  const paypalBlurb =
    store.checkout.paypalMessage?.trim() ||
    "Pay securely with PayPal — money goes to the store";
  const codTitle = store.checkout.codTitle?.trim() || "Cash on delivery";
  const paypalTitle = store.checkout.paypalTitle?.trim() || "PayPal";
  const checkoutNote = store.checkout.checkoutNote?.trim() || "";
  const showEmailTrust = fields.email !== "hidden";

  useEffect(() => {
    setStore(store.slug, store.currency);
  }, [store.slug, store.currency, setStore]);

  const countryCode =
    resolveCountryCode(form.country) ??
    shippableCountries.find((c) => c.name === form.country)?.code ??
    null;
  const cityOptions = countryCode ? [...getCitiesForCountry(countryCode)] : [];

  const matchedZone = findShippingZone(
    { city: form.city, country: form.country },
    shippingZones
  );
  const zoneShipping = calculateShippingCost(
    subtotal,
    { city: form.city, country: form.country },
    shippingZones
  );
  const shipping = zoneShipping ?? 0;
  const discount = appliedCoupon?.discount ?? 0;
  const codFee =
    form.paymentMethod === "cod" ? Math.max(0, store.checkout.codFee ?? 0) : 0;
  const taxCalc = calculateOrderTax(
    {
      enabled: store.checkout.taxEnabled === true,
      ratePercent: store.checkout.taxRatePercent ?? 0,
      pricesIncludeTax: store.checkout.taxPricesIncludeTax === true,
      label: store.checkout.taxLabel?.trim() || "Tax",
      showOnCheckout: store.checkout.taxShowOnCheckout !== false,
      showOnInvoice: true,
    },
    subtotal,
    discount
  );
  const showTaxLine =
    taxCalc.enabled && taxCalc.tax > 0 && store.checkout.taxShowOnCheckout !== false;
  const total = Math.max(
    subtotal - discount + shipping + taxCalc.addToTotal + codFee,
    0
  );
  const freeShipping = zoneShipping === 0;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const isSinglePage = store.checkout.checkoutLayout === "single";
  const showProgress =
    !isSinglePage && store.checkout.showProgress !== false;
  const showCoupon = store.checkout.showCoupon !== false;
  const requireTerms = store.checkout.requireTerms === true;
  const continueLabel =
    store.checkout.continueLabel?.trim() || t.checkout.continue;
  const placeOrderLabel =
    store.checkout.placeOrderLabel?.trim() || t.checkout.placeOrder;

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

  function validateContactAndAddress(): boolean {
    if (!form.customerName.trim()) {
      setError("Full name is required");
      return false;
    }
    if (fields.email === "required") {
      if (
        !form.customerEmail.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)
      ) {
        setError("A valid email is required");
        return false;
      }
    } else if (
      fields.email === "optional" &&
      form.customerEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)
    ) {
      setError("Enter a valid email or leave it blank");
      return false;
    }
    if (fields.phone === "required" && !form.customerPhone.trim()) {
      setError("Phone number is required for delivery");
      return false;
    }
    if (fields.street === "required" && !form.street.trim()) {
      setError("Street address is required");
      return false;
    }
    if (fields.city === "required" && !form.city.trim()) {
      setError("City is required");
      return false;
    }
    if (fields.postalCode === "required" && !form.postalCode.trim()) {
      setError("Postal code is required");
      return false;
    }
    if (fields.country === "required" && !form.country.trim()) {
      setError("Country is required");
      return false;
    }
    if (fields.orderNote === "required" && !form.customerNote.trim()) {
      setError("Please add an order note");
      return false;
    }
    if (
      calculateShippingCost(
        subtotal,
        { city: form.city, country: form.country },
        shippingZones
      ) === null
    ) {
      setError("We don’t ship to this destination. Pick a country we deliver to.");
      return false;
    }
    return true;
  }

  function validateStep(): boolean {
    if (step === 1) return validateContactAndAddress();
    return true;
  }

  function goNext() {
    if (!validateStep()) return;
    if (step === 1 && zoneShipping === null) {
      setError("We don’t ship to this destination. Pick a country we deliver to.");
      return;
    }
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

      if (!initiateCheckoutSent.current) {
        initiateCheckoutSent.current = true;
        void trackInitiateCheckout(store.marketing, {
          value: subtotal,
          currency: store.currency,
          itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
          contentIds: items.map((item) => item.productId),
          storeSlug: store.slug,
          email: form.customerEmail.trim(),
          phone: form.customerPhone.trim(),
          name: form.customerName.trim(),
          city: form.city.trim(),
          country: form.country.trim(),
          zip: form.postalCode.trim(),
        });
      }
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

    if (belowMinOrder) {
      setError(
        `Minimum order is ${formatCurrency(minOrder, store.currency)}. Add more items to continue.`
      );
      return;
    }

    if (
      form.paymentMethod === "cod" &&
      !store.checkout.cashOnDelivery
    ) {
      setError("Cash on delivery is not available. Choose another payment method.");
      return;
    }
    if (form.paymentMethod === "paypal" && !store.checkout.paypal) {
      setError("PayPal is not available. Choose another payment method.");
      return;
    }
    if (form.paymentMethod === "stripe" && !store.checkout.stripe) {
      setError("Card payment is not available. Choose another payment method.");
      return;
    }
    if (
      form.paymentMethod !== "cod" &&
      form.paymentMethod !== "paypal" &&
      form.paymentMethod !== "stripe"
    ) {
      setError("Please select a payment method");
      return;
    }

    if (requireTerms && !acceptedTerms) {
      setError("Please accept the terms to continue");
      return;
    }

    // PayPal uses Smart Buttons below — don't POST /api/checkout
    if (form.paymentMethod === "paypal") {
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (form.paymentMethod === "stripe") {
        if (!validateContactAndAddress()) {
          setLoading(false);
          return;
        }
        const res = await fetch("/api/checkout/stripe/create-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...buildCheckoutBody(), paymentMethod: "stripe" }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? "Could not start card payment");
        if (!data.url) throw new Error("Missing Stripe Checkout URL");
        clearCart();
        window.location.href = data.url as string;
        return;
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildCheckoutBody()),
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

  function buildCheckoutBody() {
    const attribution = getStoredAttribution();
    const email =
      form.customerEmail.trim() || `guest@${store.slug}.local`;
    return {
      storeSlug: store.slug,
      customerName: form.customerName.trim(),
      customerEmail: email,
      customerPhone: form.customerPhone.trim() || null,
      shippingAddress: {
        street: form.street.trim() || "—",
        city: form.city.trim() || "—",
        postalCode: form.postalCode.trim() || "0000",
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
      customerNote: form.customerNote.trim() || null,
      utmSource: attribution?.utmSource ?? null,
      utmMedium: attribution?.utmMedium ?? null,
      utmCampaign: attribution?.utmCampaign ?? null,
      utmTerm: attribution?.utmTerm ?? null,
      utmContent: attribution?.utmContent ?? null,
    };
  }

  async function createPaypalOrderId(): Promise<string> {
    if (!validateContactAndAddress()) {
      throw new Error("Please complete your details first");
    }
    if (requireTerms && !acceptedTerms) {
      throw new Error("Please accept the terms to continue");
    }
    if (belowMinOrder) {
      throw new Error(
        `Minimum order is ${formatCurrency(minOrder, store.currency)}. Add more items to continue.`
      );
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...buildCheckoutBody(), paymentMethod: "paypal" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Could not start PayPal");
      return data.id as string;
    } finally {
      setLoading(false);
    }
  }

  async function capturePaypalPayment(paypalOrderId: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/paypal/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...buildCheckoutBody(),
          paymentMethod: "paypal",
          paypalOrderId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? t.checkout.failed);
      clearCart();
      router.push(getOrderConfirmationUrl(store.slug, data.order.orderNumber));
    } catch (err) {
      setError(err instanceof Error ? err.message : t.checkout.failed);
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <CheckoutEmptyBag
        storeName={store.name}
        catalogHref={getStoreProductsUrl(store.slug)}
        storeHref={getStoreUrl(store.slug)}
        eyebrow={t.checkout.eyebrow}
        checkoutTheme={store.checkout.checkoutTheme}
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
      {showTaxLine ? (
        <div className="flex justify-between text-neutral-500">
          <span>
            {taxCalc.label}
            {taxCalc.pricesIncludeTax
              ? ` (incl. ${taxCalc.ratePercent}%)`
              : ` (${taxCalc.ratePercent}%)`}
          </span>
          <span className="tabular-nums text-neutral-800">
            {formatCurrency(taxCalc.tax, store.currency)}
          </span>
        </div>
      ) : null}
      {codFee > 0 ? (
        <div className="flex justify-between text-neutral-500">
          <span>COD fee</span>
          <span className="tabular-nums text-neutral-800">
            {formatCurrency(codFee, store.currency)}
          </span>
        </div>
      ) : null}
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
          <li
            key={item.id}
            className="flex gap-3 py-3.5 first:pt-0 last:pb-0 lg:gap-3.5 lg:py-4"
          >
            <div
              className={cn(
                "relative h-14 w-14 shrink-0 overflow-hidden bg-neutral-100 lg:h-16 lg:w-16",
                styles.imageRadius
              )}
            >
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-neutral-900 lg:text-[14px]">
                {item.title}
              </p>
              {variantLabel ? (
                <p className="mt-0.5 text-[11px] text-neutral-500">
                  {variantLabel}
                </p>
              ) : null}
              <p className="mt-0.5 text-[11px] text-neutral-400">
                Qty {item.quantity}
              </p>
            </div>
            <p className="shrink-0 text-[13px] font-medium tabular-nums text-neutral-900 lg:text-[14px]">
              {formatCurrency(item.price * item.quantity, store.currency)}
            </p>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div
      className={cn(
        "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(320px,400px)] lg:items-start lg:gap-10 xl:gap-14",
        styles.shell
      )}
    >
      {/* Mobile order summary accordion */}
      <div className={cn("mb-6 lg:hidden", styles.summaryMobile)}>
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
              <div className={cn("px-1 pb-4 pt-2", styles.divider)}>
                {lineList}
                <div className={cn("mt-3 pt-3", styles.divider)}>{totalsBlock}</div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="min-w-0">
        {showProgress ? (
          <CheckoutProgress
            currentStep={step}
            language={store.language}
            theme={theme}
          />
        ) : null}

        {checkoutNote ? (
          <div
            className={cn(
              "mb-6 border-neutral-200 bg-neutral-50 text-neutral-600",
              styles.banner
            )}
          >
            {checkoutNote}
          </div>
        ) : null}

        {belowMinOrder ? (
          <div
            role="status"
            className={cn(
              "mb-6 border-amber-100 bg-amber-50 text-amber-800",
              styles.banner
            )}
          >
            Minimum order is {formatCurrency(minOrder, store.currency)}. Your bag is{" "}
            {formatCurrency(subtotal, store.currency)}.
          </div>
        ) : null}

        {error ? (
          <div
            role="alert"
            className={cn(
              "mb-6 border-red-100 bg-red-50 text-red-700",
              styles.banner
            )}
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
            {(isSinglePage || step === 1) && (
              <div className={sectionGap}>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className={styles.heading}>Your details</h2>
                    <p className={styles.subheading}>
                      Contact and delivery info for this order.
                    </p>
                  </div>
                  <p className="inline-flex items-center gap-1.5 text-[11px] text-neutral-400">
                    <Lock className="h-3 w-3" />
                    Used only for this order
                  </p>
                </div>

                {/* Contact */}
                <section className={cn(styles.infoPanel, styles.infoPanelPad)}>
                  <InfoPanelHeader
                    styles={styles}
                    icon={UserRound}
                    title="Contact"
                    subtitle="So the store can reach you about delivery."
                  />
                  <div className={fieldGap}>
                    <div>
                      <FieldMeta
                        styles={styles}
                        mode="required"
                        label={t.checkout.name}
                        htmlFor="name"
                      />
                      <div className="relative">
                        <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                        <Input
                          id="name"
                          name="name"
                          autoComplete="name"
                          value={form.customerName}
                          onChange={(e) =>
                            updateField("customerName", e.target.value)
                          }
                          placeholder="Ahmed Benali"
                          className={cn(inputClass, "pl-10")}
                        />
                      </div>
                    </div>

                    {(fields.email !== "hidden" ||
                      fields.phone !== "hidden") && (
                      <div
                        className={cn(
                          "grid gap-4",
                          fields.email !== "hidden" &&
                            fields.phone !== "hidden"
                            ? "sm:grid-cols-2"
                            : "grid-cols-1",
                          theme === "compact" && "gap-2.5"
                        )}
                      >
                        {fields.email !== "hidden" ? (
                          <div>
                            <FieldMeta
                              styles={styles}
                              mode={fields.email}
                              label="Email"
                              htmlFor="email"
                            />
                            <div className="relative">
                              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                inputMode="email"
                                value={form.customerEmail}
                                onChange={(e) =>
                                  updateField("customerEmail", e.target.value)
                                }
                                placeholder="you@example.com"
                                className={cn(inputClass, "pl-10")}
                              />
                            </div>
                          </div>
                        ) : null}
                        {fields.phone !== "hidden" ? (
                          <div>
                            <FieldMeta
                              styles={styles}
                              mode={fields.phone}
                              label="Phone"
                              htmlFor="phone"
                            />
                            <div className="relative">
                              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                              <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                autoComplete="tel"
                                inputMode="tel"
                                value={form.customerPhone}
                                onChange={(e) =>
                                  updateField("customerPhone", e.target.value)
                                }
                                placeholder={
                                  store.checkout.phonePlaceholder?.trim() ||
                                  "+212 6XX XXX XXX"
                                }
                                className={cn(inputClass, "pl-10")}
                              />
                            </div>
                            {store.checkout.phoneHint?.trim() ? (
                              <p className="mt-1.5 text-[11px] leading-snug text-neutral-500">
                                {store.checkout.phoneHint}
                              </p>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                </section>

                {/* Address */}
                {(fields.street !== "hidden" ||
                  fields.city !== "hidden" ||
                  fields.postalCode !== "hidden" ||
                  fields.country !== "hidden") && (
                  <section className={cn(styles.infoPanel, styles.infoPanelPad)}>
                    <InfoPanelHeader
                      styles={styles}
                      icon={MapPin}
                      title="Shipping address"
                      subtitle="Where the courier should deliver."
                    />
                    <div className={fieldGap}>
                      {fields.street !== "hidden" ? (
                        <div>
                          <FieldMeta
                            styles={styles}
                            mode={fields.street}
                            label="Street address"
                            htmlFor="street"
                          />
                          <Input
                            id="street"
                            name="street"
                            autoComplete="street-address"
                            value={form.street}
                            onChange={(e) =>
                              updateField("street", e.target.value)
                            }
                            placeholder="123 Rue Mohammed V"
                            className={inputClass}
                          />
                        </div>
                      ) : null}
                      {fields.country !== "hidden" ? (
                        <div>
                          <FieldMeta
                            styles={styles}
                            mode={fields.country}
                            label="Country"
                            htmlFor="country"
                          />
                          {shippableCountries.length > 0 ? (
                            <select
                              id="country"
                              name="country"
                              autoComplete="country-name"
                              value={
                                shippableCountries.find(
                                  (c) =>
                                    c.name === form.country ||
                                    c.code === form.country
                                )?.code ?? shippableCountries[0]?.code
                              }
                              onChange={(e) => {
                                const selected = shippableCountries.find(
                                  (c) => c.code === e.target.value
                                );
                                setForm((prev) => ({
                                  ...prev,
                                  country: selected?.name ?? e.target.value,
                                  city: "",
                                }));
                                setError(null);
                              }}
                              className={cn(
                                inputClass,
                                "w-full px-3 outline-none"
                              )}
                            >
                              {shippableCountries.map((c) => (
                                <option key={c.code} value={c.code}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <Input
                              id="country"
                              name="country"
                              autoComplete="country-name"
                              value={form.country}
                              onChange={(e) =>
                                updateField("country", e.target.value)
                              }
                              placeholder="Morocco"
                              className={inputClass}
                            />
                          )}
                        </div>
                      ) : null}
                      <div
                        className={cn(
                          "grid gap-3 sm:gap-4",
                          fields.city !== "hidden" &&
                            fields.postalCode !== "hidden"
                            ? "grid-cols-2"
                            : "grid-cols-1",
                          theme === "compact" && "gap-2.5"
                        )}
                      >
                        {fields.city !== "hidden" ? (
                          <div>
                            <FieldMeta
                              styles={styles}
                              mode={fields.city}
                              label="City"
                              htmlFor="city"
                            />
                            <Input
                              id="city"
                              name="city"
                              list={
                                cityOptions.length
                                  ? "checkout-cities"
                                  : undefined
                              }
                              autoComplete="address-level2"
                              value={form.city}
                              onChange={(e) =>
                                updateField("city", e.target.value)
                              }
                              placeholder={cityOptions[0] ?? "City"}
                              className={inputClass}
                            />
                            {cityOptions.length > 0 ? (
                              <datalist id="checkout-cities">
                                {cityOptions.map((city) => (
                                  <option key={city} value={city} />
                                ))}
                              </datalist>
                            ) : null}
                          </div>
                        ) : null}
                        {fields.postalCode !== "hidden" ? (
                          <div>
                            <FieldMeta
                              styles={styles}
                              mode={fields.postalCode}
                              label="Postal code"
                              htmlFor="postal"
                            />
                            <Input
                              id="postal"
                              name="postal"
                              autoComplete="postal-code"
                              value={form.postalCode}
                              onChange={(e) =>
                                updateField("postalCode", e.target.value)
                              }
                              placeholder="20000"
                              className={inputClass}
                            />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </section>
                )}

                {/* Order note */}
                {fields.orderNote !== "hidden" ? (
                  <section className={cn(styles.infoPanel, styles.infoPanelPad)}>
                    <InfoPanelHeader
                      styles={styles}
                      icon={StickyNote}
                      title="Order note"
                      subtitle="Landmarks, building access, preferred time."
                    />
                    <div>
                      <FieldMeta
                        styles={styles}
                        mode={fields.orderNote}
                        label="Note for the courier"
                        htmlFor="order-note"
                      />
                      <Textarea
                        id="order-note"
                        name="order-note"
                        value={form.customerNote}
                        onChange={(e) =>
                          updateField("customerNote", e.target.value)
                        }
                        placeholder="Delivery instructions, landmark, preferred time…"
                        className={cn(inputClass, "min-h-[88px] py-3")}
                        maxLength={500}
                      />
                      <p className="mt-1.5 text-right text-[10px] tabular-nums text-neutral-400">
                        {form.customerNote.length}/500
                      </p>
                    </div>
                  </section>
                ) : null}
              </div>
            )}

            {(isSinglePage || step === 2) && (
              <div className={sectionGap}>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className={styles.heading}>Delivery</h2>
                    <p className={styles.subheading}>
                      Shipping for {form.city || "your city"}
                      {form.country ? `, ${form.country}` : ""}.
                    </p>
                  </div>
                </div>

                {zoneShipping === null ? (
                  <p
                    className={cn(
                      "border-amber-100 bg-amber-50 font-medium text-amber-900",
                      styles.banner
                    )}
                  >
                    We don’t ship to this destination. Go back and choose a
                    country we deliver to.
                  </p>
                ) : (
                  <>
                    {freeShipping ? (
                      <p
                        className={cn(
                          "border-emerald-100 bg-emerald-50 font-medium text-emerald-800",
                          styles.banner
                        )}
                      >
                        Free shipping on this order
                      </p>
                    ) : matchedZone &&
                      matchedZone.rate > 0 &&
                      matchedZone.freeShippingThreshold > 0 ? (
                      <p className="text-[13px] text-neutral-500">
                        Free shipping from{" "}
                        {formatCurrency(
                          matchedZone.freeShippingThreshold,
                          store.currency
                        )}
                      </p>
                    ) : freeThreshold > 0 && !matchedZone ? (
                      <p className="text-[13px] text-neutral-500">
                        Free shipping from{" "}
                        {formatCurrency(freeThreshold, store.currency)}
                      </p>
                    ) : null}

                    <section className={cn(styles.infoPanel, styles.infoPanelPad)}>
                      <InfoPanelHeader
                        styles={styles}
                        icon={Truck}
                        title={matchedZone?.name?.trim() || "Delivery"}
                        subtitle={
                          matchedZone?.rate === 0
                            ? "Free shipping for this zone"
                            : "Based on your shipping address"
                        }
                      />
                      <div
                        className={cn(
                          "flex items-center justify-between gap-3",
                          styles.divider,
                          "pt-3"
                        )}
                      >
                        <span className="text-[13px] text-neutral-500">
                          Shipping cost
                        </span>
                        <span
                          className="text-[15px] font-semibold tabular-nums"
                          style={{ color: primary }}
                        >
                          {shipping === 0
                            ? "Free"
                            : formatCurrency(shipping, store.currency)}
                        </span>
                      </div>
                    </section>
                  </>
                )}
              </div>
            )}

            {(isSinglePage || step === 3) && (
              <div className={sectionGap}>
                <div>
                  <h2 className={styles.heading}>Payment</h2>
                  <p className={styles.subheading}>
                    Choose how you’d like to pay.
                  </p>
                </div>

                {store.checkout.cashOnDelivery ? (
                  <button
                    type="button"
                    onClick={() => updateField("paymentMethod", "cod")}
                    className={cn(
                      "flex w-full items-start gap-4",
                      cnSelectable(styles, form.paymentMethod === "cod"),
                      styles.cardPadding
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
                      <span className="font-medium text-neutral-900">{codTitle}</span>
                      <span className="mt-0.5 block text-sm text-neutral-500">
                        {codBlurb}
                      </span>
                    </span>
                  </button>
                ) : null}

                {store.checkout.paypal ? (
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => updateField("paymentMethod", "paypal")}
                      className={cn(
                        "flex w-full items-start gap-4",
                        cnSelectable(styles, form.paymentMethod === "paypal"),
                        styles.cardPadding
                      )}
                    >
                      <Wallet
                        className={cn(
                          "mt-0.5 h-5 w-5",
                          form.paymentMethod === "paypal"
                            ? "text-[var(--store-primary)]"
                            : "text-neutral-400"
                        )}
                      />
                      <span>
                        <span className="inline-flex flex-wrap items-center gap-1.5 font-medium text-neutral-900">
                          {paypalTitle}
                          {store.checkout.paypalMode === "sandbox" ? (
                            <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                              Sandbox
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-0.5 block text-sm text-neutral-500">
                          {paypalBlurb}
                        </span>
                      </span>
                    </button>

                    {form.paymentMethod === "paypal" &&
                    store.checkout.paypalClientId ? (
                      <div
                        className={cn(
                          styles.card,
                          styles.cardPadding
                        )}
                      >
                        <p className="mb-3 text-[13px] text-neutral-500">
                          Pay {formatCurrency(total, store.currency)} with PayPal
                        </p>
                        <PaypalCheckoutButtons
                          clientId={store.checkout.paypalClientId}
                          currency={store.currency}
                          disabled={loading || belowMinOrder}
                          createOrder={createPaypalOrderId}
                          onApprove={capturePaypalPayment}
                          onError={(message) => {
                            if (message.includes("cancelled")) {
                              setError(null);
                              return;
                            }
                            setError(message);
                          }}
                        />
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {store.checkout.stripe ? (
                  <button
                    type="button"
                    onClick={() => updateField("paymentMethod", "stripe")}
                    className={cn(
                      "flex w-full items-start gap-4",
                      cnSelectable(styles, form.paymentMethod === "stripe"),
                      styles.cardPadding
                    )}
                  >
                    <CreditCard
                      className={cn(
                        "mt-0.5 h-5 w-5",
                        form.paymentMethod === "stripe"
                          ? "text-[var(--store-primary)]"
                          : "text-neutral-400"
                      )}
                    />
                    <span>
                      <span className="font-medium text-neutral-900">
                        Card · Apple Pay · Google Pay
                      </span>
                      <span className="mt-0.5 block text-sm text-neutral-500">
                        Pay securely with Stripe — money goes to the store
                      </span>
                    </span>
                  </button>
                ) : null}

                {!store.checkout.cashOnDelivery &&
                !store.checkout.paypal &&
                !store.checkout.stripe ? (
                  <p
                    className={cn(
                      "border-amber-100 bg-amber-50 font-medium text-amber-900",
                      styles.banner
                    )}
                  >
                    This store has no online payment methods enabled yet.
                  </p>
                ) : null}

                {showCoupon ? (
                <div className={styles.couponBox}>
                  <div className="mb-3 flex items-center gap-2 text-[13px] font-medium text-neutral-800">
                    <Tag className="h-3.5 w-3.5 text-neutral-400" />
                    Discount code
                  </div>
                  {appliedCoupon ? (
                    <div
                      className={cn(
                        "flex items-center justify-between bg-emerald-50 px-4 py-3 text-sm",
                        theme === "soft"
                          ? "rounded-2xl"
                          : theme === "compact"
                            ? "rounded-md"
                            : "rounded-xl"
                      )}
                    >
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
                        className={cn(inputClass, "uppercase")}
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
                        className={cn(
                          "shrink-0 px-5",
                          styles.btnHeight,
                          styles.btnSecondary
                        )}
                      >
                        {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                      </Button>
                    </div>
                  )}
                </div>
                ) : null}

                {requireTerms ? (
                  <label className="flex cursor-pointer items-start gap-3 text-[13px] text-neutral-600">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-[var(--store-primary)] focus:ring-[var(--store-primary)]"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                    />
                    <span>
                      I agree to the store terms and privacy policy for this order.
                    </span>
                  </label>
                ) : null}

                <div
                  className={cn(
                    "bg-neutral-50 lg:hidden",
                    styles.card,
                    styles.cardPadding,
                    theme === "soft" && "sm:p-5"
                  )}
                >
                  {totalsBlock}
                </div>

                <ul className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-neutral-400">
                  <li className="inline-flex items-center gap-1.5">
                    <Lock className="h-3 w-3" />
                    Encrypted checkout
                  </li>
                  {showEmailTrust ? (
                    <li className="inline-flex items-center gap-1.5">
                      <ShieldCheck className="h-3 w-3" />
                      Order confirmation by email
                    </li>
                  ) : (
                    <li className="inline-flex items-center gap-1.5">
                      <ShieldCheck className="h-3 w-3" />
                      Secure order for the store
                    </li>
                  )}
                  {store.checkout.cashOnDelivery ? (
                    <li className="inline-flex items-center gap-1.5">
                      <Banknote className="h-3 w-3" />
                      Pay on delivery
                    </li>
                  ) : null}
                  {store.checkout.paypal ? (
                    <li className="inline-flex items-center gap-1.5">
                      <Wallet className="h-3 w-3" />
                      PayPal available
                    </li>
                  ) : null}
                </ul>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div
          className={cn(
            "sticky bottom-0 z-10 -mx-4 mt-8 px-4 py-4 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:shadow-none sm:backdrop-blur-none pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-0",
            styles.stickyBar
          )}
        >
          <div className="flex gap-3">
            {!isSinglePage && step > 1 ? (
              <Button
                variant="outline"
                onClick={goBack}
                className={cn("flex-1", styles.btnHeight, styles.btnSecondary)}
                disabled={loading}
              >
                {t.checkout.back}
              </Button>
            ) : null}
            {!isSinglePage && step < 3 ? (
              <Button
                onClick={goNext}
                className={cn("flex-[1.4]", styles.btnHeight, styles.btn)}
                style={{ backgroundColor: ctaBg, color: ctaFg }}
              >
                {continueLabel}
              </Button>
            ) : form.paymentMethod === "paypal" ? (
              <p className="flex-[1.4] self-center text-center text-[13px] text-neutral-500">
                Use the PayPal button above to pay{" "}
                {formatCurrency(total, store.currency)}
              </p>
            ) : (
              <Button
                onClick={() => {
                  if (isSinglePage && !validateContactAndAddress()) return;
                  if (isSinglePage && zoneShipping === null) {
                    setError(
                      "We don’t ship to this destination. Pick a country we deliver to."
                    );
                    return;
                  }
                  void handleSubmit();
                }}
                disabled={loading || belowMinOrder || (requireTerms && !acceptedTerms)}
                className={cn("flex-[1.4]", styles.btnHeight, styles.btn)}
                style={{ backgroundColor: ctaBg, color: ctaFg }}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {form.paymentMethod === "stripe"
                      ? "Redirecting to Stripe…"
                      : t.checkout.placingOrder}
                  </span>
                ) : form.paymentMethod === "stripe" ? (
                  `Pay ${formatCurrency(total, store.currency)}`
                ) : (
                  `${placeOrderLabel} · ${formatCurrency(total, store.currency)}`
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop sticky summary */}
      <aside className="sticky top-8 hidden lg:block">
        <div className={styles.summaryAside}>
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Order summary
              </h2>
              <p className="mt-1 text-[13px] text-neutral-500">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </p>
            </div>
            <span
              className="rounded-full px-2.5 py-1 text-[12px] font-semibold tabular-nums text-white"
              style={{ backgroundColor: primary }}
            >
              {formatCurrency(total, store.currency)}
            </span>
          </div>

          <div
            className={cn(
              "max-h-[min(420px,50vh)] overflow-y-auto pr-1",
              items.length > 4 && "scrollbar-thin"
            )}
          >
            {lineList}
          </div>

          <div className={cn("mt-5 pt-5", styles.divider)}>
            <div className="space-y-2.5 text-[13px]">
              <div className="flex justify-between text-neutral-500">
                <span>Subtotal</span>
                <span className="tabular-nums text-neutral-800">
                  {formatCurrency(subtotal, store.currency)}
                </span>
              </div>
              {discount > 0 ? (
                <div className="flex justify-between text-emerald-700">
                  <span>
                    Discount
                    {appliedCoupon ? ` (${appliedCoupon.code})` : ""}
                  </span>
                  <span className="tabular-nums">
                    −{formatCurrency(discount, store.currency)}
                  </span>
                </div>
              ) : null}
              <div className="flex justify-between text-neutral-500">
                <span>Shipping</span>
                <span className="tabular-nums text-neutral-800">
                  {shipping === 0
                    ? "Free"
                    : formatCurrency(shipping, store.currency)}
                </span>
              </div>
              {showTaxLine ? (
                <div className="flex justify-between text-neutral-500">
                  <span>
                    {taxCalc.label}
                    {taxCalc.pricesIncludeTax
                      ? ` (incl. ${taxCalc.ratePercent}%)`
                      : ` (${taxCalc.ratePercent}%)`}
                  </span>
                  <span className="tabular-nums text-neutral-800">
                    {formatCurrency(taxCalc.tax, store.currency)}
                  </span>
                </div>
              ) : null}
              {codFee > 0 ? (
                <div className="flex justify-between text-neutral-500">
                  <span>COD fee</span>
                  <span className="tabular-nums text-neutral-800">
                    {formatCurrency(codFee, store.currency)}
                  </span>
                </div>
              ) : null}
              <div
                className={cn(
                  "flex justify-between pt-3 text-[16px] font-semibold text-neutral-900",
                  styles.divider
                )}
              >
                <span>Total</span>
                <span className="tabular-nums" style={{ color: primary }}>
                  {formatCurrency(total, store.currency)}
                </span>
              </div>
            </div>
          </div>

          {freeThreshold > 0 && shipping > 0 && subtotal < freeThreshold ? (
            <div
              className={cn(
                "mt-5 bg-neutral-50 px-3.5 py-3 text-[12px] leading-snug text-neutral-600",
                theme === "soft"
                  ? "rounded-2xl"
                  : theme === "compact"
                    ? "rounded-md"
                    : "rounded-xl"
              )}
            >
              Add{" "}
              <span className="font-semibold text-neutral-900">
                {formatCurrency(freeThreshold - subtotal, store.currency)}
              </span>{" "}
              more for free shipping.
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-200/80">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (subtotal / freeThreshold) * 100)}%`,
                    backgroundColor: primary,
                  }}
                />
              </div>
            </div>
          ) : null}

          <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-neutral-400">
            <li className="inline-flex items-center gap-1.5">
              <Lock className="h-3 w-3" />
              Encrypted checkout
            </li>
            {store.checkout.cashOnDelivery ? (
              <li className="inline-flex items-center gap-1.5">
                <Banknote className="h-3 w-3" />
                Pay on delivery
              </li>
            ) : null}
            {store.checkout.paypal ? (
              <li className="inline-flex items-center gap-1.5">
                <Wallet className="h-3 w-3" />
                PayPal
              </li>
            ) : null}
          </ul>

          {store.checkout.cashOnDelivery ? (
            <p className="mt-4 flex items-start gap-2 text-[12px] leading-relaxed text-neutral-500">
              <Banknote className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {codBlurb}
            </p>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
