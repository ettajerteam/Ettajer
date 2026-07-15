interface CardChipProps {
  className?: string;
  variant?: "gold" | "silver";
}

export function CardChip({ className = "w-[52px] h-[38px]", variant = "gold" }: CardChipProps) {
  const isGold = variant === "gold";
  const chipGradient = isGold
    ? "from-[#FFE894] via-[#DEBA54] to-[#B08E26]"
    : "from-[#FFFFFF] via-[#D4D4D8] to-[#71717A]";
  const strokeColor = isGold ? "#7A5B12" : "#3F3F46";
  const nfcColor = isGold ? "text-amber-200/70" : "text-zinc-400/60";

  return (
    <div className="flex items-center gap-3.5">
      <div
        className={`relative ${className} overflow-hidden rounded-[7px] bg-gradient-to-br ${chipGradient} p-[1px] shadow-[inset_0_1px_2px_rgba(255,255,255,0.45),0_3px_8px_rgba(0,0,0,0.35)]`}
      >
        <svg
          viewBox="0 0 100 80"
          className="h-full w-full opacity-85"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <rect x="2" y="2" width="96" height="76" rx="6" stroke={strokeColor} strokeWidth="1.5" />
          <line x1="2" y1="26" x2="98" y2="26" stroke={strokeColor} strokeWidth="1.5" />
          <line x1="2" y1="54" x2="98" y2="54" stroke={strokeColor} strokeWidth="1.5" />
          <line x1="30" y1="2" x2="30" y2="78" stroke={strokeColor} strokeWidth="1.5" />
          <line x1="70" y1="2" x2="70" y2="78" stroke={strokeColor} strokeWidth="1.5" />
          <line x1="50" y1="26" x2="50" y2="54" stroke={strokeColor} strokeWidth="1.5" />
          <rect x="42" y="34" width="16" height="12" rx="3" stroke={strokeColor} strokeWidth="1.5" fill="none" />
        </svg>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent" />
      </div>
      <svg
        viewBox="0 0 24 24"
        className={`h-6 w-6 rotate-90 ${nfcColor}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        aria-hidden
      >
        <path d="M5 8.5C6.33333 10.8333 6.33333 13.1667 5 15.5" />
        <path d="M8.5 6C10.5 9.5 10.5 14.5 8.5 18" />
        <path d="M12 3.5C14.6667 8.5 14.6667 15.5 12 20.5" />
        <path d="M15.5 1C19 7.5 19 16.5 15.5 23" />
      </svg>
    </div>
  );
}
