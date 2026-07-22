"use client";

import Link from "next/link";
import Image from "next/image";
import { getFooterNavGroups } from "@/lib/landing/landing-i18n";
import { useLandingLocale } from "@/components/landing/landing-locale-context";
import { LandingLanguageSwitcher } from "@/components/shared/language-switcher";
import { LANDING_MOBILE_CONTAINER } from "@/components/landing/landing-mobile-ui";
import { cn } from "@/lib/utils";

const NAV_LOGO = "/brand/Ettajer-logo-black-text-Next-to-the-icon.png";

function FooterLink({ href, label }: { href: string; label: string }) {
  const className =
    "text-[13px] leading-snug text-neutral-500 transition-colors duration-200 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/30 rounded-sm";

  if (href.startsWith("/") || href.startsWith("mailto:")) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }

  return (
    <a href={href} className={className}>
      {label}
    </a>
  );
}

/**
 * Professional company footer for the marketing homepage.
 * Brand aliases (التاجر, Etajer, …) stay in the DOM for SEO but are visually hidden.
 */
export function LandingFooter() {
  const { copy, locale } = useLandingLocale();
  const footerNav = getFooterNavGroups(locale);
  const year = new Date().getFullYear();

  return (
    <footer
      id="about"
      className="border-t border-neutral-200 bg-neutral-50 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-neutral-500 md:pb-0"
    >
      {/* SEO-only brand aliases — crawlable, not visible */}
      <div className="sr-only">
        <p lang="ar">{copy.hero.brandNative}</p>
        <p>{copy.footer.aka}</p>
      </div>

      <div className={cn(LANDING_MOBILE_CONTAINER, "py-12 md:py-16")}>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="space-y-4 lg:col-span-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/30"
            >
              <Image
                src={NAV_LOGO}
                alt="Ettajer"
                width={112}
                height={28}
                className="h-6 w-auto max-w-[7rem] object-contain object-left"
                style={{ width: "auto" }}
              />
            </Link>
            <p className="text-base font-semibold tracking-tight text-neutral-900">
              {copy.hero.brandName}
            </p>
            <p className="max-w-sm text-[14px] leading-relaxed text-neutral-500">
              {copy.footer.tagline}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:col-span-8 xl:grid-cols-6">
            {footerNav.map((group) => (
              <div key={group.title} className="space-y-3">
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.06em] text-neutral-900">
                  {group.title}
                </h3>
                <ul className="space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <FooterLink href={link.href} label={link.label} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-5 border-t border-neutral-200/80 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-neutral-400">
            {copy.footer.copyright(year)}
          </p>
          <LandingLanguageSwitcher variant="footer" />
        </div>
      </div>
    </footer>
  );
}
