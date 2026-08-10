"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  CircleHelp,
  LogOut,
  Settings,
  UserRound,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function userInitials(name?: string | null, email?: string | null) {
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

export function DashboardAccountMenu() {
  const { data: session } = useSession();
  const name = session?.user?.name?.trim() || "Your account";
  const email = session?.user?.email ?? "";
  const initials = userInitials(session?.user?.name, email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative ml-0.5 flex h-9 w-9 items-center justify-center rounded-full outline-none ring-offset-2 transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#007AFF]/40"
          aria-label="Account menu"
        >
          <Avatar className="h-8 w-8 ring-1 ring-black/[0.08] dark:ring-white/15">
            <AvatarImage src={session?.user?.image ?? undefined} alt="" />
            <AvatarFallback className="bg-[#007AFF] text-[11px] font-bold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        collisionPadding={12}
        className={cn(
          "w-[min(100vw-1rem,300px)] overflow-hidden rounded-[16px] border border-black/[0.06] bg-white p-0",
          "shadow-[0_12px_40px_-8px_rgba(0,0,0,0.18),0_4px_12px_-2px_rgba(0,0,0,0.08)]",
          "dark:border-white/10 dark:bg-[#1C1C1E]",
        )}
      >
        <div className="border-b border-black/[0.06] px-3.5 py-3.5 dark:border-white/10">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 shrink-0 ring-1 ring-black/[0.06] dark:ring-white/10">
              <AvatarImage src={session?.user?.image ?? undefined} alt="" />
              <AvatarFallback className="bg-[#007AFF] text-[13px] font-bold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold tracking-[-0.01em] text-neutral-900 dark:text-white">
                {name}
              </p>
              {email ? (
                <p className="truncate text-[12px] text-neutral-500 dark:text-neutral-400">
                  {email}
                </p>
              ) : null}
            </div>
          </div>
          <Link
            href="/dashboard/profile"
            className="mt-3 flex h-9 items-center justify-center rounded-lg bg-[#F0F2F5] text-[13px] font-semibold text-neutral-900 transition hover:bg-[#E4E6E9] dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
          >
            See your profile
          </Link>
        </div>

        <div className="p-1.5">
          <MenuRow href="/dashboard/profile" icon={UserRound}>
            Profile
          </MenuRow>
          <MenuRow href="/dashboard/settings" icon={Settings}>
            Settings
          </MenuRow>
          <MenuRow href="/help" icon={CircleHelp}>
            Get help
          </MenuRow>
          <DropdownMenuSeparator className="my-1.5" />
          <DropdownMenuItem
            className="cursor-pointer gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-500/10"
            onClick={() => void signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4 shrink-0" strokeWidth={2.25} />
            Sign out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MenuRow({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: typeof UserRound;
  children: React.ReactNode;
}) {
  return (
    <DropdownMenuItem asChild className="cursor-pointer rounded-xl p-0 focus:bg-[#F0F2F5] dark:focus:bg-white/10">
      <Link
        href={href}
        className="flex items-center gap-3 px-3 py-2.5 text-[14px] font-medium text-neutral-900 dark:text-white"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E4E6EB] text-neutral-800 dark:bg-white/10 dark:text-white">
          <Icon className="h-4 w-4" strokeWidth={2.25} />
        </span>
        {children}
      </Link>
    </DropdownMenuItem>
  );
}
