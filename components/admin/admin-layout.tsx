"use client";

import { Suspense, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Menu, RefreshCw, Shield } from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useSidebarStore } from "@/lib/store";
import { cn } from "@/lib/utils";

function SidebarFallback() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[220px] border-r border-black/[0.06] bg-[#F5F5F7] lg:flex dark:border-white/10 dark:bg-[#111111]" />
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isCollapsed, toggle } = useSidebarStore();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  function handleRefresh() {
    startRefresh(() => router.refresh());
  }

  return (
    <div className={cn("min-h-screen", isDark ? "bg-[#0a0a0a]" : "bg-[#F5F5F7]")}>
      <Suspense fallback={<SidebarFallback />}>
        <AdminSidebar />
      </Suspense>
      <div
        className={cn(
          "min-h-screen transition-[padding] duration-300",
          "[transition-timing-function:cubic-bezier(0.32,0.72,0,1)]",
          isCollapsed ? "lg:pl-[72px]" : "lg:pl-[220px]"
        )}
      >
        <div
          className={cn(
            "flex min-h-screen flex-col overflow-hidden",
            isDark ? "bg-[#121212] text-white" : "bg-white text-foreground"
          )}
        >
          <header className="sticky top-0 z-30 border-b border-black/[0.06] bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-[#121212]/90">
            <div className="flex h-11 items-center justify-between gap-3 px-4 sm:px-5">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <button
                  type="button"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-neutral-400 transition-colors duration-200 hover:bg-black/[0.04] hover:text-neutral-700 lg:hidden dark:hover:bg-white/10 dark:hover:text-white"
                  onClick={toggle}
                  aria-label="Open navigation"
                >
                  <Menu className="h-4 w-4" />
                </button>
                <div className="flex min-w-0 items-center gap-1.5 text-[12px] font-medium text-neutral-600 dark:text-neutral-300">
                  <Shield className="h-3.5 w-3.5 shrink-0 text-[#007AFF]" />
                  <span className="truncate">Platform admin</span>
                  <span className="hidden text-neutral-300 sm:inline dark:text-neutral-600">
                    ·
                  </span>
                  <span className="hidden truncate text-neutral-400 sm:inline">
                    Private control panel
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 transition-colors duration-200 hover:bg-black/[0.04] hover:text-neutral-700 disabled:opacity-50 dark:hover:bg-white/10 dark:hover:text-white"
                onClick={handleRefresh}
                disabled={refreshing}
                aria-label="Refresh"
              >
                <RefreshCw
                  className={cn("h-3.5 w-3.5", refreshing && "animate-spin")}
                />
              </button>
            </div>
          </header>
          <div className="flex-1 overflow-auto bg-[#F5F5F7] dark:bg-[#0a0a0a]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
