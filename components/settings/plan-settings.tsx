"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  CreditCard,
  ExternalLink,
  Globe2,
  HelpCircle,
  Package,
  Receipt,
  Sparkles,
  Store,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { SettingsSection } from "@/components/settings/settings-section";
import {
  SettingsRelatedCard,
  SettingsRelatedLink,
} from "@/components/settings/settings-related-link";
import type { AccountProfile } from "@/lib/account-profile";
import {
  formatPrice,
  getAnnualSavings,
  getBilledAnnuallyTotal,
  PRICING_INCLUDES,
  type PricingCurrency,
  type PricingPlan,
} from "@/lib/landing/pricing";
import {
  formatPlanLimit,
  getMerchantPlanStatus,
  getNextPlanKind,
  getPaidPricingPlans,
  getPlanLimits,
  getUsagePercent,
  PLAN_COMPARE_ROWS,
  resolvePricingCurrency,
  type PlanUsage,
} from "@/lib/merchant-plan";
import { formatFounderNumber } from "@/lib/founder/constants";
import {
  dashboardPill,
  dashboardPillActive,
  dashboardPillGroup,
  dashboardPillInactive,
  dashboardPrimaryBtn,
  dashboardSegmentNav,
  dashboardSegmentTab,
  dashboardSegmentTabActive,
  dashboardSegmentTabInactive,
} from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";

export type PlanSettingsUsage = PlanUsage;

interface PlanSettingsProps {
  profile: AccountProfile;
  storeCurrency?: string | null;
  usage?: PlanSettingsUsage;
}

type BillingPeriod = "monthly" | "annually";
type PlanSubTab = "overview" | "plans" | "billing";

const SUB_TABS: { id: PlanSubTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "plans", label: "Plans" },
  { id: "billing", label: "Billing" },
];

