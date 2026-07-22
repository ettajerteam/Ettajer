import { prisma } from "@/lib/db";
import {
  DEFAULT_ADMIN_EMAIL,
  USER_ROLE,
  type UserRole,
} from "@/lib/admin/constants";

export function normalizeAdminEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function getBootstrapAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS?.trim();
  const fromEnv = raw
    ? raw.split(",").map((e) => normalizeAdminEmail(e)).filter(Boolean)
    : [];
  const merged = new Set([DEFAULT_ADMIN_EMAIL, ...fromEnv]);
  return Array.from(merged);
}

export function isBootstrapAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getBootstrapAdminEmails().includes(normalizeAdminEmail(email));
}

export function resolveUserRole(
  dbRole: string | null | undefined,
  email: string | null | undefined,
): UserRole {
  if (dbRole === USER_ROLE.ADMIN) return USER_ROLE.ADMIN;
  if (isBootstrapAdminEmail(email)) return USER_ROLE.ADMIN;
  return USER_ROLE.MERCHANT;
}

export function isPlatformAdmin(user: {
  role?: string | null;
  email?: string | null;
}): boolean {
  return resolveUserRole(user.role, user.email) === USER_ROLE.ADMIN;
}

/** Sync bootstrap admin emails to DB role on login */
export async function ensureBootstrapAdminRole(
  userId: string,
  email: string,
  currentRole: string | null | undefined,
): Promise<UserRole> {
  const effectiveRole = resolveUserRole(currentRole, email);
  if (effectiveRole === USER_ROLE.ADMIN && currentRole !== USER_ROLE.ADMIN) {
    await prisma.user.update({
      where: { id: userId },
      data: { role: USER_ROLE.ADMIN, status: "active" },
    });
  }
  return effectiveRole;
}
