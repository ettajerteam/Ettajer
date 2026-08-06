"use client";

import { useState } from "react";
import {
  Download,
  Eye,
  FileText,
  Loader2,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { SettingsPanel } from "@/components/settings/settings-panel";
import {
  SettingsField,
  SettingsSection,
} from "@/components/settings/settings-section";
import {
  SettingsRelatedCard,
  SettingsRelatedLink,
} from "@/components/settings/settings-related-link";
import type { StoreWithSettings } from "@/lib/store-settings";
import {
  type EticketPreferences,
  type EticketSizeId,
  type InvoicePreferences,
} from "@/lib/shop-preferences";
import {
  applyEticketTemplate,
  applyInvoiceTemplate,
  ETICKET_TEMPLATE_OPTIONS,
  INVOICE_TEMPLATE_OPTIONS,
} from "@/lib/print-templates";
import { cn } from "@/lib/utils";

interface PrinterSettingsProps {
  store: StoreWithSettings;
  onChange: (updates: Partial<StoreWithSettings>) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  dirty?: boolean;
}

type PrintSubTab = "eticket" | "invoice";
type BusyAction = "preview" | "pdf" | null;

const FIELD =
  "h-9 rounded-md border-black/[0.06] bg-white text-[13px] shadow-none focus-visible:ring-[#007AFF]/20 dark:border-white/10 dark:bg-transparent";
const AREA =
  "rounded-md border-black/[0.06] bg-white text-[13px] shadow-none focus-visible:ring-[#007AFF]/20 dark:border-white/10 dark:bg-transparent";

const SUB_TABS: {
  id: PrintSubTab;
  label: string;
  icon: typeof Tag;
}[] = [
  { id: "eticket", label: "E-tickets", icon: Tag },
  { id: "invoice", label: "Invoice", icon: FileText },
];

const SIZE_OPTIONS: {
  id: EticketSizeId;
  label: string;
  hint: string;
}[] = [
  { id: "80x100", label: "80 × 100 mm", hint: "Full packing label (default)" },
  { id: "58x40", label: "58 × 40 mm", hint: "Compact thermal" },
  { id: "40x30", label: "40 × 30 mm", hint: "Small sticker" },
];

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-[10px] border border-black/[0.06] bg-white px-3.5 py-3 dark:border-white/10 dark:bg-transparent">
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
          {label}
        </p>
        <p className="mt-0.5 text-[11px] text-neutral-400">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </label>
  );
}

