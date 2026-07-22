"use client";

import { Suspense, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Menu, RefreshCw, Shield } from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/lib/store";
import { cn } from "@/lib/utils";

function SidebarFallback() {
  return <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[284px] p-3 lg:flex" />;
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebarStore();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { toggle } = useSidebarStore();
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  function handleRefresh() {
    startRefresh(() => router.refresh());
  }

  return (
    <div className={cn("min-h-screen", isDark ? "bg-black" : "bg-neutral-100/90")}>
      <Suspense fallback={<SidebarFallback />}>
        <AdminSidebar />
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
          <header className="sticky top-0 z-30 border-b border-neutral-200/90 bg-[#FAFAFA]/95 px-6 py-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-[#121212]/95">
            <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-[14px] lg:hidden"
                  onClick={toggle}
                  aria-label="Open navigation"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-2 text-sm font-medium text-violet-700 dark:text-violet-300">
                  <Shield className="h-4 w-4" />
                  Platform admin — private
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg"
                onClick={handleRefresh}
                disabled={refreshing}
                aria-label="Refresh"
              >
                <RefreshCw className={cn("h-[1.125rem] w-[1.125rem]", refreshing && "animate-spin")} />
              </Button>
            </div>
          </header>
          <div className="flex-1 overflow-auto bg-[#FAFAFA] dark:bg-[#0a0a0a]">{children}</div>
        </div>
      </div>
    </div>
  );
}
