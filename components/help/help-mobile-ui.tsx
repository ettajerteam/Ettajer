"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function HelpMobileHeader({
  eyebrow,
  title,
  subtitle,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("md:text-center", className)}>
      {eyebrow ? (
        <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#8E8E93] md:text-sm md:font-normal md:normal-case md:tracking-normal md:text-neutral-500">
          {eyebrow}
        </p>
      ) : null}
      <h1
        className={cn(
          "font-bold tracking-tight text-neutral-900",
          eyebrow ? "mt-2 text-[1.95rem] leading-[1.08] md:mt-3 md:text-5xl md:font-semibold" : "text-[1.95rem] leading-[1.08] md:text-4xl md:font-semibold",
        )}
      >
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-3.5 text-[17px] leading-[1.55] text-[#8E8E93] md:mx-auto md:mt-4 md:max-w-xl md:text-base md:text-neutral-500">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

export function HelpMobileSectionLabel({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4 md:mb-8">
      <div>
        <h2 className="text-[1.35rem] font-bold tracking-tight text-neutral-900 md:text-2xl md:font-semibold">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1.5 text-[15px] text-[#8E8E93] md:text-sm md:text-neutral-500">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function HelpMobileGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[0.875rem] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_6px_20px_rgba(0,0,0,0.05)] md:rounded-2xl md:border md:border-neutral-200 md:shadow-none",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function HelpMobileListRow({
  href,
  title,
  subtitle,
  onClick,
}: {
  href?: string;
  title: string;
  subtitle?: string;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <div className="min-w-0 flex-1">
        <p className="text-[17px] font-medium text-neutral-900 md:text-base">{title}</p>
        {subtitle ? (
          <p className="mt-0.5 line-clamp-2 text-[15px] text-[#8E8E93] md:text-sm md:text-neutral-500">
            {subtitle}
          </p>
        ) : null}
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-[#C7C7CC] md:h-4 md:w-4 md:text-neutral-300" />
    </>
  );

  const className =
    "flex items-center justify-between gap-4 border-b border-[#E5E5EA] px-4 py-4 transition-colors last:border-0 active:bg-[#F2F2F7]/80 md:px-6 md:py-5 md:hover:bg-neutral-50";

  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cn(className, "w-full text-left")}>
      {inner}
    </button>
  );
}

export function HelpMobileBackBar({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <div className="border-b border-[#E5E5EA] bg-[#F2F2F7]/95 px-4 py-2.5 backdrop-blur-xl md:hidden">
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-[15px] font-medium text-[#007AFF] active:opacity-70"
      >
        <ChevronLeft className="h-5 w-5" strokeWidth={2.25} />
        {label}
      </Link>
    </div>
  );
}

export function HelpMobileCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[0.875rem] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_6px_20px_rgba(0,0,0,0.05)] md:rounded-2xl md:border md:border-neutral-200 md:p-6 md:shadow-none",
        className,
      )}
    >
      {children}
    </div>
  );
}
