import Link from "next/link";
import { requireAdminPage } from "@/lib/admin/auth";
import {
  getActivationGap,
  type ActivationStoreRow,
} from "@/lib/admin/activation-stats";
import {
  activationTemperature,
  healthFromActivationRow,
  temperatureLabel,
  type ActivationTemperature,
} from "@/lib/admin/merchant-health";
import { AdminLayout } from "@/components/admin/admin-layout";
import {
  AdminPageHeader,
  AdminSectionTitle,
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

export const metadata = { title: "Activation — Ettajer Console" };

type Stage = "all" | "empty" | "draft" | "listed" | "activated" | "hot";

function parseStage(raw: string | string[] | undefined): Stage {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === "empty" || v === "draft" || v === "listed" || v === "activated" || v === "hot" || v === "all") {
    return v;
  }
  return "all";
}

function parseTemp(
  raw: string | string[] | undefined
): ActivationTemperature | "all" {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === "hot" || v === "warm" || v === "cold") return v;
  return "all";
}

function fmtDate(d: Date | null) {
  if (!d) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function TempBadge({ temp }: { temp: ActivationTemperature }) {
  const styles =
    temp === "hot"
      ? "bg-rose-50 text-rose-800 dark:bg-rose-500/10 dark:text-rose-300"
      : temp === "warm"
        ? "bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300"
        : "bg-neutral-100 text-neutral-600 dark:bg-white/10 dark:text-neutral-300";
  return (
    <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", styles)}>
      {temp === "hot" ? "🔥 Hot" : temp === "warm" ? "🟡 Warm" : "⚪ Cold"}
    </span>
  );
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
      <table className="w-full min-w-[880px] text-left text-[13px]">
        <thead className={adminThead}>
          <tr>
            <th className={adminTh}>Store</th>
            <th className={adminTh}>Merchant</th>
            <th className={adminTh}>Created</th>
            <th className={adminTh}>Last login</th>
            {showProducts ? <th className={adminTh}>Products</th> : null}
            <th className={adminTh}>Temp</th>
            <th className={adminTh}>Health</th>
            <th className={adminTh}>Priority</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const health = healthFromActivationRow(r);
            const temp = activationTemperature(r.lastLoginAt, r.createdAt);
            const priority =
              temp === "hot" && r.realOrders === 0
                ? "Help today"
                : temp === "warm"
                  ? "This week"
                  : "Backlog";
            return (
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
                    {r.activeProducts} live
                    {r.draftProducts > 0 ? (
                      <span className={cn("ml-1", homeSubtitle)}>
                        +{r.draftProducts} draft
                      </span>
                    ) : null}
                  </td>
                ) : null}
                <td className={adminTd}>
                  <TempBadge temp={temp} />
                </td>
                <td className={adminTd}>
                  <span className="font-medium tabular-nums">{health.score}</span>
                  <p className={cn("mt-0.5", homeSubtitle)}>{health.bandLabel}</p>
                </td>
                <td className={adminTd}>
                  <span className="text-[12px] font-medium">{priority}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </AdminTableShell>
  );
}

function StageLink({
  href,
  label,
  count,
  hint,
  active,
}: {
  href: string;
  label: string;
  count: number;
  hint: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-[12px] border px-3 py-3 transition-colors",
        active
          ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
          : "border-black/[0.06] bg-white hover:bg-[#FAFAFA] dark:border-white/10 dark:bg-[#121212] dark:hover:bg-white/[0.03]"
      )}
    >
      <p
        className={cn(
          "text-[10px] font-medium uppercase tracking-[0.08em]",
          active ? "text-white/70 dark:text-neutral-500" : "text-neutral-400"
        )}
      >
        {label}
      </p>
      <p className="mt-1 text-[20px] font-semibold tabular-nums tracking-tight">
        {count.toLocaleString()}
      </p>
      <p
        className={cn(
          "mt-1 text-[11px]",
          active ? "text-white/70 dark:text-neutral-500" : "text-neutral-400"
        )}
      >
        {hint}
      </p>
    </Link>
  );
}

