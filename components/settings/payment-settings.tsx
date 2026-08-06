"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  Banknote,
  Check,
  CreditCard,
  Loader2,
  Sparkles,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { SettingsPanel } from "@/components/settings/settings-panel";
import {
  SettingsField,
} from "@/components/settings/settings-section";
import {
  SettingsRelatedCard,
  SettingsRelatedLink,
} from "@/components/settings/settings-related-link";
import type { StoreWithSettings } from "@/lib/store-settings";
import { isPaypalConnected } from "@/lib/store-settings";
import {
  isPaypalCurrencySupported,
  paypalCurrencyHint,
} from "@/lib/payments/paypal-currency";
import {
  STRIPE_AVAILABLE_AROUND,
  STRIPE_COMING_SOON_SHORT,
} from "@/lib/payments/stripe-availability";
import { cn } from "@/lib/utils";

interface PaymentSettingsProps {
  store: StoreWithSettings;
  onChange: (updates: Partial<StoreWithSettings>) => void;
  onSave: (
    gatewayPatch?: Partial<StoreWithSettings["settings"]["paymentGateways"]>
  ) => Promise<void>;
  saving: boolean;
  dirty?: boolean;
}

function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: "ok" | "warn" | "muted" | "soon";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium",
        tone === "ok" &&
          "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
        tone === "warn" &&
          "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
        tone === "muted" &&
          "bg-black/[0.04] text-neutral-500 dark:bg-white/[0.06] dark:text-neutral-400",
        tone === "soon" &&
          "bg-neutral-100 text-neutral-500 dark:bg-white/[0.06] dark:text-neutral-400"
      )}
    >
      {label}
    </span>
  );
}

