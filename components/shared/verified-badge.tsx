import { cn } from "@/lib/utils";

/** Facebook-style blue verification check for Ettajer team. */
export function VerifiedBadge({
  className,
  title = "Verified Ettajer team",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[#0866FF] text-white",
        className
      )}
      title={title}
      aria-label={title}
    >
      <svg
        viewBox="0 0 16 16"
        className="h-2.5 w-2.5"
        fill="none"
        aria-hidden
      >
        <path
          d="M3.5 8.2 6.4 11l6.1-6.5"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
