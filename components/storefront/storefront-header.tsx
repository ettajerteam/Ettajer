"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import type { PublicCategory, PublicStore } from "@/types/storefront";
import type { NavItem } from "@/lib/navigation";
import { getStoreUrl, getStoreSearchUrl, resolveStoreNavHref } from "@/lib/storefront-urls";
import { cn } from "@/lib/utils";

type HeaderVariant = "minimal" | "modern" | "bold";

interface StorefrontHeaderProps {
  store: PublicStore;
  variant?: HeaderVariant;
  backHref?: string;
  backLabel?: string;
  categories?: PublicCategory[];
}

function NavLink({
  storeSlug,
  item,
  className,
  variant,
}: {
  storeSlug: string;
  item: NavItem;
  className: string;
  variant: HeaderVariant;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasChildren = Boolean(item.children?.length);
  const isBold = variant === "bold";

  function openMenu() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function scheduleClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  if (!hasChildren) {
    return (
      <Link href={resolveStoreNavHref(storeSlug, item.href)} className={className}>
        {item.label}
      </Link>
    );
  }

  return (
    <div className="relative" onMouseEnter={openMenu} onMouseLeave={scheduleClose}>
      <button
        type="button"
        className={cn(className, "inline-flex items-center gap-1.5")}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        {item.label}
        <ChevronDown
          className={cn(
            "h-3 w-3 opacity-50 transition-transform duration-200",
            open && "rotate-180 opacity-80"
          )}
          aria-hidden
        />
      </button>
      <div
        className={cn(
          "absolute left-1/2 top-full z-50 w-52 -translate-x-1/2 pt-3 transition",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        role="menu"
      >
        <div
          className={cn(
            "overflow-hidden border py-2 shadow-[0_12px_40px_rgba(0,0,0,0.12)]",
            isBold
              ? "rounded-xl border-white/10 bg-zinc-900"
              : variant === "modern"
                ? "rounded-sm border-neutral-200 bg-white"
                : "rounded-2xl border-neutral-200/80 bg-white"
          )}
        >
          <Link
            href={resolveStoreNavHref(storeSlug, item.href)}
            role="menuitem"
            className={cn(
              "block px-4 py-2.5 text-[13px] font-medium transition",
              isBold
                ? "text-white/90 hover:bg-white/5"
                : "text-neutral-900 hover:bg-neutral-50"
            )}
            onClick={() => setOpen(false)}
          >
            {item.label}
          </Link>
          <div className={cn("mx-3 my-1 h-px", isBold ? "bg-white/10" : "bg-neutral-100")} />
          {item.children!.map((child) => (
            <Link
              key={child.id}
              href={resolveStoreNavHref(storeSlug, child.href)}
              role="menuitem"
              className={cn(
                "block px-4 py-2 text-[13px] transition",
                isBold
                  ? "text-white/55 hover:bg-white/5 hover:text-white"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
              )}
              onClick={() => setOpen(false)}
            >
              {child.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function HeaderSearch({
  storeSlug,
  variant,
  className,
  autoFocus,
  onSubmitted,
}: {
  storeSlug: string;
  variant: HeaderVariant;
  className?: string;
  autoFocus?: boolean;
  onSubmitted?: () => void;
}) {
  const router = useRouter();
  const fieldId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const isBold = variant === "bold";
  const isModern = variant === "modern";

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const q = query.trim();
    const base = getStoreSearchUrl(storeSlug);
    router.push(q ? `${base}?q=${encodeURIComponent(q)}` : base);
    onSubmitted?.();
  }

  return (
    <form onSubmit={onSubmit} className={cn("relative", className)} role="search">
      <label htmlFor={fieldId} className="sr-only">
        Search products
      </label>
      <Search
        className={cn(
          "pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2",
          isBold ? "text-white/35" : "text-neutral-400"
        )}
        aria-hidden
      />
      <input
        ref={inputRef}
        id={fieldId}
        type="search"
        name="q"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search"
        autoComplete="off"
        className={cn(
          "h-10 w-full border pl-10 pr-3 text-[13px] outline-none transition placeholder:tracking-wide",
          isModern &&
            "rounded-sm border-neutral-300/70 bg-white/60 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white",
          isBold &&
            "rounded-lg border-white/12 bg-white/[0.04] text-white placeholder:text-white/35 focus:border-white/30 focus:bg-white/[0.07]",
          !isModern &&
            !isBold &&
            "rounded-full border-neutral-200/90 bg-neutral-50/80 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-300 focus:bg-white focus:shadow-sm"
        )}
      />
    </form>
  );
}

function HeaderCartButton({ variant }: { variant: HeaderVariant }) {
  const itemCount = useCartStore((s) => s.getItemCount());
  const openCart = useCartStore((s) => s.openCart);
  const isBold = variant === "bold";
  const isModern = variant === "modern";

  return (
    <button
      type="button"
      onClick={openCart}
      className={cn(
        "group relative inline-flex h-10 items-center gap-2 px-2.5 transition",
        isModern && "rounded-sm hover:bg-black/[0.04]",
        isBold && "rounded-lg hover:bg-white/5",
        !isModern && !isBold && "rounded-full hover:bg-neutral-100"
      )}
      aria-label={`Open cart, ${itemCount} items`}
    >
      <ShoppingBag
        className={cn(
          "h-[18px] w-[18px] transition",
          isBold ? "text-white/75 group-hover:text-white" : "text-neutral-700 group-hover:text-neutral-900"
        )}
      />
      <span
        className={cn(
          "hidden text-[11px] font-semibold tracking-[0.12em] uppercase sm:inline",
          isBold ? "text-white/55 group-hover:text-white/80" : "text-neutral-500 group-hover:text-neutral-800"
        )}
      >
        Bag
      </span>
      <span
        className={cn(
          "inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold tabular-nums",
          itemCount > 0
            ? "text-white"
            : isBold
              ? "bg-white/10 text-white/50"
              : "bg-neutral-100 text-neutral-400"
        )}
        style={itemCount > 0 ? { backgroundColor: "var(--store-primary, #0a0a0a)" } : undefined}
      >
        {itemCount > 99 ? "99+" : itemCount}
      </span>
    </button>
  );
}

export function StorefrontHeader({
  store,
  variant = "minimal",
  backHref,
  backLabel,
  categories = [],
}: StorefrontHeaderProps) {
  const isMinimal = variant === "minimal";
  const isModern = variant === "modern";
  const isBold = variant === "bold";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const navItems: NavItem[] = store.navigation?.length
    ? store.navigation
    : categories.length > 0
      ? [
          { id: "shop", label: "Shop", href: "/products" },
          ...categories.slice(0, 4).map((c) => ({
            id: c.id,
            label: c.name,
            href: `/category/${c.slug}`,
          })),
        ]
      : [{ id: "shop", label: "Shop", href: "/products" }];

  useEffect(() => {
    if (!mobileOpen && !mobileSearchOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen, mobileSearchOpen]);

  const linkClass = cn(
    "relative whitespace-nowrap transition-colors after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100",
    isMinimal && "text-[13px] font-medium text-neutral-600 after:bg-neutral-900 hover:text-neutral-900",
    isModern &&
      "text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-600 after:bg-neutral-900 hover:text-neutral-900",
    isBold &&
      "text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55 after:bg-white hover:text-white"
  );

  const iconBtn = cn(
    "inline-flex h-10 w-10 items-center justify-center transition",
    isModern && "rounded-sm hover:bg-black/[0.04]",
    isBold && "rounded-lg text-white/70 hover:bg-white/5 hover:text-white",
    isMinimal && "rounded-full text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-40",
        isMinimal && "border-b border-neutral-200/60 bg-white/80 backdrop-blur-2xl",
        isModern && "border-b border-black/[0.06] bg-[#F5F5F0]/85 backdrop-blur-2xl",
        isBold && "border-b border-white/10 bg-zinc-950/85 backdrop-blur-2xl"
      )}
    >
      <div
        className={cn(
          "mx-auto grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-6 lg:px-8",
          isModern ? "max-w-7xl h-[4.25rem]" : "max-w-6xl h-[4.25rem]"
        )}
      >
        <div className="flex min-w-0 items-center justify-start">
          {backHref ? (
            <Link href={backHref} className={cn(linkClass, "after:hidden")}>
              {backLabel ?? "← Back"}
            </Link>
          ) : (
            <Link
              href={getStoreUrl(store.slug)}
              className="group flex min-w-0 items-center gap-2.5"
            >
              {store.logo ? (
                <Image
                  src={store.logo}
                  alt={store.name}
                  width={34}
                  height={34}
                  className={cn(
                    "shrink-0 object-cover",
                    isModern ? "rounded-sm" : "rounded-lg"
                  )}
                />
              ) : null}
              <span
                className={cn(
                  "truncate tracking-tight transition",
                  isModern && "text-[15px] font-semibold text-neutral-900",
                  isBold && "text-[13px] font-black uppercase tracking-[0.18em] text-white",
                  isMinimal && "text-[15px] font-semibold text-neutral-900",
                  !store.logo && "pl-0"
                )}
              >
                {store.name}
              </span>
            </Link>
          )}
        </div>

        <div className="hidden justify-center lg:flex">
          {!backHref ? (
            <nav
              className="flex items-center gap-x-7 xl:gap-x-9"
              aria-label="Primary"
            >
              {navItems.map((item) => (
                <NavLink
                  key={item.id}
                  storeSlug={store.slug}
                  item={item}
                  className={linkClass}
                  variant={variant}
                />
              ))}
            </nav>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-0.5 sm:gap-1">
          {!backHref ? (
            <>
              <div className="mr-1 hidden w-[11.5rem] xl:block xl:w-[13.5rem]">
                <HeaderSearch storeSlug={store.slug} variant={variant} />
              </div>
              <button
                type="button"
                aria-label={mobileSearchOpen ? "Close search" : "Search"}
                className={cn(iconBtn, "xl:hidden")}
                onClick={() => {
                  setMobileSearchOpen((v) => !v);
                  setMobileOpen(false);
                }}
              >
                {mobileSearchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
              </button>
              <button
                type="button"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                className={cn(iconBtn, "lg:hidden")}
                onClick={() => {
                  setMobileOpen((v) => !v);
                  setMobileSearchOpen(false);
                }}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </>
          ) : null}
          <HeaderCartButton variant={variant} />
        </div>
      </div>

      {mobileSearchOpen && !backHref ? (
        <div
          className={cn(
            "border-t px-4 py-3 xl:hidden",
            isBold ? "border-white/10 bg-zinc-950" : "border-neutral-100 bg-white/95"
          )}
        >
          <HeaderSearch
            storeSlug={store.slug}
            variant={variant}
            autoFocus
            onSubmitted={() => setMobileSearchOpen(false)}
          />
        </div>
      ) : null}

      {mobileOpen && !backHref ? (
        <div
          className={cn(
            "fixed inset-x-0 bottom-0 top-[4.25rem] z-40 overflow-y-auto lg:hidden",
            isBold ? "bg-zinc-950" : "bg-white"
          )}
        >
          <nav
            className="mx-auto flex max-w-6xl flex-col px-6 py-8"
            aria-label="Mobile"
          >
            <p
              className={cn(
                "mb-6 text-[11px] font-semibold uppercase tracking-[0.2em]",
                isBold ? "text-white/35" : "text-neutral-400"
              )}
            >
              Menu
            </p>
            {navItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "border-b py-1",
                  isBold ? "border-white/10" : "border-neutral-100"
                )}
              >
                <Link
                  href={resolveStoreNavHref(store.slug, item.href)}
                  className={cn(
                    "block py-3.5 text-[1.35rem] font-medium tracking-tight",
                    isBold ? "text-white" : "text-neutral-900",
                    isModern && "text-[1.15rem] uppercase tracking-[0.12em]"
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
                {item.children?.length ? (
                  <div className="mb-3 ml-0.5 flex flex-col">
                    {item.children.map((child) => (
                      <Link
                        key={child.id}
                        href={resolveStoreNavHref(store.slug, child.href)}
                        className={cn(
                          "py-2 text-[15px]",
                          isBold ? "text-white/45" : "text-neutral-500"
                        )}
                        onClick={() => setMobileOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            <div className="mt-10">
              <HeaderSearch
                storeSlug={store.slug}
                variant={variant}
                onSubmitted={() => setMobileOpen(false)}
              />
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
