"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  BookOpen,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const BRAND_ICON = "/brand/App-Logo.png";

export function DeveloperConsoleShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const name = session?.user?.name?.trim() || "Developer";
  const email = session?.user?.email ?? "";
  const initial =
    name[0]?.toUpperCase() || email[0]?.toUpperCase() || "D";

  const onActivity = pathname?.startsWith("/dashboard/developer/activity");
  const onHelp = pathname?.startsWith("/dashboard/developer/help");
  const onConsole = !onActivity && !onHelp;

  return (
    <div className="flex min-h-dvh flex-col bg-[#F5F5F7] font-[family-name:var(--font-inter),ui-sans-serif,system-ui,sans-serif] text-neutral-900 antialiased">
      <header className="sticky top-0 z-40 shrink-0 border-b border-white/[0.08] bg-[#0B0D10]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link
            href="/dashboard/developer"
            className="flex min-w-0 items-center gap-2.5"
          >
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

          <div className="hidden items-center md:flex">
            <div className="inline-flex rounded-[10px] bg-white/[0.06] p-0.5">
              <SegmentLink href="/dashboard/developer" active={onConsole}>
                Console
              </SegmentLink>
              <SegmentLink
                href="/dashboard/developer/activity"
                active={onActivity}
              >
                Activity
              </SegmentLink>
              <SegmentLink
                href="/dashboard/developer/help"
                active={onHelp}
              >
                Help
              </SegmentLink>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Link
              href="/developers"
              className="hidden h-8 items-center rounded-lg px-2.5 text-[12px] font-medium text-white/45 transition hover:bg-white/[0.06] hover:text-white lg:inline-flex"
            >
              Docs
            </Link>
            <Link
              href="/dashboard"
              className="hidden h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12px] font-medium text-white/45 transition hover:bg-white/[0.06] hover:text-white md:inline-flex"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Store
            </Link>

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
                className="w-52 rounded-xl border-black/[0.06] p-1 shadow-lg"
              >
                <DropdownMenuItem asChild className="cursor-pointer text-[13px]">
                  <Link href="/dashboard/developer">Console</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer text-[13px]">
                  <Link href="/dashboard/developer/activity">Activity</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer text-[13px]">
                  <Link href="/dashboard/developer/help">Help</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer text-[13px]">
                  <Link href="/developers/guides">Guides</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer text-[13px]">
                  <Link href="/developers">Docs</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer text-[13px]">
                  <Link href="/developers/mcp">MCP</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer text-[13px]">
                  <Link href="/developers/oauth">OAuth</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer text-[13px]">
                  <Link href="/dashboard">Store dashboard</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] py-1 pl-1 pr-2 transition hover:bg-white/[0.08]"
                  aria-label="Account menu"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={session?.user?.image ?? undefined} />
                    <AvatarFallback className="bg-[#007AFF] text-[10px] font-semibold text-white">
                      {initial}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="hidden h-3.5 w-3.5 text-white/35 sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 rounded-xl border-black/[0.06] p-0 shadow-lg"
              >
                <div className="border-b border-black/[0.06] px-3 py-2.5">
                  <p className="truncate text-[13px] font-medium">{name}</p>
                  {email ? (
                    <p className="truncate text-[11px] text-neutral-500">
                      {email}
                    </p>
                  ) : null}
                </div>
                <div className="p-1">
                  <DropdownMenuItem asChild className="cursor-pointer text-[12px]">
                    <Link href="/dashboard">
                      <LayoutDashboard className="mr-2 h-3.5 w-3.5" />
                      Store dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer text-[12px]">
                    <Link href="/dashboard/settings">
                      <Settings className="mr-2 h-3.5 w-3.5" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer text-[12px]">
                    <Link href="/developers">
                      <BookOpen className="mr-2 h-3.5 w-3.5" />
                      Developer docs
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-[12px] text-red-600 focus:text-red-600"
                    onClick={() => void signOut({ callbackUrl: "/login" })}
                  >
                    <LogOut className="mr-2 h-3.5 w-3.5" />
                    Sign out
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-black/[0.06] bg-white/90 backdrop-blur-xl md:hidden">
        <div className="mx-auto grid max-w-5xl grid-cols-4 px-1 pb-[env(safe-area-inset-bottom)]">
          <MobileNavLink href="/dashboard/developer" active={onConsole}>
            Console
          </MobileNavLink>
          <MobileNavLink
            href="/dashboard/developer/activity"
            active={onActivity}
          >
            Activity
          </MobileNavLink>
          <MobileNavLink href="/dashboard/developer/help" active={onHelp}>
            Help
          </MobileNavLink>
          <MobileNavLink href="/developers">Docs</MobileNavLink>
        </div>
      </nav>

      <main className="flex min-h-0 flex-1 flex-col">{children}</main>

      <footer className="mt-auto shrink-0 border-t border-black/[0.06] bg-[#E8E8ED] pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
          <Link
            href="/developers"
            className="text-[12px] font-medium text-neutral-800 transition hover:text-neutral-950"
          >
            Ettajer
            <span className="font-normal text-neutral-500"> for Developers</span>
          </Link>
          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-[12px]">
            <Link
              href="/dashboard/developer/help"
              className="text-neutral-500 transition hover:text-neutral-900"
            >
              Help
            </Link>
            <Link
              href="/developers/guides"
              className="text-neutral-500 transition hover:text-neutral-900"
            >
              Guides
            </Link>
            <Link
              href="/developers"
              className="text-neutral-500 transition hover:text-neutral-900"
            >
              Docs
            </Link>
            <Link
              href="/developers/mcp"
              className="text-neutral-500 transition hover:text-neutral-900"
            >
              MCP
            </Link>
            <Link
              href="/developers/oauth"
              className="text-neutral-500 transition hover:text-neutral-900"
            >
              OAuth
            </Link>
            <Link
              href="/dashboard"
              className="text-neutral-500 transition hover:text-neutral-900"
            >
              Store dashboard
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function SegmentLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-7 items-center rounded-[8px] px-3 text-[12px] font-semibold transition",
        active
          ? "bg-white text-neutral-900 shadow-sm"
          : "text-white/50 hover:text-white",
      )}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center py-2.5 text-[11px] font-medium transition",
        active ? "text-[#007AFF]" : "text-neutral-400",
      )}
    >
      {children}
    </Link>
  );
}
