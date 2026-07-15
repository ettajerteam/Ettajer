"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Mail,
  MessageCircle,
  Clock,
  CheckCircle2,
  Headphones,
  ChevronRight,
} from "lucide-react";
import type { ContactSupportInput } from "@/lib/validations/contact";
import { toLandingLocale } from "@/lib/landing/landing-i18n";
import {
  getContactApiCopy,
  getContactCopy,
  getContactTopics,
  localizeContactValidationMessage,
} from "@/lib/contact/contact-i18n";
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from "@/lib/constants/support";
import { HelpShell } from "@/components/help/help-shell";
import { useHelpLocale } from "@/components/help/help-locale-provider";
import {
  HelpMobileHeader,
  HelpMobileCard,
  HelpMobileGroup,
  HelpMobileSectionLabel,
} from "@/components/help/help-mobile-ui";
import { LandingCarousel } from "@/components/landing/landing-mobile-carousel";
import { cn } from "@/lib/utils";

const inputClassName =
  "w-full rounded-[0.75rem] border-0 bg-[#F2F2F7] px-4 py-3.5 text-[17px] text-neutral-900 outline-none transition-all placeholder:text-[#8E8E93] focus:bg-white focus:ring-2 focus:ring-[#007AFF]/25 md:rounded-xl md:border md:border-neutral-200 md:bg-white md:py-3 md:text-sm md:placeholder:text-neutral-400 md:focus:border-blue-600 md:focus:ring-blue-600/15";

type ContactSupportPageProps = {
  initialTopic?: ContactSupportInput["topic"];
  articleRef?: string;
};

