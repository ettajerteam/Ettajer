import Link from "next/link";
import type { FooterSectionSettings } from "@/lib/sections/types";
import type { PublicStore } from "@/types/storefront";
import {
  resolveStoreNavHref,
  getStorePageUrl,
  getStoreBlogUrl,
  getStoreSearchUrl,
  getStoreProductsUrl,
  getStoreCollectionsUrl,
  getStoreUrl,
} from "@/lib/storefront-urls";
import { parseSectionVisualSettings } from "@/lib/builder/section-styles";
import { cn } from "@/lib/utils";

interface FooterSectionProps {
  store: PublicStore;
  settings: FooterSectionSettings;
}

type FooterLink = { label: string; href: string };

function isDarkBackground(bg: string | undefined): boolean {
  if (!bg) return false;
  const c = bg.toLowerCase().trim();
  return (
    c === "#0a0a0a" ||
    c === "#000" ||
    c === "#000000" ||
    c === "#0f172a" ||
    c === "#171717" ||
    c === "#111827" ||
    c === "#09090b" ||
    c === "#18181b"
  );
}

function resolveNavLinks(store: PublicStore): FooterLink[] {
  const fromStore =
    store.navigation
      ?.filter((item) => item.href && item.label)
      .slice(0, 7)
      .map((item) => ({
        label: item.label,
        href: resolveStoreNavHref(store.slug, item.href),
      })) ?? [];

  if (fromStore.length > 0) return fromStore;

  return [
    { label: "Shop", href: getStoreProductsUrl(store.slug) },
    { label: "Collections", href: getStoreCollectionsUrl(store.slug) },
    { label: "About", href: getStorePageUrl(store.slug, "about") },
    { label: "Journal", href: getStoreBlogUrl(store.slug) },
  ];
}

