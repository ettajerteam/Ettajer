"use client";

import { useRef, useState, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";
import { CardLogo } from "@/components/founder/card-logo";
import { CardChip } from "@/components/founder/card-chip";
import { FounderSeal } from "@/components/founder/founder-seal";
import { buildFounderCardId, formatFounderNumber } from "@/lib/founder/constants";
import { cn } from "@/lib/utils";

interface FounderCardProps {
  name: string;
  founderNumber: number;
  className?: string;
  defaultFlipped?: boolean;
  /** Keeps card at 440px width — does not shrink on small screens. */
  fixedSize?: boolean;
  showHint?: boolean;
}

export function FounderCard({
  name,
  founderNumber,
  className,
  defaultFlipped = false,
  fixedSize = false,
  showHint = true,
}: FounderCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isFlipped, setIsFlipped] = useState(defaultFlipped);

  const x = useMotionValue(200);
  const y = useMotionValue(125);
  const rotateXSpring = useSpring(0, { stiffness: 160, damping: 20 });
  const rotateYSpring = useSpring(0, { stiffness: 160, damping: 20 });
  const rotateX = useTransform(y, [0, 250], [14, -14]);
  const rotateY = useTransform(x, [0, 400], [-16, 16]);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const unsubX = rotateX.on("change", (latest) => rotateXSpring.set(latest));
    const unsubY = rotateY.on("change", (latest) => rotateYSpring.set(latest));
    return () => {
      unsubX();
      unsubY();
    };
  }, [rotateX, rotateY, rotateXSpring, rotateYSpring]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isFlipped) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set((mouseX / rect.width) * 400);
    y.set((mouseY / rect.height) * 250);
    setGlarePos({
      x: (mouseX / rect.width) * 100,
      y: (mouseY / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    rotateXSpring.set(0);
    rotateYSpring.set(0);
    setGlarePos({ x: 50, y: 50 });
  };

  const cardId = buildFounderCardId(founderNumber);
  const displayName = name?.trim() || "FOUNDING MERCHANT";
  const formattedId = cardId.replace(/(.{4})/g, "$1 ").trim();

  const cardWidthClass = fixedSize
    ? "w-[440px] shrink-0"
    : "w-full max-w-[420px] sm:max-w-[480px]";

  return (
    <div
      className={cn(
        "perspective-1000 group/card relative flex select-none justify-center py-6",
        fixedSize ? "w-auto" : "w-full",
        className,
      )}
    >
      {/* Ambient glow */}
      <div
        className="founder-card-glow pointer-events-none absolute left-[5%] top-[8%] z-0 h-[88%] w-[90%] rounded-[1.35rem]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 60%, rgba(59,130,246,0.28) 0%, rgba(99,102,241,0.12) 40%, transparent 70%)",
          filter: "blur(28px)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-[7.5%] top-[10%] z-0 h-[85%] w-[85%] rounded-2xl transition-all duration-700"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)",
          transform: isHovered && !isFlipped ? "scale(1.06) translateY(6px)" : "scale(0.98)",
        }}
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={cardWidthClass}
      >
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          onClick={() => setIsFlipped((v) => !v)}
          style={{
            rotateX: isFlipped ? 0 : rotateXSpring,
            rotateY: isFlipped ? 0 : rotateYSpring,
            transformStyle: "preserve-3d",
          }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="preserve-3d relative aspect-[1.586] w-full cursor-pointer rounded-[1.15rem] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.06)] transition-shadow duration-500 hover:shadow-[0_40px_90px_-15px_rgba(0,0,0,0.9),0_0_40px_-10px_rgba(59,130,246,0.35)]"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsFlipped((v) => !v);
            }
          }}
          aria-label="Founder card — click to flip"
        >
          {/* ═══════════ FRONT ═══════════ */}
          <div
            className="backface-hidden absolute inset-0 flex h-full w-full flex-col justify-between overflow-hidden rounded-[1.15rem] border border-white/[0.12] bg-gradient-to-br from-[#050507] via-[#0c0d10] to-[#14151a] p-5 sm:p-6"
            style={{ transform: "translateZ(2px)" }}
          >
            {/* Textures */}
            <div className="founder-card-noise pointer-events-none absolute inset-0 opacity-[0.04]" />
            <div className="founder-card-carbon pointer-events-none absolute inset-0 opacity-[0.35]" />
            <div className="founder-card-hex pointer-events-none absolute inset-0 opacity-60" />
            <div className="founder-card-shimmer pointer-events-none absolute inset-0 overflow-hidden rounded-[1.15rem]" />

            {/* Edge lighting */}
            <div
              className="pointer-events-none absolute inset-0 rounded-[1.15rem]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(59,130,246,0.15) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.06) 100%)",
              }}
            />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

            {/* Interactive glare */}
            {isHovered && !isFlipped ? (
              <div
                className="pointer-events-none absolute inset-0 z-20 mix-blend-overlay transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle 280px at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.35) 0%, rgba(59,130,246,0.12) 40%, transparent 70%)`,
                }}
              />
            ) : null}

            {/* Top row */}
            <div className="relative z-10 flex items-start justify-between gap-3">
              <CardLogo />
              <div className="text-right">
                <span className="founder-foil-platinum block text-[9px] font-bold uppercase tracking-[0.28em] sm:text-[10px]">
                  FOUNDING MERCHANT
                </span>
                <span className="mt-1 block font-mono text-[7px] tracking-[0.2em] text-zinc-500 sm:text-[8px]">
                  EST. 2026
                </span>
              </div>
            </div>

            {/* Center — founder badge */}
            <div className="relative z-10 flex flex-col items-center py-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent px-3.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                <span className="founder-foil-gold font-mono text-[11px] font-bold tracking-[0.12em] sm:text-xs">
                  {formatFounderNumber(founderNumber).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Chip row */}
            <div className="relative z-10 flex items-center justify-between">
              <CardChip variant="gold" />
              <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-gradient-to-br from-blue-500/25 via-indigo-600/15 to-transparent shadow-[0_4px_16px_rgba(59,130,246,0.2)]">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50" />
                <svg
                  className="relative h-6 w-6 animate-[spin_12s_linear_infinite] text-white/90"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                </svg>
                <span
                  className="absolute font-mono text-[6px] font-black text-white"
                  style={{ textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}
                >
                  100
                </span>
              </div>
            </div>

            {/* Bottom — name + seal */}
            <div className="relative z-10 flex items-end justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <div
                  className="font-mono text-[11px] font-semibold tracking-[0.16em] text-zinc-400 sm:text-xs"
                  style={{ textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}
                >
                  {formattedId}
                </div>
                <div className="space-y-1">
                  <span className="font-sans text-[7px] font-bold uppercase tracking-[0.22em] text-zinc-500">
                    Cardholder
                  </span>
                  <p
                    className="truncate font-sans text-[15px] font-semibold uppercase tracking-[0.08em] text-white sm:text-base"
                    style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
                  >
                    {displayName}
                  </p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="h-px w-4 bg-gradient-to-r from-blue-500/80 to-transparent" />
                    <span className="bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-[9px] font-semibold uppercase tracking-[0.2em] text-transparent sm:text-[10px]">
                      Early Access Member
                    </span>
                  </div>
                </div>
              </div>
              <FounderSeal number={founderNumber} className="h-[72px] w-[72px] shrink-0 translate-y-0.5 sm:h-[76px] sm:w-[76px]" />
            </div>
          </div>

          {/* ═══════════ BACK ═══════════ */}
          <div
            className="backface-hidden absolute inset-0 flex h-full w-full flex-col justify-between overflow-hidden rounded-[1.15rem] border border-white/[0.1] bg-gradient-to-br from-[#050507] via-[#0a0b0e] to-[#121318]"
            style={{ transform: "rotateY(180deg) translateZ(2px)" }}
          >
            <div className="founder-card-noise pointer-events-none absolute inset-0 opacity-[0.04]" />
            <div className="founder-card-carbon pointer-events-none absolute inset-0 opacity-25" />

            {/* Magnetic stripe */}
            <div className="relative z-10 mt-5 h-11 w-full bg-[#0a0a0c] shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]">
              <div className="absolute inset-x-0 bottom-2 h-1.5 bg-gradient-to-r from-red-500/25 via-amber-400/25 via-30% to-blue-500/25 opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent" />
            </div>

            <div className="relative z-10 flex flex-grow flex-col justify-center gap-4 px-5 py-4 sm:px-6">
              <div className="flex items-end gap-3 sm:gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 font-sans text-[7px] font-medium uppercase tracking-[0.2em] text-zinc-500">
                    Authorized Signature
                  </div>
                  <div className="relative flex h-10 w-full items-center overflow-hidden rounded-md border border-zinc-200/80 bg-gradient-to-b from-white to-zinc-50 px-4 shadow-inner">
                    <svg
                      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08]"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden
                    >
                      <defs>
                        <pattern id="sigLines" width="28" height="8" patternUnits="userSpaceOnUse">
                          <path d="M0 4 Q7 0 14 4 T28 4" fill="none" stroke="#1E293B" strokeWidth="1" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#sigLines)" />
                    </svg>
                    <span
                      className="relative truncate font-[family-name:var(--font-inter)] text-lg italic text-slate-800 sm:text-xl"
                      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                    >
                      {displayName}
                    </span>
                  </div>
                </div>
                <div className="w-[60px] shrink-0 sm:w-16">
                  <div className="mb-1.5 text-center font-sans text-[7px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                    Founder No
                  </div>
                  <div className="flex h-10 items-center justify-center rounded-md border border-zinc-300/90 bg-gradient-to-b from-zinc-100 to-zinc-200 font-mono text-sm font-black tracking-widest text-zinc-900 shadow-inner">
                    {String(founderNumber).padStart(4, "0")}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-sans text-[7.5px] leading-[1.45] text-zinc-400 sm:text-[8px]">
                  This card certifies that its owner is among the first 100 founding merchants of Ettajer and is entitled to exclusive founder benefits, early platform access, partner rewards, and lifetime recognition.
                </p>
                <div className="flex items-center justify-between border-t border-white/[0.08] pt-2">
                  <span className="font-mono text-[5.5px] uppercase tracking-[0.18em] text-zinc-600 sm:text-[6px]">
                    Non-transferable · Privileged
                  </span>
                  <span className="font-mono text-[5.5px] uppercase tracking-wider text-blue-400/70 sm:text-[6px]">
                    ettajer.com
                  </span>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex h-4 w-full items-center justify-center border-t border-white/[0.05] bg-black/30">
              <span className="font-mono text-[5px] uppercase tracking-[0.22em] text-zinc-600">
                Ettajer · Morocco · 2026
              </span>
            </div>
          </div>
        </motion.div>

        {showHint ? (
          <p className="mt-4 text-center text-[11px] text-neutral-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-neutral-300" />
              Tap to flip
              <span className="h-1 w-1 rounded-full bg-neutral-300" />
            </span>
          </p>
        ) : null}
      </motion.div>
    </div>
  );
}
