"use client";

import { useId, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type NewsletterFormVariant = "dark" | "light" | "bold";

interface NewsletterSignupFormProps {
  storeSlug: string;
  source?: string;
  buttonText?: string;
  variant?: NewsletterFormVariant;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  /** Prefix for field ids when multiple newsletter forms exist on one page. */
  idPrefix?: string;
}

export function NewsletterSignupForm({
  storeSlug,
  source = "newsletter",
  buttonText = "Join",
  variant = "dark",
  className,
  inputClassName,
  buttonClassName,
  idPrefix,
}: NewsletterSignupFormProps) {
  const reactId = useId().replace(/:/g, "");
  const emailId = `${idPrefix ?? `newsletter-${reactId}`}-email`;
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    setMessage(null);

    try {
      const res = await fetch(`/api/store/${encodeURIComponent(storeSlug)}/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) {
        setStatus("error");
        setMessage(data.message ?? "Something went wrong. Try again.");
        return;
      }
      setStatus("success");
      setMessage(data.message ?? "You're on the list");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Try again.");
    }
  }

  const isDark = variant === "dark";
  const isBold = variant === "bold";

  return (
    <div className={className}>
      <form className="mx-auto flex max-w-md flex-col gap-2 sm:flex-row" onSubmit={onSubmit}>
        <input
          id={emailId}
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== "idle" && status !== "loading") setStatus("idle");
          }}
          disabled={status === "loading"}
          aria-label="Email address"
          placeholder="Email address"
          className={cn(
            "min-w-0 flex-1 border px-4 py-3 text-sm outline-none transition disabled:opacity-60",
            isDark &&
              "rounded-sm border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-white/50",
            variant === "light" &&
              "rounded-sm border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900",
            isBold &&
              "rounded-xl border-white/20 bg-black/40 text-white placeholder:text-white/40 focus:ring-2 focus:ring-[var(--store-primary)]/30",
            inputClassName
          )}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className={cn(
            "inline-flex shrink-0 items-center justify-center gap-2 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] transition hover:opacity-90 disabled:opacity-60",
            isDark && "rounded-sm bg-white text-neutral-900 hover:bg-neutral-100",
            variant === "light" && "rounded-sm text-white",
            isBold && "rounded-xl text-white",
            buttonClassName
          )}
          style={
            isDark
              ? undefined
              : { backgroundColor: "var(--store-primary)" }
          }
        >
          {status === "loading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {buttonText}
        </button>
      </form>
      {message ? (
        <p
          className={cn(
            "mt-3 text-center text-xs",
            status === "success" && (isDark || isBold ? "text-emerald-300" : "text-emerald-700"),
            status === "error" && (isDark || isBold ? "text-red-300" : "text-red-600")
          )}
          role="status"
        >
          {message}
        </p>
      ) : (
        <p
          className={cn(
            "mt-4 text-center text-[11px] uppercase tracking-[0.12em]",
            isDark || isBold ? "text-white/35" : "text-neutral-400"
          )}
        >
          No spam · Unsubscribe anytime
        </p>
      )}
    </div>
  );
}
