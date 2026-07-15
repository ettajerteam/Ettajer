"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  CreditCard,
  MessageCircle,
  Menu,
  HelpCircle,
  LogOut,
  Mail,
  ExternalLink,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useFounderApp, type FounderMobileTab } from "@/components/founder/founder-app-context";
import { useFounderFlowLocale } from "@/components/founder/founder-flow-root";
import { FounderLanguageSwitcher } from "@/components/shared/language-switcher";
import { formatFounderNumber } from "@/lib/founder/constants";
import { cn } from "@/lib/utils";

const IOS_BLUE = "#007AFF";

const TABS: {
  id: FounderMobileTab;
  labelKey: "home" | "card" | "contact" | "menu";
  icon: typeof Home;
}[] = [
  { id: "home", labelKey: "home", icon: Home },
  { id: "card", labelKey: "card", icon: CreditCard },
  { id: "contact", labelKey: "contact", icon: MessageCircle },
  { id: "menu", labelKey: "menu", icon: Menu },
];

interface FounderMobileNavProps {
  userName?: string;
  founderNumber?: number;
  showLogout?: boolean;
}

export function FounderMobileHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6 md:hidden">
      <h1 className="text-[2rem] font-bold leading-tight tracking-[-0.03em] text-neutral-900">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-1.5 text-[15px] leading-snug text-[#8E8E93]">{subtitle}</p>
      ) : null}
    </div>
  );
}

