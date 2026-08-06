"use client";

import Link from "next/link";
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
  const hint = isMerchant ? "Control panel" : "Your store";

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[12px] transition-colors duration-200",
        "border border-black/[0.06] bg-white hover:bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.06]",
        collapsed && "justify-center px-0"
      )}
      title={collapsed ? label : undefined}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#007AFF]/10 text-[#007AFF]">
        <Icon className="h-3 w-3" />
      </span>
      {!collapsed && (
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1 font-medium leading-tight text-neutral-900 dark:text-white">
            <span className="truncate">{label}</span>
            <ArrowLeftRight className="h-3 w-3 shrink-0 text-neutral-400 transition-transform group-hover:rotate-180" />
          </span>
          <span className="block truncate text-[10px] text-neutral-400">
            {hint}
          </span>
        </span>
      )}
    </Link>
  );
}
