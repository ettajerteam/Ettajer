"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { LANDING_MOBILE_CAROUSEL_BREAKOUT, LANDING_MOBILE_GUTTER } from "@/components/landing/landing-mobile-ui";

const IOS_BLUE = "#007AFF";

type LandingCarouselProps = {
  children: React.ReactNode;
  className?: string;
  slideClassName?: string;
  showDots?: boolean;
  showCounter?: boolean;
  autoplayMs?: number;
  slideWidth?: number;
  ariaLabel?: string;
  gap?: number;
  edgeToEdge?: boolean;
};

export function LandingCarousel({
  children,
  className,
  slideClassName,
  showDots = true,
  showCounter = false,
  autoplayMs,
  slideWidth = 94,
  ariaLabel = "Carousel",
  gap = 14,
  edgeToEdge = false,
}: LandingCarouselProps) {
  const slides = Children.toArray(children);
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pauseUntilRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const slideCount = slides.length;

  const pauseAutoplay = useCallback(() => {
    pauseUntilRef.current = Date.now() + 10_000;
  }, []);

  const scrollToIndex = useCallback(
    (index: number) => {
      const el = scrollRef.current;
      if (!el || slideCount === 0) return;
      const clamped = Math.min(Math.max(index, 0), slideCount - 1);
      const child = el.children[clamped] as HTMLElement | undefined;
      if (!child) return;

      const targetLeft = child.offsetLeft - (el.clientWidth - child.offsetWidth) / 2;
      el.scrollTo({ left: Math.max(0, targetLeft), behavior: "smooth" });
    },
    [slideCount],
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry?.isIntersecting ?? false),
      { threshold: 0.15 },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || slideCount === 0) return;

    const center = el.scrollLeft + el.clientWidth / 2;
    let closest = 0;
    let minDist = Infinity;

    Array.from(el.children).forEach((child, i) => {
      const node = child as HTMLElement;
      const childCenter = node.offsetLeft + node.offsetWidth / 2;
      const dist = Math.abs(center - childCenter);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });

    setActiveIndex(closest);
  }, [slideCount]);

  useEffect(() => {
    if (!autoplayMs || slideCount <= 1 || !isVisible) return;

    const timer = window.setInterval(() => {
      if (Date.now() < pauseUntilRef.current) return;

      setActiveIndex((prev) => {
        const next = (prev + 1) % slideCount;
        scrollToIndex(next);
        return next;
      });
    }, autoplayMs);

    return () => window.clearInterval(timer);
  }, [autoplayMs, slideCount, scrollToIndex, isVisible]);

  if (slideCount === 0) return null;

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative w-full max-w-full min-w-0 overflow-hidden",
        edgeToEdge && LANDING_MOBILE_CAROUSEL_BREAKOUT,
        className,
      )}
    >
      <div
        ref={scrollRef}
        onScroll={onScroll}
        onTouchStart={pauseAutoplay}
        onMouseDown={pauseAutoplay}
        className={cn(
          "flex w-full max-w-full min-w-0 snap-x snap-mandatory overflow-x-auto overscroll-x-contain pb-1 touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          edgeToEdge ? cn(LANDING_MOBILE_GUTTER, "md:px-0") : "",
        )}
        style={{ gap, WebkitOverflowScrolling: "touch" }}
        role="region"
        aria-label={ariaLabel}
        aria-roledescription="carousel"
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            className={cn(
              "min-w-0 shrink-0 snap-center overflow-hidden transition-opacity duration-300 ease-out",
              !edgeToEdge && "first:ml-3 last:mr-3 md:first:ml-0 md:last:mr-0",
              i === activeIndex ? "opacity-100" : "opacity-[0.88]",
              slideClassName,
            )}
            style={{ flex: `0 0 ${slideWidth}%`, maxWidth: `${slideWidth}%` }}
            aria-roledescription="slide"
            aria-label={`Slide ${i + 1} of ${slideCount}`}
          >
            {slide}
          </div>
        ))}
      </div>

      {showCounter && slideCount > 1 ? (
        <p className="mt-3 text-center text-[12px] font-semibold tracking-wide text-[#8E8E93]">
          {activeIndex + 1} / {slideCount}
        </p>
      ) : null}

      {showDots && slideCount > 1 ? (
        <div className="mt-4 flex justify-center gap-2" aria-hidden>
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                pauseAutoplay();
                setActiveIndex(i);
                scrollToIndex(i);
              }}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === activeIndex ? "w-7" : "w-2 bg-[#C7C7CC]",
              )}
              style={i === activeIndex ? { backgroundColor: IOS_BLUE } : undefined}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function LandingMobileSectionHeader({
  eyebrow,
  title,
  subtitle,
  className,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  className?: string;
  centered?: boolean;
}) {
  return (
    <div
      className={cn(
        "mb-7 max-w-2xl md:mb-12",
        centered && "mx-auto text-center",
        className,
      )}
    >
      <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#8E8E93] md:text-sm md:font-normal md:normal-case md:tracking-normal md:text-neutral-500">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-[1.95rem] font-bold leading-[1.08] tracking-[-0.03em] text-neutral-900 md:mt-3 md:text-4xl md:font-semibold md:tracking-tight">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-3.5 text-[17px] leading-[1.55] text-[#8E8E93] md:mt-4 md:text-base md:leading-relaxed md:text-neutral-500">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

export function LandingMobileCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "h-full overflow-hidden rounded-[0.875rem] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_6px_20px_rgba(0,0,0,0.05)] sm:p-6 md:rounded-2xl md:border md:border-neutral-200 md:p-6 md:shadow-none",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function LandingScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={cn(
        "fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] end-4 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-black/[0.05] bg-white/95 text-[#007AFF] shadow-[0_6px_28px_rgba(0,0,0,0.14)] backdrop-blur-2xl backdrop-saturate-[180%] transition-all duration-300 active:scale-90 md:bottom-8 md:end-8",
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-6 opacity-0",
      )}
    >
      <ChevronUp className="h-6 w-6" strokeWidth={2.5} />
    </button>
  );
}
