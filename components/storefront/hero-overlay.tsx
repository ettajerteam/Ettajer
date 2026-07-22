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
  backgroundColor?: string;
  textStyle?: React.CSSProperties;
  ctaClassName: string;
  textFocusAttrs?: React.HTMLAttributes<HTMLHeadingElement>;
}

const ease = [0.22, 1, 0.36, 1] as const;

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
  backgroundColor,
  textStyle,
  ctaClassName,
  textFocusAttrs,
}: HeroOverlayProps) {
  const textAlign =
    alignment === "left" ? "text-left" : alignment === "right" ? "text-right" : "text-center";

  return (
    <section
      className="relative flex w-full items-end overflow-hidden"
      style={{
        minHeight: minHeight ?? "100svh",
        backgroundColor: backgroundColor ?? "#0a0a0a",
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
          "relative z-10 mx-auto w-full max-w-7xl px-6 pb-16 pt-32 sm:px-10 sm:pb-24 sm:pt-36 lg:px-16 lg:pb-28",
          textAlign
        )}
      >
        <motion.div
          className={cn(
            "flex max-w-3xl flex-col gap-6 sm:gap-7",
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
          {showBrand ? (
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
              }}
              className="text-[13px] font-semibold tracking-[0.28em] text-white/90 uppercase sm:text-sm"
            >
              {brandName}
            </motion.p>
          ) : eyebrow ? (
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
              }}
              className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70"
            >
              {eyebrow}
            </motion.p>
          ) : null}

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 28 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.85, ease } },
            }}
          >
            <h1
              className={cn(
                "whitespace-pre-line text-5xl font-semibold leading-[0.94] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl xl:text-[5.25rem]",
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
              className="max-w-md text-[15px] font-light leading-relaxed text-white/75 sm:text-base"
              style={textStyle}
            >
              {subheadline}
            </motion.p>
          ) : null}

          {(ctaText || secondaryCtaText) && (
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
              }}
              className={cn(
                "mt-1 flex flex-wrap items-center gap-x-6 gap-y-3",
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
