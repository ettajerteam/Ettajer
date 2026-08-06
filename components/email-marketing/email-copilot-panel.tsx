"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CopilotAction =
  | "generate_subject"
  | "generate_email"
  | "improve"
  | "rewrite"
  | "translate"
  | "tone"
  | "shorten"
  | "expand"
  | "generate_cta"
  | "promotion_ideas";

interface EmailCopilotPanelProps {
  subject: string;
  body: string;
  title: string;
  ctaLabel: string;
  onApply: (patch: {
    subject?: string;
    title?: string;
    body?: string;
    ctaLabel?: string;
  }) => void;
}

const WRITE_ACTIONS: { id: CopilotAction; label: string }[] = [
  { id: "generate_subject", label: "Subject" },
  { id: "generate_email", label: "Full email" },
  { id: "generate_cta", label: "CTA" },
  { id: "promotion_ideas", label: "Promo ideas" },
];

const EDIT_ACTIONS: { id: CopilotAction; label: string }[] = [
  { id: "improve", label: "Improve" },
  { id: "rewrite", label: "Rewrite" },
  { id: "shorten", label: "Shorten" },
  { id: "expand", label: "Expand" },
  { id: "translate", label: "→ French" },
];

const TONES = [
  { id: "luxury", label: "Luxury" },
  { id: "friendly", label: "Friendly" },
  { id: "professional", label: "Professional" },
] as const;

export function EmailCopilotPanel({
  subject,
  body,
  title,
  ctaLabel,
  onApply,
}: EmailCopilotPanelProps) {
  const [open, setOpen] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [tone, setTone] = useState<(typeof TONES)[number]["id"]>("professional");
  const [lastResult, setLastResult] = useState<string>("");
  const [source, setSource] = useState<string | null>(null);

  async function run(action: CopilotAction, toneOverride?: typeof tone) {
    setBusy(action);
    try {
      const text =
        action === "generate_subject"
          ? subject
          : action === "generate_cta"
            ? ctaLabel
            : body || title;
      const res = await fetch("/api/email/atlas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "copilot",
          copilot: {
            action,
            text,
            tone: toneOverride || tone,
            targetLocale: action === "translate" ? "fr" : undefined,
            locale: "en",
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.message === "string" ? data.message : "AI writing failed"
        );
      }
      setSource(typeof data.source === "string" ? data.source : null);
      const result = data.result;
      if (typeof result === "string") {
        setLastResult(result);
        if (action === "generate_subject") onApply({ subject: result });
        else if (action === "generate_cta") onApply({ ctaLabel: result });
        else if (
          action === "improve" ||
          action === "rewrite" ||
          action === "shorten" ||
          action === "expand" ||
          action === "translate" ||
          action === "tone"
        ) {
          onApply({ body: result });
        }
      } else if (result && typeof result === "object") {
        const copy = result as {
          subject?: string;
          title?: string;
          body?: string;
          ctaLabel?: string;
          promotionIdeas?: string[];
        };
        onApply({
          subject: copy.subject,
          title: copy.title,
          body: copy.body,
          ctaLabel: copy.ctaLabel,
        });
        setLastResult(
          [copy.subject, copy.title, copy.body, ...(copy.promotionIdeas || [])]
            .filter(Boolean)
            .join("\n\n")
        );
      }
      toast.success("Applied");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI writing failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-100 dark:border-white/10">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-white/[0.03]"
        onClick={() => setOpen((v) => !v)}
      >
        <span>
          <span className="block text-[13px] font-medium text-neutral-950 dark:text-white">
            AI writing
          </span>
          <span className="text-[11px] text-neutral-400">
            Write, refine, translate
          </span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-neutral-400 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open ? (
        <div className="space-y-4 border-t border-neutral-100 px-4 py-3.5 dark:border-white/10">
          <div>
            <p className="mb-1.5 text-[11px] font-medium text-neutral-400">
              Tone
            </p>
            <div className="flex flex-wrap gap-1">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTone(t.id);
                    if (body.trim()) void run("tone", t.id);
                  }}
                  className={cn(
                    "rounded-full px-3 py-1 text-[11px] font-medium transition-colors",
                    tone === t.id
                      ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                      : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-medium text-neutral-400">
              Write
            </p>
            <div className="flex flex-wrap gap-1">
              {WRITE_ACTIONS.map((a) => (
                <Button
                  key={a.id}
                  type="button"
                  variant="outline"
                  className="h-7 rounded-full border-neutral-200 px-2.5 text-[11px] dark:border-white/10"
                  loading={busy === a.id}
                  onClick={() => void run(a.id)}
                >
                  {a.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-medium text-neutral-400">
              Edit body
            </p>
            <div className="flex flex-wrap gap-1">
              {EDIT_ACTIONS.map((a) => (
                <Button
                  key={a.id}
                  type="button"
                  variant="outline"
                  className="h-7 rounded-full border-neutral-200 px-2.5 text-[11px] dark:border-white/10"
                  loading={busy === a.id}
                  disabled={!body.trim() && a.id !== "translate"}
                  onClick={() => void run(a.id)}
                >
                  {a.label}
                </Button>
              ))}
            </div>
          </div>

          {lastResult ? (
            <div className="rounded-xl bg-neutral-50 p-3 dark:bg-white/[0.04]">
              <p className="mb-1 text-[10px] font-medium text-neutral-400">
                Last result
                {source ? ` · ${source}` : ""}
              </p>
              <pre className="max-h-32 overflow-auto whitespace-pre-wrap font-sans text-[11px] leading-relaxed text-neutral-600 dark:text-neutral-300">
                {lastResult}
              </pre>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
