"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  LogOut,
  Settings,
  ExternalLink,
  PanelLeftClose,
  PanelLeft,
  X,
  LayoutDashboard,
  ArrowLeftRight,
  UserRound,
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
import {
  allNavSections,
  isNavLinkActive,
  sectionHasActiveChild,
  type NavGroup,
  type NavLink,
  type NavSection,
} from "@/lib/dashboard-nav";
import { USER_ROLE } from "@/lib/admin/constants";
import { isBootstrapAdminEmail } from "@/lib/admin/auth-client";
import { getMerchantPlanInfo } from "@/lib/merchant-plan";

const BRAND_ICON = "/brand/App-Logo.png";
const ease = [0.32, 0.72, 0, 1] as const;
const panelSpring = { type: "spring" as const, damping: 32, stiffness: 380 };

function resolveHref(href: string | undefined): string {
  if (!href) return "#";
  return href;
}

function storeInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "S"
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const { data: session, update: updateSession } = useSession();
  const { isOpen, isCollapsed, setOpen, toggleCollapsed } = useSidebarStore();
  const [storeName, setStoreName] = useState("My Store");
  const [storeSlug, setStoreSlug] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const isAdmin = session?.user?.role === USER_ROLE.ADMIN;

  const plan = useMemo(
    () =>
      getMerchantPlanInfo({
        founderNumber: session?.user?.founderNumber,
        plan: session?.user?.plan,
      }),
    [session?.user?.founderNumber, session?.user?.plan]
  );

  useEffect(() => {
    const email = session?.user?.email;
    if (!email || isAdmin) return;
    if (isBootstrapAdminEmail(email)) {
      void updateSession();
    }
  }, [session?.user?.email, isAdmin, updateSession]);

  useEffect(() => {
    fetch("/api/store")
      .then((r) => r.json())
      .then((d) => {
        if (d.store?.name) setStoreName(d.store.name);
        if (d.store?.slug) setStoreSlug(d.store.slug);
      })
      .catch(() => {});
  }, []);

  const storefrontHref = storeSlug ? `/store/${storeSlug}` : undefined;
  const initials = storeInitials(storeName);

  const toggleGroup = useCallback((id: string) => {
    setExpanded((prev) => (prev[id] ? {} : { [id]: true }));
  }, []);

  useEffect(() => {
    let activeGroup: string | null = null;
    for (const section of allNavSections) {
      for (const group of section.items) {
        if (group.children && sectionHasActiveChild(pathname, search, group)) {
          activeGroup = group.id;
        }
      }
    }
    setExpanded(activeGroup ? { [activeGroup]: true } : {});
  }, [pathname, search]);

  function renderLink(link: NavLink, nested = true) {
    const href = resolveHref(link.href);
    const active = isNavLinkActive(pathname, link.href, search);
    const isExternal = link.external;

    return (
      <li key={link.id}>
        <Link
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          onClick={() => setOpen(false)}
          className={cn(
            "relative flex items-center gap-2 rounded-md text-[12px] transition-colors duration-200",
            nested ? "px-2.5 py-1.5 pl-9" : "px-2.5 py-1.5",
            active
              ? "font-medium text-neutral-900 dark:text-white"
              : "font-normal text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
          )}
        >
          {active && (
            <motion.span
              layoutId="sidebar-active-pill"
              className="absolute inset-0 rounded-md bg-black/[0.05] dark:bg-white/[0.08]"
              transition={panelSpring}
            />
          )}
          <span className="relative z-10 flex min-w-0 items-center gap-1.5 truncate">
            <span className="truncate">{link.label}</span>
            {link.comingSoon && (
              <span className="text-[9px] font-medium uppercase tracking-wide text-neutral-400">
                Soon
              </span>
            )}
            {isExternal && <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-40" />}
          </span>
        </Link>
      </li>
    );
  }

  function renderGroup(group: NavGroup) {
    const hasChildren = !!group.children?.length;
    const isExpanded = expanded[group.id] ?? false;
    const href = group.href ? resolveHref(group.href) : undefined;
    const groupActive =
      (href && isNavLinkActive(pathname, group.href!, search)) ||
      sectionHasActiveChild(pathname, search, group);

    if (!hasChildren && href) {
      const active = isNavLinkActive(pathname, group.href!, search);
      return (
        <Link
          key={group.id}
          href={href}
          onClick={() => setOpen(false)}
          title={isCollapsed ? group.label : undefined}
          className={cn(
            "group/item relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[12px] transition-colors duration-200",
            isCollapsed && "justify-center px-0",
            active
              ? "font-medium text-neutral-900 dark:text-white"
              : "font-normal text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
          )}
        >
          {active && (
            <motion.span
              layoutId="sidebar-active-pill"
              className="absolute inset-0 rounded-md bg-black/[0.05] dark:bg-white/[0.08]"
              transition={panelSpring}
            />
          )}
          <group.icon
            className={cn(
              "relative z-10 h-3.5 w-3.5 shrink-0 transition-colors duration-200",
              active ? "text-[#007AFF]" : "text-neutral-400 group-hover/item:text-neutral-500"
            )}
            strokeWidth={active ? 2 : 1.6}
          />
          {!isCollapsed && <span className="relative z-10 truncate">{group.label}</span>}
        </Link>
      );
    }

    return (
      <div key={group.id}>
        <button
          type="button"
          onClick={() => toggleGroup(group.id)}
          title={isCollapsed ? group.label : undefined}
          className={cn(
            "relative flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[12px] transition-colors duration-200",
            isCollapsed && "justify-center px-0",
            groupActive
              ? "font-medium text-neutral-900 dark:text-white"
              : "font-normal text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
          )}
        >
          {groupActive && !isExpanded && (
            <span className="absolute inset-0 rounded-md bg-black/[0.04] dark:bg-white/[0.06]" />
          )}
          <group.icon
            className={cn(
              "relative z-10 h-3.5 w-3.5 shrink-0",
              groupActive ? "text-[#007AFF]" : "text-neutral-400"
            )}
            strokeWidth={groupActive ? 2 : 1.6}
          />
          {!isCollapsed && (
            <>
              <span className="relative z-10 flex-1 truncate text-left">{group.label}</span>
              <ChevronDown
                className={cn(
                  "relative z-10 h-3 w-3 shrink-0 text-neutral-400 transition-transform duration-200",
                  isExpanded && "rotate-180"
                )}
              />
            </>
          )}
        </button>
        <AnimatePresence initial={false}>
          {isExpanded && !isCollapsed && (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease }}
              className="mt-0.5 mb-1 space-y-px overflow-hidden"
            >
              {group.children?.map((child) => renderLink(child))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    );
  }

  function renderSection(section: NavSection) {
    return (
      <div key={section.id} className="space-y-px">
        {section.title && !isCollapsed && (
          <p className="px-2.5 pb-1 pt-4 text-[10px] font-medium uppercase tracking-[0.08em] text-neutral-400 first:pt-0.5">
            {section.title}
          </p>
        )}
        {isCollapsed && section.title && (
          <div className="mx-2 my-2 border-t border-black/[0.06] dark:border-white/10" />
        )}
        {section.items.map(renderGroup)}
      </div>
    );
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className={cn("shrink-0 px-3 pb-2 pt-3", isCollapsed && "px-2")}>
        <div className={cn("flex items-center gap-1.5", isCollapsed && "flex-col gap-2")}>
          <Link
            href="/dashboard"
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
                  {storeName}
                </p>
                <p className="truncate text-[10px] text-neutral-400">Merchant</p>
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

      <nav className="flex-1 space-y-0.5 overflow-x-hidden overflow-y-auto px-2 pb-2">
        {allNavSections.map(renderSection)}
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
                  {initials}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-1">
                    <p className="truncate text-[12px] font-medium text-neutral-900 dark:text-white">
                      {storeName}
                    </p>
                    <span
                      className={cn(
                        "shrink-0 rounded px-1 py-px text-[9px] font-medium uppercase tracking-wide",
                        plan.kind === "founder"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                          : "bg-black/[0.04] text-neutral-500 dark:bg-white/10 dark:text-neutral-300"
                      )}
                    >
                      {plan.label}
                    </span>
                  </div>
                  <p className="truncate text-[10px] text-neutral-400">{session?.user?.email}</p>
                </div>
              )}
              {!isCollapsed && <ChevronDown className="h-3 w-3 shrink-0 text-neutral-400" />}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            side="top"
            sideOffset={6}
            className="w-56 rounded-xl border-black/[0.06] p-0 shadow-lg dark:border-white/10"
          >
            <div className="border-b border-black/[0.06] px-3 py-2.5 dark:border-white/10">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-[12px] font-medium">{storeName}</p>
                <span className="shrink-0 rounded px-1 py-px text-[9px] font-medium uppercase tracking-wide bg-black/[0.04] text-neutral-500">
                  {plan.label}
                </span>
              </div>
              <p className="truncate text-[10px] text-neutral-400">{session?.user?.email}</p>
              {plan.hint && (
                <p className="mt-1 text-[10px] text-neutral-400">{plan.hint}</p>
              )}
            </div>
            <div className="p-1">
              {isAdmin && (
                <>
                  <DropdownMenuItem asChild className="rounded-lg text-[12px]">
                    <Link href="/admin" className="flex items-start gap-2">
                      <LayoutDashboard className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1 font-medium">
                          Platform admin
                          <ArrowLeftRight className="h-3 w-3 opacity-50" />
                        </span>
                        <span className="block text-[10px] text-muted-foreground">
                          Ettajer control panel
                        </span>
                      </span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {storefrontHref && (
                <DropdownMenuItem asChild className="rounded-lg text-[12px]">
                  <Link href={storefrontHref} target="_blank">
                    <ExternalLink className="mr-2 h-3.5 w-3.5" />
                    View storefront
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild className="rounded-lg text-[12px]">
                <Link href="/dashboard/settings?tab=profile">
                  <UserRound className="mr-2 h-3.5 w-3.5" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-lg text-[12px]">
                <Link href="/dashboard/settings?tab=general">
                  <Settings className="mr-2 h-3.5 w-3.5" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-lg text-[12px]">
                <Link href={plan.href}>
                  {plan.needsUpgrade ? "Upgrade plan" : "View plan"}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-lg text-[12px] text-red-600 focus:bg-red-50 focus:text-red-600 dark:text-red-400 dark:focus:bg-red-500/10 dark:focus:text-red-400"
              >
                <LogOut className="mr-2 h-3.5 w-3.5" />
                Log out
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
