"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store,
  Tag,
  Coins,
  Check,
  Briefcase,
  LayoutTemplate,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FadeIn } from "@/components/ui/motion";
import { useOnboardingStore } from "@/lib/store";
import { CURRENCIES, STORE_CATEGORIES } from "@/types";
import { cn } from "@/lib/utils";
import { FounderFlowRoot, useFounderFlowLocale } from "@/components/founder/founder-flow-root";
import { FounderLanguageSwitcher } from "@/components/shared/language-switcher";
import { LandingArrowForward } from "@/components/landing/landing-direction-icon";
import {
  isBusinessModel,
  type BusinessModel,
} from "@/lib/onboarding/business-models";
import {
  getOnboardingExtendedCopy,
  ONBOARDING_TOTAL_STEPS,
} from "@/lib/onboarding/onboarding-i18n";
import { OnboardingBusinessModelStep } from "@/components/onboarding/onboarding-business-model-step";
import { OnboardingWebsiteStep } from "@/components/onboarding/onboarding-website-step";
import type { WebsiteTemplateId } from "@/lib/website-templates/types";

const STORE_LANGUAGES = ["en", "fr", "ar"] as const;
type StoreLanguage = (typeof STORE_LANGUAGES)[number];

function hydrateBusinessModels(data: {
  businessModels?: BusinessModel[];
  businessModel?: BusinessModel;
}): BusinessModel[] {
  if (data.businessModels?.length) {
    return data.businessModels.filter(isBusinessModel);
  }
  if (data.businessModel && isBusinessModel(data.businessModel)) {
    return [data.businessModel];
  }
  return [];
}

