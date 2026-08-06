"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PRIMARY_TABS = [
  { id: "home", label: "Home", href: "/dashboard/marketing/email" },
  {
    id: "campaigns",
    label: "Campaigns",
    href: "/dashboard/marketing/email/campaigns",
  },
  {
    id: "templates",
    label: "Templates",
    href: "/dashboard/marketing/email/templates",
  },
  {
    id: "automations",
    label: "Automations",
    href: "/dashboard/marketing/email/automations",
  },
  {
    id: "subscribers",
    label: "Subscribers",
    href: "/dashboard/marketing/email/subscribers",
  },
  {
    id: "analytics",
    label: "Analytics",
    href: "/dashboard/marketing/email/analytics",
  },
] as const;

const MORE_ITEMS = [
  {
    id: "segments",
    label: "Segments",
    description: "Target groups",
    href: "/dashboard/marketing/email/segments",
  },
  {
    id: "insights",
    label: "Ideas",
    description: "What to send next",
    href: "/dashboard/marketing/email/insights",
  },
  {
    id: "journeys",
    label: "Email flows",
    description: "Multi-step flows",
    href: "/dashboard/marketing/email/journeys",
  },
  {
    id: "queue",
    label: "Sending status",
    description: "Pending & failed sends",
    href: "/dashboard/marketing/email/queue",
  },
  {
    id: "deliverability",
    label: "Inbox health",
    description: "Domains & reputation",
    href: "/dashboard/marketing/email/deliverability",
  },
  {
    id: "setup",
    label: "Email setup",
    description: "Providers & addresses",
    href: "/dashboard/settings?tab=email",
  },
] as const;

interface EmailSectionNavProps {
  counts?: {
    audience?: number;
    templates?: number;
    automationsOn?: number;
    segments?: number;
  };
}

function isExactHome(pathname: string) {
  return pathname === "/dashboard/marketing/email";
}

function isActiveHref(pathname: string, href: string) {
  if (href === "/dashboard/marketing/email") {
    return isExactHome(pathname);
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function EmailSectionNav({ counts: _counts }: EmailSectionNavProps) {
  const pathname = usePathname();
  const moreActive = MORE_ITEMS.some((item) => isActiveHref(pathname, item.href));
  const activeMore = MORE_ITEMS.find((item) => isActiveHref(pathname, item.href));

  return (
    <nav className="scrollbar-none -mx-1 flex items-center gap-0.5 overflow-x-auto border-b border-neutral-100 px-1 pb-px dark:border-white/10">
      {PRIMARY_TABS.map((tab) => {
        const active = isActiveHref(pathname, tab.href);
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn(
              "relative shrink-0 px-3 py-2.5 text-[13px] font-medium transition-colors",
              active
                ? "text-neutral-950 dark:text-white"
                : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200",
            )}
          >
            {tab.label}
            {active ? (
              <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-neutral-950 dark:bg-white" />
            ) : null}
          </Link>
        );
      })}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "relative inline-flex shrink-0 items-center gap-1 px-3 py-2.5 text-[13px] font-medium transition-colors",
              moreActive
                ? "text-neutral-950 dark:text-white"
                : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200",
            )}
          >
            {activeMore ? activeMore.label : "More"}
            <ChevronDown className="h-3 w-3 opacity-50" />
            {moreActive ? (
              <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-neutral-950 dark:bg-white" />
            ) : null}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 p-1.5 text-[13px]">
          {MORE_ITEMS.map((item) => {
            const active = isActiveHref(pathname, item.href);
            return (
              <DropdownMenuItem key={item.id} asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex cursor-pointer flex-col items-start gap-0.5 rounded-lg px-2.5 py-2",
                    active && "bg-neutral-100 dark:bg-white/10",
                  )}
                >
                  <span className="font-medium text-neutral-950 dark:text-white">
                    {item.label}
                  </span>
                  <span className="text-[11px] font-normal text-neutral-400">
                    {item.description}
                  </span>
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
