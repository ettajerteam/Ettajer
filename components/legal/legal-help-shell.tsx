"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronRight, MessageCircle, LogIn } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LANDING_FOOTER_NAV } from "@/lib/landing/footer-nav";
import { LandingScrollToTop } from "@/components/landing/landing-mobile-carousel";
import { LandingLanguageSwitcher } from "@/components/shared/language-switcher";
import { useLandingLocale } from "@/components/landing/landing-locale-context";
import { getLegalCopy } from "@/lib/legal/legal-i18n";
import { cn } from "@/lib/utils";

const NAV_LOGO = "/brand/Ettajer-logo-black-text-Next-to-the-icon.png";

const FOOTER_GROUP_TITLES = ["Resources", "Support", "Platform"] as const;

type LegalHelpShellProps = {
  children: React.ReactNode;
  breadcrumb?: React.ReactNode;
};

export function LegalHelpShell({ children, breadcrumb }: LegalHelpShellProps) {
  const { locale, isRtl } = useLandingLocale();
  const shell = getLegalCopy(locale).shell;
  const footerNav = LANDING_FOOTER_NAV.filter((group) =>
    FOOTER_GROUP_TITLES.includes(group.title as (typeof FOOTER_GROUP_TITLES)[number]),
  );

  const mobileLinks = [
    { href: "/help", label: shell.getHelp },
    { href: "/contact", label: shell.contact },
    { href: "/", label: shell.home },
  ] as const;

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const localeSwitcherDesktop = (
    <div className="hidden min-w-[8.5rem] sm:block">
      <LandingLanguageSwitcher />
    </div>
  );

  const localeSwitcherMobile = <LandingLanguageSwitcher variant="select" className="sm:hidden" />;

  return (
    <div className="min-h-screen scroll-smooth bg-[#F2F2F7] font-sans text-neutral-900 antialiased selection:bg-neutral-900 selection:text-white md:bg-white">
      <LandingScrollToTop />

      <nav className="sticky top-0 z-40 border-b border-black/[0.04] bg-[#F2F2F7]/88 pt-[env(safe-area-inset-top)] backdrop-blur-xl backdrop-saturate-[180%] md:border-neutral-200/80 md:bg-white/80">
        <div className="mx-auto flex h-[3.25rem] max-w-6xl items-center justify-between gap-3 px-4 md:h-auto md:gap-6 md:px-6 md:py-3.5">
          <Link href="/" className="shrink-0 active:opacity-70">
            <Image
              src={NAV_LOGO}
              alt="Ettajer"
              width={104}
              height={26}
              className="h-[1.35rem] max-h-[1.35rem] w-auto max-w-[6.5rem] object-contain object-start md:h-6"
              style={{ width: "auto" }}
              priority
            />
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link href="/help" className="text-sm font-medium text-neutral-900">
              {shell.getHelp}
            </Link>
            <Link
              href="/contact"
              className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
            >
              {shell.contact}
            </Link>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {localeSwitcherDesktop}
            <Link
              href="/signup"
              className="rounded-full bg-neutral-900 px-5 py-2 text-sm text-white transition-colors hover:bg-neutral-800"
            >
              {shell.startFree}
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            {localeSwitcherMobile}
            <Link
              href="/contact"
              className="rounded-full bg-[#007AFF] px-4 py-2 text-[14px] font-semibold text-white active:scale-95"
            >
              {shell.contact}
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] active:scale-95"
              aria-label={shell.openMenu}
            >
              <Menu className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
        </div>

        {breadcrumb ? (
          <div className="hidden border-t border-neutral-100 bg-neutral-50/80 md:block">
            <div className="mx-auto max-w-6xl px-6 py-3">{breadcrumb}</div>
          </div>
        ) : null}
      </nav>

      <AnimatePresence>
        {menuOpen ? (
          <LegalMobileMenu
            onClose={() => setMenuOpen(false)}
            shell={shell}
            mobileLinks={mobileLinks}
            isRtl={isRtl}
          />
        ) : null}
      </AnimatePresence>

      {children}

      <footer className="border-t border-black/[0.04] bg-[#F2F2F7] py-10 pb-[calc(4.5rem+env(safe-area-inset-bottom))] text-sm text-neutral-500 md:bg-white md:py-12 md:pb-12">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-12">
            <div className="space-y-3 lg:col-span-5">
              <Link href="/" className="inline-flex items-center">
                <Image
                  src={NAV_LOGO}
                  alt="Ettajer"
                  width={88}
                  height={22}
                  className="h-5 max-h-5 w-auto max-w-[5.5rem] object-contain object-start"
                  style={{ width: "auto" }}
                />
              </Link>
              <p className="max-w-sm text-[15px] leading-relaxed md:text-sm">{shell.footerTagline}</p>
            </div>

            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:col-span-7">
              {footerNav.map((group) => (
                <div key={group.title} className="space-y-2.5">
                  <h3 className="text-[13px] font-bold uppercase tracking-wide text-neutral-800 md:text-sm md:font-medium md:normal-case">
                    {group.title}
                  </h3>
                  <ul className="space-y-2">
                    {group.links.map((link) => (
                      <li key={link.label}>
                        {link.href.startsWith("/") || link.href.startsWith("mailto:") ? (
                          <Link
                            href={link.href}
                            className="text-[15px] transition-colors hover:text-neutral-900 md:text-sm"
                          >
                            {link.label}
                          </Link>
                        ) : (
                          <a
                            href={link.href}
                            className="text-[15px] transition-colors hover:text-neutral-900 md:text-sm"
                          >
                            {link.label}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-[#E5E5EA] pt-6 text-xs md:mt-10 md:flex-row md:items-center md:border-neutral-200">
            <p>
              © {new Date().getFullYear()} Ettajer. {shell.allRights}
            </p>
            <LandingLanguageSwitcher variant="footer" label={shell.language} />
            <div className="flex gap-5">
              <Link href="/privacy" className="transition-colors hover:text-neutral-900">
                {shell.privacy}
              </Link>
              <Link href="/terms" className="transition-colors hover:text-neutral-900">
                {shell.terms}
              </Link>
              <Link href="/cookies" className="transition-colors hover:text-neutral-900">
                {shell.cookies}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function LegalMobileMenu({
  onClose,
  shell,
  mobileLinks,
  isRtl,
}: {
  onClose: () => void;
  shell: ReturnType<typeof getLegalCopy>["shell"];
  mobileLinks: readonly { href: string; label: string }[];
  isRtl: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 md:hidden"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-label={shell.closeMenu}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 380 }}
        className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-[1.25rem] bg-[#F2F2F7] pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
      >
        <div className="flex justify-center pt-2.5">
          <div className="h-1 w-9 rounded-full bg-black/15" />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="absolute end-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90"
          aria-label={shell.closeMenu}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="px-5 pb-4 pt-2 text-start">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-[#8E8E93]">
            {shell.support}
          </p>
          <p className="mt-1 text-[1.75rem] font-bold text-neutral-900">{shell.helpCenter}</p>
        </div>

        <div className="space-y-5 px-4">
          <div className="overflow-hidden rounded-[0.75rem] bg-white">
            {mobileLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className="flex items-center gap-3 border-b border-[#E5E5EA] px-4 py-3.5 text-[17px] text-neutral-900 last:border-0 active:bg-[#E5E5EA]/60"
              >
                <span className="flex-1">{link.label}</span>
                <ChevronRight className={cn("h-5 w-5 text-[#C7C7CC]", isRtl && "scale-x-[-1]")} />
              </Link>
            ))}
          </div>

          <div className="overflow-hidden rounded-[0.75rem] bg-white">
            <LandingLanguageSwitcher variant="menu" label={shell.language} />
          </div>

          <div className="overflow-hidden rounded-[0.75rem] bg-white">
            <Link
              href="/login"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3.5 active:bg-[#E5E5EA]/60"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#007AFF]/10">
                <LogIn className="h-4 w-4 text-[#007AFF]" />
              </div>
              <span className="flex-1 text-[17px]">{shell.signIn}</span>
              <ChevronRight className={cn("h-5 w-5 text-[#C7C7CC]", isRtl && "scale-x-[-1]")} />
            </Link>
            <Link
              href="/signup"
              onClick={onClose}
              className="flex items-center gap-3 border-t border-[#E5E5EA] px-4 py-3.5 active:bg-[#E5E5EA]/60"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <span className="flex-1 text-[17px]">{shell.startFree}</span>
              <ChevronRight className={cn("h-5 w-5 text-[#C7C7CC]", isRtl && "scale-x-[-1]")} />
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