function OnboardingWizardInner() {
  const router = useRouter();
  const { copy, locale, isRtl } = useFounderFlowLocale();
  const extended = getOnboardingExtendedCopy(locale);
  const o = copy.onboarding;
  const { step, data, setStep, setData, reset } = useOnboardingStore();
  const [loading, setLoading] = useState(false);
  const [businessModels, setBusinessModels] = useState<BusinessModel[]>(() =>
    hydrateBusinessModels(data)
  );
  const [websiteTemplateId, setWebsiteTemplateId] = useState<WebsiteTemplateId | "">(
    data.websiteTemplateId ?? ""
  );
  const [storeName, setStoreName] = useState(data.storeName ?? "");
  const [description, setDescription] = useState(data.description ?? "");
  const [phone, setPhone] = useState(data.phone ?? "");
  const [category, setCategory] = useState(data.category ?? "");
  const [currency, setCurrency] = useState<string>(data.currency ?? "MAD");
  const [language, setLanguage] = useState<StoreLanguage>(
    STORE_LANGUAGES.includes(data.language as StoreLanguage)
      ? (data.language as StoreLanguage)
      : "en"
  );

  const steps = [
    {
      number: 1,
      title: extended.steps.businessModel.title,
      icon: Briefcase,
      description: extended.steps.businessModel.description,
    },
    {
      number: 2,
      title: extended.steps.website.title,
      icon: LayoutTemplate,
      description: extended.steps.website.description,
    },
    {
      number: 3,
      title: extended.steps.storeName.title,
      icon: Store,
      description: extended.steps.storeName.description,
    },
    {
      number: 4,
      title: extended.steps.category.title,
      icon: Tag,
      description: extended.steps.category.description,
    },
    {
      number: 5,
      title: extended.steps.currency.title,
      icon: Coins,
      description: extended.steps.currency.description,
    },
  ];

  const progress = (step / ONBOARDING_TOTAL_STEPS) * 100;

  const handleNext = () => {
    if (step === 1) {
      if (businessModels.length === 0) {
        toast.error(extended.errors.businessModelRequired);
        return;
      }
      setData({ businessModels });
      setStep(2);
    } else if (step === 2) {
      if (!websiteTemplateId) {
        toast.error(extended.errors.templateRequired);
        return;
      }
      setData({ websiteTemplateId });
      setStep(3);
    } else if (step === 3) {
      if (!storeName.trim()) {
        toast.error(extended.errors.storeNameRequired);
        return;
      }
      setData({
        storeName: storeName.trim(),
        description: description.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      setStep(4);
    } else if (step === 4) {
      if (!category) {
        toast.error(extended.errors.categoryRequired);
        return;
      }
      setData({ category });
      setStep(5);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: storeName.trim(),
          category,
          currency,
          businessModels,
          websiteTemplateId,
          description: description.trim() || undefined,
          phone: phone.trim() || undefined,
          language,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message ?? extended.errors.createFailed);
      }

      const created = await response.json();
      const slug = created?.store?.slug as string | undefined;

      reset();
      toast.success(o.success, {
        description: slug
          ? `Your website is live at /store/${slug}`
          : undefined,
        action: slug
          ? {
              label: "Open site",
              onClick: () =>
                window.open(`/store/${slug}`, "_blank", "noopener,noreferrer"),
            }
          : undefined,
      });
      router.push("/dashboard?launch=1");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : extended.errors.generic);
    } finally {
      setLoading(false);
    }
  };

  const categoryLabel = (value: string) =>
    copy.categories[value as keyof typeof copy.categories] ?? value;

  const businessModelsLabel =
    businessModels.length > 0
      ? businessModels.map((id) => extended.businessModels[id]).join(" · ")
      : extended.launch.summaryEmpty;

  const templateLabel = websiteTemplateId
    ? extended.templates[websiteTemplateId]?.name ?? websiteTemplateId
    : extended.launch.summaryEmpty;

  const summaryRows = [
    { label: extended.launch.summaryModels, value: businessModelsLabel },
    { label: extended.launch.summaryTemplate, value: templateLabel },
    { label: extended.launch.summaryCategory, value: categoryLabel(category) },
    { label: extended.launch.summaryCurrency, value: currency },
    {
      label: extended.launch.summaryLanguage,
      value: extended.launch.languages[language],
    },
    {
      label: extended.launch.summaryPhone,
      value: phone.trim() || extended.launch.summaryEmpty,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl">
      <FadeIn>
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between gap-1 overflow-x-auto pb-1">
            {steps.map((s) => {
              const done = step > s.number;
              const active = step === s.number;
              return (
                <div key={s.number} className="flex min-w-0 flex-1 items-center">
                  <div className="flex min-w-0 flex-col items-center gap-1.5">
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full text-sm transition-all duration-300 sm:h-10 sm:w-10",
                        done || active
                          ? "bg-[#007AFF] text-white shadow-sm shadow-[#007AFF]/25"
                          : "bg-neutral-100 text-neutral-400",
                        active && "ring-4 ring-[#007AFF]/15"
                      )}
                      title={s.description}
                    >
                      {done ? (
                        <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <s.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "hidden truncate text-[11px] font-medium sm:block",
                        active ? "text-neutral-900" : "text-neutral-400"
                      )}
                    >
                      {s.title}
                    </span>
                  </div>
                  {s.number < ONBOARDING_TOTAL_STEPS ? (
                    <div
                      className={cn(
                        "mx-1 mb-5 hidden h-px flex-1 sm:block",
                        step > s.number ? "bg-[#007AFF]" : "bg-neutral-200"
                      )}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="h-1 bg-neutral-100" />
          <p className="mt-2 text-center text-sm text-neutral-500">
            {o.stepOf(step, ONBOARDING_TOTAL_STEPS)}
          </p>
        </div>
      </FadeIn>

      <div className="rounded-3xl border border-neutral-200/80 bg-white/90 p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:p-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
              transition={{ duration: 0.3 }}
            >
              <OnboardingBusinessModelStep
                copy={extended}
                value={businessModels}
                onChange={setBusinessModels}
              />
            </motion.div>
          )}

          {step === 2 && businessModels.length > 0 ? (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
              transition={{ duration: 0.3 }}
            >
              <OnboardingWebsiteStep
                copy={extended}
                businessModels={businessModels}
                value={websiteTemplateId}
                onChange={setWebsiteTemplateId}
              />
            </motion.div>
          ) : null}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-[1.75rem]">
                  {extended.brand.heading}
                </h2>
                <p className="mt-2 text-sm text-neutral-500 sm:text-[15px]">
                  {extended.brand.subheading}
                </p>
              </div>
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="storeName">{extended.brand.nameLabel}</Label>
                  <Input
                    id="storeName"
                    placeholder={extended.brand.namePlaceholder}
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    autoFocus
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline">{extended.brand.taglineLabel}</Label>
                  <Input
                    id="tagline"
                    placeholder={extended.brand.taglinePlaceholder}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={160}
                    className="h-11 rounded-xl"
                  />
                  <p className="text-xs text-neutral-400">{extended.brand.taglineHint}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{extended.brand.phoneLabel}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={extended.brand.phonePlaceholder}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-11 rounded-xl"
                  />
                  <p className="text-xs text-neutral-400">{extended.brand.phoneHint}</p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-[1.75rem]">
                  {extended.category.heading}
                </h2>
                <p className="mt-2 text-sm text-neutral-500 sm:text-[15px]">
                  {extended.category.subheading}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {STORE_CATEGORIES.map((cat) => {
                  const selected = category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={cn(
                        "rounded-2xl border p-4 text-start text-sm font-medium transition-all duration-200",
                        selected
                          ? "border-[#007AFF] bg-[#007AFF]/[0.04] text-[#007AFF] shadow-sm"
                          : "border-neutral-200/80 bg-white/60 text-neutral-800 hover:border-neutral-300 hover:bg-white"
                      )}
                    >
                      <span className="flex items-center justify-between gap-2">
                        {categoryLabel(cat.value)}
                        {selected ? (
                          <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-[1.75rem]">
                  {extended.launch.heading}
                </h2>
                <p className="mt-2 text-sm text-neutral-500 sm:text-[15px]">
                  {extended.launch.subheading}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{extended.launch.currencyLabel}</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder={extended.launch.currencyPlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((cur) => (
                        <SelectItem key={cur.value} value={cur.value}>
                          {cur.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{extended.launch.languageLabel}</Label>
                  <Select
                    value={language}
                    onValueChange={(value) => setLanguage(value as StoreLanguage)}
                  >
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder={extended.launch.languagePlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {STORE_LANGUAGES.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {extended.launch.languages[lang]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-neutral-50/80">
                <div className="border-b border-neutral-200/70 px-4 py-3">
                  <p className="text-sm font-semibold text-neutral-900">
                    {extended.launch.summaryTitle}
                  </p>
                  <p className="mt-0.5 text-base font-medium tracking-tight text-neutral-950">
                    {storeName.trim() || extended.launch.summaryEmpty}
                  </p>
                  {description.trim() ? (
                    <p className="mt-1 text-sm text-neutral-500">{description.trim()}</p>
                  ) : null}
                </div>
                <dl className="divide-y divide-neutral-200/70">
                  {summaryRows.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-start justify-between gap-4 px-4 py-2.5 text-sm"
                    >
                      <dt className="text-neutral-500">{row.label}</dt>
                      <dd className="max-w-[60%] text-end font-medium text-neutral-900">
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 flex justify-between border-t border-neutral-200/80 pt-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1}
            className={cn(step === 1 && "invisible")}
          >
            <ArrowLeft className={cn("me-1 h-4 w-4", isRtl && "scale-x-[-1]")} />
            {o.back}
          </Button>

          {step < ONBOARDING_TOTAL_STEPS ? (
            <Button
              onClick={handleNext}
              className="rounded-xl bg-[#007AFF] px-5 hover:bg-[#0066d6]"
            >
              {o.continue}
              <LandingArrowForward className="ms-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              loading={loading}
              className="rounded-xl bg-[#007AFF] px-5 hover:bg-[#0066d6]"
            >
              {o.launchStore}
              <LandingArrowForward className="ms-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function OnboardingPageClient() {
  const { copy, locale } = useFounderFlowLocale();
  const extended = getOnboardingExtendedCopy(locale);
  const o = copy.onboarding;

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-x-hidden bg-[#F7F8FA] p-4">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[36vh] w-[85vw] -translate-x-1/2 rounded-full bg-[#007AFF]/[0.07] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-sky-200/25 blur-3xl" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center py-5 sm:py-8">
        <div className="mb-5 max-w-xl text-center sm:mb-7">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
            {o.pageTitle}
          </h1>
          <p className="mt-1.5 text-sm text-neutral-500 sm:text-[15px]">
            {extended.pageSubtitle}
          </p>
        </div>

        <OnboardingWizardInner />
      </div>

      <footer className="flex flex-col items-center gap-3 py-4 text-[11px] text-neutral-400">
        <FounderLanguageSwitcher variant="footer" />
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link href="/help" className="font-medium transition-colors hover:text-neutral-600">
            {copy.shell.help}
          </Link>
          <span aria-hidden>·</span>
          <Link href="/contact" className="font-medium transition-colors hover:text-neutral-600">
            {copy.shell.mobileNav.contact}
          </Link>
          <span aria-hidden>·</span>
          <span>{copy.shell.footer(new Date().getFullYear())}</span>
        </div>
      </footer>
    </div>
  );
}

export function OnboardingPageClientRoot() {
  return (
    <FounderFlowRoot>
      <OnboardingPageClient />
    </FounderFlowRoot>
  );
}
