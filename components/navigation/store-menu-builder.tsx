"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  GripVertical,
  Monitor,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  Smartphone,
  Sparkles,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  defaultNavigation,
  isDestinationInMenu,
  type NavItem,
  type StoreMenuDestination,
} from "@/lib/navigation";
import { absoluteUrl } from "@/lib/seo/site-config";
import { getStoreUrl, resolveStoreNavHref } from "@/lib/storefront-urls";
import { cn } from "@/lib/utils";
import {
  dashboardCard,
  dashboardGlassHeader,
  dashboardPill,
  dashboardPillActive,
  dashboardPillGroup,
  dashboardPillInactive,
  dashboardPrimaryBtn,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";

const GROUP_LABELS: Record<StoreMenuDestination["group"], string> = {
  core: "Core",
  shop: "Shop",
  content: "Content",
  discover: "Discover",
  legal: "Policies",
  custom: "Your pages",
};

const GROUP_ORDER: StoreMenuDestination["group"][] = [
  "core",
  "shop",
  "content",
  "discover",
  "legal",
  "custom",
];

const TRUST_HREFS = ["/about", "/faq", "/shipping", "/contact"];
const SHOP_HREFS = ["/", "/products", "/collections", "/search"];

function uid(prefix = "n") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function normHref(href: string) {
  const t = href.trim() || "/";
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  const s = t.startsWith("/") ? t : `/${t}`;
  return s === "/" ? "/" : s.replace(/\/+$/, "") || "/";
}

function deepClone(items: NavItem[]): NavItem[] {
  return structuredClone(items);
}

function sameMenu(a: NavItem[], b: NavItem[]) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function sanitize(items: NavItem[]): NavItem[] {
  return items
    .map((item) => ({
      id: item.id || uid(),
      label: item.label.trim() || "Link",
      href: normHref(item.href),
      children: item.children
        ?.map((c) => ({
          id: c.id || uid("c"),
          label: c.label.trim() || "Link",
          href: normHref(c.href),
        }))
        .filter((c) => c.label),
    }))
    .filter((item) => item.label);
}

function countLinks(items: NavItem[]) {
  return items.reduce((n, i) => n + 1 + (i.children?.length ?? 0), 0);
}

type PreviewMode = "desktop" | "mobile";

type BuilderProps = {
  initial: NavItem[];
  destinations: StoreMenuDestination[];
  storeSlug: string;
  storeName: string;
  storeLogo?: string | null;
};

export function StoreMenuBuilder({
  initial,
  destinations,
  storeSlug,
  storeName,
  storeLogo,
}: BuilderProps) {
  const [menu, setMenu] = useState(() => deepClone(initial));
  const [saved, setSaved] = useState(() => deepClone(initial));
  const [history, setHistory] = useState<NavItem[][]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(
    initial[0]?.id ?? null
  );
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [previewDropId, setPreviewDropId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQ, setPickerQ] = useState("");
  const [pickerGroup, setPickerGroup] = useState<
    "all" | StoreMenuDestination["group"]
  >("all");
  const [customMode, setCustomMode] = useState(false);
  const [customLabel, setCustomLabel] = useState("");
  const [customHref, setCustomHref] = useState("/");
  const [nestUnderId, setNestUnderId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const labelRef = useRef<HTMLInputElement>(null);

  const dirty = !sameMenu(menu, saved);
  const storeUrl = absoluteUrl(getStoreUrl(storeSlug));
  const selected = menu.find((m) => m.id === selectedId) ?? null;
  const selectedIndex = selected
    ? menu.findIndex((m) => m.id === selected.id)
    : -1;

  const pushHistory = useCallback((prev: NavItem[]) => {
    setHistory((h) => [...h.slice(-19), deepClone(prev)]);
  }, []);

  const setMenuTracked = useCallback(
    (updater: (prev: NavItem[]) => NavItem[]) => {
      setMenu((prev) => {
        pushHistory(prev);
        return updater(prev);
      });
    },
    [pushHistory]
  );

  const undo = () => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1]!;
      setMenu(deepClone(prev));
      return h.slice(0, -1);
    });
    toast.message("Undid last change");
  };

  const discard = () => {
    setMenu(deepClone(saved));
    setHistory([]);
    setSelectedId(saved[0]?.id ?? null);
    toast.message("Discarded unpublished changes");
  };

  const missingDestinations = useMemo(
    () => destinations.filter((d) => !isDestinationInMenu(menu, d.href)),
    [destinations, menu]
  );

  const pickerGrouped = useMemo(() => {
    const q = pickerQ.trim().toLowerCase();
    const list = missingDestinations.filter((d) => {
      if (pickerGroup !== "all" && d.group !== pickerGroup) return false;
      if (!q) return true;
      return (
        d.label.toLowerCase().includes(q) ||
        d.href.toLowerCase().includes(q) ||
        (d.description ?? "").toLowerCase().includes(q)
      );
    });
    return GROUP_ORDER.map((group) => ({
      group,
      label: GROUP_LABELS[group],
      items: list.filter((d) => d.group === group),
    })).filter((g) => g.items.length > 0);
  }, [missingDestinations, pickerQ, pickerGroup]);

  const issues = useMemo(() => {
    const list: string[] = [];
    const hrefs = new Map<string, number>();
    for (const item of menu) {
      if (!item.label.trim()) list.push("A top link has an empty label");
      const h = normHref(item.href);
      hrefs.set(h, (hrefs.get(h) ?? 0) + 1);
      for (const c of item.children ?? []) {
        if (!c.label.trim()) list.push(`Empty submenu label under “${item.label || "Untitled"}”`);
        const ch = normHref(c.href);
        hrefs.set(ch, (hrefs.get(ch) ?? 0) + 1);
      }
    }
    for (const [h, n] of Array.from(hrefs.entries())) {
      if (n > 1) list.push(`Duplicate URL ${h}`);
    }
    if (menu.length > 7) {
      list.push(`${menu.length} top links — mobile menus work better with 7 or fewer`);
    }
    if (!menu.some((m) => normHref(m.href) === "/")) {
      list.push("No Home link (/) yet");
    }
    return Array.from(new Set(list)).slice(0, 5);
  }, [menu]);

  const checklist = useMemo(
    () => [
      {
        id: "home",
        label: "Home in menu",
        done: menu.some((m) => normHref(m.href) === "/"),
      },
      {
        id: "labels",
        label: "All labels filled",
        done: menu.every(
          (m) =>
            m.label.trim() &&
            (m.children ?? []).every((c) => c.label.trim())
        ),
      },
      {
        id: "size",
        label: "≤ 7 top links",
        done: menu.length > 0 && menu.length <= 7,
      },
      {
        id: "published",
        label: "Changes published",
        done: !dirty && menu.length > 0,
      },
    ],
    [menu, dirty]
  );

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  useEffect(() => {
    if (selectedId) {
      const t = window.setTimeout(() => labelRef.current?.focus(), 60);
      return () => window.clearTimeout(t);
    }
  }, [selectedId]);

  const patchSelected = (patch: Partial<Pick<NavItem, "label" | "href">>) => {
    if (!selectedId) return;
    setMenu((prev) =>
      prev.map((item) =>
        item.id === selectedId ? { ...item, ...patch } : item
      )
    );
  };

  const patchChild = (
    childId: string,
    patch: Partial<Pick<NavItem, "label" | "href">>
  ) => {
    if (!selectedId) return;
    setMenu((prev) =>
      prev.map((item) => {
        if (item.id !== selectedId) return item;
        return {
          ...item,
          children: (item.children ?? []).map((c) =>
            c.id === childId ? { ...c, ...patch } : c
          ),
        };
      })
    );
  };

  const moveTop = (id: string, dir: -1 | 1) => {
    setMenuTracked((prev) => {
      const i = prev.findIndex((x) => x.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      const [row] = next.splice(i, 1);
      next.splice(j, 0, row);
      return next;
    });
  };

  const moveChild = (childId: string, dir: -1 | 1) => {
    if (!selectedId) return;
    setMenuTracked((prev) =>
      prev.map((item) => {
        if (item.id !== selectedId || !item.children) return item;
        const i = item.children.findIndex((c) => c.id === childId);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= item.children.length) return item;
        const kids = [...item.children];
        const [row] = kids.splice(i, 1);
        kids.splice(j, 0, row);
        return { ...item, children: kids };
      })
    );
  };

  const reorderTop = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    setMenuTracked((prev) => {
      const from = prev.findIndex((i) => i.id === fromId);
      const to = prev.findIndex((i) => i.id === toId);
      if (from < 0 || to < 0) return prev;
      const next = [...prev];
      const [row] = next.splice(from, 1);
      next.splice(to, 0, row);
      return next;
    });
  };

  const removeTop = (id: string) => {
    setMenuTracked((prev) => {
      const next = prev.filter((x) => x.id !== id);
      setSelectedId((cur) => (cur === id ? (next[0]?.id ?? null) : cur));
      return next;
    });
  };

  const removeChild = (childId: string) => {
    if (!selectedId) return;
    setMenuTracked((prev) =>
      prev.map((item) => {
        if (item.id !== selectedId) return item;
        const kids = (item.children ?? []).filter((c) => c.id !== childId);
        return { ...item, children: kids.length ? kids : undefined };
      })
    );
  };

  const duplicateSelected = () => {
    if (!selected) return;
    const copy: NavItem = {
      ...deepClone([selected])[0]!,
      id: uid(),
      label: `${selected.label.trim() || "Link"} copy`,
      children: selected.children?.map((c) => ({ ...c, id: uid("c") })),
    };
    setMenuTracked((prev) => {
      const i = prev.findIndex((x) => x.id === selected.id);
      const next = [...prev];
      next.splice(i + 1, 0, copy);
      return next;
    });
    setSelectedId(copy.id);
    toast.success("Link duplicated");
  };

  const insertLink = (label: string, href: string, parentId: string | null) => {
    const id = uid(parentId ? "c" : "n");
    const link: NavItem = { id, label, href: normHref(href) };
    if (parentId) {
      setMenuTracked((prev) =>
        prev.map((item) =>
          item.id === parentId
            ? { ...item, children: [...(item.children ?? []), link] }
            : item
        )
      );
      setSelectedId(parentId);
    } else {
      setMenuTracked((prev) => [...prev, link]);
      setSelectedId(id);
    }
  };

  const addPack = (hrefs: string[], name: string) => {
    const toAdd = destinations.filter(
      (d) =>
        hrefs.includes(normHref(d.href)) &&
        !isDestinationInMenu(menu, d.href)
    );
    if (toAdd.length === 0) {
      toast.message(`${name} already covered`);
      return;
    }
    setMenuTracked((prev) => [
      ...prev,
      ...toAdd.map((d) => ({
        id: uid(),
        label: d.label,
        href: normHref(d.href),
      })),
    ]);
    toast.success(`Added ${toAdd.length} from ${name}`);
  };

  const openPicker = (nestUnder: string | null = null) => {
    setNestUnderId(nestUnder);
    setPickerQ("");
    setPickerGroup("all");
    setCustomMode(false);
    setCustomLabel("");
    setCustomHref("/");
    setPickerOpen(true);
  };

  const pickDestination = (dest: StoreMenuDestination) => {
    insertLink(dest.label, dest.href, nestUnderId);
    setPickerOpen(false);
    toast.success(`Added ${dest.label}`);
  };

  const pickCustom = () => {
    if (!customLabel.trim()) {
      toast.error("Add a label");
      return;
    }
    insertLink(customLabel.trim(), customHref, nestUnderId);
    setPickerOpen(false);
    toast.success("Link added");
  };

  const save = useCallback(async () => {
    const next = sanitize(menu);
    setSaving(true);
    try {
      const res = await fetch("/api/navigation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: next }),
      });
      if (!res.ok) throw new Error("Save failed");
      setMenu(next);
      setSaved(deepClone(next));
      setHistory([]);
      if (selectedId && !next.some((x) => x.id === selectedId)) {
        setSelectedId(next[0]?.id ?? null);
      }
      toast.success("Menu published to your store");
    } catch {
      toast.error("Couldn’t save menu");
    } finally {
      setSaving(false);
    }
  }, [menu, selectedId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (dirty && !saving) void save();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        if (
          (e.target as HTMLElement)?.tagName === "INPUT" ||
          (e.target as HTMLElement)?.tagName === "TEXTAREA"
        ) {
          return;
        }
        e.preventDefault();
        if (history.length) undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty, saving, save, history.length]);

  const applyDefaults = () => {
    const next = defaultNavigation();
    setMenuTracked(() => deepClone(next));
    setSelectedId(next[0]?.id ?? null);
    toast.message("Default menu loaded — publish to go live");
  };

  const resolvedSelectedUrl = selected
    ? absoluteUrl(resolveStoreNavHref(storeSlug, selected.href))
    : null;

  const readyCount = checklist.filter((c) => c.done).length;

  return (
    <div className="space-y-4 pb-24 lg:pb-4">
      <div
        className={cn(
          dashboardGlassHeader,
          "-mx-4 px-4 py-2.5 sm:-mx-5 sm:px-5"
        )}
      >
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[12px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
              Store menu
            </p>
            <span className="text-[10px] tabular-nums text-neutral-400">
              {countLinks(menu)} links
            </span>
            {dirty ? (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                Unpublished
              </span>
            ) : (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                Live
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              variant="ghost"
              className="hidden h-8 px-2 text-[11px] text-neutral-500 sm:inline-flex"
              disabled={history.length === 0}
              onClick={undo}
            >
              <Undo2 className="mr-1 h-3.5 w-3.5" />
              Undo
            </Button>
            {dirty ? (
              <Button
                variant="ghost"
                className="hidden h-8 px-2 text-[11px] text-neutral-500 sm:inline-flex"
                onClick={discard}
              >
                Discard
              </Button>
            ) : null}
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-black/[0.06] px-2.5 text-[11px] font-medium text-neutral-600 transition hover:text-[#007AFF] dark:border-white/10 dark:text-neutral-300"
            >
              Open store
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
            <Button
              loading={saving}
              disabled={!dirty}
              className={cn(dashboardPrimaryBtn, "h-8 px-3")}
              onClick={() => void save()}
            >
              Publish menu
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1100px] space-y-4">
        {/* Preview */}
        <section
          className={cn(
            dashboardCard,
            "overflow-hidden bg-gradient-to-b from-[#F8F8FA] to-white dark:from-[#161616] dark:to-[#1C1C1E]"
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.05] px-4 py-2.5 dark:border-white/10">
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-neutral-400">
              Live preview · tap to edit
            </p>
            <div className={dashboardPillGroup}>
              <button
                type="button"
                onClick={() => {
                  setPreviewMode("desktop");
                  setMobileOpen(false);
                }}
                className={cn(
                  dashboardPill,
                  "inline-flex items-center gap-1",
                  previewMode === "desktop"
                    ? dashboardPillActive
                    : dashboardPillInactive
                )}
              >
                <Monitor className="h-3 w-3" />
                Desktop
              </button>
              <button
                type="button"
                onClick={() => {
                  setPreviewMode("mobile");
                  setMobileOpen(false);
                }}
                className={cn(
                  dashboardPill,
                  "inline-flex items-center gap-1",
                  previewMode === "mobile"
                    ? dashboardPillActive
                    : dashboardPillInactive
                )}
              >
                <Smartphone className="h-3 w-3" />
                Mobile
              </button>
            </div>
          </div>

          <div className="px-3 py-5 sm:px-6">
            {previewMode === "desktop" ? (
              <div className="mx-auto max-w-3xl overflow-hidden rounded-[14px] border border-black/[0.08] bg-white shadow-[0_12px_40px_-24px_rgba(0,0,0,0.35)] dark:border-white/10 dark:bg-[#0F0F0F]">
                <div className="flex items-center gap-1.5 border-b border-black/[0.05] bg-[#F5F5F7] px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]">
                  <span className="h-2 w-2 rounded-full bg-[#FF5F57]" />
                  <span className="h-2 w-2 rounded-full bg-[#FEBC2E]" />
                  <span className="h-2 w-2 rounded-full bg-[#28C840]" />
                  <span className="ms-2 truncate font-sans text-[10px] text-neutral-400">
                    {storeUrl.replace(/^https?:\/\//, "")}
                  </span>
                </div>
                <div className="relative flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    {storeLogo ? (
                      <span className="relative h-7 w-7 overflow-hidden rounded-md border border-black/[0.06] dark:border-white/10">
                        <Image
                          src={storeLogo}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="28px"
                          unoptimized
                        />
                      </span>
                    ) : null}
                    <p className="text-[13px] font-semibold tracking-[-0.03em] text-neutral-900 dark:text-white">
                      {storeName}
                    </p>
                  </div>
                  <nav className="flex flex-wrap items-center gap-0.5">
                    {menu.length === 0 ? (
                      <span className="px-2 text-[11px] text-neutral-400">
                        No links yet
                      </span>
                    ) : (
                      menu.map((item) => {
                        const active = item.id === selectedId;
                        const dropOpen =
                          previewDropId === item.id ||
                          (active && Boolean(item.children?.length));
                        return (
                          <div key={item.id} className="relative">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedId(item.id);
                                setPreviewDropId(
                                  item.children?.length
                                    ? previewDropId === item.id
                                      ? null
                                      : item.id
                                    : null
                                );
                              }}
                              onMouseEnter={() => {
                                if (item.children?.length) {
                                  setPreviewDropId(item.id);
                                }
                              }}
                              className={cn(
                                "inline-flex items-center gap-0.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition",
                                active
                                  ? "bg-[#007AFF] text-white"
                                  : "text-neutral-600 hover:bg-black/[0.04] hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-white/[0.06]"
                              )}
                            >
                              {item.label.trim() || "Untitled"}
                              {item.children?.length ? (
                                <ChevronDown className="h-3 w-3 opacity-70" />
                              ) : null}
                            </button>
                            {dropOpen && item.children?.length ? (
                              <div
                                className="absolute left-0 top-full z-10 mt-1 min-w-[160px] rounded-[10px] border border-black/[0.08] bg-white p-1 shadow-lg dark:border-white/10 dark:bg-[#1C1C1E]"
                                onMouseLeave={() => setPreviewDropId(null)}
                              >
                                {item.children.map((c) => (
                                  <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => setSelectedId(item.id)}
                                    className="flex w-full rounded-md px-2.5 py-1.5 text-left text-[11px] text-neutral-700 hover:bg-[#F5F5F7] dark:text-neutral-200 dark:hover:bg-white/[0.06]"
                                  >
                                    {c.label.trim() || "Untitled"}
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        );
                      })
                    )}
                    <button
                      type="button"
                      onClick={() => openPicker(null)}
                      className="ms-1 inline-flex h-7 w-7 items-center justify-center rounded-md border border-dashed border-black/[0.12] text-neutral-400 transition hover:border-[#007AFF]/40 hover:text-[#007AFF] dark:border-white/15"
                      aria-label="Add link"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </nav>
                </div>
              </div>
            ) : (
              <div className="mx-auto w-full max-w-[280px] overflow-hidden rounded-[28px] border-[6px] border-neutral-900 bg-white shadow-xl dark:border-neutral-700 dark:bg-[#0F0F0F]">
                <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                <div className="flex items-center justify-between px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    {storeLogo ? (
                      <span className="relative h-6 w-6 overflow-hidden rounded-md">
                        <Image
                          src={storeLogo}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="24px"
                          unoptimized
                        />
                      </span>
                    ) : null}
                    <p className="truncate text-[12px] font-semibold tracking-[-0.02em]">
                      {storeName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileOpen((o) => !o)}
                    className="flex h-8 w-8 flex-col items-center justify-center gap-1 rounded-md hover:bg-black/[0.04]"
                    aria-label="Menu"
                  >
                    <span className="h-0.5 w-4 rounded bg-neutral-800 dark:bg-neutral-200" />
                    <span className="h-0.5 w-4 rounded bg-neutral-800 dark:bg-neutral-200" />
                    <span className="h-0.5 w-4 rounded bg-neutral-800 dark:bg-neutral-200" />
                  </button>
                </div>
                {mobileOpen ? (
                  <div className="border-t border-black/[0.06] px-2 py-2 dark:border-white/10">
                    {menu.length === 0 ? (
                      <p className="px-2 py-4 text-center text-[11px] text-neutral-400">
                        Empty menu
                      </p>
                    ) : (
                      <ul className="space-y-0.5">
                        {menu.map((item) => (
                          <li key={item.id}>
                            <button
                              type="button"
                              onClick={() => setSelectedId(item.id)}
                              className={cn(
                                "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[12px] font-medium",
                                item.id === selectedId
                                  ? "bg-[#007AFF]/10 text-[#007AFF]"
                                  : "text-neutral-800 dark:text-neutral-100"
                              )}
                            >
                              {item.label.trim() || "Untitled"}
                              {item.children?.length ? (
                                <span className="text-[9px] text-neutral-400">
                                  {item.children.length}
                                </span>
                              ) : null}
                            </button>
                            {item.children?.length ? (
                              <ul className="mb-1 ms-3 border-s border-black/[0.06] ps-2 dark:border-white/10">
                                {item.children.map((c) => (
                                  <li
                                    key={c.id}
                                    className="px-2 py-1 text-[11px] text-neutral-500"
                                  >
                                    {c.label.trim() || "Untitled"}
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    )}
                    <button
                      type="button"
                      onClick={() => openPicker(null)}
                      className="mt-1 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-black/[0.1] py-2 text-[11px] font-medium text-[#007AFF] dark:border-white/15"
                    >
                      <Plus className="h-3 w-3" />
                      Add link
                    </button>
                  </div>
                ) : (
                  <div className="px-3 pb-6 pt-2">
                    <p className="rounded-lg bg-[#F5F5F7] px-3 py-8 text-center text-[11px] text-neutral-400 dark:bg-white/[0.04]">
                      Tap the menu icon to open links
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Quick packs */}
        <section className={cn(dashboardCard, "overflow-hidden")}>
          <div className="flex flex-wrap items-center gap-2 px-4 py-3">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500">
              <Sparkles className="h-3.5 w-3.5 text-[#007AFF]" />
              Quick add
            </span>
            <button
              type="button"
              onClick={() => addPack(SHOP_HREFS, "Shop pack")}
              className="h-7 rounded-full border border-black/[0.08] bg-[#FAFAFA] px-2.5 text-[11px] font-medium text-neutral-600 transition hover:border-[#007AFF]/30 hover:text-[#007AFF] dark:border-white/10 dark:bg-white/[0.03]"
            >
              Shop pack
            </button>
            <button
              type="button"
              onClick={() => addPack(TRUST_HREFS, "Trust pack")}
              className="h-7 rounded-full border border-black/[0.08] bg-[#FAFAFA] px-2.5 text-[11px] font-medium text-neutral-600 transition hover:border-[#007AFF]/30 hover:text-[#007AFF] dark:border-white/10 dark:bg-white/[0.03]"
            >
              Trust pack
            </button>
            <button
              type="button"
              onClick={() => openPicker(null)}
              className="h-7 rounded-full border border-dashed border-black/[0.1] px-2.5 text-[11px] font-medium text-neutral-500 hover:text-[#007AFF] dark:border-white/15"
            >
              Browse all…
            </button>
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_200px]">
          {/* Order */}
          <section className={cn(dashboardCard, "overflow-hidden self-start")}>
            <div className="flex items-center justify-between border-b border-black/[0.05] px-3 py-2.5 dark:border-white/10">
              <h2 className={dashboardTitle}>Order</h2>
              <button
                type="button"
                onClick={() => openPicker(null)}
                className="inline-flex h-6 items-center gap-0.5 rounded px-1.5 text-[10px] font-medium text-[#007AFF] hover:bg-[#007AFF]/5"
              >
                <Plus className="h-3 w-3" />
                Add
              </button>
            </div>
            {menu.length === 0 ? (
              <div className="px-3 py-8 text-center">
                <p className="text-[11px] text-neutral-400">Empty menu</p>
                <Button
                  className={cn(dashboardPrimaryBtn, "mt-3 h-7 px-2.5")}
                  onClick={() => openPicker(null)}
                >
                  Add first link
                </Button>
              </div>
            ) : (
              <ol className="p-1.5">
                {menu.map((item, index) => {
                  const active = item.id === selectedId;
                  return (
                    <li
                      key={item.id}
                      draggable
                      onDragStart={() => setDragId(item.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (dragId) reorderTop(dragId, item.id);
                        setDragId(null);
                      }}
                      onDragEnd={() => setDragId(null)}
                      className={cn(dragId === item.id && "opacity-40")}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        className={cn(
                          "flex w-full items-center gap-1.5 rounded-lg px-1.5 py-2 text-left transition",
                          active
                            ? "bg-[#007AFF]/10 text-[#007AFF]"
                            : "text-neutral-700 hover:bg-black/[0.03] dark:text-neutral-200 dark:hover:bg-white/[0.04]"
                        )}
                      >
                        <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab text-neutral-300 active:cursor-grabbing" />
                        <span
                          className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold tabular-nums",
                            active
                              ? "bg-[#007AFF] text-white"
                              : "bg-[#F5F5F7] text-neutral-400 dark:bg-white/10"
                          )}
                        >
                          {index + 1}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[12px] font-medium">
                          {item.label.trim() || "Untitled"}
                        </span>
                        {item.children?.length ? (
                          <span className="text-[9px] tabular-nums text-neutral-400">
                            +{item.children.length}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}
            <div className="border-t border-black/[0.05] px-3 py-2 dark:border-white/10">
              <button
                type="button"
                onClick={applyDefaults}
                className="inline-flex items-center gap-1 text-[10px] font-medium text-neutral-400 transition hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <RotateCcw className="h-3 w-3" />
                Load default
              </button>
            </div>
          </section>

          {/* Inspector */}
          <section className={cn(dashboardCard, "overflow-hidden")}>
            {!selected ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center px-4 py-12 text-center">
                <p className="text-[14px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                  Nothing selected
                </p>
                <p className={cn(dashboardSubtitle, "mt-1 max-w-xs")}>
                  Tap a link in the preview or order list to edit it.
                </p>
                <Button
                  className={cn(dashboardPrimaryBtn, "mt-4 h-8 px-3")}
                  onClick={() => openPicker(null)}
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add link
                </Button>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
                  <div>
                    <h2 className={dashboardTitle}>Edit link</h2>
                    <p className={cn(dashboardSubtitle, "mt-0.5")}>
                      Position {selectedIndex + 1} of {menu.length}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-neutral-400"
                      disabled={selectedIndex <= 0}
                      onClick={() => moveTop(selected.id, -1)}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-neutral-400"
                      disabled={selectedIndex >= menu.length - 1}
                      onClick={() => moveTop(selected.id, 1)}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-neutral-400"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-48 rounded-xl border-black/[0.06] p-1 dark:border-white/10"
                      >
                        <DropdownMenuItem
                          className="cursor-pointer gap-2 rounded-lg text-[12px]"
                          onClick={() => openPicker(selected.id)}
                        >
                          <Plus className="h-3.5 w-3.5 text-neutral-400" />
                          Add submenu link
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer gap-2 rounded-lg text-[12px]"
                          onClick={duplicateSelected}
                        >
                          <Copy className="h-3.5 w-3.5 text-neutral-400" />
                          Duplicate
                        </DropdownMenuItem>
                        {resolvedSelectedUrl ? (
                          <DropdownMenuItem
                            className="cursor-pointer gap-2 rounded-lg text-[12px]"
                            onClick={() =>
                              window.open(
                                resolvedSelectedUrl,
                                "_blank",
                                "noopener,noreferrer"
                              )
                            }
                          >
                            <ExternalLink className="h-3.5 w-3.5 text-neutral-400" />
                            Open URL
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="cursor-pointer gap-2 rounded-lg text-[12px] text-red-600 focus:bg-red-50 focus:text-red-600"
                          onClick={() => removeTop(selected.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="space-y-4 px-4 py-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="menu-label"
                        className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400"
                      >
                        Label
                      </Label>
                      <Input
                        ref={labelRef}
                        id="menu-label"
                        value={selected.label}
                        onChange={(e) =>
                          patchSelected({ label: e.target.value })
                        }
                        placeholder="Shop"
                        className="h-9 rounded-lg border-black/[0.06] text-[13px] font-medium shadow-none focus-visible:ring-[#007AFF]/20 dark:border-white/10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="menu-href"
                        className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400"
                      >
                        Path or URL
                      </Label>
                      <Input
                        id="menu-href"
                        value={selected.href}
                        onChange={(e) =>
                          patchSelected({ href: e.target.value })
                        }
                        placeholder="/products"
                        className="h-9 rounded-lg border-black/[0.06] font-sans text-[12px] shadow-none focus-visible:ring-[#007AFF]/20 dark:border-white/10"
                      />
                      {resolvedSelectedUrl ? (
                        <p className="truncate font-sans text-[10px] text-neutral-400">
                          → {resolvedSelectedUrl.replace(/^https?:\/\//, "")}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[12px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                          Submenu
                        </p>
                        <p className="text-[10px] text-neutral-400">
                          Dropdown under this link
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="h-7 rounded-md border-black/[0.06] px-2 text-[11px] shadow-none dark:border-white/10"
                        onClick={() => openPicker(selected.id)}
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Add
                      </Button>
                    </div>

                    {(selected.children ?? []).length === 0 ? (
                      <div className="rounded-[10px] border border-dashed border-black/[0.08] px-3 py-6 text-center dark:border-white/10">
                        <p className="text-[11px] text-neutral-400">
                          No dropdown items
                        </p>
                      </div>
                    ) : (
                      <ul className="space-y-1.5">
                        {(selected.children ?? []).map((child, ci) => (
                          <li
                            key={child.id}
                            className="rounded-[10px] border border-black/[0.06] bg-[#FAFAFA] p-2.5 dark:border-white/10 dark:bg-white/[0.03]"
                          >
                            <div className="flex gap-2">
                              <div className="grid min-w-0 flex-1 gap-1.5 sm:grid-cols-2">
                                <Input
                                  value={child.label}
                                  onChange={(e) =>
                                    patchChild(child.id, {
                                      label: e.target.value,
                                    })
                                  }
                                  placeholder="Label"
                                  className="h-8 rounded-md border-black/[0.06] bg-white text-[12px] shadow-none focus-visible:ring-[#007AFF]/20 dark:border-white/10 dark:bg-transparent"
                                />
                                <Input
                                  value={child.href}
                                  onChange={(e) =>
                                    patchChild(child.id, {
                                      href: e.target.value,
                                    })
                                  }
                                  placeholder="/path"
                                  className="h-8 rounded-md border-black/[0.06] bg-white font-sans text-[11px] shadow-none focus-visible:ring-[#007AFF]/20 dark:border-white/10 dark:bg-transparent"
                                />
                              </div>
                              <div className="flex shrink-0 flex-col gap-0.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-neutral-400"
                                  disabled={ci === 0}
                                  onClick={() => moveChild(child.id, -1)}
                                >
                                  <ArrowUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-neutral-400"
                                  disabled={
                                    ci === (selected.children?.length ?? 0) - 1
                                  }
                                  onClick={() => moveChild(child.id, 1)}
                                >
                                  <ArrowDown className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-neutral-400 hover:text-red-600"
                                  onClick={() => removeChild(child.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </>
            )}
          </section>

          {/* Health */}
          <aside className="space-y-4 self-start">
            <section className={cn(dashboardCard, "overflow-hidden")}>
              <div className="border-b border-black/[0.05] px-3 py-2.5 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className={dashboardTitle}>Ready</h2>
                  <span className="text-[10px] tabular-nums text-neutral-400">
                    {readyCount}/{checklist.length}
                  </span>
                </div>
              </div>
              <ul className="space-y-1.5 px-3 py-3">
                {checklist.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-2 text-[11px] text-neutral-600 dark:text-neutral-300"
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-full",
                        item.done
                          ? "bg-emerald-500 text-white"
                          : "bg-black/[0.06] text-transparent dark:bg-white/10"
                      )}
                    >
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>
                    {item.label}
                  </li>
                ))}
              </ul>
            </section>

            {issues.length > 0 ? (
              <section className={cn(dashboardCard, "overflow-hidden")}>
                <div className="border-b border-black/[0.05] px-3 py-2.5 dark:border-white/10">
                  <h2 className={dashboardTitle}>Watch</h2>
                </div>
                <ul className="space-y-1.5 px-3 py-3">
                  {issues.map((issue) => (
                    <li
                      key={issue}
                      className="text-[10px] leading-snug text-amber-700 dark:text-amber-300"
                    >
                      {issue}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {missingDestinations.length > 0 ? (
              <section className={cn(dashboardCard, "overflow-hidden")}>
                <div className="border-b border-black/[0.05] px-3 py-2.5 dark:border-white/10">
                  <h2 className={dashboardTitle}>Suggested</h2>
                </div>
                <div className="flex flex-col gap-1 p-2">
                  {missingDestinations.slice(0, 6).map((dest) => (
                    <button
                      key={dest.id}
                      type="button"
                      onClick={() => {
                        insertLink(dest.label, dest.href, null);
                        toast.success(`Added ${dest.label}`);
                      }}
                      className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-[11px] font-medium text-neutral-600 transition hover:bg-[#007AFF]/5 hover:text-[#007AFF] dark:text-neutral-300"
                    >
                      <Plus className="h-3 w-3 shrink-0" />
                      <span className="truncate">{dest.label}</span>
                    </button>
                  ))}
                </div>
              </section>
            ) : null}
          </aside>
        </div>

        <p className="px-1 text-center text-[10px] text-neutral-400">
          Need a page that isn’t listed?{" "}
          <Link
            href="/dashboard/pages/new"
            className="font-medium text-[#007AFF] hover:underline"
          >
            Create page
          </Link>
        </p>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-black/[0.06] bg-white/95 px-3 py-2 backdrop-blur-md dark:border-white/10 dark:bg-[#0A0A0A]/95 lg:hidden">
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            className="h-9 rounded-md border-black/[0.06] px-3 text-[12px] shadow-none dark:border-white/10"
            disabled={history.length === 0}
            onClick={undo}
          >
            <Undo2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            loading={saving}
            disabled={!dirty}
            className={cn(dashboardPrimaryBtn, "h-9 flex-1")}
            onClick={() => void save()}
          >
            Publish menu
          </Button>
        </div>
      </div>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="w-[min(100vw-1.5rem,440px)] max-w-[440px] gap-0 overflow-hidden rounded-2xl border-black/[0.06] p-0 shadow-xl dark:border-white/10">
          <DialogHeader className="space-y-0 border-b border-black/[0.05] px-4 py-3.5 pr-10 text-left dark:border-white/10">
            <DialogTitle className="text-[14px] font-semibold tracking-[-0.02em]">
              {nestUnderId ? "Add submenu link" : "Add to menu"}
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-[11px] text-neutral-500">
              Pick a store page or create a custom URL.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-1 border-b border-black/[0.05] px-3 py-2 dark:border-white/10">
            <button
              type="button"
              onClick={() => setCustomMode(false)}
              className={cn(
                "h-7 rounded-md px-2.5 text-[11px] font-medium",
                !customMode
                  ? "bg-[#F5F5F7] text-neutral-900 dark:bg-white/10 dark:text-white"
                  : "text-neutral-500"
              )}
            >
              Store pages
            </button>
            <button
              type="button"
              onClick={() => setCustomMode(true)}
              className={cn(
                "h-7 rounded-md px-2.5 text-[11px] font-medium",
                customMode
                  ? "bg-[#F5F5F7] text-neutral-900 dark:bg-white/10 dark:text-white"
                  : "text-neutral-500"
              )}
            >
              Custom URL
            </button>
          </div>

          {customMode ? (
            <div className="space-y-3 px-4 py-3">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium text-neutral-600">
                  Label
                </Label>
                <Input
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="About us"
                  className="h-8 rounded-md border-black/[0.06] text-[12px] shadow-none focus-visible:ring-[#007AFF]/20 dark:border-white/10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium text-neutral-600">
                  URL
                </Label>
                <Input
                  value={customHref}
                  onChange={(e) => setCustomHref(e.target.value)}
                  placeholder="/about or https://…"
                  className="h-8 rounded-md border-black/[0.06] font-sans text-[12px] shadow-none focus-visible:ring-[#007AFF]/20 dark:border-white/10"
                />
              </div>
              <Button
                className={cn(dashboardPrimaryBtn, "h-8 w-full")}
                onClick={pickCustom}
              >
                Add link
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2 px-3 pt-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                  <Input
                    value={pickerQ}
                    onChange={(e) => setPickerQ(e.target.value)}
                    placeholder="Search…"
                    className="h-8 rounded-md border-black/[0.06] pl-8 pr-8 text-[12px] shadow-none focus-visible:ring-[#007AFF]/20 dark:border-white/10"
                  />
                  {pickerQ ? (
                    <button
                      type="button"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400"
                      onClick={() => setPickerQ("")}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </div>
                <div className={cn(dashboardPillGroup, "flex-wrap")}>
                  <button
                    type="button"
                    onClick={() => setPickerGroup("all")}
                    className={cn(
                      dashboardPill,
                      pickerGroup === "all"
                        ? dashboardPillActive
                        : dashboardPillInactive
                    )}
                  >
                    All
                  </button>
                  {GROUP_ORDER.filter((g) =>
                    missingDestinations.some((d) => d.group === g)
                  ).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setPickerGroup(g)}
                      className={cn(
                        dashboardPill,
                        pickerGroup === g
                          ? dashboardPillActive
                          : dashboardPillInactive
                      )}
                    >
                      {GROUP_LABELS[g]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="max-h-[300px] overflow-y-auto px-2 py-2">
                {pickerGrouped.length === 0 ? (
                  <p className="px-3 py-8 text-center text-[12px] text-neutral-400">
                    {missingDestinations.length === 0
                      ? "Everything available is already in the menu."
                      : "No matches."}
                  </p>
                ) : (
                  pickerGrouped.map((section) => (
                    <div key={section.group} className="mb-2">
                      <p className="px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                        {section.label}
                      </p>
                      <ul>
                        {section.items.map((dest) => (
                          <li key={dest.id}>
                            <button
                              type="button"
                              onClick={() => pickDestination(dest)}
                              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-[#F5F5F7] dark:hover:bg-white/[0.05]"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[12px] font-semibold text-neutral-900 dark:text-white">
                                  {dest.label}
                                </p>
                                <p className="truncate font-sans text-[10px] text-neutral-400">
                                  {dest.description ?? dest.href}
                                </p>
                              </div>
                              <Plus className="h-3.5 w-3.5 shrink-0 text-[#007AFF]" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </div>
              <div className="border-t border-black/[0.05] px-4 py-2.5 dark:border-white/10">
                <Link
                  href="/dashboard/pages/new"
                  className="text-[11px] font-medium text-[#007AFF] hover:underline"
                  onClick={() => setPickerOpen(false)}
                >
                  Create a new page instead
                </Link>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
