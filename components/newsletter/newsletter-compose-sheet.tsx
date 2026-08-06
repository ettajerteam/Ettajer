"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import { toast } from "sonner";
import {
  Check,
  Gift,
  Heart,
  Megaphone,
  Package,
  Sparkles,
  Tag,
  Truck,
  Zap,
  Crown,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  NEWSLETTER_TEMPLATES,
  buildNewsletterComposeDefaults,
  buildNewsletterEmailHtml,
  getNewsletterTemplate,
  type NewsletterComposeFields,
  type NewsletterTemplateId,
} from "@/lib/email/newsletter-templates";
import {
  NEWSLETTER_THEMES,
  themeSwatchStyle,
  type NewsletterThemeId,
} from "@/lib/email/newsletter-themes";
import type { NewsletterSendRow } from "@/lib/newsletter";
import { getAbsoluteStoreUrl } from "@/lib/storefront-urls";

const TEMPLATE_ICONS: Record<
  NewsletterTemplateId,
  ComponentType<{ className?: string }>
> = {
  promo: Tag,
  new_arrivals: Sparkles,
  announcement: Megaphone,
  welcome: Heart,
  flash_sale: Zap,
  free_shipping: Truck,
  thank_you: Gift,
  restock: Package,
  exclusive: Crown,
};

interface NewsletterComposeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeName: string;
  storeSlug: string;
  storePrimaryColor?: string | null;
  activeCount: number;
  savedTemplates?: { id: string; name: string; subject: string }[];
  onSent: (send: NewsletterSendRow) => void;
}

