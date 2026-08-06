"use client";

import Link from "next/link";
import { FileText, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { dashboardPillGroup } from "@/lib/dashboard-ui";

interface PageEditNavProps {
  pageId: string;
  active: "content" | "settings";
}

export function PageEditNav({ pageId, active }: PageEditNavProps) {
  const items = [
    {
      id: "content" as const,
      href: `/dashboard/pages/${pageId}/edit`,
      label: "Content",
      icon: FileText,
    },
    {
      id: "settings" as const,
      href: `/dashboard/pages/${pageId}/settings`,
      label: "SEO & settings",
      icon: Settings2,
    },
  ];

  return (
    <div className={cn(dashboardPillGroup, "w-full sm:w-auto")}>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.id;
        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-[7px] px-3 text-[11px] font-medium transition sm:flex-none",
              isActive
                ? "bg-white text-neutral-900 shadow-sm dark:bg-[#2C2C2E] dark:text-white"
                : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