export function PaymentSettings({
  store,
  onChange,
  onSave,
  saving,
  dirty,
}: PaymentSettingsProps) {
  const gateways = store.settings.paymentGateways;
  const shop = store.settings.shop;

  const [busy, setBusy] = useState<string | null>(null);
  const [paypalSetupOpen, setPaypalSetupOpen] = useState(false);
  const [paypalVerify, setPaypalVerify] = useState<{
    status: "idle" | "ok" | "error";
    message: string | null;
  }>({ status: "idle", message: null });
  const paypalPanelRef = useRef<HTMLDivElement>(null);
  const paypalClientIdRef = useRef<HTMLInputElement>(null);

  const focusPaypalCredentials = useCallback(() => {
    setPaypalSetupOpen(true);
    requestAnimationFrame(() => {
      paypalPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
      paypalClientIdRef.current?.focus();
    });
  }, []);

  const updateGateways = (patch: Partial<typeof gateways>) => {
    onChange({
      settings: {
        ...store.settings,
        paymentGateways: { ...gateways, ...patch },
      },
    });
  };

  const patchShop = (patch: Partial<typeof shop>) => {
    onChange({
      settings: {
        ...store.settings,
        shop: { ...shop, ...patch },
      },
    });
  };

  const hasOtherMethod = (excluding: "cod" | "paypal") => {
    if (excluding !== "cod" && gateways.cashOnDelivery) return true;
    if (excluding !== "paypal" && gateways.paypal) return true;
    return false;
  };

  const paypalReady = isPaypalConnected(gateways);
  const paypalCurrencyOk = isPaypalCurrencySupported(store.currency);

  const verifyAndConnectPaypal = async () => {
    const clientId = gateways.paypalClientId?.trim() ?? "";
    const secretDraft = gateways.paypalClientSecret?.trim() ?? "";
    if (!clientId) {
      toast.error("Paste your PayPal Client ID");
      focusPaypalCredentials();
      return;
    }
    if (!secretDraft && !paypalReady) {
      toast.error("Paste your PayPal Secret Key 1");
      focusPaypalCredentials();
      return;
    }
    if (!paypalCurrencyOk) {
      toast.error(paypalCurrencyHint(store.currency));
      return;
    }

    setBusy("paypal-verify");
    setPaypalVerify({ status: "idle", message: null });
    try {
      const res = await fetch("/api/payments/paypal/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          clientSecret: secretDraft || null,
          mode: gateways.paypalMode === "live" ? "live" : "sandbox",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setPaypalVerify({
          status: "error",
          message:
            typeof data.message === "string"
              ? data.message
              : "Could not connect — check Client ID, Secret, and Mode",
        });
        toast.error("PayPal connection failed");
        return;
      }

      updateGateways({ paypal: true });
      setPaypalSetupOpen(false);
      setPaypalVerify({
        status: "ok",
        message:
          typeof data.message === "string"
            ? data.message
            : "Connected successfully",
      });
      toast.success("PayPal connected");
      await onSave({ paypal: true });
    } catch {
      setPaypalVerify({
        status: "error",
        message: "Network error — try again",
      });
      toast.error("PayPal connection failed");
    } finally {
      setBusy(null);
    }
  };

  const checklist = useMemo(
    () => [
      {
        id: "method",
        label: "Method on",
        done: gateways.cashOnDelivery || gateways.paypal,
      },
      {
        id: "cod",
        label: "COD",
        done: gateways.cashOnDelivery,
      },
      {
        id: "online",
        label: "Online",
        done: gateways.paypal && paypalReady,
      },
    ],
    [gateways, paypalReady]
  );
  const doneCount = checklist.filter((c) => c.done).length;
  const enabledCount = [
    gateways.cashOnDelivery,
    gateways.paypal,
  ].filter(Boolean).length;

  return (
    <SettingsPanel
      title="Payments"
      description="Connect PayPal so customers pay you online — COD stays available. Stripe cards come in about 2 months."
      onSave={onSave}
      saving={saving}
      dirty={dirty}
      saveLabel="Save payments"
    >
      <div className="overflow-hidden rounded-[10px] border border-black/[0.06] bg-[#FAFAFA]/80 dark:border-white/10 dark:bg-white/[0.025]">
        <div className="flex items-center justify-between border-b border-black/[0.05] px-3.5 py-2 dark:border-white/10">
          <p className="text-[11px] font-medium text-neutral-400">
            Checkout preview
          </p>
          <p className="text-[10px] text-neutral-400">
            {doneCount}/{checklist.length} ready
          </p>
        </div>

        <div className="grid gap-3 px-3.5 py-3.5 sm:grid-cols-2">
          <div className="flex items-start gap-2.5 rounded-[10px] border border-black/[0.05] bg-white p-3 dark:border-white/10 dark:bg-[#1C1C1E]">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#007AFF]/10 text-[#007AFF]">
              <Wallet className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-neutral-400">
                Enabled methods
              </p>
              <p className="mt-0.5 font-sans text-[15px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                {enabledCount} of 2
              </p>
              <p className="mt-0.5 truncate text-[11px] text-neutral-500">
                COD · PayPal
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-[10px] border border-black/[0.05] bg-white p-3 dark:border-white/10 dark:bg-[#1C1C1E]">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#007AFF]/10 text-[#007AFF]">
              <CreditCard className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-neutral-400">Cards</p>
              <p className="mt-0.5 font-sans text-[15px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                {paypalReady && gateways.paypal ? "PayPal live" : "COD / PayPal"}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-neutral-500">
                {gateways.cashOnDelivery ? "COD on" : "COD off"}
                {gateways.paypal && isPaypalConnected(gateways)
                  ? " · PayPal live"
                  : " · PayPal off"}
                {" · Stripe in ~2 mo"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 border-t border-black/[0.05] px-3.5 py-2 dark:border-white/10">
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

      <div className="space-y-3">
        {/* COD */}
        <div
          className={cn(
            "rounded-[10px] border p-3.5 transition",
            gateways.cashOnDelivery
              ? "border-[#007AFF]/25 bg-[#007AFF]/[0.04] dark:border-[#007AFF]/30 dark:bg-[#007AFF]/10"
              : "border-black/[0.06] bg-white dark:border-white/10 dark:bg-white/[0.03]"
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#007AFF]/10 text-[#007AFF]">
                <Banknote className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="text-[13px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                    Cash on delivery
                  </p>
                  <StatusPill label="Recommended" tone="ok" />
                </div>
                <p className="mt-0.5 text-[11px] text-neutral-500">
                  Pay the courier when the order arrives
                </p>
              </div>
            </div>
            <Switch
              checked={gateways.cashOnDelivery}
              onCheckedChange={(checked) => {
                if (!checked && !hasOtherMethod("cod")) {
                  toast.error("Keep at least one payment method enabled");
                  return;
                }
                updateGateways({ cashOnDelivery: checked });
              }}
            />
          </div>

          {gateways.cashOnDelivery ? (
            <div className="mt-3 space-y-2.5 border-t border-black/[0.05] pt-3 dark:border-white/10">
              <SettingsField label="Checkout title" htmlFor="cod-title">
                <Input
                  id="cod-title"
                  value={shop.codTitle}
                  onChange={(e) => patchShop({ codTitle: e.target.value })}
                  placeholder="Cash on delivery"
                  className="h-9 rounded-md border-black/[0.06] text-[13px] shadow-none dark:border-white/10"
                  maxLength={60}
                />
              </SettingsField>
              <SettingsField
                label={`COD fee (${store.currency})`}
                htmlFor="cod-fee"
                hint="Extra amount when buyer picks COD. 0 = none."
              >
                <Input
                  id="cod-fee"
                  type="number"
                  min={0}
                  step="0.01"
                  value={shop.codFee}
                  onChange={(e) =>
                    patchShop({
                      codFee: Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                  className="h-9 max-w-xs rounded-md border-black/[0.06] text-[13px] shadow-none dark:border-white/10"
                />
              </SettingsField>
              <SettingsField label="Message at checkout" htmlFor="cod-message">
                <Textarea
                  id="cod-message"
                  value={shop.codMessage}
                  onChange={(e) => patchShop({ codMessage: e.target.value })}
                  placeholder="Pay the courier when your package arrives. No card needed."
                  className="min-h-[72px] rounded-md border-black/[0.06] text-[13px] shadow-none dark:border-white/10"
                  maxLength={280}
                />
              </SettingsField>
            </div>
          ) : null}
        </div>

        {/* PayPal */}
        <div
          ref={paypalPanelRef}
          className={cn(
            "rounded-[10px] border p-3.5 transition",
            gateways.paypal && paypalReady
              ? "border-[#0070BA]/25 bg-[#0070BA]/[0.04] dark:border-[#0070BA]/30"
              : paypalSetupOpen
                ? "border-[#0070BA]/40 bg-[#0070BA]/[0.03] ring-1 ring-[#0070BA]/15 dark:border-[#0070BA]/35"
                : "border-black/[0.06] bg-white dark:border-white/10 dark:bg-white/[0.03]"
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#0070BA]/10 text-[#0070BA]">
                <Wallet className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="text-[13px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                    PayPal
                  </p>
                  <StatusPill
                    label={
                      gateways.paypal && paypalReady
                        ? paypalVerify.status === "ok"
                          ? "Verified"
                          : "Connected"
                        : paypalReady
                          ? "Ready"
                          : "Not connected"
                    }
                    tone={
                      gateways.paypal && paypalReady
                        ? "ok"
                        : paypalReady
                          ? "warn"
                          : "muted"
                    }
                  />
                </div>
                <p className="mt-0.5 text-[11px] text-neutral-500">
                  Money goes to your PayPal account via Checkout
                </p>
              </div>
            </div>
            <Switch
              checked={gateways.paypal || paypalSetupOpen}
              onCheckedChange={(checked) => {
                if (checked) {
                  if (paypalReady) {
                    updateGateways({ paypal: true });
                    return;
                  }
                  focusPaypalCredentials();
                  toast.message("Add your PayPal credentials below", {
                    description:
                      "Paste Client ID and Secret Key 1, then click Verify & connect.",
                  });
                  return;
                }
                if (gateways.paypal && !hasOtherMethod("paypal")) {
                  toast.error("Keep at least one payment method enabled");
                  return;
                }
                setPaypalSetupOpen(false);
                setPaypalVerify({ status: "idle", message: null });
                updateGateways({ paypal: false });
              }}
            />
          </div>

          {paypalReady && gateways.paypal && !paypalSetupOpen ? (
            <div className="mt-3 space-y-2.5 border-t border-black/[0.05] pt-3 dark:border-white/10">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] text-neutral-500">
                  PayPal is on at checkout.
                </p>
                <button
                  type="button"
                  className="text-[11px] font-medium text-[#0070BA] hover:underline"
                  onClick={() => focusPaypalCredentials()}
                >
                  Edit / verify credentials
                </button>
              </div>
              <SettingsField label="Checkout title" htmlFor="paypal-title">
                <Input
                  id="paypal-title"
                  value={shop.paypalTitle}
                  onChange={(e) => patchShop({ paypalTitle: e.target.value })}
                  placeholder="PayPal"
                  className="h-9 rounded-md border-black/[0.06] text-[13px] shadow-none dark:border-white/10"
                  maxLength={60}
                />
              </SettingsField>
              <SettingsField label="Message at checkout" htmlFor="paypal-message">
                <Textarea
                  id="paypal-message"
                  value={shop.paypalMessage}
                  onChange={(e) => patchShop({ paypalMessage: e.target.value })}
                  placeholder="Pay securely with PayPal — money goes to the store."
                  className="min-h-[72px] rounded-md border-black/[0.06] text-[13px] shadow-none dark:border-white/10"
                  maxLength={280}
                />
              </SettingsField>
            </div>
          ) : null}

          {paypalSetupOpen ? (
            <div className="mt-3 space-y-2.5 border-t border-black/[0.05] pt-3 dark:border-white/10">
              <div className="rounded-md border border-[#0070BA]/20 bg-[#0070BA]/[0.06] px-2.5 py-2 dark:border-[#0070BA]/25 dark:bg-[#0070BA]/10">
                <p className="text-[12px] font-medium text-[#004E82] dark:text-[#7BC4F0]">
                  Connect your PayPal app — money goes to your PayPal
                </p>
                <p className="mt-0.5 text-[11px] text-neutral-600 dark:text-neutral-400">
                  From{" "}
                  <a
                    href="https://developer.paypal.com/dashboard/applications"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[#0070BA] hover:underline"
                  >
                    developer.paypal.com
                  </a>{" "}
                  → your app → copy Client ID and Secret Key 1. Mode must match
                  (Sandbox vs Live). {paypalCurrencyHint(store.currency)}
                  {!paypalCurrencyOk ? (
                    <>
                      {" "}
                      Open{" "}
                      <SettingsRelatedLink tab="currency">
                        Languages
                      </SettingsRelatedLink>{" "}
                      to switch to USD or EUR.
                    </>
                  ) : null}
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <SettingsField label="Mode">
                  <select
                    value={gateways.paypalMode ?? "sandbox"}
                    onChange={(e) => {
                      setPaypalVerify({ status: "idle", message: null });
                      updateGateways({
                        paypalMode:
                          e.target.value === "live" ? "live" : "sandbox",
                      });
                    }}
                    className="h-9 w-full rounded-md border border-black/[0.06] bg-white px-2 text-[13px] dark:border-white/10 dark:bg-transparent"
                  >
                    <option value="sandbox">Sandbox (test)</option>
                    <option value="live">Live</option>
                  </select>
                </SettingsField>
                <SettingsField label="PayPal email (optional)">
                  <Input
                    value={gateways.paypalEmail ?? ""}
                    onChange={(e) =>
                      updateGateways({ paypalEmail: e.target.value || null })
                    }
                    placeholder="you@business.com"
                    className="h-9 rounded-md border-black/[0.06] text-[13px] shadow-none dark:border-white/10"
                  />
                </SettingsField>
              </div>

              <SettingsField label="Client ID">
                <Input
                  ref={paypalClientIdRef}
                  value={gateways.paypalClientId ?? ""}
                  onChange={(e) => {
                    setPaypalVerify({ status: "idle", message: null });
                    updateGateways({ paypalClientId: e.target.value || null });
                  }}
                  placeholder="Paste Client ID from your PayPal app"
                  className="h-9 rounded-md border-black/[0.06] font-mono text-[12px] shadow-none dark:border-white/10"
                  autoComplete="off"
                />
              </SettingsField>

              <SettingsField label="Secret Key 1">
                <Input
                  type="password"
                  value={gateways.paypalClientSecret ?? ""}
                  onChange={(e) => {
                    setPaypalVerify({ status: "idle", message: null });
                    updateGateways({
                      paypalClientSecret: e.target.value || null,
                    });
                  }}
                  placeholder={
                    paypalReady
                      ? "Leave blank to keep saved secret"
                      : "Paste Secret Key 1 here"
                  }
                  className="h-9 rounded-md border-black/[0.06] font-mono text-[12px] shadow-none dark:border-white/10"
                  autoComplete="new-password"
                />
              </SettingsField>

              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <Button
                  type="button"
                  size="sm"
                  className="h-9 rounded-md bg-[#0070BA] px-3 text-[13px] text-white hover:bg-[#005EA6]"
                  disabled={busy === "paypal-verify" || saving || !paypalCurrencyOk}
                  onClick={() => void verifyAndConnectPaypal()}
                >
                  {busy === "paypal-verify" ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Checking with PayPal…
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5" />
                      Verify &amp; connect
                    </span>
                  )}
                </Button>
                {paypalReady && gateways.paypal ? (
                  <button
                    type="button"
                    className="text-[11px] font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                    onClick={() =>
                      setPaypalSetupOpen((open) => !open)
                    }
                  >
                    {paypalSetupOpen ? "Hide credentials" : "Edit credentials"}
                  </button>
                ) : null}
              </div>

              {paypalVerify.status === "ok" ? (
                <p className="rounded-md border border-emerald-200/80 bg-emerald-50 px-2.5 py-2 text-[11px] text-emerald-800 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-200">
                  {paypalVerify.message ??
                    "Connected — PayPal works. Shoppers can pay at checkout."}
                </p>
              ) : paypalVerify.status === "error" ? (
                <p className="rounded-md border border-red-200/80 bg-red-50 px-2.5 py-2 text-[11px] text-red-800 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-200">
                  {paypalVerify.message ??
                    "Connection failed. Check Client ID, Secret Key 1, and Mode."}
                </p>
              ) : gateways.paypal && paypalReady ? (
                <p className="rounded-md border border-emerald-200/80 bg-emerald-50 px-2.5 py-2 text-[11px] text-emerald-800 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-200">
                  PayPal is on at checkout. Click Verify &amp; connect anytime to
                  re-check credentials.
                </p>
              ) : (
                <p className="rounded-md border border-black/[0.05] bg-[#FAFAFA] px-2.5 py-2 text-[11px] text-neutral-500 dark:border-white/10 dark:bg-white/[0.03]">
                  Paste Client ID + Secret, then Verify &amp; connect — we check
                  with PayPal before turning it on.
                </p>
              )}
            </div>
          ) : null}
        </div>

        {/* Stripe — visible but locked (~2 months) */}
        <div className="flex items-center justify-between gap-3 rounded-[10px] border border-dashed border-[#635BFF]/25 bg-[#635BFF]/[0.03] p-3.5 dark:border-[#635BFF]/30 dark:bg-[#635BFF]/[0.06]">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#635BFF]/10 text-[#635BFF]">
              <CreditCard className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="text-[13px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                  Stripe
                </p>
                <StatusPill label="In ~2 months" tone="soon" />
              </div>
              <p className="mt-0.5 text-[11px] text-neutral-500">
                Cards · Apple Pay · Google Pay — turns on around{" "}
                {STRIPE_AVAILABLE_AROUND}. {STRIPE_COMING_SOON_SHORT} Use COD or
                PayPal until then.
              </p>
            </div>
          </div>
          <Switch
            checked={false}
            disabled
            onCheckedChange={() => {
              toast.message("Stripe is not available yet", {
                description: `Card payments turn on in about 2 months (around ${STRIPE_AVAILABLE_AROUND}).`,
              });
            }}
          />
        </div>

        {/* Ettajer Pay — coming soon */}
        <div className="flex items-center justify-between gap-3 rounded-[10px] border border-dashed border-black/[0.08] bg-[#FAFAFA]/80 p-3.5 opacity-90 dark:border-white/15 dark:bg-white/[0.02]">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-neutral-200/70 text-neutral-500 dark:bg-white/10">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="text-[13px] font-semibold tracking-[-0.02em] text-neutral-800 dark:text-neutral-200">
                  Ettajer Pay
                </p>
                <StatusPill label="Coming soon" tone="soon" />
              </div>
              <p className="mt-0.5 text-[11px] text-neutral-500">
                Built-in wallet for Ettajer merchants — balance, payouts, and
                store checkout in one place
              </p>
            </div>
          </div>
        </div>
      </div>

      {!gateways.cashOnDelivery && !gateways.paypal ? (
        <p className="rounded-[10px] border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[12px] text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200">
          Enable at least one payment method so customers can checkout.
        </p>
      ) : null}

      <SettingsRelatedCard className="rounded-[10px] px-3.5 py-3 text-[12px]">
        Customize the COD message and minimum order in{" "}
        <SettingsRelatedLink tab="checkout">Checkout</SettingsRelatedLink>.
        Shipping rates live under{" "}
        <SettingsRelatedLink tab="shipping">Shipping</SettingsRelatedLink>.
      </SettingsRelatedCard>
    </SettingsPanel>
  );
}
