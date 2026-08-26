import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  CreditCard,
  Globe,
  LayoutDashboard,
  MessageSquare,
  Package,
  Rocket,
  ShoppingBag,
  Store,
  Users,
} from "lucide-react";
import type { PlatformOverviewData } from "@/lib/admin/platform-stats";
import { TimeOfDayGreeting } from "@/hooks/use-time-of-day-greeting";
import { HomeSparkline } from "@/components/dashboard/home/home-sparkline";
import { AdminInsightsPanel } from "@/components/admin/admin-insights-panel";
import { AdminActivationFunnel } from "@/components/admin/admin-activation-funnel";
import { AdminShareBars } from "@/components/admin/admin-share-bars";
import {
  homeCard,
  homeCardPad,
  homeHeading,
  homeIconWrap,
  homeKicker,
  homeLinkQuiet,
  homePage,
  homeStatCell,
  homeSubtitle,
  homeTitle,
} from "@/components/dashboard/home/home-ui";
import { cn } from "@/lib/utils";

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function changeLabel(change: number) {
  if (change === 0) return "flat vs prior 7d";
  if (change > 0) return `+${change}% vs prior 7d`;
  return `${change}% vs prior 7d`;
}

function ChangeHint({ change }: { change: number }) {
  return (
    <span
      className={cn(
        "text-[10px] font-medium",
        change > 0
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-neutral-400"
      )}
    >
      {changeLabel(change)}
    </span>
  );
}

function KpiCard({
  label,
  value,
  hint,
  href,
  icon: Icon,
  change,
  sparkline,
}: {
  label: string;
  value: string;
  hint?: string;
  href: string;
  icon: LucideIcon;
  change?: number;
  sparkline?: number[];
}) {
  return (
    <Link
      href={href}
      className="group block rounded-[12px] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/30"
    >
      <article className={cn(homeCard, homeCardPad, "h-full")}>
        <div className="flex items-start justify-between gap-2">
          <Icon className="h-3.5 w-3.5 text-neutral-400" aria-hidden />
          <div className="flex items-center gap-2">
            {sparkline && sparkline.length > 1 ? (
              <HomeSparkline points={sparkline} className="opacity-80" />
            ) : null}
            <ArrowUpRight className="h-3 w-3 text-neutral-300 opacity-0 transition group-hover:opacity-100" />
          </div>
        </div>
        <p className={cn("mt-3", homeKicker)}>{label}</p>
        <p className="mt-1 text-[18px] font-semibold tracking-[-0.03em] text-neutral-900 dark:text-white">
          {value}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          {typeof change === "number" ? <ChangeHint change={change} /> : null}
          {hint ? <span className={homeSubtitle}>{hint}</span> : null}
        </div>
      </article>
    </Link>
  );
}

const QUICK_ACTIONS = [
  {
    id: "activation",
    href: "/admin/activation",
    label: "Activation",
    description: "Empty stores & first sale",
    icon: Rocket,
  },
  {
    id: "users",
    href: "/admin/users",
    label: "Users",
    description: "Accounts & founders",
    icon: Users,
  },
  {
    id: "stores",
    href: "/admin/stores",
    label: "Stores",
    description: "Browse every storefront",
    icon: Store,
  },
  {
    id: "payments",
    href: "/admin/payments",
    label: "Payments",
    description: "Orders & real GMV",
    icon: CreditCard,
  },
  {
    id: "messages",
    href: "/admin/messages",
    label: "Messages",
    description: "Support inbox",
    icon: MessageSquare,
  },
  {
    id: "analytics",
    href: "/admin/analytics",
    label: "Intelligence",
    description: "Trends & deep reads",
    icon: LayoutDashboard,
  },
] as const;

