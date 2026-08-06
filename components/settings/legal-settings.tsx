"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  ExternalLink,
  Eye,
  FileText,
  HelpCircle,
  Loader2,
  Scale,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { SettingsSection } from "@/components/settings/settings-section";
import {
  SettingsRelatedCard,
  SettingsRelatedLink,
} from "@/components/settings/settings-related-link";
import type { AccountProfile } from "@/lib/account-profile";
import type { StorePageRow } from "@/lib/pages";
import type { StoreWithSettings } from "@/lib/store-settings";
import {
  getLegalTemplateBody,
  legalReadinessScore,
  resolveLegalPolicyStatuses,
  type LegalPolicySlug,
  type LegalPolicyStatus,
} from "@/lib/legal-settings";
import { getStorePageUrl } from "@/lib/storefront-urls";
import { dashboardPrimaryBtn } from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";

interface LegalSettingsProps {
  store: StoreWithSettings;
  profile?: AccountProfile;
  initialPages: StorePageRow[];
  onChange: (updates: Partial<StoreWithSettings>) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  dirty?: boolean;
}

const POLICY_ICONS: Record<LegalPolicySlug, typeof FileText> = {
  privacy: ShieldCheck,
  terms: Scale,
  shipping: Truck,
};

export function LegalSettings({
  store,
  initialPages,
  onChange,
  onSave,
  saving,
  dirty = false,
}: LegalSettingsProps) {
  const [pages, setPages] = useState(initialPages);
  const [busySlug, setBusySlug] = useState<LegalPolicySlug | null>(null);

  const shop = store.settings.shop;
  const policies = useMemo(() => resolveLegalPolicyStatuses(pages), [pages]);
  const readiness = useMemo(
    () =>
      legalReadinessScore({
        policies,
        requireTerms: shop.requireTerms,
      }),
    [policies, shop.requireTerms]
  );

  const patchRequireTerms = (checked: boolean) => {
    onChange({
      settings: {
        ...store.settings,
        shop: { ...shop, requireTerms: checked },
      },
    });
  };

  async function createPolicy(slug: LegalPolicySlug) {
    setBusySlug(slug);
    try {
      const template = getLegalTemplateBody(slug);
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: template.title,
          slug,
          content: template.content,
          status: "draft",
        }),
      });
      const data = (await res.json()) as { page?: StorePageRow; message?: string };
      if (!res.ok || !data.page) {
        toast.error(data.message ?? "Could not create page");
        return;
      }
      setPages((prev) => [data.page!, ...prev.filter((p) => p.slug !== slug)]);
      toast.success(`${template.title} created as draft`);
    } catch {
      toast.error("Could not create page");
    } finally {
      setBusySlug(null);
    }
  }

  async function setPolicyStatus(page: StorePageRow, status: "published" | "draft") {
    setBusySlug(page.slug as LegalPolicySlug);
    try {
      const res = await fetch(`/api/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = (await res.json()) as { page?: StorePageRow; message?: string };
      if (!res.ok || !data.page) {
        toast.error(data.message ?? "Could not update page");
        return;
      }
      setPages((prev) =>
        prev.map((p) => (p.id === data.page!.id ? data.page! : p))
      );
      toast.success(
        status === "published" ? "Published to your storefront" : "Unpublished (draft)"
      );
    } catch {
      toast.error("Could not update page");
    } finally {
      setBusySlug(null);
    }
  }

  return (
    <SettingsPanel
      title="Legal"
      description="Policies shoppers see in the footer and at checkout."
      dirty={dirty}
      saving={saving}
      onSave={onSave}
      saveLabel="Save legal settings"
      action={
        <Button asChild variant="outline" size="sm" className="h-8 text-[12px]">
          <Link href="/help/handle-returns-and-refunds" target="_blank">
            <HelpCircle className="mr-1.5 h-3.5 w-3.5" />
            Help
          </Link>
        </Button>
      }
    >
      <SettingsSection
        title="Readiness"
        description="Publish policies before you require them at checkout."
      >
        <div className="rounded-[10px] border border-black/[0.06] bg-white px-3.5 py-3 dark:border-white/10 dark:bg-transparent">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[12px] font-semibold text-neutral-900 dark:text-white">
                {readiness.done}/{readiness.total} complete
              </p>
              <p className="mt-0.5 text-[11px] text-neutral-400">
                Footer already links Privacy, Terms, and Shipping — publish so pages load.
              </p>
            </div>
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/10">
              <div
                className="h-full rounded-full bg-[#007AFF] transition-all"
                style={{
                  width: `${Math.round((readiness.done / readiness.total) * 100)}%`,
                }}
              />
            </div>
          </div>
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {readiness.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-2 text-[12px] text-neutral-600 dark:text-neutral-300"
              >
                <span
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-full",
                    item.done
                      ? "bg-emerald-500 text-white"
                      : "border border-neutral-300 dark:border-neutral-600"
                  )}
                >
                  {item.done ? <Check className="h-2.5 w-2.5" /> : null}
                </span>
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Store policies"
        description="Managed pages shown in your storefront footer."
        action={
          <Button asChild variant="outline" size="sm" className="h-8 text-[12px]">
            <Link href="/dashboard/pages">All pages</Link>
          </Button>
        }
      >
        <div className="space-y-2">
          {policies.map((policy) => (
            <PolicyRow
              key={policy.def.slug}
              policy={policy}
              storeSlug={store.slug}
              busy={busySlug === policy.def.slug}
              onCreate={() => void createPolicy(policy.def.slug)}
              onPublish={() =>
                policy.page
                  ? void setPolicyStatus(policy.page, "published")
                  : undefined
              }
              onUnpublish={() =>
                policy.page ? void setPolicyStatus(policy.page, "draft") : undefined
              }
            />
          ))}
        </div>
      </SettingsSection>

      <SettingsSection
        title="Checkout"
        description="Ask buyers to accept your terms before placing an order."
      >
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-[10px] border border-black/[0.06] bg-white px-3.5 py-3 dark:border-white/10 dark:bg-transparent">
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
              Require accept terms
            </p>
            <p className="mt-0.5 text-[11px] text-neutral-400">
              Shows a checkbox before Place order / PayPal. Publish Terms first.
            </p>
          </div>
          <Switch
            checked={shop.requireTerms}
            onCheckedChange={patchRequireTerms}
          />
        </label>
        {shop.requireTerms &&
        !policies.find((p) => p.def.slug === "terms")?.published ? (
          <p className="rounded-[10px] border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-[11px] text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200">
            Terms are required at checkout, but your Terms page is not published yet.
          </p>
        ) : null}
      </SettingsSection>

      <SettingsSection
        title="Business details on invoices"
        description="Company name and address for PDF invoices come from Print settings."
      >
        <div className="flex flex-col gap-3 rounded-[10px] border border-black/[0.06] bg-white px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-transparent">
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
              Invoice company block
            </p>
            <p className="mt-0.5 text-[11px] text-neutral-400">
              {store.settings.shop.invoice.companyDetails?.trim()
                ? "Company details are set — edit anytime under Print → Invoice."
                : "No company details yet. Add them for branded invoices."}
            </p>
          </div>
          <SettingsRelatedLink tab="print">Print settings</SettingsRelatedLink>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Ettajer platform"
        description="Legal pages for the Ettajer product itself — not your storefront."
      >
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="h-8 text-[12px]">
            <Link href="/privacy" target="_blank">
              Platform privacy
              <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="h-8 text-[12px]">
            <Link href="/terms" target="_blank">
              Platform terms
              <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </SettingsSection>

      <SettingsRelatedCard className="rounded-[10px] px-3.5 py-3 text-[12px]">
        Related:{" "}
        <SettingsRelatedLink tab="checkout">Checkout</SettingsRelatedLink>
        {" · "}
        <SettingsRelatedLink tab="print">Print</SettingsRelatedLink>
        {" · "}
        <SettingsRelatedLink tab="seo">SEO</SettingsRelatedLink>
        {" · "}
        <Link
          href="/dashboard/pages"
          className="font-medium text-[#007AFF] underline-offset-2 hover:underline"
        >
          Pages
        </Link>
      </SettingsRelatedCard>
    </SettingsPanel>
  );
}

function PolicyRow({
  policy,
  storeSlug,
  busy,
  onCreate,
  onPublish,
  onUnpublish,
}: {
  policy: LegalPolicyStatus;
  storeSlug: string;
  busy: boolean;
  onCreate: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
}) {
  const Icon = POLICY_ICONS[policy.def.slug];
  const previewHref = getStorePageUrl(storeSlug, policy.def.slug);
  const editHref = policy.page
    ? `/dashboard/pages/${policy.page.id}/edit`
    : null;

  const statusLabel = !policy.page
    ? "Missing"
    : policy.published
      ? "Published"
      : "Draft";

  return (
    <div className="rounded-[10px] border border-black/[0.06] bg-white px-3.5 py-3 dark:border-white/10 dark:bg-transparent">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#007AFF]/10 text-[#007AFF]">
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[13px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                {policy.def.label}
              </p>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium",
                  !policy.page
                    ? "bg-neutral-100 text-neutral-500 dark:bg-white/10 dark:text-neutral-400"
                    : policy.published
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200"
                )}
              >
                {statusLabel}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-neutral-400">
              {policy.def.description}
            </p>
            <p className="mt-1 font-mono text-[10px] text-neutral-400">
              {policy.def.pathHint}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          {!policy.page ? (
            <Button
              type="button"
              size="sm"
              className={cn(dashboardPrimaryBtn, "h-8")}
              disabled={busy}
              onClick={onCreate}
            >
              {busy ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
              Create draft
            </Button>
          ) : (
            <>
              {editHref ? (
                <Button asChild variant="outline" size="sm" className="h-8 text-[12px]">
                  <Link href={editHref}>
                    <FileText className="mr-1.5 h-3.5 w-3.5" />
                    Edit
                  </Link>
                </Button>
              ) : null}
              <Button asChild variant="outline" size="sm" className="h-8 text-[12px]">
                <Link href={previewHref} target="_blank">
                  <Eye className="mr-1.5 h-3.5 w-3.5" />
                  View
                </Link>
              </Button>
              {policy.published ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-[12px]"
                  disabled={busy}
                  onClick={onUnpublish}
                >
                  {busy ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                  Unpublish
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  className={cn(dashboardPrimaryBtn, "h-8")}
                  disabled={busy}
                  onClick={onPublish}
                >
                  {busy ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                  Publish
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}