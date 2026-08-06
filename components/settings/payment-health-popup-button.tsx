"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Activity,
  AlertTriangle,
  Banknote,
  Check,
  CreditCard,
  ExternalLink,
  RefreshCw,
  Wallet,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  dashboardPrimaryBtn,
  dashboardSubtitle,
} from "@/lib/dashboard-ui";
import {
  isPaypalConnected,
  type StoreWithSettings,
} from "@/lib/store-settings";
import { isPaypalCurrencySupported } from "@/lib/payments/paypal-currency";
import {
  STRIPE_AVAILABLE_AROUND,
  STRIPE_COMING_SOON_DETAIL,
  STRIPE_COMING_SOON_SHORT,
} from "@/lib/payments/stripe-availability";
import type { DashboardTipItem } from "@/components/shared/dashboard-tips-button";

type MethodStatus = {
  id: string;
  label: string;
  accent: string;
  icon: typeof Banknote;
  status: "live" | "setup" | "off" | "blocked" | "soon";
  statusLabel: string;
  detail: string;
  done: boolean;
};

/** Soft-gray health icon next to Help — opens payment readiness popup. */
export function PaymentHealthCheckButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [currency, setCurrency] = useState("MAD");
  const [gateways, setGateways] = useState({
    cashOnDelivery: true,
    stripe: false,
    paypal: false,
    paypalClientId: null as string | null,
    paypalClientSecret: null as string | null,
    paypalMode: "sandbox" as "sandbox" | "live",
    stripeAccountId: null as string | null,
  });

  const loadHealth = useCallback(async () => {
    setLoading(true);
    try {
      const storeRes = await fetch("/api/store");
      const storeData = await storeRes.json().catch(() => ({}));
      if (!storeRes.ok) throw new Error(storeData.message || "Health check failed");

      const store = storeData.store as StoreWithSettings | undefined;
      const g = store?.settings?.paymentGateways;
      setCurrency(store?.currency?.toUpperCase() || "MAD");
      setGateways({
        cashOnDelivery: g?.cashOnDelivery !== false,
        stripe: Boolean(g?.stripe),
        paypal: Boolean(g?.paypal),
        paypalClientId: g?.paypalClientId ?? null,
        paypalClientSecret: g?.paypalClientSecret ?? null,
        paypalMode: g?.paypalMode === "live" ? "live" : "sandbox",
        stripeAccountId: g?.stripeAccountId ?? null,
      });
      setLoaded(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Health check failed");
    } finally {
      setLoading(false);
    }
  }, []);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) void loadHealth();
  }

  const paypalReady = isPaypalConnected(gateways);
  const paypalCurrencyOk = isPaypalCurrencySupported(currency);

  const methods: MethodStatus[] = [
    {
      id: "cod",
      label: "Cash on delivery",
      accent: "#34C759",
      icon: Banknote,
      status: gateways.cashOnDelivery ? "live" : "off",
      statusLabel: gateways.cashOnDelivery ? "On at checkout" : "Off",
      detail: gateways.cashOnDelivery
        ? "Buyers pay the courier — confirm orders before shipping."
        : "Turn COD on if you still deliver cash orders.",
      done: gateways.cashOnDelivery,
    },
    {
      id: "stripe",
      label: "Stripe",
      accent: "#635BFF",
      icon: CreditCard,
      status: "soon",
      statusLabel: "In ~2 months",
      detail: STRIPE_COMING_SOON_DETAIL,
      done: false,
    },
    {
      id: "paypal",
      label: "PayPal",
      accent: "#0070BA",
      icon: Wallet,
      status: !paypalCurrencyOk
        ? "blocked"
        : gateways.paypal && paypalReady
          ? "live"
          : paypalReady || gateways.paypal
            ? "setup"
            : "off",
      statusLabel: !paypalCurrencyOk
        ? `Blocked · ${currency} unsupported`
        : gateways.paypal && paypalReady
          ? `Live · ${gateways.paypalMode === "live" ? "Live mode" : "Sandbox"}`
          : paypalReady
            ? "Credentials saved — turn on"
            : gateways.paypal
              ? "Add Client ID + Secret"
              : "Not connected",
      detail: !paypalCurrencyOk
        ? "Switch store currency to USD or EUR in Languages, then Verify & connect."
        : gateways.paypal && paypalReady
          ? "Shoppers pay with PayPal buttons — orders marked paid automatically."
          : "Turn PayPal on → paste credentials → Verify & connect.",
      done: gateways.paypal && paypalReady && paypalCurrencyOk,
    },
  ];

  const checklist = [
    {
      id: "method",
      label: "≥1 method",
      done: methods.some((m) => m.done),
    },
    {
      id: "cod",
      label: "COD",
      done: gateways.cashOnDelivery,
    },
    {
      id: "paypal",
      label: "PayPal live",
      done: gateways.paypal && paypalReady && paypalCurrencyOk,
    },
  ];
  const doneCount = checklist.filter((c) => c.done).length;
  const liveCount = methods.filter((m) => m.done).length;
  const hasIssue = methods.some(
    (m) => m.status === "blocked" || m.status === "setup"
  );

  function statusTone(status: MethodStatus["status"]) {
    if (status === "live")
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300";
    if (status === "blocked")
      return "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200";
    if (status === "setup")
      return "bg-[#007AFF]/10 text-[#007AFF] dark:bg-[#007AFF]/15";
    if (status === "soon")
      return "bg-neutral-100 text-neutral-500 dark:bg-white/[0.06] dark:text-neutral-400";
    return "bg-black/[0.03] text-neutral-400 dark:bg-white/[0.04]";
  }

  return (
    <>
      <button
        type="button"
        onClick={() => handleOpenChange(true)}
        aria-label="Payment readiness"
        title="Payment readiness"
        className={cn(
          "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-neutral-400 transition-colors duration-200",
          "hover:bg-black/[0.04] hover:text-neutral-600",
          "dark:text-neutral-500 dark:hover:bg-white/[0.06] dark:hover:text-neutral-300",
          className
        )}
      >
        <Activity className="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className={cn(
            "w-[min(100vw-1.5rem,440px)] max-w-[440px] gap-0 overflow-hidden rounded-2xl border-black/[0.06] p-0 shadow-xl dark:border-white/10"
          )}
        >
          <DialogHeader className="space-y-0 border-b border-black/[0.05] px-4 pb-3 pt-4 pr-12 text-left dark:border-white/10">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#007AFF]/10 text-[#007AFF]">
                  <Activity className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <DialogTitle className="text-[14px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                    Payment readiness
                  </DialogTitle>
                  <DialogDescription className="mt-0.5 text-[11px] text-neutral-500">
                    COD and PayPal now — Stripe cards in about 2 months.
                  </DialogDescription>
                </div>
              </div>
              {loaded && !loading ? (
                <span className="shrink-0 text-[10px] tabular-nums text-neutral-400">
                  {doneCount}/{checklist.length} ready
                </span>
              ) : null}
            </div>
          </DialogHeader>

          <div className="max-h-[min(70vh,560px)] space-y-0 overflow-y-auto">
            {loading && !loaded ? (
              <div className="space-y-2 px-4 py-3">
                <div className="h-14 animate-pulse rounded-[10px] bg-black/[0.04] dark:bg-white/[0.06]" />
                <div className="h-24 animate-pulse rounded-[10px] bg-black/[0.04] dark:bg-white/[0.06]" />
                <div className="h-24 animate-pulse rounded-[10px] bg-black/[0.04] dark:bg-white/[0.06]" />
              </div>
            ) : (
              <>
                <div className="flex items-start gap-3 border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#007AFF]/10 text-[#007AFF]">
                    <Wallet className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                      {liveCount} live method{liveCount === 1 ? "" : "s"} ·{" "}
                      {currency}
                    </p>
                    <p className={cn(dashboardSubtitle, "mt-0.5")}>
                      {hasIssue
                        ? "Fix setup items below so shoppers can pay and you get paid."
                        : liveCount > 0
                          ? "Checkout can take orders. Ettajer never holds customer money."
                          : "Enable at least one method so customers can checkout."}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
                  <p className="text-[11px] font-medium text-neutral-400">
                    Methods
                  </p>
                  {methods.map((m) => {
                    const Icon = m.icon;
                    return (
                      <div
                        key={m.id}
                        className="rounded-[10px] border border-black/[0.05] bg-[#FAFAFA] px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.03]"
                      >
                        <div className="flex items-start gap-2.5">
                          <span
                            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white"
                            style={{ backgroundColor: m.accent }}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <p className="text-[12px] font-semibold text-neutral-900 dark:text-white">
                                {m.label}
                              </p>
                              <span
                                className={cn(
                                  "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                                  statusTone(m.status)
                                )}
                              >
                                {m.done ? (
                                  <Check className="h-2.5 w-2.5" />
                                ) : m.status === "blocked" ? (
                                  <AlertTriangle className="h-2.5 w-2.5" />
                                ) : null}
                                {m.statusLabel}
                              </span>
                            </div>
                            <p className="mt-0.5 text-[11px] leading-relaxed text-neutral-500">
                              {m.detail}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-1.5 border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
                  <p className="text-[11px] font-medium text-neutral-400">
                    Checklist
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {checklist.map((item) => (
                      <span
                        key={item.id}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                          item.done
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                            : "bg-black/[0.03] text-neutral-400 dark:bg-white/[0.04]"
                        )}
                      >
                        {item.done ? (
                          <Check className="h-2.5 w-2.5" />
                        ) : (
                          <span className="h-2.5 w-2.5 rounded-full border border-current opacity-40" />
                        )}
                        {item.label}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 px-4 py-3">
                  <p className="text-[11px] font-medium text-neutral-400">
                    Guides
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {(
                      [
                        {
                          href: "/help/set-up-online-payments",
                          label: "Set up online payments",
                        },
                        {
                          href: "/help/connect-paypal-checkout",
                          label: "Connect PayPal",
                        },
                        {
                          href: "/help/connect-stripe-for-cards",
                          label: "Stripe (coming soon)",
                        },
                      ] as const
                    ).map((g) => (
                      <Link
                        key={g.href}
                        href={g.href}
                        className="inline-flex items-center gap-1 text-[12px] font-medium text-[#007AFF] hover:underline"
                        onClick={() => setOpen(false)}
                      >
                        {g.label}
                        <ExternalLink className="h-3 w-3 opacity-70" />
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-black/[0.05] px-4 py-3 dark:border-white/10">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-[12px] text-neutral-500"
              disabled={loading}
              onClick={() => void loadHealth()}
            >
              <RefreshCw
                className={cn("mr-1.5 h-3.5 w-3.5", loading && "animate-spin")}
              />
              Refresh
            </Button>
            <Button
              type="button"
              size="sm"
              className={cn(dashboardPrimaryBtn, "h-8 px-3 text-[12px]")}
              onClick={() => setOpen(false)}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const PAYMENT_SETTINGS_TIPS: DashboardTipItem[] = [
  {
    title: "Keep COD while you add PayPal",
    body: "Most Moroccan buyers still prefer cash on delivery. Leave COD on, then add PayPal for online payers. Stripe cards arrive in about 2 months.",
  },
  {
    title: "Stripe in ~2 months",
    body: `${STRIPE_COMING_SOON_SHORT} Around ${STRIPE_AVAILABLE_AROUND} you’ll connect Stripe for cards, Apple Pay, and Google Pay — money will go to your bank. Until then use COD and PayPal.`,
  },
  {
    title: "PayPal: verify before going live",
    body: "Turn PayPal on → paste Client ID + Secret Key 1 from developer.paypal.com → pick Sandbox or Live → Verify & connect. Green means credentials work; orders are marked paid automatically.",
  },
  {
    title: "Currency for PayPal",
    body: "PayPal does not support MAD. Switch to USD or EUR in Settings → Languages, then Verify & connect again.",
  },
  {
    title: "Test a tiny order first",
    body: "Use PayPal Sandbox, place a small checkout, then confirm Paid in Orders and funds in PayPal before switching to Live.",
  },
  {
    title: "You own the money",
    body: "Ettajer never holds customer PayPal funds. Platform fees (if any) are separate from PayPal processing fees — see Transaction fees in Help.",
  },
];

export function PaymentTipsFooter() {
  return (
    <p>
      Step-by-step:{" "}
      <Link
        href="/help/set-up-online-payments"
        className="font-medium text-[#007AFF] hover:underline"
      >
        Online payments
      </Link>
      {" · "}
      <Link
        href="/help/connect-paypal-checkout"
        className="font-medium text-[#007AFF] hover:underline"
      >
        PayPal
      </Link>
      {" · "}
      <Link
        href="/help/connect-stripe-for-cards"
        className="font-medium text-[#007AFF] hover:underline"
      >
        Stripe soon
      </Link>
    </p>
  );
}

