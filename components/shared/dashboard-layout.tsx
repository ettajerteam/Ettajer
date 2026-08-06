"use client";

import { Suspense } from "react";
import { Sidebar } from "@/components/shared/sidebar";
import { DashboardShellHeader } from "@/components/shared/dashboard-shell-header";
import { useSidebarStore } from "@/lib/store";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function SidebarFallback() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[220px] border-r border-black/[0.06] bg-[#F5F5F7] lg:flex dark:border-white/10 dark:bg-[#111111]" />
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebarStore();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <div className={cn("min-h-screen", isDark ? "bg-[#0a0a0a]" : "bg-[#F5F5F7]")}>
      <Suspense fallback={<SidebarFallback />}>
        <Sidebar />
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
          <DashboardShellHeader />
          <div className="flex-1 overflow-auto bg-[#F5F5F7] dark:bg-[#0a0a0a]">{children}</div>
        </div>
      </div>
    </div>
  );
}
