"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  HelpCircle,
  LogIn,
  Sparkles,
  Layout,
  Truck,
  Images,
  CreditCard,
  MessageCircle,
  Mail,
  BadgeCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LandingMobileGroup } from "@/components/landing/landing-mobile-ui";
import { useLandingLocale } from "@/components/landing/landing-locale-context";
import { LandingArrowForward, LandingChevronForward } from "@/components/landing/landing-direction-icon";

const NAV_LOGO = "/brand/Ettajer-logo-black-text-Next-to-the-icon.png";
const IOS_BLUE = "#007AFF";

const MOBILE_SECTION_ICONS = [
  { id: "founder-card", href: "/founder-card", icon: BadgeCheck, key: "founderCard" as const },
  { id: "why-ettajer", href: "#why-ettajer", icon: Layout, key: "features" as const },
  { id: "cod-suite", href: "#cod-suite", icon: Truck, key: "cod" as const },
  { id: "showcase", href: "#showcase", icon: Images, key: "gallery" as const },
  { id: "pricing", href: "#pricing", icon: CreditCard, key: "pricing" as const },
  { id: "faq", href: "#faq", icon: MessageCircle, key: "faq" as const },
] as const;

const MOBILE_SUPPORT_ICONS = [
  { href: "/help", icon: HelpCircle, tint: "bg-[#34C759]/10 text-[#34C759]", key: "helpCenter" as const },
  { href: "/contact", icon: Mail, tint: "bg-[#FF9500]/10 text-[#FF9500]", key: "contactSupport" as const },
] as const;

