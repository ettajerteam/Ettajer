"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Globe,
  Loader2,
  MessageSquare,
  Rocket,
  Search,
  ShoppingBag,
  Store,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { adminNavItems } from "@/lib/admin/admin-nav";

type SearchResults = {
  users: {
    id: string;
    name: string | null;
    email: string;
    _count?: { stores: number };
  }[];
  stores: {
    id: string;
    name: string;
    slug: string;
    ownerId?: string;
    ownerName?: string | null;
    ownerEmail?: string;
    realOrders?: number;
  }[];
  orders: {
    id: string;
    orderNumber: string;
    total: number;
    store: { name: string; id?: string };
  }[];
  shortcuts?: {
    id: string;
    label: string;
    hint: string;
    href: string;
    group: string;
  }[];
};

type PaletteItem = {
  id: string;
  label: string;
  hint?: string;
  href: string;
  group: string;
  icon?: React.ComponentType<{ className?: string }>;
};

const QUICK_ACTIONS: PaletteItem[] = [
  {
    id: "qa-pending",
    label: "Verify pending orders",
    hint: "COD backlog",
    href: "/admin/payments?focus=pending",
    group: "Quick actions",
    icon: ShoppingBag,
  },
  {
    id: "qa-activation",
    label: "Open activation targets",
    href: "/admin/activation?stage=empty",
    group: "Quick actions",
    icon: Rocket,
  },
  {
    id: "qa-listed",
    label: "First-sale targets",
    href: "/admin/activation?stage=listed",
    group: "Quick actions",
    icon: Store,
  },
  {
    id: "qa-support",
    label: "Open support inbox",
    href: "/admin/messages",
    group: "Quick actions",
    icon: MessageSquare,
  },
  {
    id: "qa-domains",
    label: "Domain health",
    href: "/admin/domains",
    group: "Quick actions",
    icon: Globe,
  },
  {
    id: "qa-payments",
    label: "Payments & GMV",
    href: "/admin/payments",
    group: "Quick actions",
    icon: CreditCard,
  },
];

function isMac() {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad/.test(navigator.platform);
}

