"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/motion";

export function CTASection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#007AFF] to-[#5856D6]" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

            <div className="relative px-8 py-16 sm:px-16 sm:py-24 text-center">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
                Ready to start selling?
              </h2>
              <p className="text-lg text-white/80 font-light max-w-xl mx-auto mb-10">
                Join thousands of Moroccan merchants who chose Ettajer to grow their business online.
              </p>
              <Button
                size="xl"
                variant="secondary"
                className="bg-white text-[#007AFF] hover:bg-white/90 shadow-xl"
                asChild
              >
                <Link href="/signup">
                  Create your store
                  <ArrowRight className="ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
