"use client";

import Link from "next/link";
import {
  BookOpen,
  HelpCircle,
  Newspaper,
  Sparkles,
  Users,
  Activity,
} from "lucide-react";
import { homeCard, homeCardPad, homeSubtitle, homeTitle } from "./home-ui";
import { useHomeCopy } from "./home-i18n";
import { cn } from "@/lib/utils";

const LINKS = [
  { id: "news", label: "Ettajer Updates", href: "/help", icon: Newspaper },
  { id: "whats-new", label: "What's New", href: "/help", icon: Sparkles },
  { id: "community", label: "Community", href: "/help", icon: Users },
  { id: "learning", label: "Learning Center", href: "/help", icon: BookOpen },
  { id: "support", label: "Support", href: "/help", icon: HelpCircle },
  { id: "status", label: "System Status", href: "/help", icon: Activity },
] as const;

export function HomeNewsSidebar() {
  const t = useHomeCopy();
  return (
    <aside className={cn(homeCard, homeCardPad, "h-full")}>
      <h2 className={homeTitle}>{t.news}</h2>
      <p className={homeSubtitle}>{t.resourcesUpdates}</p>
      <ul className="mt-4 space-y-1">
        {LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <li key={link.id}>
              <Link
                href={link.href}
                className="flex items-center gap-2.5 rounded-xl px-2 py-2 text-[13px] font-medium text-neutral-700 transition hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-white/[0.04]"
              >
                <Icon className="h-4 w-4 text-neutral-400" />
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