export function AdminCommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults>({
    users: [],
    stores: [],
    orders: [],
    shortcuts: [],
  });

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("ettajer:open-command-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("ettajer:open-command-palette", onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActive(0);
      setResults({ users: [], stores: [], orders: [], shortcuts: [] });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    let cancelled = false;
    setLoading(true);
    const t = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/admin/search?q=${encodeURIComponent(q)}`
        );
        if (!res.ok) throw new Error("search failed");
        const data = (await res.json()) as SearchResults;
        if (!cancelled) setResults(data);
      } catch {
        if (!cancelled)
          setResults({ users: [], stores: [], orders: [], shortcuts: [] });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 140);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [query, open]);

  const navItems: PaletteItem[] = useMemo(
    () =>
      adminNavItems.map((item) => ({
        id: `nav-${item.id}`,
        label: item.label,
        hint: item.description,
        href: item.href,
        group: "Navigate",
        icon: item.icon,
      })),
    []
  );

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list: PaletteItem[] = [];

    for (const s of results.shortcuts ?? []) {
      list.push({
        id: s.id,
        label: s.label,
        hint: s.hint,
        href: s.href,
        group: s.group,
      });
    }

    for (const store of results.stores) {
      list.push({
        id: `store-${store.id}`,
        label: store.name,
        hint: `/${store.slug}${
          typeof store.realOrders === "number"
            ? ` · ${store.realOrders} real order${store.realOrders === 1 ? "" : "s"}`
            : ""
        }`,
        href: `/admin/stores/${store.id}`,
        group: "Stores",
        icon: Store,
      });
      if (store.ownerId) {
        list.push({
          id: `store-owner-${store.id}`,
          label: store.ownerName || store.ownerEmail || "Merchant",
          hint: "Open merchant",
          href: `/admin/users/${store.ownerId}`,
          group: "Merchants",
          icon: Users,
        });
        list.push({
          id: `store-orders-${store.id}`,
          label: `Orders · ${store.name}`,
          hint: "View payments filtered by store page",
          href: `/admin/stores/${store.id}`,
          group: "Actions",
          icon: ShoppingBag,
        });
      }
    }

    for (const u of results.users) {
      list.push({
        id: `user-${u.id}`,
        label: u.name || u.email,
        hint: `${u.email}${
          u._count ? ` · ${u._count.stores} store${u._count.stores === 1 ? "" : "s"}` : ""
        }`,
        href: `/admin/users/${u.id}`,
        group: "Users",
        icon: Users,
      });
    }

    for (const o of results.orders) {
      list.push({
        id: `order-${o.id}`,
        label: `#${o.orderNumber}`,
        hint: `${o.store.name} · ${Math.round(o.total).toLocaleString()} MAD`,
        href: `/admin/orders/${o.id}`,
        group: "Orders",
        icon: ShoppingBag,
      });
    }

    const filter = (rows: PaletteItem[]) =>
      !q
        ? rows
        : rows.filter(
            (r) =>
              r.label.toLowerCase().includes(q) ||
              (r.hint ?? "").toLowerCase().includes(q) ||
              r.group.toLowerCase().includes(q)
          );

    list.push(...filter(QUICK_ACTIONS));
    list.push(...filter(navItems));

    const seen = new Set<string>();
    return list.filter((item) => {
      const key = `${item.group}:${item.href}:${item.label}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [query, results, navItems]);

  useEffect(() => {
    setActive(0);
  }, [items.length, query]);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, Math.max(items.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = items[active];
      if (item) go(item.href);
    }
  }

  let lastGroup = "";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden h-7 items-center gap-2 rounded-md border border-black/[0.06] bg-black/[0.02] px-2 text-[11px] text-neutral-500 transition-colors hover:bg-black/[0.04] sm:inline-flex dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]"
        aria-label="Open command palette"
      >
        <Search className="h-3 w-3" />
        <span>Search</span>
        <kbd className="rounded border border-black/[0.06] bg-white px-1 py-0.5 font-mono text-[9px] text-neutral-400 dark:border-white/10 dark:bg-black/30">
          {isMac() ? "⌘K" : "Ctrl K"}
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl gap-0 overflow-hidden p-0 sm:rounded-xl">
          <DialogTitle className="sr-only">Command palette</DialogTitle>
          <div className="flex items-center gap-2 border-b border-black/[0.06] px-3 dark:border-white/10">
            <Search className="h-4 w-4 shrink-0 text-neutral-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search users, stores, orders — or try “pending orders”"
              className="h-11 w-full bg-transparent text-[13px] outline-none placeholder:text-neutral-400"
            />
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-400" />
            ) : null}
          </div>
          <div className="max-h-[380px] overflow-y-auto p-1.5">
            {items.length === 0 ? (
              <p className="px-3 py-6 text-center text-[12px] text-neutral-400">
                No matches
              </p>
            ) : (
              items.map((item, index) => {
                const showGroup = item.group !== lastGroup;
                lastGroup = item.group;
                const Icon = item.icon;
                return (
                  <div key={item.id}>
                    {showGroup ? (
                      <p className="px-2.5 pb-1 pt-2 text-[10px] font-medium uppercase tracking-[0.08em] text-neutral-400">
                        {item.group}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      onMouseEnter={() => setActive(index)}
                      onClick={() => go(item.href)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12px] transition-colors",
                        index === active
                          ? "bg-black/[0.05] text-neutral-900 dark:bg-white/[0.08] dark:text-white"
                          : "text-neutral-600 dark:text-neutral-300"
                      )}
                    >
                      {Icon ? (
                        <Icon className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                      ) : null}
                      <span className="min-w-0 flex-1 truncate font-medium">
                        {item.label}
                      </span>
                      {item.hint ? (
                        <span className="truncate text-[11px] text-neutral-400">
                          {item.hint}
                        </span>
                      ) : null}
                    </button>
                  </div>
                );
              })
            )}
          </div>
          <div className="flex items-center justify-between border-t border-black/[0.06] px-3 py-2 text-[10px] text-neutral-400 dark:border-white/10">
            <span>↑↓ navigate · ↵ open · esc close</span>
            <span>Ettajer Console</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
