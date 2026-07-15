"use client";

import { useId } from "react";

interface FounderSealProps {
  className?: string;
  number: number;
}

export function FounderSeal({ className = "w-16 h-16", number }: FounderSealProps) {
  const uid = useId().replace(/:/g, "");
  const goldGradId = `sealGold-${uid}`;
  const textPathTopId = `sealTop-${uid}`;
  const textPathBottomId = `sealBottom-${uid}`;
  const textColor = "#B45309";

  return (
    <div
      className={`relative ${className} flex items-center justify-center select-none filter drop-shadow-[0_4px_12px_rgba(245,158,11,0.25)]`}
    >
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full animate-[spin_50s_linear_infinite]"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id={goldGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF2AF" />
            <stop offset="25%" stopColor="#E5B242" />
            <stop offset="50%" stopColor="#FFF8D4" />
            <stop offset="75%" stopColor="#B38018" />
            <stop offset="100%" stopColor="#8A5A00" />
          </linearGradient>
          <path id={textPathTopId} d="M 12,50 A 38,38 0 1,1 88,50" fill="none" />
          <path id={textPathBottomId} d="M 88,50 A 38,38 0 0,1 12,50" fill="none" />
        </defs>
        <circle
          cx="50"
          cy="50"
          r="48"
          fill={`url(#${goldGradId})`}
          stroke="#E5B242"
          strokeWidth="1"
          strokeDasharray="3 2"
        />
        <circle cx="50" cy="50" r="41" fill="none" stroke={textColor} strokeWidth="1.5" opacity="0.45" />
        <circle cx="50" cy="50" r="37" fill="none" stroke={textColor} strokeWidth="0.75" opacity="0.3" />
        <text fill={textColor} className="font-sans text-[9.5px] font-bold tracking-[0.08em]">
          <textPath href={`#${textPathTopId}`} startOffset="50%" textAnchor="middle">
            • FIRST 100 •
          </textPath>
        </text>
        <text fill={textColor} className="font-sans text-[8.5px] font-semibold tracking-[0.1em]">
          <textPath href={`#${textPathBottomId}`} startOffset="50%" textAnchor="middle">
            ETTAJER FOUNDER
          </textPath>
        </text>
        <g transform="translate(50, 50)">
          <polygon
            points="0,-15 4,-5 14,-5 6,3 9,13 0,7 -9,13 -6,3 -14,-5 -4,-5"
            fill={textColor}
            opacity="0.85"
          />
          <circle cx="0" cy="0" r="15" fill="none" stroke={textColor} strokeWidth="1" opacity="0.2" />
        </g>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-2.5 select-none">
        <span className="founder-foil-gold font-mono text-[11px] font-black leading-none tracking-tight">
          {String(number).padStart(4, "0")}
        </span>
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/20 to-transparent mix-blend-overlay" />
    </div>
  );
}
