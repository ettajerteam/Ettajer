"use client";

import {
  Store,
  Palette,
  CreditCard,
  Globe,
  BarChart3,
  Smartphone,
} from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";

const features = [
  {
    icon: Store,
    title: "Beautiful Storefronts",
    description:
      "Choose from 3 stunning templates. Customize colors, fonts, and logo with live preview.",
  },
  {
    icon: Palette,
    title: "Apple-Inspired Design",
    description:
      "Clean, minimal interface your customers will love. Glassmorphism, smooth animations, dark mode.",
  },
  {
    icon: CreditCard,
    title: "Local Payments",
    description:
      "Accept Stripe, cash on delivery, and local payment methods. Multi-currency: MAD, DZD, TND.",
  },
  {
    icon: Globe,
    title: "Multi-Language",
    description:
      "Sell in Arabic, French, and English. Full RTL support for Arabic storefronts.",
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description:
      "Track sales, orders, visitors, and conversion rates. Make data-driven decisions.",
  },
  {
    icon: Smartphone,
    title: "Mobile-First",
    description:
      "Manage your store from anywhere. Responsive dashboard works perfectly on all devices.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Everything you need to
            <span className="text-gradient"> sell online</span>
          </h2>
          <p className="text-lg text-muted-foreground font-light max-w-2xl mx-auto">
            Powerful features designed for Moroccan merchants, without the complexity
            or high costs of international platforms.
          </p>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <StaggerItem key={feature.title}>
              <div className="group rounded-2xl border bg-card/50 backdrop-blur-sm p-8 h-full transition-all duration-300 hover:shadow-glass hover:border-primary/20 hover:-translate-y-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#007AFF]/10 to-[#5856D6]/10 mb-6 group-hover:from-[#007AFF]/20 group-hover:to-[#5856D6]/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-[#007AFF]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