export function NewsletterComposeSheet({
  open,
  onOpenChange,
  storeName,
  storeSlug,
  storePrimaryColor,
  activeCount,
  savedTemplates = [],
  onSent,
}: NewsletterComposeSheetProps) {
  const [templateId, setTemplateId] =
    useState<NewsletterTemplateId>("promo");
  const [themeId, setThemeId] = useState<NewsletterThemeId>("store");
  const [fields, setFields] = useState<NewsletterComposeFields>(() =>
    buildNewsletterComposeDefaults("promo", storeName)
  );
  const [sending, setSending] = useState(false);
  void savedTemplates;

  useEffect(() => {
    if (!open) return;
    setTemplateId("promo");
    const tpl = getNewsletterTemplate("promo")!;
    setThemeId(tpl.suggestedThemeId);
    setFields(buildNewsletterComposeDefaults("promo", storeName));
  }, [open, storeName]);

  function selectTemplate(id: NewsletterTemplateId) {
    setTemplateId(id);
    const tpl = getNewsletterTemplate(id)!;
    setThemeId(tpl.suggestedThemeId);
    setFields(buildNewsletterComposeDefaults(id, storeName));
  }

  function patch(partial: Partial<NewsletterComposeFields>) {
    setFields((f) => ({ ...f, ...partial }));
  }

  const previewHtml = useMemo(() => {
    return buildNewsletterEmailHtml({
      templateId,
      themeId,
      storeName,
      storeSlug,
      storePrimaryColor,
      fields: {
        ...fields,
        ctaUrl: fields.ctaUrl.trim() || getAbsoluteStoreUrl(storeSlug),
      },
    });
  }, [templateId, themeId, storeName, storeSlug, storePrimaryColor, fields]);

  async function handleSend() {
    if (activeCount <= 0) {
      toast.error("No active subscribers to email");
      return;
    }
    if (!fields.subject.trim() || !fields.title.trim() || !fields.body.trim()) {
      toast.error("Subject, title, and body are required");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId,
          themeId,
          subject: fields.subject.trim(),
          title: fields.title.trim(),
          body: fields.body.trim(),
          ctaLabel: fields.ctaLabel.trim(),
          ctaUrl: fields.ctaUrl.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.message === "string" ? data.message : "Send failed"
        );
      }

      onSent(data.send as NewsletterSendRow);
      onOpenChange(false);
      const queued =
        typeof data.queuedCount === "number"
          ? data.queuedCount
          : data.recipientCount;
      toast.success(
        `Queued ${queued} email${queued === 1 ? "" : "s"} — track progress in Queue`
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

  const fieldClass =
    "h-9 rounded-xl border-neutral-200 bg-neutral-50 text-[13px] dark:border-white/10 dark:bg-white/[0.04]";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col overflow-hidden border-l border-neutral-100 bg-neutral-50 p-0 dark:border-white/10 dark:bg-[#121212] sm:max-w-xl"
      >
        <SheetHeader className="shrink-0 space-y-0 border-b border-neutral-100 bg-white px-5 py-4 text-left dark:border-white/10 dark:bg-[#1C1C1E]">
          <div className="min-w-0">
            <SheetTitle className="text-[15px] font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
              Quick send
            </SheetTitle>
            <SheetDescription className="mt-1 text-[13px] text-neutral-400">
              Send to{" "}
              <span className="font-medium text-neutral-600 dark:text-neutral-300">
                {activeCount} active
              </span>{" "}
              subscriber{activeCount === 1 ? "" : "s"}
            </SheetDescription>
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <section className="space-y-3">
            <div>
              <h3 className="text-[14px] font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
                Template
              </h3>
              <p className="mt-0.5 text-[12px] text-neutral-400">
                Layout and starter copy — edit the message below.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {NEWSLETTER_TEMPLATES.map((template) => {
                const selected = templateId === template.id;
                const Icon = TEMPLATE_ICONS[template.id];
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => selectTemplate(template.id)}
                    className={cn(
                      "relative rounded-2xl border px-3 py-2.5 text-left transition-colors",
                      selected
                        ? "border-neutral-950 bg-white dark:border-white dark:bg-white/[0.06]"
                        : "border-neutral-100 bg-white hover:border-neutral-200 dark:border-white/10 dark:bg-transparent"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-full",
                          selected
                            ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                            : "bg-neutral-100 text-neutral-500 dark:bg-white/[0.08]"
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      {selected ? (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950">
                          <Check className="h-2.5 w-2.5" />
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-[12px] font-medium text-neutral-950 dark:text-white">
                      {template.name}
                    </p>
                    <p className="mt-0.5 text-[10px] leading-snug text-neutral-400">
                      {template.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-3">
            <div>
              <h3 className="text-[14px] font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
                Theme
              </h3>
              <p className="mt-0.5 text-[12px] text-neutral-400">
                Accent colors for the header badge and button.
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
                        ? "border-neutral-950 bg-white dark:border-white dark:bg-white/[0.06]"
                        : "border-neutral-100 bg-white hover:border-neutral-200 dark:border-white/10 dark:bg-transparent"
                    )}
                  >
                    <span
                      className="block h-6 w-full rounded-md"
                      style={themeSwatchStyle(theme, storePrimaryColor)}
                    />
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
              <h3 className="text-[14px] font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
                Message
              </h3>
              <p className="mt-0.5 text-[12px] text-neutral-400">
                Subject line for the inbox; title and body for the email.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-neutral-500">
                Subject
              </Label>
              <Input
                value={fields.subject}
                onChange={(e) => patch({ subject: e.target.value })}
                className={fieldClass}
                maxLength={200}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-neutral-500">
                Headline
              </Label>
              <Input
                value={fields.title}
                onChange={(e) => patch({ title: e.target.value })}
                className={fieldClass}
                maxLength={200}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-neutral-500">
                Body
              </Label>
              <Textarea
                value={fields.body}
                onChange={(e) => patch({ body: e.target.value })}
                className="min-h-[120px] rounded-2xl border-neutral-200 bg-white text-[13px] dark:border-white/10 dark:bg-white/[0.04]"
                maxLength={5000}
              />
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium text-neutral-500">
                  Button label
                </Label>
                <Input
                  value={fields.ctaLabel}
                  onChange={(e) => patch({ ctaLabel: e.target.value })}
                  className={fieldClass}
                  maxLength={80}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium text-neutral-500">
                  Button URL
                </Label>
                <Input
                  value={fields.ctaUrl}
                  onChange={(e) => patch({ ctaUrl: e.target.value })}
                  placeholder={getAbsoluteStoreUrl(storeSlug)}
                  className={fieldClass}
                  maxLength={500}
                />
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-neutral-100 bg-white dark:border-white/10 dark:bg-transparent">
            <div className="border-b border-neutral-100 px-4 py-3 dark:border-white/10">
              <h3 className="text-[14px] font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
                Preview
              </h3>
              <p className="mt-0.5 text-[12px] text-neutral-400">
                Approximate look in the inbox — branded with {storeName}.
              </p>
            </div>
            <div className="max-h-[360px] overflow-auto bg-neutral-50 p-3 dark:bg-white/[0.02]">
              <iframe
                title="Newsletter preview"
                srcDoc={previewHtml}
                className="h-[480px] w-full rounded-xl border border-neutral-100 bg-white dark:border-white/10"
                sandbox=""
              />
            </div>
          </section>
        </div>

        <SheetFooter className="shrink-0 gap-2 border-t border-neutral-100 bg-white px-5 py-3.5 dark:border-white/10 dark:bg-[#1C1C1E] sm:flex-row sm:justify-end sm:space-x-0">
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-full border-neutral-200 px-4 text-[12px] dark:border-white/10"
            onClick={() => onOpenChange(false)}
            disabled={sending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="h-9 rounded-full bg-neutral-950 px-4 text-[12px] font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950"
            loading={sending}
            disabled={activeCount <= 0 || sending}
            onClick={() => void handleSend()}
          >
            Send to {activeCount} subscriber{activeCount === 1 ? "" : "s"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
