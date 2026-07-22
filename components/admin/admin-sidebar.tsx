"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  LogOut,
  PanelLeft,
  PanelLeftClose,
  Shield,
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
import { adminNavItems, isAdminNavActive } from "@/lib/admin/admin-nav";
import { PlatformSwitch } from "@/components/admin/platform-switch";

const panelSpring = { type: "spring" as const, damping: 30, stiffness: 340 };

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isOpen, isCollapsed, setOpen, toggleCollapsed } = useSidebarStore();

  const sidebarContent = (
    <div className="flex h-full flex-col text-muted-foreground">
      <div className={cn("relative shrink-0 px-3 pt-4 pb-3", isCollapsed && "px-2")}>
        <Link
          href="/admin"
          className={cn("flex items-center gap-2.5 min-w-0 group", isCollapsed && "justify-center")}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600 shadow-sm shadow-violet-600/30">
            <Shield className="h-[18px] w-[18px] text-white" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold truncate leading-tight text-foreground">Ettajer Admin</p>
              <p className="text-[11px] truncate text-muted-foreground/70">Platform control</p>
            </div>
          )}
        </Link>
        {!isCollapsed && (
          <button
            type="button"
            onClick={toggleCollapsed}
            className="hidden lg:flex absolute right-3 top-4 h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="lg:hidden absolute right-3 top-4 h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {isCollapsed && (
        <div className="hidden lg:flex justify-center pb-2">
          <button
            type="button"
            onClick={toggleCollapsed}
            className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Expand sidebar"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className={cn("px-2 pb-3", isCollapsed && "px-1.5")}>
        <PlatformSwitch mode="admin" collapsed={isCollapsed} />
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-2 space-y-0.5">
        {adminNavItems.map((item) => {
          const active = isAdminNavActive(pathname, item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setOpen(false)}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                isCollapsed && "justify-center px-0",
                active
                  ? "font-semibold text-foreground"
                  : "font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {active && (
                <motion.span
                  layoutId="admin-sidebar-active-pill"
                  className="absolute inset-0 rounded-lg bg-violet-500/10 ring-1 ring-violet-500/20"
                  transition={panelSpring}
                />
              )}
              {active && !isCollapsed && (
                <span className="absolute left-0 top-1/2 z-10 h-5 w-1 -translate-y-1/2 rounded-r-full bg-violet-600" />
              )}
              <item.icon
                className={cn(
                  "relative z-10 h-[18px] w-[18px] shrink-0",
                  active && "text-violet-600"
                )}
                strokeWidth={active ? 2.25 : 1.75}
              />
              {!isCollapsed && (
                <span className="relative z-10 truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 p-2 border-t border-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "w-full flex items-center gap-3 rounded-lg p-2 transition-colors text-left hover:bg-muted",
                isCollapsed && "justify-center"
              )}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={session?.user?.image ?? undefined} />
                <AvatarFallback className="text-xs font-bold bg-violet-600 text-white">
                  {session?.user?.name?.[0] ?? session?.user?.email?.[0]?.toUpperCase() ?? "A"}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate text-foreground">
                    {session?.user?.name ?? "Admin"}
                  </p>
                  <p className="text-[11px] truncate text-muted-foreground/70">{session?.user?.email}</p>
                </div>
              )}
              {!isCollapsed && <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 rounded-xl p-0">
            <div className="px-4 py-3 border-b">
              <p className="text-sm font-semibold truncate">{session?.user?.name ?? "Admin"}</p>
              <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
            </div>
            <div className="p-1">
              <DropdownMenuItem asChild>
                <Link href="/dashboard">Merchant dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  const panelClass = cn(
    "relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_2px_rgba(15,23,42,0.05),0_20px_45px_-34px_rgba(15,23,42,0.45)]",
    isCollapsed ? "w-[80px]" : "w-[268px]"
  );

  return (
    <>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 hidden h-screen p-3 transition-all duration-300 lg:flex",
          isCollapsed ? "w-[96px]" : "w-[284px]"
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
              className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={panelSpring}
              className="fixed left-0 top-0 z-50 h-screen w-[284px] p-3 lg:hidden"
            >
              <div className={cn(panelClass, "w-full")}>{sidebarContent}</div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
