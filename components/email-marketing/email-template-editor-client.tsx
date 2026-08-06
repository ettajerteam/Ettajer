"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  NEWSLETTER_THEMES,
  themeSwatchStyle,
  type NewsletterThemeId,
} from "@/lib/email/newsletter-themes";
import { buildEmailTemplateHtml } from "@/lib/email-marketing/render";
import { parseEmailBlocks, type EmailBlock } from "@/lib/email-marketing/email-blocks";
import { resolveEmailProductBlocksFromCatalog } from "@/lib/email-marketing/product-blocks-render";
import type { EmailTemplateRow } from "@/lib/email-marketing/types";
import { getAbsoluteStoreUrl } from "@/lib/storefront-urls";
import {
  EmailProductBlocksEditor,
  type CatalogProduct,
} from "@/components/email-marketing/email-product-blocks-editor";
import { EmailCopilotPanel } from "@/components/email-marketing/email-copilot-panel";

interface EmailTemplateEditorClientProps {
  mode: "create" | "edit";
  storeName: string;
  storeSlug: string;
  storePrimaryColor?: string | null;
  currency?: string;
  initial?: EmailTemplateRow | null;
}

export function EmailTemplateEditorClient({
  mode,
  storeName,
  storeSlug,
  storePrimaryColor,
  currency = "MAD",
  initial,
}: EmailTemplateEditorClientProps) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "Untitled template");
  const [themeId, setThemeId] = useState<NewsletterThemeId>(
    (initial?.themeId as NewsletterThemeId) || "store"
  );
  const [subject, setSubject] = useState(initial?.subject ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [ctaLabel, setCtaLabel] = useState(initial?.ctaLabel ?? "Shop now");
  const [ctaUrl, setCtaUrl] = useState(initial?.ctaUrl ?? "");
  const [blocks, setBlocks] = useState<EmailBlock[]>(
    () => parseEmailBlocks(initial?.blocks ?? [])
  );
  const [saving, setSaving] = useState(false);
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setCatalogLoading(true);
      try {
        const res = await fetch("/api/products?status=active");
        if (!res.ok) throw new Error("Failed to load products");
        const data = (await res.json()) as {
          products?: Array<{
            id: string;
            title: string;
            slug: string;
            price: number;
            comparePrice?: number | null;
            images?: string[];
            variants?: CatalogProduct["variants"];
            status?: string;
          }>;
        };
        if (cancelled) return;
        setCatalog(
          (data.products ?? []).map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            price: p.price,
            comparePrice: p.comparePrice ?? null,
            images: Array.isArray(p.images) ? p.images : [],
            variants: Array.isArray(p.variants) ? p.variants : [],
            status: p.status,
          }))
        );
      } catch {
        if (!cancelled) setCatalog([]);
      } finally {
        if (!cancelled) setCatalogLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const resolvedProducts = useMemo(
    () =>
      resolveEmailProductBlocksFromCatalog({
        storeSlug,
        currency,
        blocks,
        products: catalog,
      }),
    [blocks, catalog, currency, storeSlug]
  );

  const previewHtml = useMemo(
    () =>
      buildEmailTemplateHtml({
        template: {
          themeId,
          subject,
          title,
          body,
          ctaLabel,
          ctaUrl,
          galleryId: initial?.galleryId ?? "announcement",
          blocks,
        },
        storeName,
        storeSlug,
        storePrimaryColor,
        currency,
        resolvedProducts,
      }),
    [
      themeId,
      subject,
      title,
      body,
      ctaLabel,
      ctaUrl,
      blocks,
      resolvedProducts,
      initial?.galleryId,
      storeName,
      storeSlug,
      storePrimaryColor,
      currency,
    ]
  );

  async function handleSave() {
    if (!name.trim() || !subject.trim() || !title.trim() || !body.trim()) {
      toast.error("Name, subject, title, and body are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name,
        themeId,
        subject,
        title,
        body,
        ctaLabel,
        ctaUrl,
        blocks,
      };
      if (mode === "create") {
        const res = await fetch("/api/email/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "custom",
            ...payload,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(
            typeof data.message === "string" ? data.message : "Create failed"
          );
        }
        toast.success("Template created");
        router.push(
          `/dashboard/marketing/email/templates/${data.template.id}/edit`
        );
        router.refresh();
      } else if (initial) {
        const res = await fetch("/api/email/templates", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: initial.id,
            ...payload,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(
            typeof data.message === "string" ? data.message : "Save failed"
          );
        }
        toast.success("Template saved");
        router.refresh();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const fieldClass =
    "h-9 rounded-xl border-neutral-200 bg-neutral-50 text-[13px] dark:border-white/10 dark:bg-white/[0.04]";

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
      <div className="space-y-6">
        <section className="space-y-3">
          <div>
            <h2 className="text-[14px] font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
              Details
            </h2>
            <p className="mt-0.5 text-[12px] text-neutral-400">
              Name this template for your library and automations.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium text-neutral-500">
              Template name
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldClass}
              maxLength={120}
            />
          </div>
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="text-[14px] font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
              Theme
            </h2>
            <p className="mt-0.5 text-[12px] text-neutral-400">
              Accent colors for badge and button.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {NEWSLETTER_THEMES.map((theme) => {
              const selected = themeId === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setThemeId(theme.id)}
                  className={cn(
                    "rounded-2xl border p-2.5 text-left transition-colors",
                    selected
                      ? "border-neutral-950 bg-neutral-50 dark:border-white dark:bg-white/[0.06]"
                      : "border-neutral-100 bg-white hover:border-neutral-200 dark:border-white/10 dark:bg-transparent"
                  )}
                >
                  <span
                    className="relative block h-6 w-full rounded-md"
                    style={themeSwatchStyle(theme, storePrimaryColor)}
                  >
                    {selected ? (
                      <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950">
                        <Check className="h-2 w-2" />
                      </span>
                    ) : null}
                  </span>
                  <p className="mt-2 text-[11px] font-medium text-neutral-950 dark:text-white">
                    {theme.name}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="text-[14px] font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
              Message
            </h2>
            <p className="mt-0.5 text-[12px] text-neutral-400">
              Subject for the inbox; headline and body for the email.
            </p>
          </div>
          <EmailCopilotPanel
            subject={subject}
            title={title}
            body={body}
            ctaLabel={ctaLabel}
            onApply={(patch) => {
              if (patch.subject != null) setSubject(patch.subject);
              if (patch.title != null) setTitle(patch.title);
              if (patch.body != null) setBody(patch.body);
              if (patch.ctaLabel != null) setCtaLabel(patch.ctaLabel);
            }}
          />
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium text-neutral-500">
              Subject
            </Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={fieldClass}
              maxLength={200}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium text-neutral-500">
              Headline
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={fieldClass}
              maxLength={200}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium text-neutral-500">
              Body
            </Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-[140px] rounded-2xl border-neutral-200 bg-neutral-50 text-[13px] dark:border-white/10 dark:bg-white/[0.04]"
              maxLength={5000}
            />
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-neutral-500">
                Button label
              </Label>
              <Input
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                className={fieldClass}
                maxLength={80}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-neutral-500">
                Button URL
              </Label>
              <Input
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder={getAbsoluteStoreUrl(storeSlug)}
                className={fieldClass}
                maxLength={500}
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-100 p-4 dark:border-white/10">
          <EmailProductBlocksEditor
            blocks={blocks}
            onChange={setBlocks}
            currency={currency}
            catalog={catalog}
            catalogLoading={catalogLoading}
          />
        </section>

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            asChild
            type="button"
            variant="outline"
            className="h-9 rounded-full border-neutral-200 px-4 text-[12px] dark:border-white/10"
          >
            <Link href="/dashboard/marketing/email/templates">Cancel</Link>
          </Button>
          <Button
            type="button"
            className="h-9 rounded-full bg-neutral-950 px-4 text-[12px] text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950"
            loading={saving}
            onClick={() => void handleSave()}
          >
            {mode === "create" ? "Create template" : "Save template"}
          </Button>
        </div>
      </div>

      <section className="sticky top-4 overflow-hidden rounded-2xl border border-neutral-100 dark:border-white/10">
        <div className="border-b border-neutral-100 px-4 py-3 dark:border-white/10">
          <h2 className="text-[14px] font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
            Preview
          </h2>
          <p className="mt-0.5 text-[12px] text-neutral-400">
            Live inbox preview
            {blocks.length > 0
              ? ` · ${blocks.length} product${blocks.length === 1 ? "" : "s"}`
              : ""}
          </p>
        </div>
        <div className="max-h-[70vh] overflow-auto bg-neutral-50 p-3 dark:bg-white/[0.02]">
          <iframe
            title="Template preview"
            srcDoc={previewHtml}
            className="h-[520px] w-full rounded-xl border border-neutral-100 bg-white dark:border-white/10"
            sandbox=""
          />
        </div>
      </section>
    </div>
  );
}