export function AdminHomeDashboard({
  data,
  userName,
}: {
  data: PlatformOverviewData;
  userName: string;
}) {
  const attention = data.attentionItems ?? [];
  const attentionSentence =
    data.attentionSentence ??
    "Platform pulse — real GMV, merchant growth, support, and storefront health.";

  const briefToneClass =
    data.brief.tone === "positive"
      ? "text-emerald-700 dark:text-emerald-400"
      : data.brief.tone === "attention"
        ? "text-amber-800 dark:text-amber-300"
        : "";

  return (
    <div className={homePage}>
      <section>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className={homeKicker}>Ettajer Console</p>
            <h1 className={cn(homeHeading, "mt-1")}>
              <TimeOfDayGreeting />, {userName}
            </h1>
          </div>
          <p className="hidden text-[11px] text-neutral-400 sm:block">
            ⌘K / Ctrl K · command palette
          </p>
        </div>
        <p className={cn("mt-1.5 max-w-2xl", homeSubtitle, briefToneClass)}>
          {data.brief.subtitle}
        </p>
        <p className="mt-2 max-w-3xl text-[13px] font-medium tracking-tight text-neutral-800 dark:text-neutral-100">
          {attentionSentence}
        </p>
      </section>

      {attention.length > 0 ? (
        <section aria-label="Attention required">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-neutral-400">
              Attention required
            </p>
            <span className={homeSubtitle}>Prioritized by urgency · impact</span>
          </div>
          <ul className="space-y-2">
            {attention.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="group flex gap-3 rounded-[12px] border border-black/[0.06] bg-white px-3 py-2.5 transition-colors hover:border-black/[0.1] hover:bg-[#FAFAFA] dark:border-white/10 dark:bg-[#121212] dark:hover:bg-white/[0.03]"
                >
                  <p className="w-12 shrink-0 text-[18px] font-semibold tabular-nums tracking-tight text-neutral-900 dark:text-white">
                    {item.count}
                  </p>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-neutral-900 dark:text-white">
                      {item.title}
                    </p>
                    <p className={cn("mt-0.5", homeSubtitle)}>{item.reason}</p>
                    <p className="mt-1.5 text-[12px] font-medium text-[#007AFF]">
                      {item.cta} →
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section
        aria-label="Today vs yesterday"
        className="grid grid-cols-3 gap-2"
      >
        {(
          [
            {
              label: "GMV today",
              value: `${Math.round(data.today.revenue).toLocaleString()} MAD`,
              prior: data.yesterday.revenue,
              current: data.today.revenue,
              unit: "MAD",
            },
            {
              label: "Orders today",
              value: data.today.orders.toLocaleString(),
              prior: data.yesterday.orders,
              current: data.today.orders,
              unit: "orders",
            },
            {
              label: "Signups today",
              value: data.today.signups.toLocaleString(),
              prior: data.yesterday.signups,
              current: data.today.signups,
              unit: "accounts",
            },
          ] as const
        ).map((cell) => {
          const delta = cell.current - cell.prior;
          return (
            <div key={cell.label} className={homeStatCell}>
              <p className={homeKicker}>{cell.label}</p>
              <p className="mt-1 text-[15px] font-semibold tracking-tight text-neutral-900 dark:text-white">
                {cell.value}
              </p>
              <p className={cn("mt-0.5", homeSubtitle)}>
                {delta === 0
                  ? `flat vs yesterday`
                  : `${delta > 0 ? "+" : ""}${
                      cell.unit === "MAD"
                        ? Math.round(delta).toLocaleString()
                        : delta.toLocaleString()
                    } vs yesterday`}
              </p>
            </div>
          );
        })}
      </section>

      <section aria-label="Platform KPIs">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-neutral-400">
            Lifetime · sparklines last 14 days
          </p>
          <Link href="/admin/analytics?range=7" className={homeLinkQuiet}>
            7d intelligence →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          <KpiCard
            label="Real GMV"
            value={`${data.totalRevenue.toLocaleString()} MAD`}
            hint={`7d ${data.realRevenue7d.toLocaleString()} MAD`}
            href="/admin/payments"
            icon={CreditCard}
            change={data.changes.revenue7d}
            sparkline={data.sparklines.revenue}
          />
          <KpiCard
            label="Real orders"
            value={data.realOrders.toLocaleString()}
            hint={`${data.testOrders} test · ${data.realOrders7d} in 7d`}
            href="/admin/payments"
            icon={ShoppingBag}
            change={data.changes.orders7d}
            sparkline={data.sparklines.orders}
          />
          <KpiCard
            label="Users"
            value={data.totalUsers.toLocaleString()}
            hint={`${data.activeUsers} active · +${data.newUsers24h} today · +${data.newUsers7d} / 7d`}
            href="/admin/users"
            icon={Users}
            change={data.changes.users7d}
            sparkline={data.sparklines.signups}
          />
          <KpiCard
            label="Live stores"
            value={data.liveStores.toLocaleString()}
            hint={`${data.totalStores} total · +${data.newStores7d} this week`}
            href="/admin/stores"
            icon={Store}
          />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        <div className={homeStatCell}>
          <p className={homeKicker}>Products</p>
          <p className="mt-1 text-[15px] font-semibold tracking-tight text-neutral-900 dark:text-white">
            {data.totalProducts.toLocaleString()}
          </p>
          <p className={cn("mt-0.5", homeSubtitle)}>
            {data.activeProducts} live
          </p>
        </div>
        <div className={homeStatCell}>
          <p className={homeKicker}>Pending COD</p>
          <p className="mt-1 text-[15px] font-semibold tracking-tight text-neutral-900 dark:text-white">
            {data.pendingRealOrders}
          </p>
          <p className={cn("mt-0.5", homeSubtitle)}>
            {data.processingRealOrders} confirmed
          </p>
        </div>
        <div className={homeStatCell}>
          <p className={homeKicker}>Unverified</p>
          <p className="mt-1 text-[15px] font-semibold tracking-tight text-neutral-900 dark:text-white">
            {data.unverifiedEmails}
          </p>
          <p className={cn("mt-0.5", homeSubtitle)}>Emails not confirmed</p>
        </div>
        <Link href="/admin/domains" className={homeStatCell}>
          <p className={homeKicker}>Domains</p>
          <p className="mt-1 text-[15px] font-semibold tracking-tight text-neutral-900 dark:text-white">
            {data.domainsConnectedSuccess}
          </p>
          <p className={cn("mt-0.5", homeSubtitle)}>
            of {data.domainsConnected} linked
          </p>
        </Link>
        <div className={homeStatCell}>
          <p className={homeKicker}>Support</p>
          <p className="mt-1 text-[15px] font-semibold tracking-tight text-neutral-900 dark:text-white">
            {data.newMessages}
          </p>
          <p className={cn("mt-0.5", homeSubtitle)}>Open threads</p>
        </div>
        <div className={homeStatCell}>
          <p className={homeKicker}>Test share</p>
          <p className="mt-1 text-[15px] font-semibold tracking-tight text-neutral-900 dark:text-white">
            {data.testSharePct}%
          </p>
          <p className={cn("mt-0.5", homeSubtitle)}>
            {data.testRevenue.toLocaleString()} test GMV
          </p>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <AdminInsightsPanel insights={data.insights} />
        <AdminActivationFunnel
          funnel={data.funnel}
          hotEmptyCount={data.hotEmptyCount}
          loggedInEmpty7d={data.loggedInEmpty7d}
        />
      </div>

      <div>
        <AdminShareBars
          title="GMV concentration"
          subtitle="Lifetime real revenue share — business concentration signal."
          rows={data.concentration}
          hrefAll="/admin/analytics?range=30"
        />
        {data.concentrationRisk?.message ? (
          <div
            className={cn(
              "mt-2 rounded-lg border px-3 py-2.5",
              data.concentrationRisk.elevated
                ? "border-amber-200/80 bg-amber-50/70 dark:border-amber-500/20 dark:bg-amber-500/10"
                : "border-black/[0.05] bg-[#F5F5F7] dark:border-white/[0.06] dark:bg-white/[0.03]"
            )}
          >
            <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
              {data.concentrationRisk.message}
            </p>
            {data.concentrationRisk.why ? (
              <p className={cn("mt-1", homeSubtitle)}>
                {data.concentrationRisk.why}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <section className={cn(homeCard, homeCardPad)}>
        <h2 className={homeTitle}>Quick actions</h2>
        <p className={homeSubtitle}>Jump into the areas you check most</p>
        <div className="mt-3 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.id}
              href={action.href}
              className="group flex items-start gap-2 rounded-lg border border-black/[0.04] bg-[#F5F5F7]/80 px-2.5 py-2.5 transition-colors duration-200 hover:bg-neutral-100 dark:border-white/[0.06] dark:bg-white/[0.03] dark:hover:bg-white/[0.05]"
            >
              <span className={homeIconWrap}>
                <action.icon className="h-3 w-3" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[12px] font-medium text-neutral-900 dark:text-white">
                  {action.label}
                </span>
                <span className="mt-0.5 block truncate text-[10px] text-neutral-400">
                  {action.description}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <section>
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className={homeTitle}>Recent orders</h2>
            <Link href="/admin/payments" className={homeLinkQuiet}>
              All payments →
            </Link>
          </div>
          <div className={cn(homeCard, "overflow-hidden")}>
            {data.recentOrders.length === 0 ? (
              <p className="px-4 py-8 text-center text-[12px] text-neutral-400">
                No orders yet
              </p>
            ) : (
              <ul className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
                {data.recentOrders.map((order) => (
                  <li key={order.id}>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                    >
                      <span className={cn(homeIconWrap, "mt-0.5")}>
                        <ShoppingBag className="h-3 w-3" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-[12px] font-medium text-neutral-900 dark:text-white">
                            {order.orderNumber}
                          </p>
                          <span className="shrink-0 text-[11px] tabular-nums text-neutral-700 dark:text-neutral-300">
                            {order.total.toLocaleString()} {order.store.currency}
                          </span>
                        </div>
                        <p className="truncate text-[10px] text-neutral-400">
                          {order.customerName} · {order.store.name}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span
                            className={
                              order.isTest
                                ? "rounded bg-amber-50 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                                : "rounded bg-emerald-50 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                            }
                          >
                            {order.isTest ? "Test" : "Real"}
                          </span>
                          <span className="text-[10px] capitalize text-neutral-400">
                            {order.status}
                          </span>
                          <span className="text-[10px] text-neutral-300">
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className={homeTitle}>Top stores</h2>
            <Link href="/admin/stores" className={homeLinkQuiet}>
              All stores →
            </Link>
          </div>
          <div className={cn(homeCard, "overflow-hidden")}>
            {data.topStores.length === 0 ? (
              <p className="px-4 py-8 text-center text-[12px] text-neutral-400">
                No store GMV yet
              </p>
            ) : (
              <ul className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
                {data.topStores.map((store) => (
                  <li key={store.id}>
                    <Link
                      href={`/admin/stores/${store.id}`}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                    >
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg text-[10px] font-semibold text-white"
                        style={{
                          backgroundColor: store.primaryColor || "#007AFF",
                        }}
                      >
                        {store.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={store.logo}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          store.name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-medium text-neutral-900 dark:text-white">
                          {store.name}
                        </p>
                        <p className="truncate text-[10px] text-neutral-400">
                          {store.ownerName || store.ownerEmail} · /{store.slug}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[12px] font-semibold tabular-nums text-neutral-900 dark:text-white">
                          {store.realGmv.toLocaleString()} {store.currency}
                        </p>
                        <p className="text-[10px] text-neutral-400">
                          {store.realOrders} real orders
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section>
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className={homeTitle}>Recent signups</h2>
            <Link href="/admin/users" className={homeLinkQuiet}>
              All users →
            </Link>
          </div>
          <div className={cn(homeCard, "overflow-hidden")}>
            <ul className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
              {data.recentUsers.map((user) => (
                <li key={user.id}>
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#007AFF] text-[10px] font-semibold uppercase text-white">
                      {(user.name || user.email).slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-medium text-neutral-900 dark:text-white">
                        {user.name ?? "—"}
                        {user.founderNumber != null ? (
                          <span className="ml-1.5 text-[10px] font-medium text-neutral-400">
                            #{user.founderNumber}
                          </span>
                        ) : null}
                      </p>
                      <p className="truncate text-[10px] text-neutral-400">
                        {user.email}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[10px] capitalize text-neutral-500">
                        {user.status}
                        {user.role === "admin" ? " · admin" : ""}
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        {user._count.stores} stores · {formatDate(user.createdAt)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className={homeTitle}>Support inbox</h2>
            <Link href="/admin/messages" className={homeLinkQuiet}>
              Open inbox →
            </Link>
          </div>
          <div className={cn(homeCard, "overflow-hidden")}>
            {data.recentMessages.length === 0 ? (
              <p className="px-4 py-8 text-center text-[12px] text-neutral-400">
                No support emails yet
              </p>
            ) : (
              <ul className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
                {data.recentMessages.map((msg) => (
                  <li key={msg.id}>
                    <Link
                      href="/admin/messages"
                      className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                    >
                      <span className={cn(homeIconWrap, "mt-0.5")}>
                        <MessageSquare className="h-3 w-3" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-[12px] font-medium text-neutral-900 dark:text-white">
                            {msg.name}
                          </p>
                          <span className="shrink-0 text-[10px] text-neutral-400">
                            {formatDate(msg.createdAt)}
                          </span>
                        </div>
                        <p className="truncate text-[10px] text-neutral-400">
                          {msg.topic}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                          {msg.message}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      <section className={cn(homeCard, homeCardPad)}>
        <div className="flex flex-wrap items-center gap-3">
          <span className={homeIconWrap}>
            <Globe className="h-3 w-3" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className={homeTitle}>Dig deeper</h2>
            <p className={homeSubtitle}>
              {data.liveStores} live storefronts · {data.activeProducts} active
              products · {data.domainsConnectedSuccess}/{data.domainsConnected}{" "}
              domains DNS-ok · {data.funnel.hasOrders} stores with real sales
            </p>
          </div>
          <Link
            href="/admin/analytics"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#007AFF] hover:underline"
          >
            <Package className="h-3 w-3" />
            Open intelligence
          </Link>
        </div>
      </section>
    </div>
  );
}
