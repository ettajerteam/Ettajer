"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Menu, Moon, RefreshCw, Sun } from "lucide-react";
import { useSidebarStore } from "@/lib/store";
import { DashboardCommandSearch } from "@/components/shared/dashboard-command-search";
import { DashboardMessages } from "@/components/shared/dashboard-messages";
import { DashboardNotifications } from "@/components/shared/dashboard-notifications";
import { cn } from "@/lib/utils";

function HeaderIconButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition-colors duration-200",
        "hover:bg-black/[0.05] hover:text-neutral-800",
        "disabled:pointer-events-none disabled:opacity-40",
        "dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function DashboardShellHeader() {
  const { toggle } = useSidebarStore();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [refreshing, startRefresh] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  function handleRefresh() {
    startRefresh(() => {
      router.refresh();
    });
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b border-black/[0.06]",
        "bg-white/85 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/75",
        "dark:border-white/10 dark:bg-[#121212]/85 dark:supports-[backdrop-filter]:bg-[#121212]/75",
        "shadow-[0_1px_0_0_rgba(0,0,0,0.02)]"
      )}
    >
      <div className="flex h-12 items-center justify-between gap-3 px-3 sm:px-5">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <HeaderIconButton
            className="lg:hidden"
            onClick={toggle}
            aria-label="Open navigation"
          >
            <Menu className="h-4 w-4" />
          </HeaderIconButton>

          <DashboardCommandSearch />
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <HeaderIconButton
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {!mounted ? (
              <Sun className="h-3.5 w-3.5 opacity-0" />
            ) : isDark ? (
              <Sun className="h-3.5 w-3.5" />
            ) : (
              <Moon className="h-3.5 w-3.5" />
            )}
          </HeaderIconButton>

          <HeaderIconButton
            onClick={handleRefresh}
            disabled={refreshing}
            aria-label="Refresh dashboard"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", refreshing && "animate-spin")}
            />
          </HeaderIconButton>

          <DashboardMessages />
          <DashboardNotifications />
        </div>
      </div>
    </header>
  );
}
