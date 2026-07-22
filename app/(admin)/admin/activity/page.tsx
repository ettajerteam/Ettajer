import { requireAdminPage } from "@/lib/admin/auth";
import { getPlatformActivity } from "@/lib/admin/platform-stats";
import { AdminLayout } from "@/components/admin/admin-layout";
import {
  AdminEmptyState,
  AdminPageHeader,
  AdminTableShell,
  adminPage,
} from "@/components/admin/admin-ui";

export const metadata = { title: "Activity — Platform Admin" };

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export default async function AdminActivityPage() {
  await requireAdminPage();
  const activity = await getPlatformActivity();

  return (
    <AdminLayout>
      <div className={adminPage}>
        <AdminPageHeader
          title="Admin activity"
          description="Audit trail of platform admin actions."
        />

        {activity.length === 0 ? (
          <AdminEmptyState message="No admin actions logged yet." />
        ) : (
          <AdminTableShell>
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="border-b bg-neutral-50/80 text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-4 py-3 font-medium">When</th>
                  <th className="px-4 py-3 font-medium">Actor</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Target</th>
                </tr>
              </thead>
              <tbody>
                {activity.map((row) => (
                  <tr key={row.id} className="border-b last:border-0 align-top">
                    <td className="px-4 py-3 text-xs text-neutral-500">
                      {formatDate(row.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-xs">{row.actorEmail}</td>
                    <td className="px-4 py-3 font-medium">{row.action}</td>
                    <td className="px-4 py-3 text-xs text-neutral-500">
                      {row.targetType ?? "—"}
                      {row.targetId ? ` · ${row.targetId.slice(0, 8)}…` : ""}
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
