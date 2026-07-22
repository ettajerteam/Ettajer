import { DEFAULT_ADMIN_EMAIL } from "@/lib/admin/constants";

export function normalizeAdminEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Client-safe bootstrap admin check (mirrors server allowlist default). */
export function isBootstrapAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return normalizeAdminEmail(email) === DEFAULT_ADMIN_EMAIL;
}
