"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/motion";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#007AFF]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#5856D6]/10 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-center lg:text-left">
            <FadeIn delay={0.1}>
              <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-sm font-medium mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#007AFF] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#007AFF]" />
                </span>
                Built for Moroccan merchants
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
                Sell online.
                <br />
                <span className="text-gradient">Beautifully simple.</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.3}>
              <p className="text-lg sm:text-xl text-muted-foreground font-light max-w-lg mx-auto lg:mx-0 mb-10 leading-relaxed">
                Ettajer is the Shopify alternative for North Africa. Launch your store in minutes
                with Apple-inspired design and pricing that makes sense.
              </p>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="xl" asChild>
                  <Link href="/signup">
                    Start for free
                    <ArrowRight className="ml-1" />
                  </Link>
                </Button>
                <Button size="xl" variant="outline" asChild>
                  <a href="#features">
                    <Play className="mr-1 h-4 w-4" />
                    See how it works
                  </a>
                </Button>
              </div>
            </FadeIn>

            <FadeIn delay={0.5}>
              <p className="mt-6 text-sm text-muted-foreground">
                No credit card required · Free 14-day trial · Cancel anytime
              </p>
            </FadeIn>
          </div>

          <FadeIn delay={0.3} direction="left" className="relative">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative mx-auto max-w-lg"
            >
              <div className="rounded-3xl glass p-2 shadow-glass-lg">
                <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 aspect-[4/3]">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                    <div className="ml-4 h-6 flex-1 rounded-lg bg-white/50 dark:bg-white/10" />
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {["12.4K", "847", "3.2%"].map((stat, i) => (
                      <div key={i} className="rounded-xl bg-white/80 dark:bg-white/5 p-3 text-center">
                        <div className="text-lg font-bold text-[#007AFF]">{stat}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {["Sales", "Orders", "Conv."][i]}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 rounded-xl bg-white/60 dark:bg-white/5 p-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#007AFF]/20 to-[#5856D6]/20" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-2 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                          <div className="h-2 w-1/2 rounded bg-gray-100 dark:bg-gray-800" />
                        </div>
                        <div className="h-6 w-16 rounded-full bg-green-100 dark:bg-green-900/30 text-[10px] flex items-center justify-center text-green-600">
                          Paid
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 rounded-2xl glass px-4 py-3 shadow-glass">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <span className="text-green-500 text-xs">✓</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium">New order!</p>
                    <p className="text-[10px] text-muted-foreground">+299 MAD</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
