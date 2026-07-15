"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bell, Menu, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/lib/store";
import { DashboardCommandSearch } from "@/components/shared/dashboard-command-search";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { cn } from "@/lib/utils";

export function DashboardShellHeader() {
  const { data: session } = useSession();
  const { toggle } = useSidebarStore();
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  const [lastSyncedAt, setLastSyncedAt] = useState(() => new Date().toISOString());
  const [notificationCount, setNotificationCount] = useState(0);
  const [storeName, setStoreName] = useState<string | null>(null);

  const displayName = storeName ?? session?.user?.name ?? "Merchant";
  const initials =
    displayName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  const fetchMeta = useCallback(async () => {
    try {
      const [storeRes, ordersRes] = await Promise.all([
        fetch("/api/store"),
        fetch("/api/orders?status=pending"),
      ]);

      if (storeRes.ok) {
        const storeData = await storeRes.json();
        if (storeData.store?.name) setStoreName(storeData.store.name);
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setNotificationCount((ordersData.orders ?? []).length);
      }
    } catch {
      // Keep header usable if fetch fails
    }
  }, []);

  useEffect(() => {
    fetchMeta();
    const timer = window.setInterval(fetchMeta, 5 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [fetchMeta]);

  function handleRefresh() {
    startRefresh(() => {
      router.refresh();
      setLastSyncedAt(new Date().toISOString());
      void fetchMeta();
    });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200/90 bg-[#FAFAFA]/95 px-6 py-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-[#121212]/95">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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
          <DashboardCommandSearch />
        </div>

        <div className="flex items-center gap-2 self-end lg:self-auto">
          <div className="hidden items-center gap-1.5 rounded-lg border border-neutral-200/90 bg-white px-2.5 py-1.5 text-[11px] text-neutral-500 dark:border-white/10 dark:bg-[#161616] sm:flex">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            Synced {formatRelativeTime(lastSyncedAt)}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            onClick={handleRefresh}
            disabled={refreshing}
            aria-label="Refresh dashboard"
          >
            <RefreshCw className={cn("h-[1.125rem] w-[1.125rem]", refreshing && "animate-spin")} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            aria-label={notificationCount > 0 ? `${notificationCount} notifications` : "Notifications"}
            onClick={() => router.push("/dashboard/orders?status=pending")}
          >
            <Bell className="h-[1.125rem] w-[1.125rem]" />
            {notificationCount > 0 ? (
              <span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            ) : null}
          </Button>

          <button
            type="button"
            className={cn(
              "flex h-9 items-center gap-2.5 rounded-lg border border-neutral-200/90 bg-white pl-1.5 pr-3 transition-colors hover:bg-neutral-50",
              "dark:border-white/10 dark:bg-[#161616] dark:hover:bg-white/5"
            )}
            aria-label="User menu"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#007AFF] text-[10px] font-semibold text-white">
              {initials}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-medium leading-tight text-neutral-900 dark:text-white">
                {displayName}
              </span>
              <span className="block max-w-[140px] truncate text-[11px] text-neutral-500 lg:max-w-[180px]">
                {session?.user?.email}
              </span>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
