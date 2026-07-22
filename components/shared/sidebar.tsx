"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, LogOut, Settings, Store, ExternalLink, PanelLeftClose, PanelLeft, X } from "lucide-react";
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
import { PlatformSwitch } from "@/components/admin/platform-switch";

const panelSpring = { type: "spring" as const, damping: 30, stiffness: 340 };

function resolveHref(href: string | undefined): string {
  if (!href) return "#";
  return href;
}

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const { data: session } = useSession();
  const { isOpen, isCollapsed, setOpen, toggleCollapsed } = useSidebarStore();
  const [storeName, setStoreName] = useState("My Store");
  const [storeSlug, setStoreSlug] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

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
            "relative flex items-center gap-3 rounded-lg text-sm transition-colors",
            nested ? "px-3 py-2 pl-11" : "px-3 py-2.5",
            active
              ? "font-semibold text-foreground"
              : "font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          {active && (
            <motion.span
              layoutId="sidebar-active-pill"
              className="absolute inset-0 rounded-lg bg-muted ring-1 ring-border/60"
              transition={panelSpring}
            />
          )}
          <span className="relative z-10 truncate flex items-center gap-2">
            {link.label}
            {link.comingSoon && (
              <span className="text-[9px] uppercase tracking-wider font-bold opacity-50">Soon</span>
            )}
            {isExternal && <ExternalLink className="h-3 w-3 opacity-50" />}
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
            "group/item relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
            isCollapsed && "justify-center px-0",
            active
              ? "font-semibold text-foreground"
              : "font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          {active && (
            <motion.span
              layoutId="sidebar-active-pill"
              className="absolute inset-0 rounded-lg bg-muted ring-1 ring-border/60"
              transition={panelSpring}
            />
          )}
          {active && !isCollapsed && (
            <span className="absolute left-0 top-1/2 z-10 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[#007AFF]" />
          )}
          <group.icon
            className={cn(
              "relative z-10 h-[18px] w-[18px] shrink-0",
              active && "text-[#007AFF]"
            )}
            strokeWidth={active ? 2.25 : 1.75}
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
            "relative w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
            isCollapsed && "justify-center px-0",
            groupActive
              ? "font-semibold text-foreground"
              : "font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          {groupActive && !isExpanded && (
            <span className="absolute inset-0 rounded-lg bg-muted ring-1 ring-border/60" />
          )}
          <group.icon
            className={cn("relative z-10 h-[18px] w-[18px] shrink-0", groupActive && "text-[#007AFF]")}
            strokeWidth={groupActive ? 2.25 : 1.75}
          />
          {!isCollapsed && (
            <>
              <span className="relative z-10 flex-1 text-left truncate">{group.label}</span>
              <ChevronDown
                className={cn(
                  "relative z-10 h-4 w-4 shrink-0 transition-transform duration-200",
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
              transition={{ duration: 0.2 }}
              className="overflow-hidden space-y-0.5 mt-0.5 mb-1"
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
      <div key={section.id} className="space-y-0.5">
        {section.title && !isCollapsed && (
          <p className="px-3 pt-4 pb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground/60">
            {section.title}
          </p>
        )}
        {isCollapsed && section.title && <div className="my-2 mx-3 border-t border-border" />}
        {section.items.map(renderGroup)}
      </div>
    );
  }

  const sidebarContent = (
    <div className="flex h-full flex-col text-muted-foreground">
      <div className={cn("relative shrink-0 px-3 pt-4 pb-3", isCollapsed && "px-2")}>
        <Link href="/dashboard" className={cn("flex items-center gap-2.5 min-w-0 group", isCollapsed && "justify-center")}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#007AFF] shadow-sm shadow-[#007AFF]/30">
            <Store className="h-[18px] w-[18px] text-white" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold truncate leading-tight text-foreground">{storeName}</p>
              <p className="text-[11px] truncate text-muted-foreground/70">Merchant Dashboard</p>
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
        <PlatformSwitch mode="merchant" collapsed={isCollapsed} />
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-2 space-y-1">
        {allNavSections.map(renderSection)}
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
                <AvatarFallback className="text-xs font-bold bg-muted text-foreground">
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
              <p className="text-sm font-semibold truncate">
                {session?.user?.name ?? "Admin"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {session?.user?.email}
              </p>
            </div>
            <div className="p-1">
              {storefrontHref && (
                <DropdownMenuItem asChild>
                  <Link href={storefrontHref} target="_blank">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View storefront
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
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
