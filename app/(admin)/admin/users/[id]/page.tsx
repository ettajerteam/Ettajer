import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { requireAdminPage } from "@/lib/admin/auth";
import { getPlatformUserDetail } from "@/lib/admin/platform-stats";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminUserActions } from "@/components/admin/admin-user-actions";
import {
  AdminPageHeader,
  AdminStatCard,
  AdminTableShell,
  adminPage,
} from "@/components/admin/admin-ui";
import { formatFounderNumber } from "@/lib/founder/constants";
import { cn } from "@/lib/utils";
import {
  dashboardCard,
  dashboardCardPad,
  dashboardKicker,
  dashboardSubtitle,
} from "@/lib/dashboard-ui";

export const metadata = { title: "User details — Platform Admin" };

function formatDate(value: Date | string | null | undefined, withTime = false) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(withTime
      ? { hour: "2-digit", minute: "2-digit" }
      : {}),
  }).format(new Date(value));
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="grid gap-0.5 border-b border-neutral-100 py-2.5 last:border-0 dark:border-white/5 sm:grid-cols-[140px_1fr] sm:gap-4">
      <dt className={dashboardKicker}>{label}</dt>
      <dd
        className={cn(
          "text-sm text-neutral-900 dark:text-white",
          mono && "font-mono text-xs break-all"
        )}
      >
        {value ?? "—"}
      </dd>
    </div>
  );
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdminPage();
  const user = await getPlatformUserDetail(params.id);
  if (!user) notFound();

  const initials = (user.name || user.email)
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <AdminLayout>
      <div className={adminPage}>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[11px] font-medium text-neutral-500 transition-colors hover:bg-black/[0.04] hover:text-neutral-800 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All users
          </Link>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#007AFF] text-[13px] font-semibold tracking-[-0.01em] text-white">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <AdminPageHeader
              title={user.name?.trim() || "Unnamed user"}
              description={user.email}
            />
          </div>
          <AdminUserActions
            userId={user.id}
            status={user.status}
            role={user.role}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard
            label="Status"
            value={user.status}
            accent={user.status === "active" ? "emerald" : "amber"}
            hint={user.role}
          />
          <AdminStatCard
            label="Founder"
            value={
              user.founderNumber != null
                ? formatFounderNumber(user.founderNumber)
                : "—"
            }
          />
          <AdminStatCard
            label="Stores"
            value={user.stats.storeCount}
            hint={`${user.stats.productCount} products`}
          />
          <AdminStatCard
            label="Orders"
            value={user.stats.orderCount}
            hint={`${user.stats.orderRevenue.toLocaleString()} MAD real · ${user.stats.testOrderCount} test`}
            accent="emerald"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className={cn(dashboardCard, dashboardCardPad)}>
            <h2 className="mb-2 text-[13px] font-semibold tracking-[-0.01em]">Account</h2>
            <dl>
              <DetailRow label="User ID" value={user.id} mono />
              <DetailRow label="Name" value={user.name || "—"} />
              <DetailRow label="Email" value={user.email} />
              <DetailRow
                label="Email verified"
                value={
                  user.emailVerified
                    ? formatDate(user.emailVerified, true)
                    : "Not verified"
                }
              />
              <DetailRow
                label="Password"
                value={user.hasPassword ? "Set" : "None (OAuth / magic)"}
              />
              <DetailRow
                label="Password changed"
                value={formatDate(user.passwordChangedAt, true)}
              />
              <DetailRow
                label="Marketing emails"
                value={user.marketingEmails ? "Opted in" : "Opted out"}
              />
              <DetailRow
                label="Terms accepted"
                value={formatDate(user.termsAcceptedAt, true)}
              />
              <DetailRow label="Joined" value={formatDate(user.createdAt, true)} />
              <DetailRow
                label="Updated"
                value={formatDate(user.updatedAt, true)}
              />
            </dl>
          </section>

          <section className={cn(dashboardCard, dashboardCardPad)}>
            <h2 className="mb-2 text-[13px] font-semibold tracking-[-0.01em]">Security & access</h2>
            <dl>
              <DetailRow
                label="Last login"
                value={formatDate(user.lastLoginAt, true)}
              />
              <DetailRow
                label="Last login IP"
                value={user.lastLoginIp || "—"}
                mono
              />
              <DetailRow
                label="Failed logins"
                value={String(user.failedLoginAttempts)}
              />
              <DetailRow
                label="Locked until"
                value={formatDate(user.lockedUntil, true)}
              />
              <DetailRow
                label="Linked accounts"
                value={
                  user.accounts.length
                    ? user.accounts
                        .map((a) => `${a.provider} (${a.type})`)
                        .join(", ")
                    : "None"
                }
              />
              <DetailRow
                label="Active sessions"
                value={`${user.stats.sessionCount} total · showing ${user.sessions.length}`}
              />
            </dl>

            {user.sessions.length > 0 ? (
              <div className="mt-3 space-y-1.5 border-t border-neutral-100 pt-3 dark:border-white/5">
                <p className={dashboardKicker}>Recent sessions</p>
                {user.sessions.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between gap-2 text-xs text-neutral-600 dark:text-neutral-400"
                  >
                    <span className="font-mono">{s.tokenHint}</span>
                    <span>expires {formatDate(s.expires, true)}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        </div>

        <section>
          <h2 className="mb-2 text-[13px] font-semibold tracking-[-0.01em]">Stores</h2>
          {user.stores.length === 0 ? (
            <div className={cn(dashboardCard, dashboardCardPad)}>
              <p className={dashboardSubtitle}>No stores yet</p>
            </div>
          ) : (
            <AdminTableShell>
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-black/[0.06] bg-[#F5F5F7]/80 text-[10px] uppercase tracking-[0.06em] text-neutral-400 dark:border-white/10 dark:bg-white/[0.03]">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Store</th>
                    <th className="px-4 py-2.5 font-medium">Model</th>
                    <th className="px-4 py-2.5 font-medium">Domain</th>
                    <th className="px-4 py-2.5 font-medium">Products</th>
                    <th className="px-4 py-2.5 font-medium">Orders</th>
                    <th className="px-4 py-2.5 font-medium">Created</th>
                    <th className="px-4 py-2.5 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {user.stores.map((store) => (
                    <tr key={store.id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-medium">{store.name}</p>
                        <p className="text-xs text-neutral-500">/{store.slug}</p>
                        {store.phone || store.contactEmail ? (
                          <p className="mt-0.5 text-[11px] text-neutral-400">
                            {[store.phone, store.contactEmail]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-xs capitalize">
                        {store.businessModel
                          ? store.businessModel.split(",").join(" · ")
                          : "—"}
                        {store.category ? (
                          <span className="block text-neutral-400">
                            {store.category}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {store.settings?.customDomain || "Ettajer subdomain"}
                      </td>
                      <td className="px-4 py-3">{store._count.products}</td>
                      <td className="px-4 py-3">{store._count.orders}</td>
                      <td className="px-4 py-3 text-xs">
                        {formatDate(store.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <Link
                            href={`/admin/stores/${store.id}`}
                            className="text-xs font-medium text-[#007AFF] hover:underline"
                          >
                            Admin view
                          </Link>
                          <Link
                            href={`/store/${store.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:underline"
                          >
                            Storefront
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminTableShell>
          )}
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <section>
            <h2 className="mb-2 text-[13px] font-semibold tracking-[-0.01em]">
              Login activity{" "}
              <span className="font-normal text-neutral-400">
                ({user.loginAttempts.length} recent)
              </span>
            </h2>
            <AdminTableShell>
              {user.loginAttempts.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-neutral-500">
                  No login attempts recorded
                </p>
              ) : (
                <div className="max-h-[360px] overflow-y-auto divide-y divide-neutral-100 dark:divide-white/5">
                  {user.loginAttempts.map((attempt) => (
                    <div key={attempt.id} className="px-4 py-2.5 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "font-medium",
                            attempt.success
                              ? "text-emerald-600"
                              : "text-rose-600"
                          )}
                        >
                          {attempt.success ? "Success" : "Failed"} · {attempt.action}
                        </span>
                        <span className="text-neutral-400">
                          {formatDate(attempt.createdAt, true)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-neutral-500">
                        {[attempt.ipAddress, attempt.reason]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </p>
                      {attempt.userAgent ? (
                        <p className="mt-0.5 truncate text-[10px] text-neutral-400" title={attempt.userAgent}>
                          {attempt.userAgent}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </AdminTableShell>
          </section>

          <section>
            <h2 className="mb-2 text-[13px] font-semibold tracking-[-0.01em]">
              Support messages{" "}
              <span className="font-normal text-neutral-400">
                ({user.supportMessages.length})
              </span>
            </h2>
            <AdminTableShell>
              {user.supportMessages.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-neutral-500">
                  No support emails from this address
                </p>
              ) : (
                <div className="max-h-[360px] overflow-y-auto divide-y divide-neutral-100 dark:divide-white/5">
                  {user.supportMessages.map((msg) => (
                    <div key={msg.id} className="px-4 py-2.5 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-neutral-900 dark:text-white">
                          {msg.direction === "outbound" ? "→ You" : "← Them"} ·{" "}
                          {msg.topic}
                        </span>
                        <span className="shrink-0 text-neutral-400">
                          {formatDate(msg.createdAt, true)}
                        </span>
                      </div>
                      <p className="mt-0.5 line-clamp-3 text-neutral-500">
                        {msg.message}
                      </p>
                      <p className="mt-0.5 text-[10px] uppercase tracking-wide text-neutral-400">
                        {msg.status}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </AdminTableShell>
            {user.supportMessages.length > 0 ? (
              <p className="mt-2 text-right">
                <Link
                  href="/admin/messages"
                  className="text-xs font-medium text-[#007AFF] hover:underline"
                >
                  Open support inbox →
                </Link>
              </p>
            ) : null}
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}
