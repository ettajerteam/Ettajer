"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  LogOut,
  PanelLeft,
  PanelLeftClose,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSidebarStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { adminNavGroups, isAdminNavActive } from "@/lib/admin/admin-nav";
import { PlatformSwitch } from "@/components/admin/platform-switch";

const BRAND_ICON = "/brand/App-Logo.png";
const ease = [0.32, 0.72, 0, 1] as const;
const panelSpring = { type: "spring" as const, damping: 32, stiffness: 380 };

function useSaraCriticalCount(enabled: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetch("/api/admin/sara/status")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data && typeof data.criticalCount === "number") {
          setCount(data.criticalCount);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [enabled]);
  return count;
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isOpen, isCollapsed, setOpen, toggleCollapsed } = useSidebarStore();
  const hasSaraBadge = adminNavGroups.some((g) =>
    g.items.some((i) => i.criticalBadge)
  );
  const saraCriticalCount = useSaraCriticalCount(hasSaraBadge);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className={cn("shrink-0 px-3 pb-2 pt-3", isCollapsed && "px-2")}>
        <div
          className={cn(
            "flex items-center gap-1.5",
            isCollapsed && "flex-col gap-2"
          )}
        >
          <Link
            href="/admin"
            className={cn(
              "flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-1 py-1 transition-colors duration-200 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]",
              isCollapsed && "justify-center px-0"
            )}
          >
            <div className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-white ring-1 ring-black/[0.06] dark:bg-white/95">
              <Image
                src={BRAND_ICON}
                alt="Ettajer"
                width={22}
                height={22}
                className="h-[22px] w-[22px] object-contain"
                priority
              />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="truncate text-[12px] font-semibold tracking-[-0.01em] text-neutral-900 dark:text-white">
                  Ettajer Console
                </p>
                <p className="truncate text-[10px] text-neutral-400">
                  Control center
                </p>
              </div>
            )}
          </Link>

          {!isCollapsed && (
            <button
              type="button"
              onClick={toggleCollapsed}
              className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-md text-neutral-400 transition-colors duration-200 hover:bg-black/[0.04] hover:text-neutral-700 lg:flex dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-neutral-400 transition-colors duration-200 hover:bg-black/[0.04] lg:hidden"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {isCollapsed && (
        <div className="hidden justify-center pb-2 lg:flex">
          <button
            type="button"
            onClick={toggleCollapsed}
            className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 transition-colors duration-200 hover:bg-black/[0.04] hover:text-neutral-700 dark:hover:bg-white/10"
            aria-label="Expand sidebar"
          >
            <PanelLeft className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className={cn("px-2 pb-2", isCollapsed && "px-1.5")}>
        <PlatformSwitch mode="admin" collapsed={isCollapsed} />
      </div>

      <nav className="flex-1 space-y-3 overflow-x-hidden overflow-y-auto px-2 pb-2">
        {adminNavGroups.map((group) => (
          <div key={group.id}>
            {!isCollapsed && (
              <p className="px-2.5 pb-1 pt-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-neutral-400">
                {group.label}
              </p>
            )}
            <div className="space-y-px">
              {group.items.map((item) => {
                const active = isAdminNavActive(pathname, item.href);
                const badge =
                  item.criticalBadge && saraCriticalCount > 0
                    ? saraCriticalCount
                    : 0;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    title={isCollapsed ? item.label : undefined}
                    className={cn(
                      "group/item relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[12px] transition-colors duration-200",
                      item.subtitle && !isCollapsed && "py-2",
                      isCollapsed && "justify-center px-0",
                      active
                        ? "font-medium text-neutral-900 dark:text-white"
                        : "font-normal text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="admin-sidebar-active-pill"
                        className="absolute inset-0 rounded-md bg-black/[0.05] dark:bg-white/[0.08]"
                        transition={panelSpring}
                      />
                    )}
                    <span className="relative z-10 flex shrink-0 items-center">
                      <item.icon
                        className={cn(
                          "h-3.5 w-3.5 transition-colors duration-200",
                          active || item.id === "sara"
                            ? "text-[#007AFF]"
                            : "text-neutral-400 group-hover/item:text-neutral-500"
                        )}
                        strokeWidth={active || item.id === "sara" ? 2.25 : 1.75}
                      />
                      {item.statusDot && isCollapsed ? (
                        <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-[#F5F5F7] dark:ring-[#111111]" />
                      ) : null}
                      {badge > 0 && isCollapsed ? (
                        <span className="absolute -bottom-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-0.5 text-[8px] font-semibold text-white">
                          {badge > 9 ? "9+" : badge}
                        </span>
                      ) : null}
                    </span>
                    {!isCollapsed && (
                      <span className="relative z-10 min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span className="truncate">{item.label}</span>
                          {item.statusDot ? (
                            <span
                              className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"
                              title="Live"
                            />
                          ) : null}
                        </span>
                        {item.subtitle ? (
                          <span className="block truncate text-[10px] font-normal text-neutral-400">
                            {item.subtitle}
                          </span>
                        ) : null}
                      </span>
                    )}
                    {!isCollapsed && badge > 0 ? (
                      <span className="relative z-10 flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold text-white">
                        {badge > 99 ? "99+" : badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-black/[0.06] p-2 dark:border-white/10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex w-full items-center gap-2 rounded-lg p-1.5 text-left transition-colors duration-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.05]",
                isCollapsed && "justify-center"
              )}
            >
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarImage src={session?.user?.image ?? undefined} />
                <AvatarFallback className="bg-[#007AFF] text-[9px] font-semibold text-white">
                  {session?.user?.name?.[0] ??
                    session?.user?.email?.[0]?.toUpperCase() ??
                    "A"}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium text-neutral-900 dark:text-white">
                    {session?.user?.name ?? "Admin"}
                  </p>
                  <p className="truncate text-[10px] text-neutral-400">
                    {session?.user?.email}
                  </p>
                </div>
              )}
              {!isCollapsed && (
                <ChevronDown className="h-3 w-3 shrink-0 text-neutral-400" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            side="top"
            sideOffset={6}
            className="w-56 rounded-xl border-black/[0.06] p-0 shadow-lg dark:border-white/10"
          >
            <div className="border-b border-black/[0.06] px-3 py-2.5 dark:border-white/10">
              <p className="truncate text-[12px] font-medium">
                {session?.user?.name ?? "Admin"}
              </p>
              <p className="truncate text-[10px] text-neutral-400">
                {session?.user?.email}
              </p>
            </div>
            <div className="p-1">
              <DropdownMenuItem asChild className="rounded-lg text-[12px]">
                <Link href="/dashboard">Merchant dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-lg text-[12px] text-red-600 focus:bg-red-50 focus:text-red-600 dark:text-red-400 dark:focus:bg-red-500/10 dark:focus:text-red-400"
              >
                <LogOut className="mr-2 h-3.5 w-3.5" />
                Sign out
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  const panelClass = cn(
    "flex h-full w-full flex-col overflow-hidden",
    "border-r border-black/[0.06] bg-[#F5F5F7] dark:border-white/10 dark:bg-[#111111]"
  );

  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden transition-[width] duration-300 lg:flex",
          "[transition-timing-function:cubic-bezier(0.32,0.72,0,1)]",
          isCollapsed ? "w-[72px]" : "w-[220px]"
        )}
      >
        <div className={panelClass}>{sidebarContent}</div>
      </aside>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.28, ease }}
              className="fixed inset-y-0 left-0 z-50 w-[220px] lg:hidden"
            >
              <div className={panelClass}>{sidebarContent}</div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
