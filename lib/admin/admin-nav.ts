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
  Mail,
  Rocket,
  PieChart,
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
    id: "user-stats",
    label: "User stats",
    href: "/admin/users/stats",
    icon: PieChart,
    description: "Trial ended & cards",
  },
  {
    id: "stores",
    label: "Stores",
    href: "/admin/stores",
    icon: Store,
    description: "All merchant stores",
  },
  {
    id: "activation",
    label: "Activation",
    href: "/admin/activation",
    icon: Rocket,
    description: "Empty stores & first sale",
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
  {
    id: "email",
    label: "Email",
    href: "/admin/email",
    icon: Mail,
    description: "MailHub platform health",
  },
];

export function isAdminNavActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  if (pathname === href) return true;
  if (!pathname.startsWith(`${href}/`)) return false;
  // Prefer a more specific nav item (e.g. /admin/users/stats over /admin/users)
  const moreSpecific = adminNavItems.some(
    (item) =>
      item.href !== href &&
      item.href.startsWith(`${href}/`) &&
      (pathname === item.href || pathname.startsWith(`${item.href}/`)),
  );
  return !moreSpecific;
}
