import Link from "next/link";
import { requireAdminPage } from "@/lib/admin/auth";
import { getPlatformOverview } from "@/lib/admin/platform-stats";
import { AdminLayout } from "@/components/admin/admin-layout";
import {
  AdminPageHeader,
  AdminStatCard,
  AdminTableShell,
  adminPage,
} from "@/components/admin/admin-ui";

export const metadata = { title: "Platform Admin" };

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export default async function AdminOverviewPage() {
  await requireAdminPage();
  const data = await getPlatformOverview();

  return (
    <AdminLayout>
      <div className={adminPage}>
        <AdminPageHeader
          title="Platform overview"
          description="Users, stores, revenue, and support at a glance."
        />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard label="Total users" value={data.totalUsers} hint={`+${data.newUsers24h} last 24h`} />
          <AdminStatCard
            label="Active / waiting"
            value={`${data.activeUsers} / ${data.waitingUsers}`}
            accent="violet"
          />
          <AdminStatCard label="Stores" value={data.totalStores} hint={`+${data.newStores7d} last 7 days`} />
          <AdminStatCard
            label="GMV (all orders)"
            value={`${data.totalRevenue.toLocaleString()} MAD`}
            accent="emerald"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard label="Orders" value={data.totalOrders} />
          <Link href="/admin/messages">
            <AdminStatCard
              label="New messages"
              value={data.newMessages}
              hint="Support inbox"
              accent={data.newMessages > 0 ? "amber" : "default"}
            />
          </Link>
          <Link href="/admin/errors">
            <AdminStatCard
              label="Failed logins (24h)"
              value={data.failedLogins24h}
              accent={data.failedLogins24h > 0 ? "rose" : "default"}
            />
          </Link>
          <Link href="/admin/activity">
            <AdminStatCard label="Admin activity" value="View log" hint="Audit trail" accent="violet" />
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <h2 className="mb-2 text-sm font-semibold">Recent signups</h2>
            <AdminTableShell>
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="border-b bg-neutral-50/80 text-xs uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Stores</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentUsers.map((user) => (
                    <tr key={user.id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-medium">{user.name ?? "—"}</p>
                        <p className="text-xs text-neutral-500">{user.email}</p>
                      </td>
                      <td className="px-4 py-3 text-xs">{user.status}</td>
                      <td className="px-4 py-3">{user._count.stores}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminTableShell>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">Recent support chat</h2>
              <Link
                href="/admin/messages"
                className="text-xs font-medium text-violet-600 hover:underline"
              >
                Open inbox →
              </Link>
            </div>
            <AdminTableShell>
              <div className="divide-y divide-neutral-100 dark:divide-white/5">
                {data.recentMessages.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-neutral-500">
                    No support emails yet
                  </p>
                ) : (
                  data.recentMessages.map((msg) => (
                    <Link
                      key={msg.id}
                      href="/admin/messages"
                      className="flex items-start gap-3 px-4 py-3 transition hover:bg-neutral-50 dark:hover:bg-white/[0.03]"
                    >
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-semibold uppercase text-white dark:bg-white dark:text-neutral-900">
                        {(msg.name || msg.email).slice(0, 2)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium">{msg.name}</p>
                          <span className="shrink-0 text-[10px] text-neutral-400">
                            {formatDate(msg.createdAt)}
                          </span>
                        </div>
                        <p className="truncate text-[11px] text-neutral-500">{msg.topic}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                          {msg.message}
                        </p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </AdminTableShell>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