export function LandingMobileNavBar({
  language,
  onLanguageChange,
}: {
  language: string;
  onLanguageChange: (value: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { copy } = useLandingLocale();
  const mn = copy.mobileNav;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <div className="flex items-center gap-2 md:hidden">
        <Link
          href="/signup"
          className="rounded-full bg-neutral-900 px-4 py-2 text-[14px] font-semibold text-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-transform active:scale-95"
        >
          {copy.nav.startFree}
        </Link>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className={cn(
            "relative z-[110] flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 active:scale-95",
            menuOpen
              ? "bg-neutral-900 text-white shadow-[0_2px_10px_rgba(0,0,0,0.18)]"
              : "bg-white text-neutral-800 shadow-[0_1px_3px_rgba(0,0,0,0.06)]",
          )}
          aria-label={menuOpen ? mn.closeMenu : mn.openMenu}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-5 w-5" strokeWidth={2.25} /> : <Menu className="h-5 w-5" strokeWidth={2} />}
        </button>
      </div>

      {mounted
        ? createPortal(
            <AnimatePresence>
              {menuOpen ? (
                <LandingMobileMenu
                  key="landing-mobile-menu"
                  language={language}
                  onLanguageChange={onLanguageChange}
                  onClose={closeMenu}
                />
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}

function LandingMobileMenu({
  language,
  onLanguageChange,
  onClose,
}: {
  language: string;
  onLanguageChange: (value: string) => void;
  onClose: () => void;
}) {
  const { copy } = useLandingLocale();
  const mn = copy.mobileNav;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-[100] md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label={mn.navigationMenu}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label={mn.closeMenu}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 34, stiffness: 400 }}
        className="absolute inset-x-0 bottom-0 z-[1] max-h-[92dvh] overflow-y-auto overscroll-contain rounded-t-[1.35rem] bg-[#F2F2F7] pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgba(0,0,0,0.12)]"
      >
        <div className="sticky top-0 z-10 bg-[#F2F2F7]/95 px-5 pb-3 pt-3 backdrop-blur-xl">
          <div className="flex justify-center">
            <div className="h-1 w-10 rounded-full bg-black/15" aria-hidden />
          </div>
          <div className="mt-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Link href="/" onClick={onClose} className="inline-flex active:opacity-70">
                <Image
                  src={NAV_LOGO}
                  alt="Ettajer"
                  width={104}
                  height={26}
                  className="h-[1.35rem] w-auto max-w-[6.5rem] object-contain object-left"
                  style={{ width: "auto" }}
                />
              </Link>
              <p className="mt-2 text-[15px] leading-snug text-[#8E8E93]">
                {mn.tagline}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-neutral-600 shadow-[0_1px_3px_rgba(0,0,0,0.06)] active:scale-95"
              aria-label={mn.close}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-5 px-4 pt-1">
          <Link
            href="/signup"
            onClick={onClose}
            className="flex h-[3.35rem] items-center justify-center gap-2 rounded-[0.875rem] bg-[#007AFF] text-[17px] font-semibold text-white shadow-[0_4px_16px_rgba(0,122,255,0.35)] active:scale-[0.98]"
          >
            {mn.startForFree}
            <LandingArrowForward className="h-4 w-4" />
          </Link>

          <div>
            <p className="mb-2 px-1 text-[13px] font-semibold uppercase tracking-wide text-[#8E8E93]">
              {mn.explore}
            </p>
            <LandingMobileGroup>
              {MOBILE_SECTION_ICONS.map((section) => {
                const Icon = section.icon;
                const labels = mn.sections[section.key];
                return (
                  <a
                    key={section.id}
                    href={section.href}
                    onClick={onClose}
                    className="flex items-center gap-3.5 border-b border-[#E5E5EA] px-4 py-3.5 last:border-0 active:bg-[#F2F2F7]/80"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.65rem] bg-[#007AFF]/10">
                      <Icon className="h-[1.05rem] w-[1.05rem] text-[#007AFF]" strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[17px] font-medium text-neutral-900">{labels.label}</p>
                      <p className="text-[13px] text-[#8E8E93]">{labels.subtitle}</p>
                    </div>
                    <LandingChevronForward className="h-5 w-5 shrink-0 text-[#C7C7CC]" />
                  </a>
                );
              })}
            </LandingMobileGroup>
          </div>

          <div>
            <p className="mb-2 px-1 text-[13px] font-semibold uppercase tracking-wide text-[#8E8E93]">
              {mn.account}
            </p>
            <LandingMobileGroup>
              <Link
                href="/signup"
                onClick={onClose}
                className="flex items-center gap-3.5 px-4 py-3.5 active:bg-[#F2F2F7]/80"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.65rem] bg-neutral-900">
                  <Sparkles className="h-[1.05rem] w-[1.05rem] text-white" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[17px] font-medium text-neutral-900">{mn.createAccount}</p>
                  <p className="text-[13px] text-[#8E8E93]">{mn.createAccountSubtitle}</p>
                </div>
                <LandingChevronForward className="h-5 w-5 shrink-0 text-[#C7C7CC]" />
              </Link>
              <Link
                href="/login"
                onClick={onClose}
                className="flex items-center gap-3.5 border-t border-[#E5E5EA] px-4 py-3.5 active:bg-[#F2F2F7]/80"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.65rem] bg-[#007AFF]/10">
                  <LogIn className="h-[1.05rem] w-[1.05rem] text-[#007AFF]" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[17px] font-medium text-neutral-900">{copy.nav.signIn}</p>
                  <p className="text-[13px] text-[#8E8E93]">{mn.signInSubtitle}</p>
                </div>
                <LandingChevronForward className="h-5 w-5 shrink-0 text-[#C7C7CC]" />
              </Link>
            </LandingMobileGroup>
          </div>

          <div>
            <p className="mb-2 px-1 text-[13px] font-semibold uppercase tracking-wide text-[#8E8E93]">
              {mn.support}
            </p>
            <LandingMobileGroup>
              {MOBILE_SUPPORT_ICONS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className="flex items-center gap-3.5 border-b border-[#E5E5EA] px-4 py-3.5 last:border-0 active:bg-[#F2F2F7]/80"
                  >
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.65rem]",
                        link.tint,
                      )}
                    >
                      <Icon className="h-[1.05rem] w-[1.05rem]" strokeWidth={2} />
                    </div>
                    <span className="flex-1 text-[17px] font-medium text-neutral-900">
                      {mn.supportLinks[link.key]}
                    </span>
                    <LandingChevronForward className="h-5 w-5 shrink-0 text-[#C7C7CC]" />
                  </Link>
                );
              })}
            </LandingMobileGroup>
          </div>

          <div>
            <p className="mb-2 px-1 text-[13px] font-semibold uppercase tracking-wide text-[#8E8E93]">
              {mn.language}
            </p>
            <LandingMobileGroup className="p-4">
              <LandingIosSegmentedControl
                options={[
                  { value: "EN", label: "EN" },
                  { value: "FR", label: "FR" },
                  { value: "AR", label: "AR" },
                ]}
                value={language}
                onChange={onLanguageChange}
              />
            </LandingMobileGroup>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function LandingIosSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex rounded-[0.75rem] bg-[#E5E5EA]/90 p-1",
        className,
      )}
      role="tablist"
    >
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex-1 rounded-[0.625rem] px-3 py-2.5 text-[14px] font-semibold transition-all duration-200 active:scale-[0.98]",
              active
                ? "bg-white text-neutral-900 shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
                : "text-[#8E8E93]",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function LandingMobilePrimaryButton({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-[3.25rem] w-full items-center justify-center gap-2 rounded-[0.875rem] bg-[#007AFF] text-[17px] font-semibold text-white shadow-[0_4px_14px_rgba(0,122,255,0.35)] transition-transform active:scale-[0.98]",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function LandingMobileSecondaryButton({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-[3.25rem] w-full items-center justify-center rounded-[0.875rem] bg-white text-[17px] font-semibold text-neutral-800 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-transform active:scale-[0.98]",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function LandingMobileSection({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "border-b border-black/[0.04] py-16 md:border-neutral-200 md:py-20",
        className,
      )}
    >
      {children}
    </section>
  );
}

export { IOS_BLUE };