async function openPreview(
  type: PrintSubTab,
  body: Record<string, unknown>
) {
  const res = await fetch("/api/store/print/preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, ...body }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message ?? "Preview failed");
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (!win) {
    URL.revokeObjectURL(url);
    throw new Error("Allow pop-ups to preview");
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

async function downloadPdf(
  type: PrintSubTab,
  body: Record<string, unknown>
) {
  const res = await fetch("/api/store/print/pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, ...body }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message ?? "Download failed");
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = type === "eticket" ? "sample-eticket.pdf" : "sample-invoice.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function PrinterSettings({
  store,
  onChange,
  onSave,
  saving,
  dirty,
}: PrinterSettingsProps) {
  const [subTab, setSubTab] = useState<PrintSubTab>("eticket");
  const [busy, setBusy] = useState<BusyAction>(null);
  const eticket = store.settings.shop.eticket;
  const invoice = store.settings.shop.invoice;

  const patchShop = (
    patch: Partial<{
      eticket: Partial<EticketPreferences>;
      invoice: Partial<InvoicePreferences>;
    }>
  ) => {
    onChange({
      settings: {
        ...store.settings,
        shop: {
          ...store.settings.shop,
          ...(patch.eticket
            ? { eticket: { ...eticket, ...patch.eticket } }
            : {}),
          ...(patch.invoice
            ? { invoice: { ...invoice, ...patch.invoice } }
            : {}),
        },
      },
    });
  };

  const runAction = async (action: Exclude<BusyAction, null>) => {
    setBusy(action);
    try {
      const body =
        subTab === "eticket"
          ? { eticket }
          : { invoice };
      if (action === "preview") {
        await openPreview(subTab, body);
      } else {
        await downloadPdf(subTab, body);
        toast.success("Sample PDF downloaded");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusy(null);
    }
  };

  const actions = (
    <div className="flex flex-wrap items-center gap-1.5">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 rounded-md border-black/[0.06] px-2.5 text-[11px] shadow-none dark:border-white/10"
        disabled={busy !== null || saving}
        onClick={() => void runAction("preview")}
      >
        {busy === "preview" ? (
          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
        ) : (
          <Eye className="mr-1 h-3 w-3" />
        )}
        Preview
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 rounded-md border-black/[0.06] px-2.5 text-[11px] shadow-none dark:border-white/10"
        disabled={busy !== null || saving}
        onClick={() => void runAction("pdf")}
      >
        {busy === "pdf" ? (
          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
        ) : (
          <Download className="mr-1 h-3 w-3" />
        )}
        Download PDF
      </Button>
    </div>
  );

  return (
    <SettingsPanel
      title="Print"
      description="E-ticket labels and invoice PDFs for packing and customers."
      onSave={onSave}
      saving={saving}
      dirty={dirty}
      saveLabel="Save print"
      action={actions}
    >
      <div className="flex flex-wrap gap-1 rounded-[10px] border border-black/[0.06] bg-[#FAFAFA]/80 p-1 dark:border-white/10 dark:bg-white/[0.03]">
        {SUB_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = subTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id)}
              className={cn(
                "inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md px-2.5 text-[11px] font-medium transition sm:flex-none",
                active
                  ? "bg-white text-[#007AFF] shadow-sm ring-1 ring-black/[0.06] dark:bg-[#1C1C1E] dark:ring-white/10"
                  : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
              )}
            >
              <Icon className="h-3.5 w-3.5 opacity-80" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {subTab === "eticket" ? (
        <>
          <SettingsSection
            title="Templates"
            description="Start from a layout, then fine-tune fields below."
          >
            <div className="grid gap-2 sm:grid-cols-3">
              {ETICKET_TEMPLATE_OPTIONS.map((option) => {
                const active = eticket.template === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      patchShop({ eticket: applyEticketTemplate(option.id) })
                    }
                    className={cn(
                      "rounded-[10px] border px-3 py-2.5 text-left transition",
                      active
                        ? "border-[#007AFF]/40 bg-[#007AFF]/5 ring-1 ring-[#007AFF]/20"
                        : "border-black/[0.06] bg-white hover:border-black/[0.12] dark:border-white/10 dark:bg-transparent"
                    )}
                  >
                    <p className="text-[12px] font-semibold text-neutral-900 dark:text-white">
                      {option.label}
                    </p>
                    <p className="mt-0.5 text-[10px] leading-snug text-neutral-400">
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </SettingsSection>

          <SettingsSection
            title="Label size"
            description="Matches common thermal / ticket printer paper."
          >
            <div className="grid gap-2 sm:grid-cols-3">
              {SIZE_OPTIONS.map((option) => {
                const active = eticket.size === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => patchShop({ eticket: { size: option.id } })}
                    className={cn(
                      "rounded-[10px] border px-3 py-2.5 text-left transition",
                      active
                        ? "border-[#007AFF]/40 bg-[#007AFF]/5 ring-1 ring-[#007AFF]/20"
                        : "border-black/[0.06] bg-white hover:border-black/[0.12] dark:border-white/10 dark:bg-transparent"
                    )}
                  >
                    <p className="text-[12px] font-semibold text-neutral-900 dark:text-white">
                      {option.label}
                    </p>
                    <p className="mt-0.5 text-[10px] text-neutral-400">
                      {option.hint}
                    </p>
                  </button>
                );
              })}
            </div>
          </SettingsSection>

          <SettingsSection
            title="What to print"
            description="Fields shown on each product e-ticket from Orders."
          >
            <div className="space-y-2">
              <ToggleRow
                label="One ticket per unit"
                description="Qty 3 prints 3 tickets. Off = one ticket per line."
                checked={eticket.onePerUnit}
                onCheckedChange={(v) =>
                  patchShop({ eticket: { onePerUnit: v } })
                }
              />
              <ToggleRow
                label="Customer name"
                description="Show who the order is for"
                checked={eticket.showCustomer}
                onCheckedChange={(v) =>
                  patchShop({ eticket: { showCustomer: v } })
                }
              />
              <ToggleRow
                label="Price"
                description="Unit price on the label"
                checked={eticket.showPrice}
                onCheckedChange={(v) =>
                  patchShop({ eticket: { showPrice: v } })
                }
              />
              <ToggleRow
                label="Barcode"
                description="Scannable product barcode / SKU"
                checked={eticket.showBarcode}
                onCheckedChange={(v) =>
                  patchShop({ eticket: { showBarcode: v } })
                }
              />
              <ToggleRow
                label="Store QR"
                description="QR linking to your storefront"
                checked={eticket.showStoreQr}
                onCheckedChange={(v) =>
                  patchShop({ eticket: { showStoreQr: v } })
                }
              />
            </div>
          </SettingsSection>

          <SettingsSection
            title="Footer note"
            description="Optional line under the ticket (e.g. Handle with care)."
          >
            <SettingsField label="Note" htmlFor="eticket-footer">
              <Input
                id="eticket-footer"
                value={eticket.footerNote}
                onChange={(e) =>
                  patchShop({ eticket: { footerNote: e.target.value } })
                }
                placeholder="Optional"
                maxLength={80}
                className={FIELD}
              />
            </SettingsField>
          </SettingsSection>

          <div className="flex flex-wrap gap-2 sm:hidden">{actions}</div>
        </>
      ) : null}

      {subTab === "invoice" ? (
        <>
          <SettingsSection
            title="Templates"
            description="Choose a starting layout for customer invoices."
          >
            <div className="grid gap-2 sm:grid-cols-3">
              {INVOICE_TEMPLATE_OPTIONS.map((option) => {
                const active = invoice.template === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      patchShop({ invoice: applyInvoiceTemplate(option.id) })
                    }
                    className={cn(
                      "rounded-[10px] border px-3 py-2.5 text-left transition",
                      active
                        ? "border-[#007AFF]/40 bg-[#007AFF]/5 ring-1 ring-[#007AFF]/20"
                        : "border-black/[0.06] bg-white hover:border-black/[0.12] dark:border-white/10 dark:bg-transparent"
                    )}
                  >
                    <p className="text-[12px] font-semibold text-neutral-900 dark:text-white">
                      {option.label}
                    </p>
                    <p className="mt-0.5 text-[10px] leading-snug text-neutral-400">
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </SettingsSection>

          <SettingsSection
            title="Invoice PDF"
            description="Applied when you print an invoice from an order."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <SettingsField label="Document title" htmlFor="invoice-title">
                <Input
                  id="invoice-title"
                  value={invoice.documentTitle}
                  onChange={(e) =>
                    patchShop({ invoice: { documentTitle: e.target.value } })
                  }
                  placeholder="Invoice"
                  maxLength={40}
                  className={FIELD}
                />
              </SettingsField>
              <SettingsField label="Footer thank-you" htmlFor="invoice-footer">
                <Input
                  id="invoice-footer"
                  value={invoice.footerNote}
                  onChange={(e) =>
                    patchShop({ invoice: { footerNote: e.target.value } })
                  }
                  placeholder="Thank you for your purchase"
                  maxLength={160}
                  className={FIELD}
                />
              </SettingsField>
            </div>

            <SettingsField
              label="Company details"
              htmlFor="invoice-company"
              hint="ICE, RC, address, or bank info — one line per row."
            >
              <Textarea
                id="invoice-company"
                value={invoice.companyDetails}
                onChange={(e) =>
                  patchShop({ invoice: { companyDetails: e.target.value } })
                }
                placeholder={"ICE 000000000000000\nCasablanca, Morocco"}
                rows={3}
                maxLength={280}
                className={cn(AREA, "resize-none")}
              />
            </SettingsField>
          </SettingsSection>

          <SettingsSection title="Display" description="What appears on the PDF.">
            <div className="space-y-2">
              <ToggleRow
                label="Store logo"
                description="Use the logo from General settings"
                checked={invoice.showLogo}
                onCheckedChange={(v) =>
                  patchShop({ invoice: { showLogo: v } })
                }
              />
              <ToggleRow
                label="Payment status"
                description="COD / PayPal and paid / unpaid"
                checked={invoice.showPaymentStatus}
                onCheckedChange={(v) =>
                  patchShop({ invoice: { showPaymentStatus: v } })
                }
              />
            </div>
          </SettingsSection>

          <div className="flex flex-wrap gap-2 sm:hidden">{actions}</div>
        </>
      ) : null}

      <SettingsRelatedCard className="rounded-[10px] px-3.5 py-3 text-[12px]">
        Preview uses a sample order with your current settings (even if unsaved).
        Store logo lives in{" "}
        <SettingsRelatedLink tab="general">General</SettingsRelatedLink>.
      </SettingsRelatedCard>
    </SettingsPanel>
  );
}
