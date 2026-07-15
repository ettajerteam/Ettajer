"use client";

import { Suspense } from "react";
import { Sidebar } from "@/components/shared/sidebar";
import { DashboardShellHeader } from "@/components/shared/dashboard-shell-header";
import { useSidebarStore } from "@/lib/store";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function SidebarFallback() {
  return <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[284px] p-3 lg:flex" />;
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebarStore();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <div className={cn("min-h-screen", isDark ? "bg-black" : "bg-neutral-100/90")}>
      <Suspense fallback={<SidebarFallback />}>
        <Sidebar />
      </Suspense>
      <div
        className={cn(
          "min-h-screen p-3 pl-0 transition-all duration-300 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]",
          isCollapsed ? "lg:pl-[96px]" : "lg:pl-[284px]"
        )}
      >
        <div
          className={cn(
            "flex min-h-[calc(100vh-24px)] flex-col overflow-hidden rounded-2xl",
            isDark
              ? "bg-[#121212] text-white"
              : "bg-white text-foreground border border-black/5 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_24px_55px_-38px_rgba(15,23,42,0.45)]"
          )}
        >
          <DashboardShellHeader />
          <div className="flex-1 overflow-auto bg-[#FAFAFA] dark:bg-[#0a0a0a]">{children}</div>
        </div>
      </div>
    </div>
  );
}
