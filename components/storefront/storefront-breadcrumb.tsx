import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface StorefrontBreadcrumbProps {
  items: BreadcrumbItem[];
  variant?: "minimal" | "modern" | "bold";
}

export function StorefrontBreadcrumb({ items, variant = "minimal" }: StorefrontBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-0">
      <ol className="flex flex-wrap items-center gap-1 text-[12px] sm:text-[13px]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight
                  className={cn(
                    "h-3 w-3",
                    variant === "bold" ? "text-white/25" : "text-neutral-300"
                  )}
                />
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className={cn(
                    "transition-colors",
                    variant === "minimal" && "text-neutral-500 hover:text-neutral-900",
                    variant === "modern" &&
                      "text-xs font-bold uppercase tracking-[0.14em] text-neutral-500 hover:text-black",
                    variant === "bold" &&
                      "text-[10px] uppercase tracking-[0.16em] text-white/45 hover:text-[var(--store-primary)]"
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    "max-w-[14rem] truncate font-medium sm:max-w-xs",
                    variant === "bold" ? "text-white/80" : "text-neutral-800",
                    variant === "modern" && "text-xs uppercase tracking-[0.14em]"
                  )}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
