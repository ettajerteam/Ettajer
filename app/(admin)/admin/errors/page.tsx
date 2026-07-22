import { requireAdminPage } from "@/lib/admin/auth";
import { getPlatformErrors } from "@/lib/admin/platform-stats";
import { AdminLayout } from "@/components/admin/admin-layout";
import {
  AdminEmptyState,
  AdminPageHeader,
  AdminTableShell,
  adminPage,
} from "@/components/admin/admin-ui";

export const metadata = { title: "Errors — Platform Admin" };

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export default async function AdminErrorsPage() {
  await requireAdminPage();
  const { loginErrors, appErrors } = await getPlatformErrors();

  return (
    <AdminLayout>
      <div className={adminPage}>
        <AdminPageHeader
          title="Errors & security"
          description="Failed logins and application errors across the platform."
        />

        <div className="space-y-6">
          <section>
            <h2 className="mb-2 text-sm font-semibold">Application errors</h2>
            {appErrors.length === 0 ? (
              <AdminEmptyState message="No application errors recorded." />
            ) : (
              <div className="space-y-2">
                {appErrors.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-xl border border-rose-200/80 bg-rose-50/50 p-4 dark:border-rose-500/20 dark:bg-rose-500/5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-rose-800 dark:text-rose-200">
                        {row.source}
                      </p>
                      <p className="text-xs text-neutral-500">{formatDate(row.createdAt)}</p>
                    </div>
                    <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
                      {row.message}
                    </p>
                    {row.path ? (
                      <p className="mt-1 text-xs text-neutral-500">{row.path}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-2 text-sm font-semibold">Failed login attempts</h2>
            {loginErrors.length === 0 ? (
              <AdminEmptyState message="No failed login attempts recorded." />
            ) : (
              <AdminTableShell>
                <table className="w-full min-w-[920px] text-left text-sm">
                  <thead className="border-b bg-neutral-50/80 text-xs uppercase tracking-wide text-neutral-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Reason</th>
                      <th className="px-4 py-3 font-medium">IP</th>
                      <th className="px-4 py-3 font-medium">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loginErrors.map((row) => (
                      <tr key={row.id} className="border-b last:border-0">
                        <td className="px-4 py-3">
                          <p>{row.email}</p>
                          {row.user?.name ? (
                            <p className="text-xs text-neutral-500">{row.user.name}</p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-xs text-rose-700">
                          {row.reason ?? row.action}
                        </td>
                        <td className="px-4 py-3 text-xs">{row.ipAddress ?? "—"}</td>
                        <td className="px-4 py-3 text-xs">{formatDate(row.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </AdminTableShell>
            )}
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}
