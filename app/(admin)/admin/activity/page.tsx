import { requireAdminPage } from "@/lib/admin/auth";
import { getPlatformActivity } from "@/lib/admin/platform-stats";
import { AdminLayout } from "@/components/admin/admin-layout";
import {
  AdminEmptyState,
  AdminPageHeader,
  AdminTableShell,
  adminPage,
  adminTd,
  adminTh,
  adminThead,
  adminTr,
} from "@/components/admin/admin-ui";
import { cn } from "@/lib/utils";

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
            <table className="w-full min-w-[880px] text-left text-[12px]">
              <thead className={adminThead}>
                <tr>
                  <th className={adminTh}>When</th>
                  <th className={adminTh}>Actor</th>
                  <th className={adminTh}>Action</th>
                  <th className={adminTh}>Target</th>
                </tr>
              </thead>
              <tbody>
                {activity.map((row) => (
                  <tr key={row.id} className={cn(adminTr, "align-top")}>
                    <td className={cn(adminTd, "text-[11px] text-neutral-400")}>
                      {formatDate(row.createdAt)}
                    </td>
                    <td className={cn(adminTd, "text-[11px]")}>{row.actorEmail}</td>
                    <td className={cn(adminTd, "font-medium text-neutral-900 dark:text-white")}>
                      {row.action}
                    </td>
                    <td className={cn(adminTd, "text-[11px] text-neutral-400")}>
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
