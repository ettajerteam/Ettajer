"use client";

import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { LogOut, HelpCircle } from "lucide-react";
import { FounderAppProvider } from "@/components/founder/founder-app-context";
import { FounderMobileNav } from "@/components/founder/founder-mobile-nav";
import { useFounderFlowLocale } from "@/components/founder/founder-flow-root";
import { FounderLanguageSwitcher } from "@/components/shared/language-switcher";
import { cn } from "@/lib/utils";

const NAV_LOGO = "/brand/Ettajer-logo-black-text-Next-to-the-icon.png";

interface FounderShellProps {
  children: React.ReactNode;
  className?: string;
  userName?: string;
  founderNumber?: number;
  showLogout?: boolean;
}

export function FounderShell({
  children,
  className,
  userName,
  founderNumber,
  showLogout = true,
}: FounderShellProps) {
  const firstName = userName?.split(" ")[0];
  const { copy } = useFounderFlowLocale();
  const s = copy.shell;

  return (
    <FounderAppProvider>
      <div
        className={cn(
          "relative min-h-[100dvh] overflow-x-hidden font-sans text-neutral-900 antialiased",
          "bg-[#F2F2F7] md:bg-[#f7f7f8]",
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 hidden md:block md:bg-[radial-gradient(ellipse_90%_60%_at_50%_-15%,rgba(59,130,246,0.11),transparent_55%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 hidden opacity-[0.35] md:block [background-image:radial-gradient(rgba(0,0,0,0.045)_1px,transparent_1px)] [background-size:20px_20px]"
          aria-hidden
        />

        <header className="sticky top-0 z-20 bg-[#F2F2F7]/80 pt-[env(safe-area-inset-top)] backdrop-blur-xl backdrop-saturate-[180%] md:border-b md:border-black/[0.04] md:bg-white/70">
          <div className="mx-auto flex h-11 max-w-6xl items-center justify-between gap-4 px-4 sm:h-14 sm:px-6">
            <Link
              href="/"
              className="inline-flex shrink-0 items-center rounded-lg transition-opacity active:opacity-60"
            >
              <Image
                src={NAV_LOGO}
                alt="Ettajer"
                width={104}
                height={26}
                className="h-[1.2rem] w-auto max-w-[6rem] object-contain object-left sm:h-[1.35rem] sm:max-w-[6.5rem]"
                style={{ width: "auto" }}
                priority
              />
            </Link>

            <div className="hidden min-w-[8.5rem] sm:block">
              <FounderLanguageSwitcher />
            </div>
            <div className="hidden items-center gap-1 sm:flex sm:gap-2">
              {firstName ? (
                <span className="text-[13px] font-medium text-neutral-500">{firstName}</span>
              ) : null}
              <Link
                href="/help"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium text-neutral-500 transition-colors hover:bg-white/60 hover:text-neutral-900"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>{s.help}</span>
              </Link>
              {showLogout ? (
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200/80 bg-white/80 px-3 py-1.5 text-[13px] font-medium text-neutral-600 shadow-sm transition-all hover:border-neutral-300 hover:bg-white hover:text-neutral-900"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>{s.logOut}</span>
                </button>
              ) : null}
            </div>
          </div>
        </header>

        <main
          className={cn(
            "relative z-10 mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-10",
            "pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:px-8 md:py-16 md:pb-14",
            className,
          )}
        >
          {children}
        </main>

        <footer className="relative z-10 border-t border-black/[0.04] bg-white/40 px-6 py-6 text-center backdrop-blur-sm pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-6">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-4">
            <FounderLanguageSwitcher variant="footer" />
            <p className="text-[12px] text-neutral-400">{s.footer(new Date().getFullYear())}</p>
          </div>
        </footer>

        <FounderMobileNav
          userName={userName}
          founderNumber={founderNumber}
          showLogout={showLogout}
        />
      </div>
    </FounderAppProvider>
  );
}
