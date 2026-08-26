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
  ShoppingBag,
  TrendingUp,
  Globe,
} from "lucide-react";

export interface AdminNavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}

export interface AdminNavGroup {
  id: string;
  label: string;
  items: AdminNavItem[];
}

export const adminNavGroups: AdminNavGroup[] = [
  {
    id: "control",
    label: "Control",
    items: [
      {
        id: "overview",
        label: "Overview",
        href: "/admin",
        icon: LayoutDashboard,
        description: "Platform command center",
      },
    ],
  },
  {
    id: "merchants",
    label: "Merchants",
    items: [
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
        id: "activation",
        label: "Activation",
        href: "/admin/activation",
        icon: Rocket,
        description: "Empty stores & first sale",
      },
    ],
  },
  {
    id: "commerce",
    label: "Commerce",
    items: [
      {
        id: "orders",
        label: "Orders",
        href: "/admin/payments",
        icon: ShoppingBag,
        description: "Order pipeline",
      },
      {
        id: "payments",
        label: "Payments",
        href: "/admin/payments",
        icon: CreditCard,
        description: "COD & revenue control",
      },
      {
        id: "gmv",
        label: "GMV",
        href: "/admin/analytics?range=30",
        icon: TrendingUp,
        description: "Revenue intelligence",
      },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    items: [
      {
        id: "domains",
        label: "Domains",
        href: "/admin/domains",
        icon: Globe,
        description: "DNS health center",
      },
      {
        id: "errors",
        label: "Errors",
        href: "/admin/errors",
        icon: AlertTriangle,
        description: "Failed logins & issues",
      },
      {
        id: "activity",
        label: "Activity",
        href: "/admin/activity",
        icon: History,
        description: "Live platform stream",
      },
    ],
  },
  {
    id: "relationship",
    label: "Relationship",
    items: [
      {
        id: "support",
        label: "Support",
        href: "/admin/messages",
        icon: MessageSquare,
        description: "Support inbox",
      },
      {
        id: "email",
        label: "Email",
        href: "/admin/email",
        icon: Mail,
        description: "MailHub platform health",
      },
    ],
  },
  {
    id: "intelligence",
    label: "Intelligence",
    items: [
      {
        id: "insights",
        label: "Insights",
        href: "/admin/analytics",
        icon: BarChart3,
        description: "Signal · why · action",
      },
    ],
  },
];

/** Flat list for command palette / legacy consumers. */
export const adminNavItems: AdminNavItem[] = adminNavGroups.flatMap(
  (g) => g.items
);

export function isAdminNavActive(pathname: string, href: string): boolean {
  const pathOnly = href.split("?")[0];
  if (pathOnly === "/admin") return pathname === "/admin";
  // Orders + Payments share /admin/payments — both highlight when on payments
  if (pathOnly === "/admin/payments") {
    return pathname === "/admin/payments" || pathname.startsWith("/admin/orders");
  }
  if (pathOnly === "/admin/analytics") {
    return pathname === "/admin/analytics" || pathname.startsWith("/admin/analytics/");
  }
  if (pathOnly === "/admin/messages") {
    return pathname === "/admin/messages" || pathname.startsWith("/admin/messages/");
  }
  return pathname === pathOnly || pathname.startsWith(`${pathOnly}/`);
}
