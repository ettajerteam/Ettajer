"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store,
  Tag,
  Coins,
  Check,
  Briefcase,
  LayoutTemplate,
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
import { ArrowLeft } from "lucide-react";
import type { BusinessModel } from "@/lib/onboarding/business-models";
import {
  getOnboardingExtendedCopy,
  ONBOARDING_TOTAL_STEPS,
} from "@/lib/onboarding/onboarding-i18n";
import { OnboardingBusinessModelStep } from "@/components/onboarding/onboarding-business-model-step";
import { OnboardingWebsiteStep } from "@/components/onboarding/onboarding-website-step";
import type { WebsiteTemplateId } from "@/lib/website-templates/types";

function OnboardingWizardInner() {
  const router = useRouter();
  const { copy, locale, isRtl } = useFounderFlowLocale();
  const extended = getOnboardingExtendedCopy(locale);
  const o = copy.onboarding;
  const { step, data, setStep, setData, reset } = useOnboardingStore();
  const [loading, setLoading] = useState(false);
  const [businessModel, setBusinessModel] = useState<BusinessModel | "">(
    data.businessModel ?? "",
  );
  const [websiteTemplateId, setWebsiteTemplateId] = useState<WebsiteTemplateId | "">(
    data.websiteTemplateId ?? "",
  );
  const [storeName, setStoreName] = useState(data.storeName ?? "");
  const [category, setCategory] = useState(data.category ?? "");
  const [currency, setCurrency] = useState<string>(data.currency ?? "MAD");

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
      if (!businessModel) {
        toast.error(extended.errors.businessModelRequired);
        return;
      }
      setData({ businessModel });
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
      setData({ storeName: storeName.trim() });
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
          businessModel,
          websiteTemplateId,
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
              onClick: () => window.open(`/store/${slug}`, "_blank", "noopener,noreferrer"),
            }
          : undefined,
      });
      router.push("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : extended.errors.generic);
    } finally {
      setLoading(false);
    }
  };

  const categoryLabel = (value: string) =>
    copy.categories[value as keyof typeof copy.categories] ?? value;

  const businessModelLabel = businessModel
    ? extended.businessModels[businessModel]
    : "—";

  const templateLabel = websiteTemplateId
    ? extended.templates[websiteTemplateId]?.name ?? websiteTemplateId
    : "—";

  return (
    <div className="w-full max-w-2xl mx-auto">
      <FadeIn>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 overflow-x-auto pb-1">
            {steps.map((s) => (
              <div key={s.number} className="flex items-center shrink-0">
                <div
                  className={cn(
                    "flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full transition-all duration-300",
                    step >= s.number
                      ? "bg-gradient-to-br from-[#007AFF] to-[#5856D6] text-white shadow-lg shadow-blue-500/25"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {step > s.number ? (
                    <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <s.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </div>
                {s.number < ONBOARDING_TOTAL_STEPS ? (
                  <div
                    className={cn(
                      "hidden sm:block w-8 lg:w-12 h-0.5 mx-1.5 transition-colors duration-300",
                      step > s.number ? "bg-[#007AFF]" : "bg-muted",
                    )}
                  />
                ) : null}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-1.5" />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            {o.stepOf(step, ONBOARDING_TOTAL_STEPS)}
          </p>
        </div>
      </FadeIn>

      <div className="glass rounded-2xl p-6 sm:p-8 shadow-glass-lg">
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
                value={businessModel}
                onChange={setBusinessModel}
              />
            </motion.div>
          )}

          {step === 2 && businessModel ? (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
              transition={{ duration: 0.3 }}
            >
              <OnboardingWebsiteStep
                copy={extended}
                businessModel={businessModel}
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
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">{extended.step4.heading}</h2>
                <p className="text-muted-foreground">{extended.step4.subheading}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeName">{extended.step4.label}</Label>
                <Input
                  id="storeName"
                  placeholder={extended.step4.placeholder}
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  autoFocus
                />
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
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">{o.step2.heading}</h2>
                <p className="text-muted-foreground">{o.step2.subheading}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {STORE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={cn(
                      "rounded-xl border p-4 text-start text-sm font-medium transition-all duration-200",
                      category === cat.value
                        ? "border-[#007AFF] bg-[#007AFF]/5 text-[#007AFF] shadow-sm"
                        : "hover:border-muted-foreground/30 hover:bg-accent",
                    )}
                  >
                    {categoryLabel(cat.value)}
                  </button>
                ))}
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
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">{extended.step5.heading}</h2>
                <p className="text-muted-foreground">{extended.step5.subheading}</p>
              </div>
              <div className="space-y-2">
                <Label>{extended.step5.label}</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue placeholder={extended.step5.placeholder} />
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

              <div className="rounded-xl bg-muted/50 p-4 text-sm space-y-2">
                <p className="font-medium">{extended.step5.summaryTitle}</p>
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">{storeName}</span>
                </p>
                <p className="text-muted-foreground">
                  {businessModelLabel} · {templateLabel}
                </p>
                <p className="text-muted-foreground">
                  {categoryLabel(category)} · {currency}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between mt-8 pt-6 border-t">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1}
            className={cn(step === 1 && "invisible")}
          >
            <ArrowLeft className={cn("h-4 w-4 me-1", isRtl && "scale-x-[-1]")} />
            {o.back}
          </Button>

          {step < ONBOARDING_TOTAL_STEPS ? (
            <Button onClick={handleNext}>
              {o.continue}
              <LandingArrowForward className="h-4 w-4 ms-1" />
            </Button>
          ) : (
            <Button onClick={handleComplete} loading={loading}>
              {o.launchStore}
              <LandingArrowForward className="h-4 w-4 ms-1" />
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
    <div className="relative flex min-h-screen flex-col overflow-hidden p-4">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#007AFF]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#5856D6]/10 rounded-full blur-3xl" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{o.pageTitle}</h1>
          <p className="text-muted-foreground">{extended.pageSubtitle}</p>
        </div>

        <OnboardingWizardInner />
      </div>

      <footer className="flex justify-center py-6">
        <FounderLanguageSwitcher variant="footer" />
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
