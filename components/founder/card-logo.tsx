"use client";

import Image from "next/image";
import { useId } from "react";

interface CardLogoProps {
  className?: string;
}

export function CardLogo({ className = "" }: CardLogoProps) {
  const uid = useId().replace(/:/g, "");

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        <div
          className="absolute -inset-1 rounded-xl bg-blue-500/20 blur-md"
          aria-hidden
        />
        <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-gradient-to-br from-white/10 to-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
          <Image
            src="/brand/App-Logo.png"
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 object-contain"
          />
        </div>
      </div>
      <div className="flex flex-col items-start leading-none">
        <span
          className="founder-foil-platinum font-sans text-[13px] font-black tracking-[0.22em]"
          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
        >
          ETTAJER
        </span>
        <span
          className="mt-1 font-sans text-[9px] font-medium tracking-[0.14em] text-zinc-500"
          dir="rtl"
        >
          التاجر
        </span>
        <svg width="0" height="0" className="absolute" aria-hidden>
          <defs>
            <linearGradient id={`logoAccent-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#a5b4fc" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