export default async function AdminActivationPage({
  searchParams,
}: {
  searchParams?: { stage?: string | string[]; temp?: string | string[] };
}) {
  await requireAdminPage();
  const data = await getActivationGap();
  const stage = parseStage(searchParams?.stage);
  const tempFilter = parseTemp(searchParams?.temp);
  const { funnel } = data;

  const filterTemp = (rows: ActivationStoreRow[]) => {
    if (tempFilter === "all") return rows;
    return rows.filter(
      (r) => activationTemperature(r.lastLoginAt, r.createdAt) === tempFilter
    );
  };

  const stageRows: {
    title: string;
    description: string;
    rows: ActivationStoreRow[];
    showProducts?: boolean;
    empty: string;
  } =
    stage === "empty" || stage === "hot"
      ? {
          title:
            stage === "hot" || tempFilter === "hot"
              ? "Hot empty stores"
              : "Empty stores",
          description:
            "No products yet. Prioritize Hot merchants who logged in recently.",
          rows: filterTemp(stage === "hot" ? data.hotEmpty : data.emptyAll),
          empty: "No stores in this stage.",
        }
      : stage === "draft"
        ? {
            title: "Draft — products exist, nothing live",
            description: "Help publish at least one active product.",
            rows: filterTemp(data.draftOnly),
            showProducts: true,
            empty: "No draft-only stores.",
          }
        : stage === "listed"
          ? {
              title: "Listed — no sales",
              description:
                "Live products with zero real orders. First-sale intelligence targets.",
              rows: filterTemp(data.activeNoOrders),
              showProducts: true,
              empty: "Every listed store has at least one real order.",
            }
          : stage === "activated"
            ? {
                title: "Activated",
                description:
                  "Stores with ≥1 real sale. Full list lives on Stores / Payments.",
                rows: [],
                empty:
                  "Activated store roster is on Stores — funnel count is live above.",
              }
            : {
                title: "Who should we help today?",
                description:
                  "Start with Hot empties, then draft publishers, then first-sale targets.",
                rows: filterTemp([
                  ...data.hotEmpty,
                  ...data.draftOnly.slice(0, 10),
                  ...data.activeNoOrders.slice(0, 15),
                ]),
                showProducts: true,
                empty: "Funnel is clear.",
              };

  // Deduplicate all-board merge
  const seen = new Set<string>();
  const uniqueRows = stageRows.rows.filter((r) => {
    if (seen.has(r.storeId)) return false;
    seen.add(r.storeId);
    return true;
  });

  return (
    <AdminLayout>
      <div className={adminPage}>
        <AdminPageHeader
          title="Activation"
          description="Identify exactly which merchants the Ettajer team should help today. Derived from live store, product, login, and order data."
        />
        <AdminActivationNudgeButtons />

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          <StageLink
            href="/admin/activation?stage=all"
            label="All stores"
            count={funnel.totalStores}
            hint="Total"
            active={stage === "all"}
          />
          <StageLink
            href="/admin/activation?stage=empty"
            label="Empty"
            count={funnel.noProducts}
            hint="No products"
            active={stage === "empty" || stage === "hot"}
          />
          <StageLink
            href="/admin/activation?stage=draft"
            label="Draft"
            count={funnel.draftOnly}
            hint="Not published"
            active={stage === "draft"}
          />
          <StageLink
            href="/admin/activation?stage=listed"
            label="Listed · 0 sales"
            count={funnel.activeNoOrders}
            hint="First sale"
            active={stage === "listed"}
          />
          <StageLink
            href="/admin/activation?stage=activated"
            label="Activated"
            count={funnel.hasOrders}
            hint="≥1 real sale"
            active={stage === "activated"}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "All temps"],
              ["hot", "🔥 Hot"],
              ["warm", "🟡 Warm"],
              ["cold", "⚪ Cold"],
            ] as const
          ).map(([id, label]) => (
            <Link
              key={id}
              href={`/admin/activation?stage=${stage === "hot" ? "empty" : stage}&temp=${id}`}
              className={cn(
                "rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors",
                tempFilter === id
                  ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                  : "border-black/[0.06] text-neutral-600 hover:bg-black/[0.02] dark:border-white/10 dark:text-neutral-300"
              )}
            >
              {label}
            </Link>
          ))}
          <span className={cn("self-center", homeSubtitle)}>
            {data.loggedInEmpty7d} empty · logged in · 7d ·{" "}
            {temperatureLabel("hot")} targets first
          </span>
        </div>

        {stage === "listed" ? (
          <div className="rounded-[12px] border border-black/[0.06] bg-white px-3 py-3 dark:border-white/10 dark:bg-[#121212]">
            <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
              First-sale intelligence
            </p>
            <p className={cn("mt-1", homeSubtitle)}>
              These merchants have live products and zero real orders. Scores and
              temperatures are derived from login recency, catalog size, and store
              age — not an LLM.
            </p>
          </div>
        ) : null}

        <div>
          <AdminSectionTitle title={`${stageRows.title} (${uniqueRows.length})`} />
          <p className={cn("mb-2", homeSubtitle)}>{stageRows.description}</p>
          <StoreTable
            rows={uniqueRows}
            empty={stageRows.empty}
            showProducts={stageRows.showProducts}
          />
        </div>

        {stage === "all" ? (
          <>
            <div>
              <AdminSectionTitle title={`Hot empties (${data.hotEmpty.length})`} />
              <StoreTable
                rows={data.hotEmpty}
                empty="No hot empty stores right now."
              />
            </div>
            <div>
              <AdminSectionTitle title="Listed · zero real orders" />
              <StoreTable
                rows={data.activeNoOrders.slice(0, 40)}
                empty="Every listed store has at least one real order."
                showProducts
              />
            </div>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}
