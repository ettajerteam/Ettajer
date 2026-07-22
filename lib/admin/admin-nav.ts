import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Store,
  MessageSquare,
  BarChart3,
  AlertTriangle,
  CreditCard,
  History,
} from "lucide-react";

export interface AdminNavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}

export const adminNavItems: AdminNavItem[] = [
  {
    id: "overview",
    label: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
    description: "Platform snapshot",
  },
  {
    id: "users",
    label: "Users",
    href: "/admin/users",
    icon: Users,
    description: "Accounts & founders",
  },
  {
    id: "stores",
    label: "Stores",
    href: "/admin/stores",
    icon: Store,
    description: "All merchant stores",
  },
  {
    id: "messages",
    label: "Messages",
    href: "/admin/messages",
    icon: MessageSquare,
    description: "Support inbox",
  },
  {
    id: "activity",
    label: "Activity",
    href: "/admin/activity",
    icon: History,
    description: "Admin audit log",
  },
  {
    id: "analytics",
    label: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    description: "Site-wide metrics",
  },
  {
    id: "errors",
    label: "Errors",
    href: "/admin/errors",
    icon: AlertTriangle,
    description: "Failed logins & issues",
  },
  {
    id: "payments",
    label: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
    description: "Orders & revenue",
  },
];

export function isAdminNavActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}
