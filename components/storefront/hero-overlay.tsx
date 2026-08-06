"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HeroOverlayProps {
  brandName: string;
  showBrand?: boolean;
  headline: string;
  accentHeadline?: string;
  subheadline?: string | null;
  eyebrow?: string;
  ctaText?: string;
  ctaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  imageSrc: string;
  imageAlt: string;
  alignment: "left" | "center" | "right";
  minHeight?: string;
  /** Applied at max-md when set (e.g. Aura promo 70svh on phones). */
  mobileMinHeight?: string;
  backgroundColor?: string;
  textStyle?: React.CSSProperties;
  ctaClassName: string;
  textFocusAttrs?: React.HTMLAttributes<HTMLHeadingElement>;
}

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

export function HeroOverlay({
  brandName,
  showBrand = true,
  headline,
  accentHeadline,
  subheadline,
  eyebrow,
  ctaText,
  ctaHref,
  secondaryCtaText,
  secondaryCtaHref,
  imageSrc,
  imageAlt,
  alignment,
  minHeight,
  mobileMinHeight,
  backgroundColor,
  textStyle,
  ctaClassName,
  textFocusAttrs,
}: HeroOverlayProps) {
  const textAlign =
    alignment === "left" ? "text-left" : alignment === "right" ? "text-right" : "text-center";

  return (
    <section
      className={cn(
        "relative flex w-full items-end overflow-hidden",
        mobileMinHeight && "max-md:[min-height:var(--hero-mh-m)]"
      )}
      style={{
        minHeight: minHeight ?? "100svh",
        backgroundColor: backgroundColor ?? "#0a0a0a",
        ...(mobileMinHeight
          ? ({ "--hero-mh-m": mobileMinHeight } as React.CSSProperties)
          : {}),
      }}
    >
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.06 }}
        animate={{ scale: 1 }}
        transition={{ duration: 8, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
          unoptimized={imageSrc.startsWith("http")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/30" />
        <div
          className={cn(
            "absolute inset-0",
            alignment === "left" && "bg-gradient-to-r from-black/70 via-black/35 to-transparent",
            alignment === "right" && "bg-gradient-to-l from-black/70 via-black/35 to-transparent",
            alignment === "center" && "bg-gradient-to-t from-black/80 via-black/20 to-black/35"
          )}
        />
      </motion.div>

      <div
        className={cn(
          "relative z-10 mx-auto w-full max-w-7xl px-5 pb-12 pt-28 sm:px-10 sm:pb-20 sm:pt-36 lg:px-16 lg:pb-28",
          textAlign
        )}
      >
        <motion.div
          className={cn(
            "flex max-w-3xl flex-col gap-4 sm:gap-6",
            alignment === "center" && "mx-auto items-center",
            alignment === "right" && "ml-auto items-end"
          )}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
          }}
        >
          {(showBrand || eyebrow) && (
            <motion.div
              variants={fadeUp}
              className={cn(
                "flex flex-col gap-2",
                alignment === "center" && "items-center",
                alignment === "right" && "items-end"
              )}
            >
              {showBrand ? (
                <p className="text-[15px] font-semibold tracking-[0.32em] text-white uppercase sm:text-base sm:tracking-[0.34em]">
                  {brandName}
                </p>
              ) : null}
              {eyebrow ? (
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/65 sm:text-[11px]">
                  {eyebrow}
                </p>
              ) : null}
            </motion.div>
          )}

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 28 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.85, ease } },
            }}
          >
            <h1
              className={cn(
                "whitespace-pre-line text-4xl font-semibold leading-[0.96] tracking-[-0.04em] text-white sm:text-5xl lg:text-7xl xl:text-[5.25rem]",
                alignment === "center" && "text-balance"
              )}
              style={textStyle}
              {...textFocusAttrs}
            >
              {headline}
              {accentHeadline ? (
                <>
                  <br />
                  <span className="font-light text-white/65">{accentHeadline}</span>
                </>
              ) : null}
            </h1>
          </motion.div>

          {subheadline ? (
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease } },
              }}
              className="max-w-md text-[14px] font-light leading-relaxed text-white/75 sm:text-[15px] sm:leading-relaxed"
              style={textStyle}
            >
              {subheadline}
            </motion.p>
          ) : null}

          {(ctaText || secondaryCtaText) && (
            <motion.div
              variants={fadeUp}
              className={cn(
                "mt-1 flex flex-wrap items-center gap-x-5 gap-y-3 sm:gap-x-6",
                alignment === "center" && "justify-center",
                alignment === "right" && "justify-end"
              )}
            >
              {ctaText ? (
                ctaHref ? (
                  <Link href={ctaHref} className={cn(ctaClassName, "mt-0")}>
                    {ctaText}
                  </Link>
                ) : (
                  <button type="button" className={cn(ctaClassName, "mt-0")}>
                    {ctaText}
                  </button>
                )
              ) : null}
              {secondaryCtaText ? (
                secondaryCtaHref ? (
                  <Link
                    href={secondaryCtaHref}
                    className="text-[12px] font-medium tracking-wide text-white/80 underline-offset-[6px] transition hover:text-white hover:underline"
                  >
                    {secondaryCtaText}
                  </Link>
                ) : (
                  <span className="text-[12px] font-medium tracking-wide text-white/55">
                    {secondaryCtaText}
                  </span>
                )
              ) : null}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
