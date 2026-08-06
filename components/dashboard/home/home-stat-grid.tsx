import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { HomeStatItem } from "@/lib/home-insights";
import {
  homeCard,
  homeCardPad,
  homeIconWrap,
  homeStatCell,
  homeSubtitle,
  homeTitle,
} from "./home-ui";
import { cn } from "@/lib/utils";

interface HomeStatGridProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  items: HomeStatItem[];
  columns?: 2 | 3;
  className?: string;
}

export function HomeStatGrid({
  title,
  description,
  icon: Icon,
  items,
  columns = 2,
  className,
}: HomeStatGridProps) {
  return (
    <section className={cn(homeCard, homeCardPad, className)}>
      <div className="flex items-center gap-2">
        {Icon ? (
          <span className={homeIconWrap}>
            <Icon className="h-3.5 w-3.5" />
          </span>
        ) : null}
        <div>
          <h2 className={homeTitle}>{title}</h2>
          {description ? <p className={homeSubtitle}>{description}</p> : null}
        </div>
      </div>

      <div
        className={cn(
          "mt-3 grid gap-2",
          columns === 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2"
        )}
      >
        {items.map((item) => {
          const content = (
            <>
              <p className="text-[10px] font-medium text-neutral-400">{item.label}</p>
              <p className="mt-0.5 truncate text-[15px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                {item.value}
              </p>
            </>
          );

          if (item.href) {
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(homeStatCell, "hover:bg-neutral-100/90 dark:hover:bg-white/[0.05]")}
              >
                {content}
              </Link>
            );
          }

          return (
            <div key={item.id} className={homeStatCell}>
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
