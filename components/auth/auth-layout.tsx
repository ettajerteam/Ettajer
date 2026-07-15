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
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#F2F2F7] font-sans text-neutral-900 antialiased selection:bg-neutral-900 selection:text-white md:bg-[#f7f7f8]">
      {isSignin ? (
        <>
          <div
            className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(ellipse_90%_60%_at_50%_-15%,rgba(59,130,246,0.11),transparent_55%)] md:block"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(ellipse_50%_40%_at_100%_50%,rgba(99,102,241,0.05),transparent_50%)] md:block"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(ellipse_45%_35%_at_0%_80%,rgba(148,163,184,0.08),transparent_50%)] md:block"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 hidden opacity-[0.35] [background-image:radial-gradient(rgba(0,0,0,0.045)_1px,transparent_1px)] [background-size:20px_20px] md:block"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute left-1/2 top-[18%] hidden h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-400/[0.04] blur-[100px] md:block"
            aria-hidden
          />
        </>
      ) : null}

      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative z-10 shrink-0"
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-6">
          <Link
            href="/"
            className="inline-flex shrink-0 items-center rounded-lg transition-opacity duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/25 focus-visible:ring-offset-2"
          >
            <Image
              src={NAV_LOGO}
              alt="Ettajer"
              width={104}
              height={26}
              className="h-[1.35rem] max-h-[1.35rem] w-auto max-w-[6.5rem] object-contain object-left"
              style={{ width: "auto" }}
              priority
            />
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <AuthLanguageSwitcher variant="segmented" className="hidden sm:block" />
            <AuthLanguageSwitcher variant="select" className="sm:hidden" />
            <Link
              href="/help"
              className="hidden rounded-lg px-3 py-1.5 text-[13px] font-medium text-neutral-500 transition-colors duration-200 hover:bg-white/60 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/25 sm:inline-block"
            >
              {l.help}
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium text-neutral-500 transition-colors duration-200 hover:bg-white/60 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/25"
            >
              <ArrowLeft className={cn("h-3.5 w-3.5", isRtl && "scale-x-[-1]")} strokeWidth={2} />
              <span className="hidden sm:inline">{l.back}</span>
            </Link>
          </div>
        </div>
      </motion.header>

      <main
        className={cn(
          "relative z-10 flex flex-1 flex-col items-center justify-center px-5 py-10 sm:px-6 sm:py-14",
        )}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={cn("w-full", isSignin ? "max-w-[408px]" : "max-w-[420px]")}
        >
          {children}
        </motion.div>
      </main>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative z-10 mt-auto shrink-0 px-6 py-5 text-center text-[11px] text-neutral-400"
      >
        <div className="mb-4 flex justify-center">
          <AuthLanguageSwitcher variant="footer" />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5">
          <Link
            href="/help"
            className="font-medium transition-colors duration-200 hover:text-neutral-600"
          >
            {l.help}
          </Link>
          <span className="hidden text-neutral-300 sm:inline" aria-hidden>
            ·
          </span>
          <Link
            href="/contact"
            className="font-medium transition-colors duration-200 hover:text-neutral-600"
          >
            {l.contact}
          </Link>
          <span className="hidden text-neutral-300 sm:inline" aria-hidden>
            ·
          </span>
          <span>© {new Date().getFullYear()} Ettajer</span>
        </div>
      </motion.footer>
    </div>
  );
}