export function ContactSupportPage({
  initialTopic,
  articleRef,
}: ContactSupportPageProps = {}) {
  const { locale } = useHelpLocale();
  const copy = getContactCopy(locale);
  const apiCopy = getContactApiCopy(locale);
  const topics = getContactTopics(locale);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState<ContactSupportInput["topic"]>(
    initialTopic ?? topics[0].value,
  );
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (initialTopic) setTopic(initialTopic);
  }, [initialTopic]);

  useEffect(() => {
    if (articleRef) {
      setMessage((current) =>
        current ? current : getContactCopy(locale).articlePrefill(articleRef),
      );
    }
  }, [articleRef, locale]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setFeedback("");

    try {
      const storedLocale = toLandingLocale(
        localStorage.getItem("ettajer-landing-locale") ?? "en",
      );
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, topic, message, articleRef, locale: storedLocale }),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setStatus("error");
        setFeedback(
          localizeContactValidationMessage(locale, data.message) ??
            apiCopy.failedToSend,
        );
        return;
      }

      setStatus("success");
      setFeedback(data.message ?? apiCopy.success);
      setName("");
      setEmail("");
      setTopic(topics[0].value);
      setMessage("");
    } catch {
      setStatus("error");
      setFeedback(apiCopy.failedToSend);
    }
  }

  function resetForm() {
    setStatus("idle");
    setFeedback("");
  }

  return (
    <HelpShell>
      {/* Hero */}
      <section className="border-b border-black/[0.04] bg-[#F2F2F7] md:border-neutral-200 md:bg-neutral-50">
        <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-20">
          <div className="mx-auto max-w-2xl md:text-center">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#007AFF] text-white shadow-[0_4px_14px_rgba(0,122,255,0.35)] md:mx-auto md:mb-6 md:shadow-lg md:shadow-blue-600/20">
              <Headphones className="h-5 w-5" strokeWidth={2} />
            </div>
            <HelpMobileHeader
              eyebrow={copy.hero.eyebrow}
              title={copy.hero.title}
              subtitle={copy.hero.subtitle}
            />
          </div>

          {/* Mobile: stats carousel */}
          <div className="mx-auto mt-8 max-w-3xl md:hidden">
            <LandingCarousel slideWidth={72} edgeToEdge ariaLabel={copy.hero.statsAria} gap={10} showDots={false}>
              {copy.stats.map((stat) => (
                <HelpMobileCard key={stat.label} className="py-4 text-center">
                  <p className="text-[1.5rem] font-bold tracking-tight text-neutral-900">{stat.value}</p>
                  <p className="mt-1 text-[14px] font-medium text-[#8E8E93]">{stat.label}</p>
                </HelpMobileCard>
              ))}
            </LandingCarousel>
          </div>

          <div className="mx-auto mt-12 hidden max-w-3xl grid-cols-3 gap-6 border-t border-neutral-200/80 pt-10 md:grid">
            {copy.stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-xl font-semibold tracking-tight text-neutral-900">{stat.value}</p>
                <p className="mt-1 text-sm text-neutral-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
          {/* Sidebar — below form on mobile */}
          <div className="order-2 lg:order-1 lg:sticky lg:top-28 lg:self-start">
            <HelpMobileSectionLabel
              title={copy.sidebar.title}
              subtitle={copy.sidebar.subtitle}
            />

            <HelpMobileGroup className="md:shadow-none md:border md:border-neutral-200">
              <a
                href={SUPPORT_MAILTO}
                className="flex items-center gap-4 border-b border-[#E5E5EA] px-4 py-4 active:bg-[#F2F2F7]/80 md:px-5 md:py-5 md:hover:bg-neutral-50"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#007AFF]/10 text-[#007AFF]">
                  <Mail className="h-5 w-5" strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[17px] font-semibold text-neutral-900 md:text-sm md:font-medium">{copy.sidebar.emailTitle}</p>
                  <p className="mt-0.5 text-[15px] text-[#007AFF] md:text-sm">{SUPPORT_EMAIL}</p>
                  <p className="mt-0.5 text-[13px] text-[#8E8E93] md:text-xs md:text-neutral-400">
                    {copy.sidebar.emailHint}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-[#C7C7CC]" />
              </a>

              <div className="flex items-center gap-4 border-b border-[#E5E5EA] px-4 py-4 md:px-5 md:py-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F2F2F7] text-[#8E8E93]">
                  <Clock className="h-5 w-5" strokeWidth={2} />
                </span>
                <div>
                  <p className="text-[17px] font-semibold text-neutral-900 md:text-sm md:font-medium">
                    {copy.sidebar.responseTimeTitle}
                  </p>
                  <p className="mt-0.5 text-[15px] text-[#8E8E93] md:text-sm md:text-neutral-500">
                    {copy.sidebar.responseTimeBody}
                  </p>
                </div>
              </div>

              <Link
                href="/help"
                className="flex items-center gap-4 px-4 py-4 active:bg-[#F2F2F7]/80 md:px-5 md:py-5 md:hover:bg-neutral-50"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#34C759]/10 text-[#34C759]">
                  <MessageCircle className="h-5 w-5" strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[17px] font-semibold text-neutral-900 md:text-sm md:font-medium">
                    {copy.sidebar.helpCenterTitle}
                  </p>
                  <p className="mt-0.5 text-[15px] text-[#8E8E93] md:text-sm md:text-neutral-500">
                    {copy.sidebar.helpCenterBody}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-[#C7C7CC]" />
              </Link>
            </HelpMobileGroup>

            <HelpMobileCard className="mt-5 border border-[#007AFF]/15 bg-[#007AFF]/8 md:mt-8 md:rounded-2xl md:border-blue-100 md:bg-blue-50/60 md:shadow-none">
              <p className="text-[16px] font-semibold text-[#007AFF] md:text-sm md:font-medium md:text-blue-900">
                {copy.sidebar.promoTitle}
              </p>
              <p className="mt-1.5 text-[15px] leading-relaxed text-neutral-700 md:text-sm md:text-blue-800/80">
                {copy.sidebar.promoBody}{" "}
                <Link href="/#pricing" className="font-semibold text-[#007AFF] underline-offset-2 hover:underline">
                  {copy.sidebar.seePricing}
                </Link>
              </p>
            </HelpMobileCard>
          </div>

          {/* Form — first on mobile */}
          <div className="order-1 lg:order-2 overflow-hidden rounded-[0.875rem] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_28px_rgba(0,0,0,0.08)] md:rounded-3xl md:border md:border-neutral-200 md:shadow-sm">
            {status === "success" ? (
              <div className="flex flex-col items-center px-5 py-12 text-center md:px-10 md:py-16">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#34C759]/15 text-[#34C759]">
                  <CheckCircle2 className="h-8 w-8" strokeWidth={2} />
                </span>
                <h2 className="mt-6 text-[1.5rem] font-bold tracking-tight text-neutral-900 md:text-2xl md:font-semibold">
                  {copy.success.title}
                </h2>
                <p className="mt-3 max-w-sm text-[16px] leading-relaxed text-[#8E8E93] md:text-sm md:text-neutral-500">
                  {copy.success.body(SUPPORT_EMAIL)}
                </p>
                <div className="mt-8 flex w-full flex-col gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="h-12 w-full rounded-[0.875rem] bg-[#F2F2F7] text-[16px] font-semibold text-neutral-900 active:bg-[#E5E5EA] md:rounded-full md:border md:border-neutral-200 md:bg-white md:py-3 md:text-sm md:font-medium md:hover:bg-neutral-50"
                  >
                    {copy.success.sendAnother}
                  </button>
                  <Link
                    href="/"
                    className="inline-flex h-12 w-full items-center justify-center rounded-[0.875rem] bg-neutral-900 text-[16px] font-semibold text-white active:bg-neutral-800 md:rounded-full md:py-3 md:text-sm md:font-medium md:hover:bg-neutral-800"
                  >
                    {copy.success.backHome}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-5 md:p-8 lg:p-10">
                <h2 className="text-[1.35rem] font-bold tracking-tight text-neutral-900 md:text-xl md:font-semibold">
                  {copy.form.title}
                </h2>
                <p className="mt-2 text-[15px] text-[#8E8E93] md:text-sm md:text-neutral-500">
                  {copy.form.subtitle}
                </p>

                <form onSubmit={handleSubmit} className="mt-7 space-y-5 md:mt-8 md:space-y-6">
                  <div className="space-y-5 md:grid md:grid-cols-2 md:gap-5 md:space-y-0">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-[14px] font-semibold text-[#8E8E93] md:text-sm md:font-medium md:text-neutral-700">
                        {copy.form.nameLabel}
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={inputClassName}
                        placeholder={copy.form.namePlaceholder}
                        autoComplete="name"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-[14px] font-semibold text-[#8E8E93] md:text-sm md:font-medium md:text-neutral-700">
                        {copy.form.emailLabel}
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClassName}
                        placeholder={copy.form.emailPlaceholder}
                        autoComplete="email"
                        inputMode="email"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[14px] font-semibold text-[#8E8E93] md:text-sm md:font-medium md:text-neutral-700">
                      {copy.form.topicLabel}
                    </label>
                    {/* Mobile: horizontal topic scroll */}
                    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden">
                      {topics.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setTopic(item.value)}
                          className={cn(
                            "shrink-0 rounded-full px-4 py-2.5 text-[14px] font-semibold transition-all active:scale-95",
                            topic === item.value
                              ? "bg-[#007AFF] text-white shadow-[0_2px_8px_rgba(0,122,255,0.35)]"
                              : "bg-[#F2F2F7] text-neutral-700",
                          )}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                    <div className="hidden flex-wrap gap-2 md:flex">
                      {topics.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setTopic(item.value)}
                          className={cn(
                            "rounded-full border px-3.5 py-2 text-sm transition-all",
                            topic === item.value
                              ? "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                              : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:text-neutral-900",
                          )}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-[14px] font-semibold text-[#8E8E93] md:text-sm md:font-medium md:text-neutral-700">
                      {copy.form.messageLabel}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className={cn(inputClassName, "min-h-[10rem] resize-none")}
                      placeholder={copy.form.messagePlaceholder}
                    />
                  </div>

                  {status === "error" && feedback ? (
                    <p className="rounded-[0.75rem] border border-red-200 bg-red-50 px-4 py-3 text-[15px] text-red-700 md:text-sm">
                      {feedback}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="inline-flex h-[3.25rem] w-full items-center justify-center gap-2 rounded-[0.875rem] bg-[#007AFF] text-[17px] font-semibold text-white shadow-[0_4px_14px_rgba(0,122,255,0.35)] transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 md:rounded-full md:py-3.5 md:text-sm md:font-medium md:hover:bg-blue-700"
                  >
                    {status === "loading" ? copy.form.submitting : copy.form.submit}
                    {status !== "loading" ? <ArrowRight className="h-4 w-4" /> : null}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      <section className="border-t border-black/[0.04] bg-[#007AFF] py-14 text-center text-white md:border-neutral-200 md:py-20">
        <div className="mx-auto max-w-2xl space-y-5 px-4 md:space-y-5 md:px-6">
          <h2 className="text-[1.65rem] font-bold tracking-tight md:text-3xl md:font-semibold">
            {copy.cta.title}
          </h2>
          <p className="text-[15px] leading-relaxed text-white/85 md:text-base md:text-blue-100">
            {copy.cta.subtitle}
          </p>
          <Link
            href="/signup"
            className="inline-flex h-12 w-full max-w-xs items-center justify-center rounded-[0.875rem] bg-white text-[16px] font-semibold text-[#007AFF] active:bg-blue-50 md:h-auto md:w-auto md:rounded-full md:px-8 md:py-3.5 md:text-sm md:font-medium md:hover:bg-blue-50"
          >
            {copy.cta.button}
          </Link>
        </div>
      </section>
    </HelpShell>
  );
}
