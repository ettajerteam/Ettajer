import type { CheckoutThemeId } from "@/lib/shop-preferences";
import { cn } from "@/lib/utils";

/**
 * Visual tokens for storefront checkout themes.
 * Classic = clear commerce default · Soft = boutique airy · Compact = dense mobile-first
 */
export type CheckoutThemeStyles = {
  id: CheckoutThemeId;
  name: string;
  description: string;
  shell: string;
  sectionGap: string;
  fieldGap: string;
  input: string;
  fieldLabel: string;
  heading: string;
  subheading: string;
  sectionTitle: string;
  infoPanel: string;
  infoPanelPad: string;
  infoIcon: string;
  optionalBadge: string;
  requiredMark: string;
  card: string;
  cardPadding: string;
  banner: string;
  selectable: string;
  selectableActive: string;
  selectableIdle: string;
  btn: string;
  btnHeight: string;
  btnSecondary: string;
  stickyBar: string;
  summaryMobile: string;
  summaryAside: string;
  couponBox: string;
  divider: string;
  progressWrap: string;
  progressDot: string;
  progressDotCurrent: string;
  progressDotDone: string;
  progressDotIdle: string;
  progressLabel: string;
  progressConnector: string;
  imageRadius: string;
};

const THEMES: Record<CheckoutThemeId, CheckoutThemeStyles> = {
  classic: {
    id: "classic",
    name: "Classic",
    description: "Clear steps, crisp fields, pill checkout button — trusted store feel.",
    shell: "",
    sectionGap: "space-y-5",
    fieldGap: "space-y-4",
    input:
      "h-12 rounded-xl border-neutral-200 bg-white text-[15px] shadow-none transition focus-visible:border-[var(--store-primary)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--store-primary)_22%,transparent)]",
    fieldLabel: "text-[13px] font-medium text-neutral-700",
    heading: "text-xl font-semibold tracking-tight text-neutral-900",
    subheading: "mt-1 text-sm text-neutral-500",
    sectionTitle: "mb-0 text-[15px] font-semibold text-neutral-900",
    infoPanel: "rounded-2xl border border-neutral-200/90 bg-white",
    infoPanelPad: "p-4 sm:p-5",
    infoIcon:
      "inline-flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600",
    optionalBadge:
      "rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500",
    requiredMark: "text-[var(--store-primary)]",
    card: "rounded-2xl border border-neutral-200 bg-white",
    cardPadding: "p-4",
    banner: "rounded-xl border px-4 py-3 text-sm",
    selectable: "rounded-2xl border p-4 text-left transition",
    selectableActive:
      "border-[var(--store-primary)] bg-[color-mix(in_srgb,var(--store-primary)_6%,white)] shadow-[0_0_0_1px_color-mix(in_srgb,var(--store-primary)_35%,transparent)]",
    selectableIdle: "border-neutral-200 hover:border-neutral-300",
    btn: "rounded-full font-semibold tracking-[-0.01em] shadow-sm",
    btnHeight: "h-12",
    btnSecondary: "rounded-full border-neutral-200",
    stickyBar:
      "border-t border-neutral-100 bg-white/95 backdrop-blur-md",
    summaryMobile: "border-y border-neutral-100 bg-neutral-50/80",
    summaryAside:
      "rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.18)]",
    couponBox: "rounded-2xl border border-neutral-200 p-4",
    divider: "border-t border-neutral-100",
    progressWrap: "mb-8 sm:mb-10",
    progressDot: "h-8 w-8 rounded-full text-[12px] font-semibold",
    progressDotCurrent:
      "bg-[var(--store-primary)] text-white ring-4 ring-[color-mix(in_srgb,var(--store-primary)_18%,transparent)]",
    progressDotDone: "bg-neutral-900 text-white",
    progressDotIdle: "bg-neutral-100 text-neutral-400",
    progressLabel: "text-[11px] font-medium tracking-wide sm:text-[12px]",
    progressConnector: "h-px bg-neutral-200",
    imageRadius: "rounded-lg",
  },
  soft: {
    id: "soft",
    name: "Soft",
    description: "Airy cards, gentle tint, roomy fields — boutique and calm.",
    shell:
      "rounded-[1.75rem] bg-[color-mix(in_srgb,var(--store-primary)_4.5%,#faf9f7)] p-4 sm:p-6 lg:rounded-none lg:bg-transparent lg:p-0",
    sectionGap: "space-y-6",
    fieldGap: "space-y-5",
    input:
      "h-[3.25rem] rounded-2xl border-transparent bg-white/90 text-[15px] shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-black/[0.04] transition placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--store-primary)_28%,transparent)]",
    fieldLabel: "text-[12px] font-medium tracking-wide text-neutral-500",
    heading: "text-[1.35rem] font-semibold tracking-[-0.03em] text-neutral-900",
    subheading: "mt-1.5 text-[13px] leading-relaxed text-neutral-500",
    sectionTitle:
      "mb-0 text-[13px] font-semibold uppercase tracking-[0.08em] text-neutral-400",
    infoPanel:
      "rounded-3xl border-0 bg-white/85 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] ring-1 ring-black/[0.03]",
    infoPanelPad: "p-5 sm:p-6",
    infoIcon:
      "inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--store-primary)_10%,white)] text-[var(--store-primary)]",
    optionalBadge:
      "rounded-full bg-neutral-100/90 px-2 py-0.5 text-[10px] font-medium text-neutral-500",
    requiredMark: "text-[var(--store-primary)]",
    card:
      "rounded-3xl border-0 bg-white/80 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] ring-1 ring-black/[0.03]",
    cardPadding: "p-5",
    banner:
      "rounded-2xl border-0 bg-white/70 px-4 py-3.5 text-sm shadow-sm ring-1 ring-black/[0.04]",
    selectable:
      "rounded-3xl border-0 p-5 text-left shadow-sm ring-1 ring-black/[0.04] transition",
    selectableActive:
      "bg-white shadow-[0_12px_40px_-16px_color-mix(in_srgb,var(--store-primary)_45%,transparent)] ring-2 ring-[color-mix(in_srgb,var(--store-primary)_40%,transparent)]",
    selectableIdle: "bg-white/60 hover:bg-white hover:ring-black/[0.08]",
    btn:
      "rounded-2xl font-semibold tracking-[-0.02em] shadow-[0_8px_24px_-8px_color-mix(in_srgb,var(--store-primary)_55%,transparent)]",
    btnHeight: "h-[3.25rem]",
    btnSecondary: "rounded-2xl border-transparent bg-white/80 ring-1 ring-black/[0.06]",
    stickyBar:
      "border-t-0 bg-[color-mix(in_srgb,var(--store-primary)_6%,white)]/90 shadow-[0_-8px_30px_-12px_rgba(15,23,42,0.1)] backdrop-blur-xl",
    summaryMobile:
      "rounded-2xl border-0 bg-white/70 shadow-sm ring-1 ring-black/[0.04]",
    summaryAside:
      "rounded-[1.75rem] border-0 bg-white/95 p-7 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.22)] ring-1 ring-black/[0.04]",
    couponBox:
      "rounded-3xl border-0 bg-white/70 p-5 shadow-sm ring-1 ring-black/[0.04]",
    divider: "border-t border-black/[0.04]",
    progressWrap: "mb-8 sm:mb-10",
    progressDot: "h-9 w-9 rounded-2xl text-[12px] font-semibold",
    progressDotCurrent:
      "bg-[var(--store-primary)] text-white shadow-[0_6px_16px_-4px_color-mix(in_srgb,var(--store-primary)_50%,transparent)]",
    progressDotDone: "bg-neutral-800 text-white",
    progressDotIdle: "bg-white text-neutral-400 ring-1 ring-black/[0.06]",
    progressLabel: "text-[11px] font-medium tracking-wide text-neutral-500 sm:text-[12px]",
    progressConnector:
      "h-0.5 rounded-full bg-[color-mix(in_srgb,var(--store-primary)_12%,#e5e5e5)]",
    imageRadius: "rounded-2xl",
  },
  compact: {
    id: "compact",
    name: "Compact",
    description: "Tight spacing, sharp edges, faster tap targets — built for phones.",
    shell: "",
    sectionGap: "space-y-3",
    fieldGap: "space-y-2.5",
    input:
      "h-10 rounded-md border-neutral-300/90 bg-white text-[14px] shadow-none focus-visible:border-[var(--store-primary)] focus-visible:ring-1 focus-visible:ring-[var(--store-primary)]",
    fieldLabel: "text-[11px] font-semibold uppercase tracking-[0.04em] text-neutral-500",
    heading: "text-lg font-semibold tracking-tight text-neutral-900",
    subheading: "mt-0.5 text-[12px] text-neutral-500",
    sectionTitle:
      "mb-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-neutral-500",
    infoPanel: "rounded-lg border border-neutral-200 bg-white",
    infoPanelPad: "p-3",
    infoIcon:
      "inline-flex h-7 w-7 items-center justify-center rounded-md bg-neutral-100 text-neutral-600",
    optionalBadge:
      "rounded bg-neutral-100 px-1 py-px text-[9px] font-semibold uppercase tracking-wide text-neutral-500",
    requiredMark: "text-[var(--store-primary)]",
    card: "rounded-lg border border-neutral-200 bg-white",
    cardPadding: "p-3",
    banner: "rounded-md border px-3 py-2 text-[13px]",
    selectable: "rounded-lg border p-3 text-left transition",
    selectableActive:
      "border-[var(--store-primary)] bg-[color-mix(in_srgb,var(--store-primary)_5%,white)]",
    selectableIdle: "border-neutral-200 hover:border-neutral-300",
    btn: "rounded-lg font-semibold text-[14px]",
    btnHeight: "h-10",
    btnSecondary: "rounded-lg border-neutral-200",
    stickyBar: "border-t border-neutral-200 bg-white py-3",
    summaryMobile: "border-y border-neutral-200 bg-neutral-50",
    summaryAside:
      "rounded-lg border border-neutral-200 bg-white p-4 shadow-sm",
    couponBox: "rounded-lg border border-neutral-200 p-3",
    divider: "border-t border-neutral-200",
    progressWrap: "mb-5 sm:mb-6",
    progressDot: "h-6 w-6 rounded-md text-[10px] font-bold",
    progressDotCurrent: "bg-[var(--store-primary)] text-white",
    progressDotDone: "bg-neutral-800 text-white",
    progressDotIdle: "bg-neutral-100 text-neutral-400",
    progressLabel: "text-[10px] font-semibold uppercase tracking-wider",
    progressConnector: "h-px bg-neutral-200",
    imageRadius: "rounded-md",
  },
};

export function getCheckoutThemeStyles(
  theme: CheckoutThemeId | string | null | undefined
): CheckoutThemeStyles {
  if (theme === "soft" || theme === "compact" || theme === "classic") {
    return THEMES[theme];
  }
  return THEMES.classic;
}

export function checkoutThemeOptions(): Array<{
  id: CheckoutThemeId;
  label: string;
  description: string;
}> {
  return (["classic", "soft", "compact"] as const).map((id) => ({
    id,
    label: THEMES[id].name,
    description: THEMES[id].description,
  }));
}

export function cnSelectable(
  styles: CheckoutThemeStyles,
  active: boolean
): string {
  return cn(
    styles.selectable,
    active ? styles.selectableActive : styles.selectableIdle
  );
}
