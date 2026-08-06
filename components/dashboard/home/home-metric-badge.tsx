import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HomeMetricBadgeProps {
  value: number;
  label?: string;
  className?: string;
}

export function HomeMetricBadge({ value, label, className }: HomeMetricBadgeProps) {
  if (value === 0) {
    return (
      <span className={cn("text-[10px] font-medium text-neutral-400", className)}>
        {label ?? "0%"}
      </span>
    );
  }

  const positive = value > 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[10px] font-medium",
        positive ? "text-emerald-600" : "text-red-600",
        className
      )}
    >
      {positive ? (
        <ArrowUpRight className="h-2.5 w-2.5" aria-hidden />
      ) : (
        <ArrowDownRight className="h-2.5 w-2.5" aria-hidden />
      )}
      {Math.abs(value).toFixed(1)}%
      {label ? <span className="text-neutral-400">· {label}</span> : null}
    </span>
  );
}
