import Link from "next/link";
import { requireAdminPage } from "@/lib/admin/auth";
import { getPlatformDomains } from "@/lib/admin/platform-stats";
import { AdminLayout } from "@/components/admin/admin-layout";
import {
  AdminEmptyState,
  AdminPageHeader,
  AdminStatCard,
  AdminTableShell,
  adminLink,
  adminPage,
  adminTd,
  adminTh,
  adminThead,
  adminTr,
} from "@/components/admin/admin-ui";
import { cn } from "@/lib/utils";
import { homeSubtitle } from "@/components/dashboard/home/home-ui";

export const metadata = { title: "Domains — Ettajer Console" };

function Status({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[12px] font-medium",
        ok
          ? "text-emerald-700 dark:text-emerald-400"
          : "text-rose-700 dark:text-rose-400"
      )}
    >
      {ok ? "✓" : "✕"} {label}
    </span>
  );
}

export default async function AdminDomainsPage() {
  await requireAdminPage();
  const data = await getPlatformDomains();

  return (
    <AdminLayout>
      <div className={adminPage}>
        <AdminPageHeader
          title="Domain health"
          description="DNS verified live against Ettajer targets. SSL and HTTP reachability are not claimed unless separately checked."
        />

        <div className="grid gap-2.5 sm:grid-cols-3">
          <AdminStatCard label="Connected" value={data.total} />
          <AdminStatCard
            label="DNS OK"
            value={data.ok}
            accent="emerald"
          />
          <AdminStatCard
            label="DNS failing"
            value={data.failing}
            accent={data.failing > 0 ? "amber" : "default"}
            hint={data.failing > 0 ? "Diagnose below" : "All clear"}
          />
        </div>

        {data.domains.length === 0 ? (
          <AdminEmptyState message="No custom domains linked yet." />
        ) : (
          <AdminTableShell>
            <table className="w-full min-w-[880px] text-left text-[13px]">
              <thead className={adminThead}>
                <tr>
                  <th className={adminTh}>Domain</th>
                  <th className={adminTh}>Store</th>
                  <th className={adminTh}>DNS</th>
                  <th className={adminTh}>Detail</th>
                  <th className={adminTh}>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.domains.map((row) => (
                  <tr key={`${row.storeId}-${row.domain}`} className={adminTr}>
                    <td className={adminTd}>
                      <p className="font-medium text-neutral-900 dark:text-white">
                        {row.domain}
                      </p>
                      {row.domainPrimary ? (
                        <p className={cn("mt-0.5", homeSubtitle)}>Primary</p>
                      ) : null}
                    </td>
                    <td className={adminTd}>
                      <Link
                        href={`/admin/stores/${row.storeId}`}
                        className={adminLink}
                      >
                        {row.storeName}
                      </Link>
                      <p className={cn("mt-0.5", homeSubtitle)}>
                        {row.ownerName || row.ownerEmail}
                      </p>
                    </td>
                    <td className={adminTd}>
                      <Status
                        ok={row.dnsOk}
                        label={row.dnsOk ? "Correct" : "Failing"}
                      />
                    </td>
                    <td className={cn(adminTd, "max-w-[280px]")}>
                      <p className="text-[12px] text-neutral-500">{row.dnsDetail}</p>
                    </td>
                    <td className={adminTd}>
                      {row.dnsOk ? (
                        <Link
                          href={`/admin/stores/${row.storeId}`}
                          className={adminLink}
                        >
                          Open store
                        </Link>
                      ) : (
                        <Link
                          href={`/admin/users/${row.ownerId}`}
                          className={adminLink}
                        >
                          Contact merchant
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableShell>
        )}
      </div>
    </AdminLayout>
  );
}