export function FounderMobileNav({
  userName,
  founderNumber,
  showLogout = true,
}: FounderMobileNavProps) {
  const { tab, setTab } = useFounderApp();
  const { copy, isRtl } = useFounderFlowLocale();
  const shell = copy.shell;
  const nav = shell.mobileNav;
  const firstName = userName?.split(" ")[0];

  return (
    <>
      <AnimatePresence>
        {tab === "menu" ? (
          <FounderMenuPanel
            firstName={firstName}
            founderNumber={founderNumber}
            showLogout={showLogout}
            onClose={() => setTab("home")}
            nav={nav}
            languageLabel={shell.language}
            isRtl={isRtl}
          />
        ) : null}
      </AnimatePresence>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-4 pb-[calc(0.625rem+env(safe-area-inset-bottom))] md:hidden">
        <nav
          className="pointer-events-auto mx-auto flex h-[3.25rem] max-w-[22rem] items-center justify-around rounded-[1.375rem] border border-black/[0.04] bg-white/72 shadow-[0_4px_24px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,0.8)_inset] backdrop-blur-2xl backdrop-saturate-[180%]"
          aria-label={nav.navAria}
        >
          {TABS.map((item) => {
            const active = tab === item.id;
            const Icon = item.icon;
            const label = nav[item.labelKey];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className="flex h-full min-w-[4rem] flex-1 flex-col items-center justify-center gap-0.5 transition-transform active:scale-95"
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  className="h-[1.35rem] w-[1.35rem] transition-colors"
                  style={{ color: active ? IOS_BLUE : "#8E8E93" }}
                  strokeWidth={active ? 2.25 : 1.75}
                />
                <span
                  className="text-[10px] font-medium leading-none"
                  style={{ color: active ? IOS_BLUE : "#8E8E93" }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}

function FounderMenuPanel({
  firstName,
  founderNumber,
  showLogout,
  onClose,
  nav,
  languageLabel,
  isRtl,
}: {
  firstName?: string;
  founderNumber?: number;
  showLogout: boolean;
  onClose: () => void;
  nav: ReturnType<typeof useFounderFlowLocale>["copy"]["shell"]["mobileNav"];
  languageLabel: string;
  isRtl: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-40 md:hidden"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/25 backdrop-blur-sm"
        onClick={onClose}
        aria-label={nav.closeMenu}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 380 }}
        className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-[1.25rem] bg-[#F2F2F7] pb-[calc(4.5rem+env(safe-area-inset-bottom))]"
      >
        <div className="flex justify-center pb-1 pt-2.5">
          <div className="h-1 w-9 rounded-full bg-black/15" aria-hidden />
        </div>

        <div className="px-5 pb-4 pt-2">
          <p className="text-[13px] font-medium uppercase tracking-wide text-[#8E8E93]">
            {nav.account}
          </p>
          <p className="mt-1 text-[1.75rem] font-bold tracking-[-0.03em] text-neutral-900">
            {firstName ?? nav.founderFallback}
          </p>
          {founderNumber ? (
            <p className="mt-0.5 text-[15px] text-[#8E8E93]">
              {formatFounderNumber(founderNumber)}
            </p>
          ) : null}
        </div>

        <div className="space-y-5 px-4">
          <AppleGroup>
            <FounderLanguageSwitcher variant="menu" label={languageLabel} />
          </AppleGroup>

          <AppleGroup>
            <MenuLink href="/early-access" icon={Sparkles} label={nav.earlyAccess} onNavigate={onClose} isRtl={isRtl} />
            <MenuLink href="/help" icon={HelpCircle} label={nav.helpCenter} onNavigate={onClose} isRtl={isRtl} />
            <MenuLink href="/contact" icon={MessageCircle} label={nav.contactSupport} onNavigate={onClose} isRtl={isRtl} />
          </AppleGroup>

          <AppleGroup>
            <MenuLink href="/" icon={ExternalLink} label={nav.ettajerWebsite} onNavigate={onClose} isRtl={isRtl} />
          </AppleGroup>

          {showLogout ? (
            <AppleGroup>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex w-full items-center justify-center gap-2 px-4 py-3.5 text-[17px] font-normal text-[#FF3B30] active:bg-black/[0.04]"
              >
                <LogOut className="h-5 w-5" strokeWidth={1.75} />
                {nav.logOut}
              </button>
            </AppleGroup>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  );
}

function AppleGroup({ children }: { children: React.ReactNode }) {
  return <div className="overflow-hidden rounded-[0.625rem] bg-white">{children}</div>;
}

function MenuLink({
  href,
  icon: Icon,
  label,
  onNavigate,
  isRtl,
}: {
  href: string;
  icon: typeof Home;
  label: string;
  onNavigate: () => void;
  isRtl?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="flex items-center gap-3 border-b border-[#E5E5EA] px-4 py-3.5 text-[17px] text-neutral-900 last:border-0 active:bg-[#E5E5EA]/60"
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#007AFF]/10">
        <Icon className="h-4 w-4 text-[#007AFF]" strokeWidth={2} />
      </div>
      <span className="flex-1">{label}</span>
      <ChevronRight className={cn("h-5 w-5 text-[#C7C7CC]", isRtl && "scale-x-[-1]")} strokeWidth={2} />
    </Link>
  );
}

export function FounderContactPanel({
  email,
  founderNumber,
}: {
  email: string;
  founderNumber: number;
}) {
  return (
    <div className="md:py-0">
      <FounderMobileHeader
        title="Contact"
        subtitle={`Priority support for ${formatFounderNumber(founderNumber)}`}
      />

      <div className="space-y-5">
        <AppleGroup>
          <Link
            href="/contact"
            className="flex items-center gap-3 px-4 py-3.5 active:bg-[#E5E5EA]/60"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#007AFF]">
              <MessageCircle className="h-[1.15rem] w-[1.15rem] text-white" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[17px] text-neutral-900">Send a message</p>
              <p className="text-[13px] text-[#8E8E93]">Reply within 24h on business days</p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-[#C7C7CC]" />
          </Link>
          <Link
            href="/help"
            className="flex items-center gap-3 border-t border-[#E5E5EA] px-4 py-3.5 active:bg-[#E5E5EA]/60"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#34C759]">
              <HelpCircle className="h-[1.15rem] w-[1.15rem] text-white" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[17px] text-neutral-900">Help Center</p>
              <p className="text-[13px] text-[#8E8E93]">COD, orders & store guides</p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-[#C7C7CC]" />
          </Link>
        </AppleGroup>

        <div>
          <p className="mb-2 px-4 text-[13px] font-medium uppercase tracking-wide text-[#8E8E93]">
            Your email
          </p>
          <AppleGroup>
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#8E8E93]/15">
                <Mail className="h-[1.15rem] w-[1.15rem] text-[#8E8E93]" strokeWidth={2} />
              </div>
              <p className="truncate text-[17px] text-neutral-900">{email}</p>
            </div>
          </AppleGroup>
        </div>
      </div>
    </div>
  );
}

export function FounderCardMobileView({
  children,
  subtitle = "Tap to flip",
}: {
  children: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="flex min-h-[calc(100dvh-10rem)] flex-col md:hidden">
      <FounderMobileHeader title="Founder Card" subtitle={subtitle} />
      <div className="flex flex-1 flex-col items-center justify-center pb-4">{children}</div>
    </div>
  );
}