export function FooterSection({ store, settings }: FooterSectionProps) {
  const isBold = store.theme === "bold";
  const isModern = store.theme === "modern";
  const visual = parseSectionVisualSettings(settings as Record<string, unknown>);

  const bg =
    settings.backgroundColor ??
    (isModern || isBold ? "#0a0a0a" : "#0a0a0a");
  const dark = isDarkBackground(bg) || isBold;
  const fg =
    settings.textColor ??
    (dark ? "#a3a3a3" : "#737373");

  const showNav = settings.showNav !== false;
  const showClientCare = settings.showClientCare !== false;
  const showLegal = settings.showLegal !== false;
  const tagline = settings.tagline?.trim() || store.description?.trim() || "";

  const navLinks = resolveNavLinks(store);
  const careLinks: FooterLink[] = [
    { label: "Contact", href: getStorePageUrl(store.slug, "contact") },
    { label: "Shipping & returns", href: getStorePageUrl(store.slug, "shipping") },
    { label: "Journal", href: getStoreBlogUrl(store.slug) },
    { label: "Search", href: getStoreSearchUrl(store.slug) },
  ];
  const legalLinks: FooterLink[] = [
    { label: "Privacy", href: getStorePageUrl(store.slug, "privacy") },
    { label: "Terms", href: getStorePageUrl(store.slug, "terms") },
    { label: "Shipping", href: getStorePageUrl(store.slug, "shipping") },
  ];

  const columnCount =
    1 + (showNav ? 1 : 0) + (showClientCare ? 1 : 0) + (showLegal ? 1 : 0);

  const labelClass = cn(
    "mb-4 text-[11px] font-semibold uppercase tracking-[0.18em]",
    dark ? "text-white/35" : "text-neutral-400"
  );

  const linkClass = cn(
    "text-[13px] leading-snug transition",
    dark ? "text-white/55 hover:text-white" : "text-neutral-500 hover:text-neutral-900"
  );

  const brandNameClass = cn(
    "text-lg font-semibold tracking-tight sm:text-xl",
    dark ? "text-white" : "text-neutral-900",
    isModern && "font-medium tracking-[-0.02em]"
  );

  const taglineClass = cn(
    "mt-3 max-w-[16rem] text-sm leading-relaxed",
    dark ? "text-white/40" : "text-neutral-500"
  );

  const gridClass = cn(
    "grid gap-10 sm:gap-12",
    columnCount >= 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : columnCount === 3
        ? "sm:grid-cols-2 lg:grid-cols-3"
        : columnCount === 2
          ? "sm:grid-cols-2"
          : "grid-cols-1"
  );

  return (
    <footer
      className={cn("border-t", dark ? "border-white/10" : "border-neutral-200")}
      style={{
        backgroundColor: bg,
        color: fg,
        padding: visual.padding || undefined,
      }}
    >
      <div
        className={cn(
          "mx-auto px-6",
          isModern ? "max-w-6xl" : "max-w-5xl",
          !visual.padding && "py-14 sm:py-16"
        )}
      >
        <div className={gridClass}>
          {/* Brand */}
          <div className="min-w-0">
            <Link href={getStoreUrl(store.slug)} className={brandNameClass}>
              {store.name}
            </Link>
            {tagline ? <p className={taglineClass}>{tagline}</p> : null}
            {store.contact.showOnStorefront ? (
              <div
                className={cn(
                  "mt-5 space-y-1.5 text-[13px] leading-snug",
                  dark ? "text-white/45" : "text-neutral-500"
                )}
              >
                {store.contact.email ? (
                  <a
                    href={`mailto:${store.contact.email}`}
                    className={cn(
                      "block transition",
                      dark ? "hover:text-white" : "hover:text-neutral-900"
                    )}
                  >
                    {store.contact.email}
                  </a>
                ) : null}
                {store.contact.phone ? (
                  <a
                    href={`tel:${store.contact.phone.replace(/\s+/g, "")}`}
                    className={cn(
                      "block transition",
                      dark ? "hover:text-white" : "hover:text-neutral-900"
                    )}
                  >
                    {store.contact.phone}
                  </a>
                ) : null}
                {store.contact.whatsapp ? (
                  <a
                    href={`https://wa.me/${store.contact.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "block transition",
                      dark ? "hover:text-white" : "hover:text-neutral-900"
                    )}
                  >
                    WhatsApp
                  </a>
                ) : null}
                {store.contact.address ? (
                  <p className="pt-1">{store.contact.address}</p>
                ) : null}
              </div>
            ) : null}
          </div>

          {showNav ? (
            <div>
              <p className={labelClass}>Navigate</p>
              <nav className="flex flex-col gap-2.5" aria-label="Footer navigation">
                {navLinks.map((item) => (
                  <Link key={`${item.href}-${item.label}`} href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          ) : null}

          {showClientCare ? (
            <div>
              <p className={labelClass}>Client care</p>
              <nav className="flex flex-col gap-2.5" aria-label="Client care">
                {careLinks.map((item) => (
                  <Link key={item.href} href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          ) : null}

          {showLegal ? (
            <div>
              <p className={labelClass}>Legal</p>
              <nav className="flex flex-col gap-2.5" aria-label="Legal">
                {legalLinks.map((item) => (
                  <Link key={item.href} href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          ) : null}
        </div>

        {/* Bottom bar */}
        <div
          className={cn(
            "mt-12 flex flex-col gap-4 border-t pt-6 sm:mt-14 sm:flex-row sm:items-center sm:justify-between sm:gap-6",
            dark ? "border-white/10" : "border-neutral-200"
          )}
        >
          <p
            className={cn(
              "text-[12px] tracking-wide",
              dark ? "text-white/35" : "text-neutral-400"
            )}
          >
            © {new Date().getFullYear()} {store.name}
          </p>

          <div
            className={cn(
              "flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px]",
              dark ? "text-white/35" : "text-neutral-400"
            )}
          >
            {showLegal ? (
              <>
                <Link
                  href={getStorePageUrl(store.slug, "privacy")}
                  className={cn(
                    "transition",
                    dark ? "hover:text-white" : "hover:text-neutral-900"
                  )}
                >
                  Privacy
                </Link>
                <Link
                  href={getStorePageUrl(store.slug, "terms")}
                  className={cn(
                    "transition",
                    dark ? "hover:text-white" : "hover:text-neutral-900"
                  )}
                >
                  Terms
                </Link>
              </>
            ) : null}
            {settings.showPoweredBy !== false ? (
              <span className={dark ? "text-white/25" : "text-neutral-300"}>
                Powered by Ettajer
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
