"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { OpenConsoleLink } from "@/components/developer/open-console-link";

const BRAND_ICON = "/brand/App-Logo.png";

const NAV = [
  { href: "/developers", label: "Overview", exact: true },
  { href: "/developers/quickstart", label: "Quickstart" },
  { href: "/developers/mcp", label: "MCP" },
  { href: "/developers/api", label: "API" },
  { href: "/developers/oauth", label: "OAuth" },
  { href: "/developers/guides", label: "Guides" },
] as const;

export function DevelopersSiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#0B0D10]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/developers" className="flex min-w-0 items-center gap-2.5">
          <Image
            src={BRAND_ICON}
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 rounded-[7px]"
          />
          <span className="truncate text-[14px] font-semibold text-white">
            Ettajer
            <span className="font-normal text-white/40"> for Developers</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition",
                  active
                    ? "bg-white/[0.1] text-white"
                    : "text-white/45 hover:bg-white/[0.05] hover:text-white",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5">
          <OpenConsoleLink className="hidden h-8 items-center rounded-lg bg-[#007AFF] px-3 text-[12px] font-semibold text-white transition hover:bg-[#0071EB] sm:inline-flex">
            Open console
          </OpenConsoleLink>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/[0.06] hover:text-white md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 rounded-xl border-black/[0.06] p-1"
            >
              {NAV.map((item) => (
                <DropdownMenuItem
                  key={item.href}
                  asChild
                  className="cursor-pointer text-[13px]"
                >
                  <Link href={item.href}>{item.label}</Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem asChild className="cursor-pointer text-[13px]">
                <OpenConsoleLink>Open console</OpenConsoleLink>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
