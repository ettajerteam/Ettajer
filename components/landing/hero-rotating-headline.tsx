"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LandingCarousel } from "@/components/landing/landing-mobile-carousel";
import { useLandingLocale } from "@/components/landing/landing-locale-context";
import type { HeroSlide } from "@/lib/landing/landing-i18n";

const EASE = [0.22, 1, 0.36, 1] as const;
const INTERVAL_MS = 5000;

function TitleLineView({ line }: { line: HeroSlide["lines"][0] }) {
  if (!line.highlight) {
    return (
      <span>
        {line.before}
        {line.after ?? ""}
      </span>
    );
  }

  return (
    <span>
      {line.before}
      <span className="text-[#007AFF] md:text-blue-600">{line.highlight}</span>
      {line.after ?? ""}
    </span>
  );
}

function HeroSlideContent({ slide }: { slide: HeroSlide }) {
  return (
    <div className="text-center md:text-start md:text-center">
      <h1 className="text-[2rem] font-bold leading-[1.1] tracking-tight text-neutral-900 sm:text-4xl md:text-[2.65rem] md:font-semibold md:leading-[1.12] lg:text-5xl lg:leading-[1.1]">
        {slide.lines.map((line, lineIndex) => (
          <span key={lineIndex} className="block">
            <TitleLineView line={line} />
          </span>
        ))}
      </h1>
      <p className="mt-5 text-[17px] leading-relaxed text-[#8E8E93] md:mx-auto md:mt-5 md:max-w-2xl md:text-base md:text-neutral-500 lg:text-lg">
        {slide.subtitle}
      </p>
    </div>
  );
}

export function HeroRotatingHeadline() {
  const { content, copy } = useLandingLocale();
  const slides = content.heroSlides;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [slides]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  const slide = slides[index];

  return (
    <>
      <div className="md:hidden">
        <LandingCarousel
          autoplayMs={INTERVAL_MS}
          slideWidth={96}
          edgeToEdge
          showCounter
          ariaLabel={copy.hero.carouselAria}
          gap={14}
        >
          {slides.map((heroSlide, i) => (
            <HeroSlideContent key={i} slide={heroSlide} />
          ))}
        </LandingCarousel>
      </div>

      <div className="relative hidden md:block">
        <div className="relative min-h-[12.5rem]">
          <AnimatePresence mode="wait">
            <motion.h1
              key={`title-${index}-${slide.lines[0]?.before}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.55, ease: EASE }}
              className="text-[2.65rem] font-semibold leading-[1.12] tracking-tight text-neutral-900 lg:text-5xl lg:leading-[1.1]"
            >
              {slide.lines.map((line, lineIndex) => (
                <span key={lineIndex} className="block">
                  <TitleLineView line={line} />
                </span>
              ))}
            </motion.h1>
          </AnimatePresence>
        </div>

        <div className="relative mx-auto mt-5 min-h-[4.75rem] max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.p
              key={`subtitle-${index}-${slide.subtitle}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.05 }}
              className="text-lg leading-relaxed text-neutral-500"
            >
              {slide.subtitle}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex justify-center gap-1.5" aria-hidden>
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index
                  ? "w-6 bg-blue-600"
                  : "w-1.5 bg-neutral-200 hover:bg-neutral-300"
              }`}
              aria-label={copy.hero.showHeadlineAria(i + 1)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
