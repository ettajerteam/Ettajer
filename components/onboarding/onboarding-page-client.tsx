"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Store, Tag, Coins, Check } from "lucide-react";
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
import { CURRENCIES } from "@/types";
import { STORE_CATEGORIES } from "@/types";
import { cn } from "@/lib/utils";
import { FounderFlowRoot, useFounderFlowLocale } from "@/components/founder/founder-flow-root";
import { FounderLanguageSwitcher } from "@/components/shared/language-switcher";
import { LandingArrowForward } from "@/components/landing/landing-direction-icon";
import { ArrowLeft } from "lucide-react";

function OnboardingWizardInner() {
  const router = useRouter();
  const { copy, isRtl } = useFounderFlowLocale();
  const o = copy.onboarding;
  const { step, data, setStep, setData, reset } = useOnboardingStore();
  const [loading, setLoading] = useState(false);
  const [storeName, setStoreName] = useState(data.storeName ?? "");
  const [category, setCategory] = useState(data.category ?? "");
  const [currency, setCurrency] = useState<string>(data.currency ?? "MAD");

  const steps = [
    { number: 1, title: o.steps.storeName.title, icon: Store, description: o.steps.storeName.description },
    { number: 2, title: o.steps.category.title, icon: Tag, description: o.steps.category.description },
    { number: 3, title: o.steps.currency.title, icon: Coins, description: o.steps.currency.description },
  ];

  const progress = (step / 3) * 100;

  const handleNext = () => {
    if (step === 1) {
      if (!storeName.trim()) {
        toast.error(o.errors.storeNameRequired);
        return;
      }
      setData({ storeName: storeName.trim() });
      setStep(2);
    } else if (step === 2) {
      if (!category) {
        toast.error(o.errors.categoryRequired);
        return;
      }
      setData({ category });
      setStep(3);
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
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message ?? o.errors.createFailed);
      }

      reset();
      toast.success(o.success);
      router.push("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : o.errors.generic);
    } finally {
      setLoading(false);
    }
  };

  const categoryLabel = (value: string) =>
    copy.categories[value as keyof typeof copy.categories] ?? value;

  return (
    <div className="w-full max-w-lg mx-auto">
      <FadeIn>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((s) => (
              <div key={s.number} className="flex items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300",
                    step >= s.number
                      ? "bg-gradient-to-br from-[#007AFF] to-[#5856D6] text-white shadow-lg shadow-blue-500/25"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {step > s.number ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                </div>
                {s.number < 3 ? (
                  <div
                    className={cn(
                      "hidden sm:block w-16 lg:w-24 h-0.5 mx-2 transition-colors duration-300",
                      step > s.number ? "bg-[#007AFF]" : "bg-muted",
                    )}
                  />
                ) : null}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-1.5" />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            {o.stepOf(step, 3)}
          </p>
        </div>
      </FadeIn>

      <div className="glass rounded-2xl p-8 shadow-glass-lg">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">{o.step1.heading}</h2>
                <p className="text-muted-foreground">{o.step1.subheading}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeName">{o.step1.label}</Label>
                <Input
                  id="storeName"
                  placeholder={o.step1.placeholder}
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  autoFocus
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
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
                <h2 className="text-2xl font-bold mb-2">{o.step3.heading}</h2>
                <p className="text-muted-foreground">{o.step3.subheading}</p>
              </div>
              <div className="space-y-2">
                <Label>{o.step3.label}</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue placeholder={o.step3.placeholder} />
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

              <div className="rounded-xl bg-muted/50 p-4 text-sm">
                <p className="font-medium mb-1">{o.step3.summaryTitle}</p>
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">{storeName}</span>
                  {" · "}
                  {categoryLabel(category)}
                  {" · "}
                  {currency}
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

          {step < 3 ? (
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
  const { copy } = useFounderFlowLocale();
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
          <p className="text-muted-foreground">{o.pageSubtitle}</p>
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