export function PlanSettings({
  profile,
  storeCurrency,
  usage = { products: 0, domains: 0, stores: 1 },
}: PlanSettingsProps) {
  const status = useMemo(
    () =>
      getMerchantPlanStatus({
        founderNumber: profile.founderNumber,
        plan: profile.plan,
      }),
    [profile.founderNumber, profile.plan]
  );
  const limits = getPlanLimits(status.kind);
  const nextPlan = getNextPlanKind(status.kind);
  const plans = getPaidPricingPlans();

  const [subTab, setSubTab] = useState<PlanSubTab>("overview");
  const [period, setPeriod] = useState<BillingPeriod>("monthly");
  const [currency, setCurrency] = useState<PricingCurrency>(() =>
    resolvePricingCurrency(storeCurrency)
  );
  const [selectedId, setSelectedId] = useState(() => {
    if (plans.some((p) => p.id === status.kind)) return status.kind;
    return nextPlan ?? plans.find((p) => p.popular)?.id ?? "growth";
  });

  const selected = plans.find((p) => p.id === selectedId) ?? plans[0];
  const isFounder = status.kind === "founder";
  const isPaid =
    status.kind === "starter" ||
    status.kind === "growth" ||
    status.kind === "business";
  const currentPricing = plans.find((p) => p.id === status.kind);
  const currentPriceUsd = currentPricing
    ? period === "annually"
      ? currentPricing.annualPriceUsd
      : currentPricing.monthlyPriceUsd
    : null;

  const usageRows = [
    {
      id: "products",
      label: "Products",
      icon: Package,
      used: usage.products,
      limit: limits.products,
    },
    {
      id: "domains",
      label: "Custom domains",
      icon: Globe2,
      used: usage.domains,
      limit: limits.domains,
    },
    {
      id: "stores",
      label: "Stores",
      icon: Store,
      used: usage.stores,
      limit: limits.stores,
    },
  ] as const;

  return (
    <SettingsPanel
      title="Plan"
      description="Subscription, usage, upgrades, and invoices."
      action={
        <div className="flex items-center gap-2">
          <div className={cn(dashboardPillGroup, "hidden sm:inline-flex")} role="group" aria-label="Currency">
            {(["MAD", "USD"] as const).map((c) => (
              <button
                key={c}
                type="button"
                className={cn(
                  dashboardPill,
                  currency === c ? dashboardPillActive : dashboardPillInactive
                )}
                onClick={() => setCurrency(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <Button asChild variant="outline" size="sm" className="h-8 text-[12px]">
            <Link href="/help/pricing-plans-and-trial" target="_blank">
              <HelpCircle className="mr-1.5 h-3.5 w-3.5" />
              Help
            </Link>
          </Button>
        </div>
      }
    >
      <div className={dashboardSegmentNav} role="tablist" aria-label="Plan sections">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={subTab === tab.id}
            className={cn(
              dashboardSegmentTab,
              subTab === tab.id
                ? dashboardSegmentTabActive
                : dashboardSegmentTabInactive
            )}
            onClick={() => setSubTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={cn(dashboardPillGroup, "sm:hidden")} role="group" aria-label="Currency">
        {(["MAD", "USD"] as const).map((c) => (
          <button
            key={c}
            type="button"
            className={cn(
              dashboardPill,
              currency === c ? dashboardPillActive : dashboardPillInactive
            )}
            onClick={() => setCurrency(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {subTab === "overview" ? (
        <>
          <SettingsSection
            title="Current plan"
            description={
              isFounder
                ? "Founder seats stay free while paid billing ships."
                : isPaid
                  ? "Active subscription on your Ettajer account."
                  : "Self-serve checkout is coming — upgrade anytime."
            }
          >
            <div
              className={cn(
                "overflow-hidden rounded-[10px] border bg-white dark:bg-transparent",
                isFounder
                  ? "border-amber-200/80 dark:border-amber-500/25"
                  : isPaid
                    ? "border-emerald-200/80 dark:border-emerald-500/25"
                    : "border-black/[0.06] dark:border-white/10"
              )}
            >
              <div
                className={cn(
                  "flex flex-col gap-4 px-3.5 py-4 sm:flex-row sm:items-start sm:justify-between",
                  isFounder
                    ? "bg-gradient-to-br from-amber-50/90 via-white to-white dark:from-amber-500/10 dark:via-transparent dark:to-transparent"
                    : isPaid
                      ? "bg-gradient-to-br from-emerald-50/80 via-white to-white dark:from-emerald-500/10 dark:via-transparent dark:to-transparent"
                      : "bg-[#FAFAFA]/60 dark:bg-white/[0.02]"
                )}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-md",
                      isFounder
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                        : isPaid
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                          : "bg-[#007AFF]/10 text-[#007AFF]"
                    )}
                  >
                    {isFounder ? (
                      <Sparkles className="h-4 w-4" />
                    ) : (
                      <Zap className="h-4 w-4" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[15px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                        {status.label}
                      </p>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-medium",
                          isFounder
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200"
                            : isPaid
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200"
                              : "bg-[#007AFF]/10 text-[#007AFF]"
                        )}
                      >
                        {status.badge}
                      </span>
                      {status.founderNumber ? (
                        <span className="text-[11px] text-neutral-400">
                          {formatFounderNumber(status.founderNumber)}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 max-w-xl text-[12px] leading-relaxed text-neutral-500">
                      {status.summary}
                    </p>
                    <p className="mt-2 text-[11px] text-neutral-400">
                      Billed to{" "}
                      <span className="font-medium text-neutral-600 dark:text-neutral-300">
                        {profile.email}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="shrink-0 space-y-2 sm:text-right">
                  {currentPriceUsd !== null ? (
                    <div>
                      <p className="text-[18px] font-semibold tracking-[-0.03em] text-neutral-900 dark:text-white">
                        {formatPrice(currentPriceUsd, currency, { perMonth: true })}
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        {period === "annually" ? "Annual billing · ~20% off" : "Monthly billing"}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[18px] font-semibold tracking-[-0.03em] text-neutral-900 dark:text-white">
                        {currency === "MAD" ? "0 MAD" : "$0"}
                      </p>
                      <p className="text-[10px] text-neutral-400">No subscription charge</p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    {isFounder ? (
                      <Button asChild size="sm" className={cn(dashboardPrimaryBtn, "h-8")}>
                        <Link href="/founder-card">
                          Founder card
                          <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      size="sm"
                      className={cn(dashboardPrimaryBtn, "h-8")}
                      onClick={() => setSubTab("plans")}
                    >
                      {isPaid ? "Change plan" : "Compare plans"}
                      <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                    <Button asChild variant="outline" size="sm" className="h-8 text-[12px]">
                      <Link href="/contact?topic=billing">Talk to sales</Link>
                    </Button>
                  </div>
                </div>
              </div>

              <ul className="grid gap-2 border-t border-black/[0.05] px-3.5 py-3 sm:grid-cols-2 dark:border-white/10">
                {status.perks.map((perk) => (
                  <li
                    key={perk}
                    className="flex items-start gap-2 text-[12px] text-neutral-600 dark:text-neutral-300"
                  >
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#007AFF]" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </SettingsSection>

          <SettingsSection
            title="Usage"
            description="Limits for your current plan. Upgrade when you need more room."
            action={
              nextPlan ? (
                <button
                  type="button"
                  className="text-[11px] font-medium text-[#007AFF] underline-offset-2 hover:underline"
                  onClick={() => {
                    setSelectedId(nextPlan);
                    setSubTab("plans");
                  }}
                >
                  Need more? → {nextPlan[0]!.toUpperCase() + nextPlan.slice(1)}
                </button>
              ) : null
            }
          >
            <div className="grid gap-2 sm:grid-cols-3">
              {usageRows.map((row) => {
                const pct = getUsagePercent(row.used, row.limit);
                const Icon = row.icon;
                const nearLimit = pct !== null && pct >= 80;
                return (
                  <div
                    key={row.id}
                    className="rounded-[10px] border border-black/[0.06] bg-white px-3 py-3 dark:border-white/10 dark:bg-transparent"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-500">
                        <Icon className="h-3.5 w-3.5" />
                        {row.label}
                      </div>
                      <span
                        className={cn(
                          "text-[11px] font-semibold tabular-nums",
                          nearLimit
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-neutral-900 dark:text-white"
                        )}
                      >
                        {row.used}
                        <span className="font-normal text-neutral-400">
                          {" "}
                          / {formatPlanLimit(row.limit)}
                        </span>
                      </span>
                    </div>
                    <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/10">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          nearLimit ? "bg-amber-500" : "bg-[#007AFF]"
                        )}
                        style={{
                          width:
                            pct === null
                              ? row.used > 0
                                ? "12%"
                                : "0%"
                              : `${pct}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1.5 text-[10px] text-neutral-400">
                      {row.limit === null
                        ? "Unlimited on this plan"
                        : pct === null
                          ? "—"
                          : `${pct}% used`}
                      {limits.platformFeePercent !== null && row.id === "products"
                        ? ` · ${limits.platformFeePercent}% Ettajer fee`
                        : ""}
                    </p>
                  </div>
                );
              })}
            </div>
          </SettingsSection>

          {nextPlan ? (
            <div className="flex flex-col gap-3 rounded-[10px] border border-[#007AFF]/20 bg-[#007AFF]/5 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between dark:bg-[#007AFF]/10">
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-neutral-900 dark:text-white">
                  Unlock more with {nextPlan[0]!.toUpperCase() + nextPlan.slice(1)}
                </p>
                <p className="mt-0.5 text-[11px] text-neutral-500">
                  {nextPlan === "growth"
                    ? "0% Ettajer fees, WhatsApp verification, and unlimited products."
                    : "Unlimited stores & domains, courier tools, and a dedicated account manager."}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                className={cn(dashboardPrimaryBtn, "h-8 shrink-0")}
                onClick={() => {
                  setSelectedId(nextPlan);
                  setSubTab("plans");
                }}
              >
                View {nextPlan[0]!.toUpperCase() + nextPlan.slice(1)}
              </Button>
            </div>
          ) : null}
        </>
      ) : null}

      {subTab === "plans" ? (
        <div id="plans" className="scroll-mt-4 space-y-4">
          <SettingsSection
            title="Choose a plan"
            description="Same pricing as the public site. Annual saves about 20%."
            action={
              <div className={dashboardPillGroup} role="group" aria-label="Billing period">
                <button
                  type="button"
                  className={cn(
                    dashboardPill,
                    period === "monthly" ? dashboardPillActive : dashboardPillInactive
                  )}
                  onClick={() => setPeriod("monthly")}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  className={cn(
                    dashboardPill,
                    period === "annually" ? dashboardPillActive : dashboardPillInactive
                  )}
                  onClick={() => setPeriod("annually")}
                >
                  Annually
                </button>
              </div>
            }
          >
            <div className="grid gap-2.5 lg:grid-cols-3">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  period={period}
                  currency={currency}
                  selected={selectedId === plan.id}
                  isCurrent={status.kind === plan.id}
                  onSelect={() => setSelectedId(plan.id)}
                />
              ))}
            </div>

            {selected ? (
              <div className="flex flex-col gap-3 rounded-[10px] border border-black/[0.06] bg-white px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-transparent">
                <div className="min-w-0">
                  <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
                    {status.kind === selected.id
                      ? `${selected.name} is your current plan`
                      : `Switch to ${selected.name}`}
                  </p>
                  <p className="mt-0.5 text-[11px] text-neutral-400">
                    {status.kind === selected.id
                      ? "You're all set. Pick another plan above when you want to change."
                      : "Self-serve billing is almost ready. Request this plan and we'll activate it manually."}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {status.kind === selected.id ? (
                    <Button type="button" size="sm" disabled className="h-8 text-[12px]">
                      Current plan
                    </Button>
                  ) : (
                    <Button asChild size="sm" className={cn(dashboardPrimaryBtn, "h-8")}>
                      <Link
                        href={`/contact?topic=billing&plan=${encodeURIComponent(selected.id)}&period=${period}`}
                      >
                        Request {selected.name}
                      </Link>
                    </Button>
                  )}
                  <Button asChild variant="outline" size="sm" className="h-8 text-[12px]">
                    <Link href="/#pricing" target="_blank">
                      Public pricing
                      <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            ) : null}

            <p className="px-0.5 text-[11px] leading-relaxed text-neutral-400">
              Every plan includes: {PRICING_INCLUDES.join(" · ")}
            </p>
          </SettingsSection>

          <SettingsSection
            title="Compare features"
            description="What changes between Free, Starter, Growth, and Business."
          >
            <div className="overflow-x-auto rounded-[10px] border border-black/[0.06] bg-white dark:border-white/10 dark:bg-transparent">
              <table className="w-full min-w-[560px] border-collapse text-left text-[11px]">
                <thead>
                  <tr className="border-b border-black/[0.06] bg-[#FAFAFA]/80 dark:border-white/10 dark:bg-white/[0.03]">
                    <th className="px-3 py-2.5 font-medium text-neutral-500">Feature</th>
                    {(["free", "starter", "growth", "business"] as const).map((col) => (
                      <th
                        key={col}
                        className={cn(
                          "px-3 py-2.5 font-semibold capitalize text-neutral-900 dark:text-white",
                          status.kind === col && "text-[#007AFF]"
                        )}
                      >
                        {col}
                        {status.kind === col ? (
                          <span className="ml-1 text-[9px] font-medium uppercase tracking-[0.04em] text-emerald-600">
                            you
                          </span>
                        ) : null}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PLAN_COMPARE_ROWS.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-black/[0.04] last:border-0 dark:border-white/5"
                    >
                      <td className="px-3 py-2.5 text-neutral-600 dark:text-neutral-300">
                        {row.label}
                      </td>
                      <td className="px-3 py-2.5 text-neutral-500">{row.free}</td>
                      <td
                        className={cn(
                          "px-3 py-2.5",
                          status.kind === "starter"
                            ? "font-medium text-neutral-900 dark:text-white"
                            : "text-neutral-500"
                        )}
                      >
                        {row.starter}
                      </td>
                      <td
                        className={cn(
                          "px-3 py-2.5",
                          status.kind === "growth"
                            ? "font-medium text-neutral-900 dark:text-white"
                            : "text-neutral-500"
                        )}
                      >
                        {row.growth}
                      </td>
                      <td
                        className={cn(
                          "px-3 py-2.5",
                          status.kind === "business"
                            ? "font-medium text-neutral-900 dark:text-white"
                            : "text-neutral-500"
                        )}
                      >
                        {row.business}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SettingsSection>
        </div>
      ) : null}

      {subTab === "billing" ? (
        <>
          <SettingsSection
            title="Payment method"
            description="How Ettajer will charge your subscription when self-serve billing ships."
          >
            <div className="flex flex-col gap-3 rounded-[10px] border border-dashed border-black/[0.08] bg-[#FAFAFA]/80 px-3.5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/15 dark:bg-white/[0.02]">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-500 dark:bg-white/10 dark:text-neutral-300">
                  <CreditCard className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[13px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                    No card on file
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-neutral-500">
                    Cards and local payment methods will appear here. Until then, upgrades are
                    handled by our team.
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="h-8 shrink-0 text-[12px]">
                <Link href="/contact?topic=billing">Add via sales</Link>
              </Button>
            </div>
          </SettingsSection>

          <SettingsSection
            title="Invoices"
            description="Downloadable receipts for paid cycles."
          >
            <div className="overflow-hidden rounded-[10px] border border-dashed border-black/[0.08] bg-[#FAFAFA]/80 dark:border-white/15 dark:bg-white/[0.02]">
              <div className="flex items-start gap-3 px-3.5 py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-500 dark:bg-white/10 dark:text-neutral-300">
                  <Receipt className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                    No invoices yet
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-neutral-500">
                    {isPaid
                      ? `${status.label} is active. Invoices will show here once automatic billing goes live.`
                      : "When you upgrade to a paid plan, monthly or annual invoices will show here with download links."}
                  </p>
                </div>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection title="Billing email" description="Where we send receipts and plan notices.">
            <div className="flex items-center justify-between gap-3 rounded-[10px] border border-black/[0.06] bg-white px-3.5 py-3 dark:border-white/10 dark:bg-transparent">
              <div className="min-w-0">
                <p className="truncate text-[12px] font-medium text-neutral-900 dark:text-white">
                  {profile.email}
                </p>
                <p className="mt-0.5 text-[11px] text-neutral-400">
                  Same as your Ettajer login. Change it from Profile.
                </p>
              </div>
              <SettingsRelatedLink tab="profile">Profile</SettingsRelatedLink>
            </div>
          </SettingsSection>
        </>
      ) : null}

      <SettingsRelatedCard className="rounded-[10px] px-3.5 py-3 text-[12px]">
        Related:{" "}
        <SettingsRelatedLink tab="profile">Profile</SettingsRelatedLink>
        {" · "}
        <SettingsRelatedLink tab="payment">Payments</SettingsRelatedLink>
        {" · "}
        <SettingsRelatedLink tab="website">Domains</SettingsRelatedLink>
        {" · "}
        <Link
          href="/help/transaction-fees-explained"
          className="font-medium text-[#007AFF] underline-offset-2 hover:underline"
        >
          Fees explained
        </Link>
      </SettingsRelatedCard>
    </SettingsPanel>
  );
}

function PlanCard({
  plan,
  period,
  currency,
  selected,
  isCurrent,
  onSelect,
}: {
  plan: PricingPlan;
  period: BillingPeriod;
  currency: PricingCurrency;
  selected: boolean;
  isCurrent?: boolean;
  onSelect: () => void;
}) {
  const priceUsd =
    period === "annually" ? plan.annualPriceUsd : plan.monthlyPriceUsd;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative flex h-full flex-col rounded-[10px] border px-3.5 py-3.5 text-left transition-colors",
        selected
          ? "border-[#007AFF] bg-[#007AFF]/5 ring-1 ring-[#007AFF]/30 dark:bg-[#007AFF]/10"
          : "border-black/[0.06] bg-white hover:border-black/[0.12] dark:border-white/10 dark:bg-transparent dark:hover:border-white/20"
      )}
    >
      {isCurrent ? (
        <span className="absolute -top-2 right-3 rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.04em] text-white">
          Current
        </span>
      ) : plan.popular ? (
        <span className="absolute -top-2 right-3 rounded-full bg-[#007AFF] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.04em] text-white">
          Popular
        </span>
      ) : null}

      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[13px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
            {plan.name}
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-neutral-400">
            {plan.description}
          </p>
        </div>
        <span
          className={cn(
            "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
            selected
              ? "border-[#007AFF] bg-[#007AFF] text-white"
              : "border-neutral-300 dark:border-neutral-600"
          )}
          aria-hidden
        >
          {selected ? <Check className="h-2.5 w-2.5" /> : null}
        </span>
      </div>

      <div className="mt-3">
        {plan.firstMonthFree ? (
          <p className="text-[10px] font-medium uppercase tracking-[0.04em] text-emerald-600 dark:text-emerald-400">
            First month free
          </p>
        ) : null}
        <p className="mt-0.5 text-[18px] font-semibold tracking-[-0.03em] text-neutral-900 dark:text-white">
          {formatPrice(priceUsd, currency, { perMonth: true })}
        </p>
        {period === "annually" ? (
          <p className="mt-0.5 text-[10px] text-neutral-400">
            {getAnnualSavings(plan, currency)} · {getBilledAnnuallyTotal(plan, currency)}
          </p>
        ) : (
          <p className="mt-0.5 text-[10px] text-neutral-400">Billed monthly</p>
        )}
      </div>

      <ul className="mt-3 space-y-1.5 border-t border-black/[0.05] pt-3 dark:border-white/10">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2 text-[11px] text-neutral-600 dark:text-neutral-300"
          >
            <Check className="mt-0.5 h-3 w-3 shrink-0 text-[#007AFF]" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </button>
  );
}