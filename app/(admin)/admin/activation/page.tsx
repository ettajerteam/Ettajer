import Link from "next/link";
import { requireAdminPage } from "@/lib/admin/auth";
import {
  getActivationGap,
  type ActivationStoreRow,
} from "@/lib/admin/activation-stats";
import { AdminLayout } from "@/components/admin/admin-layout";
import {
  AdminPageHeader,
  AdminSectionTitle,
  AdminStatCard,
  AdminTableShell,
  AdminEmptyState,
  adminPage,
  adminTd,
  adminTh,
  adminThead,
  adminTr,
  adminLink,
} from "@/components/admin/admin-ui";
import { cn } from "@/lib/utils";
import { homeSubtitle } from "@/components/dashboard/home/home-ui";
import { AdminActivationNudgeButtons } from "@/components/admin/admin-activation-nudge-buttons";

export const metadata = { title: "Activation — Platform Admin" };

function fmtDate(d: Date | null) {
  if (!d) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StoreTable({
  rows,
  empty,
  showProducts,
}: {
  rows: ActivationStoreRow[];
  empty: string;
  showProducts?: boolean;
}) {
  if (rows.length === 0) return <AdminEmptyState message={empty} />;

  return (
    <AdminTableShell>
      <table className="w-full min-w-[720px] text-left text-[13px]">
        <thead className={adminThead}>
          <tr>
            <th className={adminTh}>Store</th>
            <th className={adminTh}>Owner</th>
            <th className={adminTh}>Age</th>
            <th className={adminTh}>Last login</th>
            {showProducts ? <th className={adminTh}>Active</th> : null}
            <th className={adminTh}>Signals</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.storeId} className={adminTr}>
              <td className={adminTd}>
                <Link href={`/admin/stores/${r.storeId}`} className={adminLink}>
                  {r.storeName}
                </Link>
                <p className={cn("mt-0.5", homeSubtitle)}>/{r.slug}</p>
              </td>
              <td className={adminTd}>
                <Link href={`/admin/users/${r.ownerId}`} className={adminLink}>
                  {r.ownerName || r.ownerEmail}
                </Link>
                <p className={cn("mt-0.5", homeSubtitle)}>{r.ownerEmail}</p>
              </td>
              <td className={adminTd}>
                {r.ageDays}d
                <p className={cn("mt-0.5", homeSubtitle)}>
                  {fmtDate(r.createdAt)}
                </p>
              </td>
              <td className={adminTd}>{fmtDate(r.lastLoginAt)}</td>
              {showProducts ? (
                <td className={adminTd}>
                  {r.activeProducts}
                  {r.draftProducts > 0 ? (
                    <span className={cn("ml-1", homeSubtitle)}>
                      (+{r.draftProducts} draft)
                    </span>
                  ) : null}
                </td>
              ) : null}
              <td className={adminTd}>
                <div className="flex flex-wrap gap-1">
                  {r.founderNumber != null ? (
                    <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
                      #{r.founderNumber}
                    </span>
                  ) : null}
                  {r.marketingEmails ? (
                    <span className="rounded bg-sky-50 px-1.5 py-0.5 text-[10px] font-medium text-sky-800 dark:bg-sky-500/10 dark:text-sky-300">
                      opt-in
                    </span>
                  ) : null}
                  {!r.emailVerified ? (
                    <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-medium text-rose-800 dark:bg-rose-500/10 dark:text-rose-300">
                      unverified
                    </span>
                  ) : null}
                  {r.category ? (
                    <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600 dark:bg-white/10 dark:text-neutral-300">
                      {r.category}
                    </span>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminTableShell>
  );
}

export default async function AdminActivationPage() {
  await requireAdminPage();
  const data = await getActivationGap();
  const { funnel } = data;
  const listedPct =
    funnel.totalStores > 0
      ? Math.round(
          ((funnel.activeNoOrders + funnel.hasOrders) / funnel.totalStores) *
            100,
        )
      : 0;
  const soldPct =
    funnel.totalStores > 0
      ? Math.round((funnel.hasOrders / funnel.totalStores) * 100)
      : 0;

  return (
    <AdminLayout>
      <div className={adminPage}>
        <AdminPageHeader
          title="Activation"
          description="Merchants who created a store but never listed or sold — prioritize hot empties, then catalogs with zero orders."
        />
        <AdminActivationNudgeButtons />

        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-5">
          <AdminStatCard label="Stores" value={funnel.totalStores} />
          <AdminStatCard
            label="No products"
            value={funnel.noProducts}
            accent="amber"
            hint={`${data.hotEmptyCount} hot (≤7d login/store)`}
          />
          <AdminStatCard
            label="Draft only"
            value={funnel.draftOnly}
            hint="Created but not published"
          />
          <AdminStatCard
            label="Listed, 0 orders"
            value={funnel.activeNoOrders}
            accent="violet"
            hint={`${listedPct}% of stores have products`}
          />
          <AdminStatCard
            label="Has orders"
            value={funnel.hasOrders}
            accent="emerald"
            hint={`${soldPct}% of stores sold`}
          />
        </div>

        <div>
          <AdminSectionTitle
            title={`Hot empties (${data.hotEmpty.length})`}
            action={
              <span className={homeSubtitle}>
                Recent login or store ≤7d · nudge:{" "}
                <code className="text-[11px]">
                  npx tsx scripts/send-first-product-nudge.ts --send
                </code>
              </span>
            }
          />
          <p className={cn("mb-2", homeSubtitle)}>
            Highest-intent: {data.loggedInEmpty7d} logged in this week with zero
            products.
          </p>
          <StoreTable
            rows={data.hotEmpty}
            empty="No hot empty stores right now."
          />
        </div>

        <div>
          <AdminSectionTitle title="Newest empty stores" />
          <StoreTable
            rows={data.emptyRecent}
            empty="No empty stores."
          />
        </div>

        {data.draftOnly.length > 0 ? (
          <div>
            <AdminSectionTitle title="Draft products (not published)" />
            <StoreTable
              rows={data.draftOnly}
              empty=""
              showProducts
            />
          </div>
        ) : null}

        <div>
          <AdminSectionTitle
            title="Listed · zero real orders"
            action={
              <span className={homeSubtitle}>
                nudge:{" "}
                <code className="text-[11px]">
                  npx tsx scripts/send-share-store-nudge.ts --send
                </code>
              </span>
            }
          />
          <p className={cn("mb-2", homeSubtitle)}>
            Catalog ready — traffic / share gap, not “add product.”
          </p>
          <StoreTable
            rows={data.activeNoOrders}
            empty="Every listed store has at least one real order."
            showProducts
          />
        </div>
      </div>
    </AdminLayout>
  );
}
