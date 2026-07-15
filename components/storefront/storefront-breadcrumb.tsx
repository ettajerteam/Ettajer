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
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight
                  className={cn(
                    "h-3.5 w-3.5",
                    variant === "bold" ? "text-white/30" : "text-gray-300"
                  )}
                />
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className={cn(
                    "transition-colors",
                    variant === "minimal" && "text-gray-500 hover:text-gray-900",
                    variant === "modern" && "text-neutral-500 hover:text-black uppercase text-xs tracking-widest font-bold",
                    variant === "bold" && "text-white/50 hover:text-[var(--store-primary)] text-[10px] uppercase tracking-widest"
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    "font-medium",
                    variant === "bold" ? "text-white" : "text-gray-900",
                    variant === "modern" && "uppercase text-xs tracking-widest"
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
