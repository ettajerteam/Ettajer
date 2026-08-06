"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuthLocale } from "@/components/auth/auth-locale-provider";
import { AuthLanguageSwitcher } from "@/components/shared/language-switcher";

const NAV_LOGO = "/brand/Ettajer-logo-black-text-Next-to-the-icon.png";

interface AuthLayoutProps {
  children: React.ReactNode;
  variant?: "default" | "signin";
}

export function AuthLayout({ children, variant = "default" }: AuthLayoutProps) {
  const isSignin = variant === "signin";
  const { copy, isRtl } = useAuthLocale();
  const l = copy.layout;

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden font-sans text-neutral-900 antialiased selection:bg-neutral-900 selection:text-white",
        isSignin
          ? "h-[100dvh] max-h-[100dvh] bg-[#eef1f6]"
          : "min-h-[100dvh] bg-[#F2F2F7] md:bg-[#f7f7f8]",
      )}
    >
      {isSignin ? (
        <>
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_50%_-20%,rgba(0,122,255,0.12),transparent_55%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_0%_100%,rgba(100,116,139,0.1),transparent_55%)]"
            aria-hidden
          />
        </>
      ) : null}

      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative z-10 shrink-0"
        style={
          isSignin
            ? { paddingTop: "max(0px, env(safe-area-inset-top))" }
            : undefined
        }
      >
        <div
          className={cn(
            "mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6",
            isSignin ? "h-11 sm:h-10" : "h-14",
          )}
        >
          <Link
            href="/"
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center rounded-lg transition-opacity duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]/40 focus-visible:ring-offset-2 sm:min-h-0 sm:min-w-0"
          >
            <Image
              src={NAV_LOGO}
              alt="Ettajer"
              width={104}
              height={26}
              className={cn(
                "w-auto object-contain object-left",
                isSignin
                  ? "h-[1.15rem] max-h-[1.15rem] max-w-[6rem]"
                  : "h-[1.25rem] max-h-[1.25rem] max-w-[6.5rem]",
              )}
              style={{ width: "auto" }}
              priority
            />
          </Link>

          <div className="flex items-center gap-1 sm:gap-3">
            {!isSignin ? (
              <>
                <AuthLanguageSwitcher variant="segmented" className="hidden sm:block" />
                <AuthLanguageSwitcher variant="select" className="sm:hidden" />
              </>
            ) : null}
            <Link
              href="/help"
              className="hidden rounded-lg px-3 py-1.5 text-[13px] font-medium text-neutral-500 transition-colors duration-200 hover:bg-white/70 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]/40 sm:inline-block"
            >
              {l.help}
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-lg text-[13px] font-medium text-neutral-500 transition-colors duration-200 hover:bg-white/70 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]/40 sm:min-h-0 sm:min-w-0 sm:px-3 sm:py-1.5"
              aria-label={l.back}
            >
              <ArrowLeft className={cn("h-4 w-4 sm:h-3.5 sm:w-3.5", isRtl && "scale-x-[-1]")} strokeWidth={2} />
              <span className="hidden sm:inline">{l.back}</span>
            </Link>
          </div>
        </div>
      </motion.header>

      <main
        className={cn(
          "relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center",
          isSignin
            ? "overflow-hidden px-3 py-0 sm:px-6"
            : "px-5 py-10 sm:px-6 sm:py-14",
        )}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "w-full",
            isSignin ? "max-w-[400px] sm:max-w-[360px]" : "max-w-[400px]",
          )}
        >
          {children}
        </motion.div>
      </main>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={cn(
          "relative z-10 shrink-0 px-4 text-center sm:px-6",
          isSignin
            ? "pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1 text-neutral-500"
            : "mt-auto py-5 text-[11px] text-neutral-400",
        )}
      >
        {isSignin ? (
          <div className="mx-auto flex max-w-[400px] flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] sm:max-w-[360px]">
            <AuthLanguageSwitcher variant="footer" label="" className="text-[11px]" />
            <span className="text-neutral-300" aria-hidden>
              ·
            </span>
            <Link
              href="/help"
              className="font-medium text-neutral-500 transition-colors hover:text-neutral-800"
            >
              {l.help}
            </Link>
            <span className="text-neutral-300" aria-hidden>
              ·
            </span>
            <Link
              href="/contact"
              className="font-medium text-neutral-500 transition-colors hover:text-neutral-800"
            >
              {l.contact}
            </Link>
            <span className="text-neutral-300" aria-hidden>
              ·
            </span>
            <span className="text-neutral-400">
              © {new Date().getFullYear()} Ettajer
            </span>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-center">
              <AuthLanguageSwitcher variant="footer" />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5 text-[11px]">
              <Link
                href="/help"
                className="font-medium text-neutral-500 transition-colors duration-200 hover:text-neutral-800"
              >
                {l.help}
              </Link>
              <span className="text-neutral-300" aria-hidden>
                ·
              </span>
              <Link
                href="/contact"
                className="font-medium text-neutral-500 transition-colors duration-200 hover:text-neutral-800"
              >
                {l.contact}
              </Link>
              <span className="text-neutral-300" aria-hidden>
                ·
              </span>
              <span>© {new Date().getFullYear()} Ettajer</span>
            </div>
          </>
        )}
      </motion.footer>
    </div>
  );
}
