"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Inbox, Loader2, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { AuthFlowSteps } from "@/components/auth/auth-flow";
import { useAuthLocale, AuthArrowForward } from "@/components/auth/auth-locale-provider";
import { cn } from "@/lib/utils";

const BRAND_ICON = "/brand/App-Logo.png";
const EASE = [0.22, 1, 0.36, 1] as const;

const cardShell =
  "relative overflow-hidden rounded-[1.25rem] border border-white/90 bg-white/90 shadow-[0_0_0_1px_rgba(15,23,42,0.04),0_8px_16px_-4px_rgba(15,23,42,0.06),0_24px_48px_-12px_rgba(15,23,42,0.1)] backdrop-blur-xl backdrop-saturate-150";

export function ForgotPasswordForm() {
  const { copy, locale, isRtl } = useAuthLocale();
  const f = copy.forgot;
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const flowSteps = useMemo(
    () => [
      { id: "email", label: f.flowEmail },
      { id: "inbox", label: f.flowInbox },
      { id: "password", label: f.flowPassword },
      { id: "done", label: f.flowDone },
    ],
    [f.flowDone, f.flowEmail, f.flowInbox, f.flowPassword],
  );

  const tips = [f.tip1, f.tip2, f.tip3];

  const submitResetRequest = async () => {
    if (!email.trim()) {
      toast.error(f.enterEmail);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), locale }),
      });

      const data = (await res.json()) as { message?: string };

      if (!res.ok) {
        toast.error(data.message ?? f.unableSend);
        return;
      }

      setSent(true);
      toast.success(f.sentToast);
    } catch {
      toast.error(f.somethingWrong);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitResetRequest();
  };

  if (sent) {
    return (
      <div>
        <div className={cardShell}>
          <div className="border-b border-neutral-100/80 px-5 py-3 sm:px-6">
            <AuthFlowSteps steps={flowSteps} current="inbox" />
          </div>

          <div className="px-5 py-5 text-center sm:px-6 sm:py-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#007AFF]/[0.08] text-[#007AFF] ring-1 ring-[#007AFF]/15"
            >
              <Inbox className="h-5 w-5" strokeWidth={1.5} />
            </motion.div>

            <h1 className="text-[1.35rem] font-semibold tracking-[-0.03em] text-neutral-950">
              {f.checkInbox}
            </h1>
            <p className="mx-auto mt-2 max-w-[320px] text-[12.5px] leading-relaxed text-neutral-500">
              {f.sentPrefix}{" "}
              <span className="font-medium text-neutral-800">{email}</span>. {f.expires}
            </p>

            <div className="mx-auto mt-4 max-w-[340px] rounded-xl border border-neutral-100 bg-neutral-50/70 px-3.5 py-3 text-start">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-400">
                {f.nextSteps}
              </p>
              <ol className="space-y-2">
                {tips.map((tip, index) => (
                  <li
                    key={tip}
                    className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-neutral-600"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-neutral-700 ring-1 ring-neutral-200">
                      {index + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-[#007AFF]/15 bg-[#007AFF]/[0.04] px-3.5 py-2.5 text-start text-[12px] leading-relaxed text-neutral-700">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#007AFF]" />
              <p>{f.spamHint}</p>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => void submitResetRequest()}
                disabled={loading}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-neutral-950 text-sm font-semibold text-white transition-all hover:bg-neutral-800 active:scale-[0.985] disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? f.sending : f.resend}
              </button>
              <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-neutral-200/80 bg-white text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50"
              >
                {f.backToSignIn}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={cardShell}>
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#007AFF]/55 to-transparent"
          aria-hidden
        />

        <div className="border-b border-neutral-100/80 px-5 py-3 sm:px-6">
          <AuthFlowSteps steps={flowSteps} current="email" />
        </div>

        <div className="relative flex items-center gap-3.5 border-b border-neutral-100/90 px-5 py-3.5 text-start sm:px-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-b from-white to-[#f4f6f9] shadow-[0_1px_2px_rgba(15,23,42,0.06),0_6px_14px_-6px_rgba(15,23,42,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-neutral-200/80">
            <Image
              src={BRAND_ICON}
              alt=""
              width={26}
              height={26}
              className="h-[26px] w-[26px] object-contain"
              priority
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-[1.2rem] font-semibold leading-tight tracking-[-0.03em] text-neutral-950 sm:text-[1.28rem]">
              {f.title}
            </h1>
            <p className="mt-0.5 text-[12px] leading-snug text-neutral-500">{f.subtitle}</p>
          </div>
        </div>

        <div className="relative px-5 py-3.5 sm:px-6">
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08, ease: EASE }}
            onSubmit={handleSubmit}
            className="space-y-3"
          >
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800"
              >
                {f.email}
              </label>
              <div className="group/field relative">
                <Mail
                  className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 transition-colors duration-200 group-focus-within/field:text-[#007AFF]"
                  strokeWidth={1.75}
                />
                <Input
                  id="email"
                  type="email"
                  placeholder={f.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                  className="h-10 rounded-xl border-neutral-200/90 bg-white ps-10 text-[14px] shadow-[inset_0_1px_2px_rgba(15,23,42,0.03)] transition-all placeholder:text-neutral-400 hover:border-neutral-300 focus-visible:border-[#007AFF]/70 focus-visible:shadow-[0_0_0_4px_rgba(0,122,255,0.12)] focus-visible:ring-0"
                />
              </div>
            </div>

            <p className="rounded-xl border border-neutral-100 bg-neutral-50/60 px-3.5 py-2.5 text-[12px] leading-relaxed text-neutral-500">
              {f.googleHint}{" "}
              <Link href="/login" className="font-medium text-neutral-800 hover:text-neutral-950">
                {f.googleLink}
              </Link>
              .
            </p>

            <button
              type="submit"
              disabled={loading}
              className="group relative mt-0.5 flex h-10 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-neutral-950 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.12),0_8px_24px_-6px_rgba(0,0,0,0.35)] transition-all hover:bg-neutral-800 active:scale-[0.985] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {f.sending}
                </>
              ) : (
                <>
                  {f.sendLink}
                  <AuthArrowForward className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                </>
              )}
            </button>
          </motion.form>
        </div>
      </div>

      <p className="mt-3 text-center text-[13px] text-neutral-500">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 font-semibold text-neutral-900 underline-offset-3 transition-colors hover:underline"
        >
          <ArrowLeft className={cn("h-3.5 w-3.5", isRtl && "scale-x-[-1]")} />
          {f.backToSignIn}
        </Link>
      </p>
    </div>
  );
}
