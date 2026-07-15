"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { PRICING_PLANS } from "@/types";
import { cn } from "@/lib/utils";

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 lg:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Simple, transparent
            <span className="text-gradient"> pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground font-light max-w-2xl mx-auto">
            Up to 70% cheaper than Shopify. No hidden fees. Start free, upgrade when you grow.
          </p>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PRICING_PLANS.map((plan) => (
            <StaggerItem key={plan.name}>
              <div
                className={cn(
                  "relative rounded-2xl border p-8 h-full flex flex-col transition-all duration-300",
                  plan.highlighted
                    ? "bg-gradient-to-b from-[#007AFF]/5 to-transparent border-[#007AFF]/30 shadow-glass-lg scale-[1.02]"
                    : "bg-card/50 backdrop-blur-sm hover:shadow-glass"
                )}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-gradient-to-r from-[#007AFF] to-[#5856D6] px-4 py-1 text-xs font-medium text-white">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">
                    {plan.currency}/{plan.period}
                  </span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="h-4 w-4 text-[#007AFF] mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.highlighted ? "default" : "outline"}
                  className="w-full"
                  size="lg"
                  asChild
                >
                  <Link href="/signup">Get started</Link>
                </Button>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
