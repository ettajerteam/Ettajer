import Link from "next/link";
import { requireAdminPage } from "@/lib/admin/auth";
import {
  getPlatformLiveFeed,
  type PlatformLiveEventCategory,
} from "@/lib/admin/platform-stats";
import { AdminLayout } from "@/components/admin/admin-layout";
import {
  AdminEmptyState,
  AdminPageHeader,
  adminPage,
} from "@/components/admin/admin-ui";
import { cn } from "@/lib/utils";
import { homeSubtitle } from "@/components/dashboard/home/home-ui";
import { formatAdminRelative } from "@/lib/admin/format";

export const metadata = { title: "Activity — Ettajer Console" };

const FILTERS: { id: PlatformLiveEventCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "commerce", label: "Commerce" },
  { id: "merchants", label: "Merchants" },
  { id: "stores", label: "Stores" },
  { id: "support", label: "Support" },
  { id: "errors", label: "Errors" },
  { id: "domains", label: "Domains" },
];

export default async function AdminActivityPage({
  searchParams,
}: {
  searchParams?: { filter?: string | string[] };
}) {
  await requireAdminPage();
  const raw = Array.isArray(searchParams?.filter)
    ? searchParams?.filter[0]
    : searchParams?.filter;
  const filter = (FILTERS.some((f) => f.id === raw)
    ? raw
    : "all") as PlatformLiveEventCategory;

  const events = await getPlatformLiveFeed(50);
  const visible =
    filter === "all" ? events : events.filter((e) => e.category === filter);

  return (
    <AdminLayout>
      <div className={adminPage}>
        <AdminPageHeader
          title="Live platform"
          description="Recent commerce, merchant, support, error, and domain signals from live data."
        />

        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <Link
              key={f.id}
              href={`/admin/activity?filter=${f.id}`}
              className={cn(
                "rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors",
                filter === f.id
                  ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                  : "border-black/[0.06] text-neutral-600 hover:bg-black/[0.02] dark:border-white/10 dark:text-neutral-300"
              )}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {visible.length === 0 ? (
          <AdminEmptyState message="No events in this filter." />
        ) : (
          <ul className="space-y-1.5">
            {visible.map((event) => (
              <li key={event.id}>
                <Link
                  href={event.href}
                  className="flex gap-3 rounded-[12px] border border-black/[0.06] bg-white px-3 py-2.5 transition-colors hover:bg-[#FAFAFA] dark:border-white/10 dark:bg-[#121212] dark:hover:bg-white/[0.03]"
                >
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#007AFF]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-neutral-900 dark:text-white">
                      {event.title}
                    </p>
                    <p className={cn("mt-0.5", homeSubtitle)}>{event.detail}</p>
                  </div>
                  <p className="shrink-0 text-[11px] text-neutral-400">
                    {formatAdminRelative(event.createdAt)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminLayout>
  );
}
