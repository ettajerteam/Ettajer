import { cn } from "@/lib/utils";

/** Facebook-style unread count pill for header icons. */
export function UnreadCountBadge({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  if (count <= 0) return null;

  const label = count > 99 ? "99+" : String(count);

  return (
    <span
      className={cn(
        "absolute -right-0.5 -top-0.5 flex min-w-[16px] items-center justify-center rounded-full bg-[#F02849] px-[4px] text-[10px] font-bold leading-none text-white ring-2 ring-white dark:ring-[#121212]",
        label.length > 2 ? "h-[16px] px-[3px]" : "h-[16px]",
        className,
      )}
      aria-hidden
    >
      {label}
    </span>
  );
}
