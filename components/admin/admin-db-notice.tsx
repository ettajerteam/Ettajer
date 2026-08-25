import { getAdminDbSource } from "@/lib/admin/db-source";

export function AdminDbNotice() {
  const source = getAdminDbSource();
  if (source.kind !== "local") return null;

  return (
    <div
      role="status"
      className="border-b border-amber-200/80 bg-amber-50 px-4 py-2.5 text-[12px] leading-relaxed text-amber-950 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100"
    >
      <strong className="font-semibold">Local database.</strong> Admin stats
      reflect your dev Postgres, not live merchants on ettajer.com. To use
      production data locally, run{" "}
      <code className="rounded bg-amber-100/80 px-1 py-0.5 font-mono text-[11px] dark:bg-amber-500/20">
        npm run vercel:env:pull
      </code>{" "}
      (after{" "}
      <code className="rounded bg-amber-100/80 px-1 py-0.5 font-mono text-[11px] dark:bg-amber-500/20">
        vercel login
      </code>
      ), then restart the dev server.
    </div>
  );
}
