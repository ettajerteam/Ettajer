"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  ArrowLeft,
  LogOut,
  Menu,
  Settings,
  UserRound,
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
import { AcademySearch } from "@/components/academy/academy-search";

const BRAND_ICON = "/brand/App-Logo.png";

function initials(name?: string | null, email?: string | null) {
  const fromName = name
    ?.trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  if (fromName) return fromName;
  return (email?.[0] ?? "U").toUpperCase();
}

export function AcademyShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const name = session?.user?.name?.trim() || "Account";
  const email = session?.user?.email ?? "";
  const init = initials(session?.user?.name, email);

  const onLearning = pathname?.startsWith("/dashboard/academy/learning");
  const onSubjectsArea =
    !!pathname?.startsWith("/dashboard/academy") && !onLearning;

  return (
    <div className="academy-world flex min-h-dvh flex-col bg-[#F7F7F8] font-[family-name:var(--font-inter),ui-sans-serif,system-ui,sans-serif] text-neutral-900 antialiased">
      <header className="sticky top-0 z-50 shrink-0 border-b border-black/[0.06] bg-[#F7F7F8]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3 sm:gap-5">
            <Link
              href="/dashboard"
              className="group inline-flex shrink-0 items-center gap-1.5 text-[12px] font-medium text-neutral-400 transition-colors hover:text-neutral-800"
              title="Back to Ettajer"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5 motion-reduce:transition-none" />
              <span className="hidden sm:inline">Ettajer</span>
            </Link>

            <span className="hidden h-4 w-px bg-black/[0.08] sm:block" />

            <Link
              href="/dashboard/academy"
              className="flex min-w-0 items-center gap-2"
            >
              <Image
                src={BRAND_ICON}
                alt=""
                width={24}
                height={24}
                className="h-6 w-6 rounded-[6px]"
              />
              <span className="truncate text-[14px] font-semibold tracking-tight text-neutral-900">
                Ettajer Academy
              </span>
            </Link>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            <NavLink href="/dashboard/academy" active={onSubjectsArea}>
              Subjects
            </NavLink>
            <NavLink href="/dashboard/academy/learning" active={!!onLearning}>
              My Learning
            </NavLink>
          </nav>

          <div className="flex shrink-0 items-center gap-1.5">
            <AcademySearch />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-black/[0.04] md:hidden"
                  aria-label="Menu"
                >
                  <Menu className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl p-1">
                <DropdownMenuItem asChild className="cursor-pointer text-[13px]">
                  <Link href="/dashboard/academy">Subjects</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer text-[13px]">
                  <Link href="/dashboard/academy/learning">My Learning</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer text-[13px]">
                  <Link href="/dashboard">← Back to Ettajer</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="relative flex h-8 w-8 items-center justify-center rounded-full outline-none ring-offset-2 transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#007AFF]/40"
                  aria-label="Account"
                >
                  <Avatar className="h-8 w-8 ring-1 ring-black/[0.08]">
                    <AvatarImage src={session?.user?.image ?? undefined} alt="" />
                    <AvatarFallback className="bg-[#007AFF] text-[11px] font-bold text-white">
                      {init}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={10}
                className="w-56 rounded-xl border-black/[0.06] p-1 shadow-lg"
              >
                <div className="px-2.5 py-2">
                  <p className="truncate text-[13px] font-semibold text-neutral-900">
                    {name}
                  </p>
                  {email ? (
                    <p className="truncate text-[11px] text-neutral-500">{email}</p>
                  ) : null}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer text-[13px]">
                  <Link href="/dashboard/profile">
                    <UserRound className="h-3.5 w-3.5" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer text-[13px]">
                  <Link href="/dashboard/settings">
                    <Settings className="h-3.5 w-3.5" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer text-[13px]">
                  <Link href="/dashboard">← Back to Ettajer</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-[13px] text-red-600 focus:text-red-600"
                  onSelect={() => void signOut({ callbackUrl: "/login" })}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="relative flex-1">{children}</main>
    </div>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
        active
          ? "bg-neutral-900 text-white"
          : "text-neutral-500 hover:bg-black/[0.04] hover:text-neutral-900",
      )}
    >
      {children}
    </Link>
  );
}
