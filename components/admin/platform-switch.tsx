"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { ArrowLeftRight, LayoutDashboard, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { USER_ROLE } from "@/lib/admin/constants";
import { isBootstrapAdminEmail } from "@/lib/admin/auth-client";

interface PlatformSwitchProps {
  mode: "merchant" | "admin";
  collapsed?: boolean;
}

export function PlatformSwitch({ mode, collapsed = false }: PlatformSwitchProps) {
  const { data: session, update } = useSession();
  const isAdmin = session?.user?.role === USER_ROLE.ADMIN;

  useEffect(() => {
    const email = session?.user?.email;
    if (!email || isAdmin) return;
    if (isBootstrapAdminEmail(email)) {
      void update();
    }
  }, [session?.user?.email, isAdmin, update]);

  if (!isAdmin) return null;

  const isMerchant = mode === "merchant";
  const href = isMerchant ? "/admin" : "/dashboard";
  const label = isMerchant ? "Platform admin" : "Merchant dashboard";
  const Icon = isMerchant ? LayoutDashboard : Store;
  const hint = isMerchant ? "Ettajer control panel" : "Your test store";

  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-all",
        isMerchant
          ? "border-violet-200/80 bg-violet-50/80 text-violet-900 hover:border-violet-300 hover:bg-violet-100/80 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-100 dark:hover:bg-violet-500/15"
          : "border-[#007AFF]/20 bg-[#007AFF]/5 text-[#007AFF] hover:border-[#007AFF]/35 hover:bg-[#007AFF]/10 dark:border-[#007AFF]/25 dark:bg-[#007AFF]/10",
        collapsed && "justify-center px-2"
      )}
      title={collapsed ? label : undefined}
    >
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          isMerchant
            ? "bg-violet-600 text-white shadow-sm shadow-violet-600/30"
            : "bg-[#007AFF] text-white shadow-sm shadow-[#007AFF]/30"
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      {!collapsed && (
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 font-semibold leading-tight">
            {label}
            <ArrowLeftRight className="h-3.5 w-3.5 opacity-60 transition-transform group-hover:rotate-180" />
          </span>
          <span className="block truncate text-[11px] opacity-70">{hint}</span>
        </span>
      )}
    </Link>
  );
}
