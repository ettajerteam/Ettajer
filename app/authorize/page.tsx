import { redirect } from "next/navigation";

/**
 * Compatibility alias: some MCP clients (e.g. Claude) default to /authorize
 * when AS metadata is unavailable. Canonical path remains /oauth/authorize.
 */
export default function AuthorizeAliasPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      for (const v of value) qs.append(key, v);
    } else {
      qs.set(key, value);
    }
  }
  const suffix = qs.toString();
  redirect(suffix ? `/oauth/authorize?${suffix}` : "/oauth/authorize");
}
