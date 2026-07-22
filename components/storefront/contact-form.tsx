"use client";

import { useId, useState } from "react";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContactFormProps {
  storeSlug: string;
  buttonText?: string;
  showPhone?: boolean;
  variant?: "light" | "dark" | "bold";
  className?: string;
  /** Prefix for field ids when multiple contact forms exist on one page. */
  idPrefix?: string;
}

export function ContactForm({
  storeSlug,
  buttonText = "Send message",
  showPhone = true,
  variant = "light",
  className,
  idPrefix,
}: ContactFormProps) {
  const reactId = useId().replace(/:/g, "");
  const prefix = idPrefix ?? `contact-${reactId}`;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState<string | null>(null);

  const isDark = variant === "dark" || variant === "bold";
  const isBold = variant === "bold";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    setFeedback(null);

    try {
      const res = await fetch(`/api/store/${encodeURIComponent(storeSlug)}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message,
          ...(showPhone && phone.trim() ? { phone } : {}),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) {
        setStatus("error");
        setFeedback(data.message ?? "Something went wrong. Try again.");
        return;
      }
      setStatus("success");
      setFeedback(data.message ?? "Message sent — we’ll get back to you soon.");
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch {
      setStatus("error");
      setFeedback("Something went wrong. Try again.");
    }
  }

  function resetToForm() {
    setStatus("idle");
    setFeedback(null);
  }

  const labelClass = cn(
    "mb-1.5 block text-[12px] font-medium tracking-wide",
    isDark ? "text-white/55" : "text-neutral-500"
  );

  const inputClass = cn(
    "h-12 w-full border px-4 text-[15px] outline-none transition disabled:opacity-60",
    isBold ? "rounded-xl" : "rounded-xl sm:rounded-lg",
    isDark
      ? "border-white/15 bg-white/5 text-white placeholder:text-white/35 focus:border-white/40"
      : "border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10"
  );

  if (status === "success") {
    return (
      <div
        className={cn(
          "mx-auto w-full max-w-lg rounded-2xl border px-6 py-10 text-center sm:px-8",
          isDark ? "border-white/10 bg-white/5" : "border-neutral-200 bg-neutral-50/80",
          className
        )}
        role="status"
      >
        <div
          className={cn(
            "mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full",
            isDark ? "bg-emerald-500/15" : "bg-emerald-50"
          )}
        >
          <CheckCircle2
            className={cn("h-6 w-6", isDark ? "text-emerald-300" : "text-emerald-600")}
          />
        </div>
        <p
          className={cn(
            "text-lg font-medium tracking-tight",
            isDark ? "text-white" : "text-neutral-900"
          )}
        >
          Message sent
        </p>
        <p
          className={cn(
            "mx-auto mt-2 max-w-sm text-sm leading-relaxed",
            isDark ? "text-white/50" : "text-neutral-500"
          )}
        >
          {feedback ?? "Thanks — we’ll reply as soon as we can."}
        </p>
        <button
          type="button"
          onClick={resetToForm}
          className={cn(
            "mt-8 inline-flex h-11 items-center px-5 text-[13px] font-medium transition",
            isBold ? "rounded-full" : "rounded-full sm:rounded-lg",
            isDark
              ? "border border-white/20 text-white/80 hover:border-white/40"
              : "border border-neutral-200 text-neutral-700 hover:border-neutral-400"
          )}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      className={cn("mx-auto w-full max-w-lg space-y-5 text-left", className)}
      onSubmit={onSubmit}
      noValidate
    >
      {status === "error" && feedback ? (
        <div
          role="alert"
          className={cn(
            "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm",
            isDark
              ? "border-red-400/30 bg-red-500/10 text-red-200"
              : "border-red-100 bg-red-50 text-red-700"
          )}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-medium">Couldn’t send</p>
            <p className={cn("mt-0.5", isDark ? "text-red-200/80" : "text-red-600/90")}>
              {feedback}
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${prefix}-name`} className={labelClass}>
            Name
          </label>
          <input
            id={`${prefix}-name`}
            type="text"
            name="name"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={status === "loading"}
            placeholder="Ahmed Benali"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor={`${prefix}-email`} className={labelClass}>
            Email
          </label>
          <input
            id={`${prefix}-email`}
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading"}
            placeholder="you@example.com"
            className={inputClass}
          />
        </div>
      </div>

      {showPhone ? (
        <div>
          <label htmlFor={`${prefix}-phone`} className={labelClass}>
            Phone <span className={isDark ? "text-white/30" : "text-neutral-400"}>(optional)</span>
          </label>
          <input
            id={`${prefix}-phone`}
            type="tel"
            name="phone"
            autoComplete="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={status === "loading"}
            placeholder="+212 6XX XXX XXX"
            className={inputClass}
          />
        </div>
      ) : null}

      <div>
        <label htmlFor={`${prefix}-message`} className={labelClass}>
          Message
        </label>
        <textarea
          id={`${prefix}-message`}
          name="message"
          autoComplete="off"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={status === "loading"}
          placeholder="Orders, returns, partnerships — how can we help?"
          className={cn(inputClass, "min-h-[9rem] resize-y py-3 leading-relaxed")}
        />
      </div>

      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={status === "loading"}
          className={cn(
            "inline-flex h-12 w-full items-center justify-center gap-2 px-6 text-[13px] font-semibold transition hover:opacity-90 disabled:opacity-60 sm:w-auto",
            isBold ? "rounded-full" : "rounded-full sm:rounded-lg",
            isDark && variant === "dark"
              ? "bg-white text-neutral-900 hover:bg-neutral-100"
              : "text-white"
          )}
          style={
            variant === "dark" ? undefined : { backgroundColor: "var(--store-primary)" }
          }
        >
          {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {status === "loading" ? "Sending…" : buttonText}
        </button>
        <p
          className={cn(
            "text-[11px] leading-relaxed sm:max-w-[14rem] sm:text-right",
            isDark ? "text-white/35" : "text-neutral-400"
          )}
        >
          We typically reply within one business day.
        </p>
      </div>
    </form>
  );
}
