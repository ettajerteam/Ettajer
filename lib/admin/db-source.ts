export type AdminDbSource =
  | { kind: "local"; label: string }
  | { kind: "remote"; label: string }
  | { kind: "unknown"; label: string };

/** Detect whether admin is reading a local dev database vs production Supabase. */
export function getAdminDbSource(): AdminDbSource {
  const url = process.env.DATABASE_URL?.trim() ?? "";
  if (!url) {
    return { kind: "unknown", label: "Database URL not set" };
  }
  if (
    url.includes("localhost") ||
    url.includes("127.0.0.1") ||
    url.includes("@host.docker.internal")
  ) {
    return {
      kind: "local",
      label: "Local PostgreSQL (demo / dev data only)",
    };
  }
  if (url.includes("supabase.com") || url.includes("pooler.supabase")) {
    return {
      kind: "remote",
      label: "Supabase (production data)",
    };
  }
  return { kind: "remote", label: "Remote database" };
}

export function isAdminLocalDatabase(): boolean {
  return getAdminDbSource().kind === "local";
}
