"use client";

import { Printer, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OrderDetail } from "@/types/orders";
import type { TicketPrinter } from "@/lib/ticket-printers";
import { groupOrderItemsByPrinter } from "@/lib/ticket-printers";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { dashboardCard, dashboardTitle, dashboardSubtitle } from "@/lib/dashboard-ui";

interface OrderTicketPrintersProps {
  order: OrderDetail;
  printers: TicketPrinter[];
}

export function OrderTicketPrinters({ order, printers }: OrderTicketPrintersProps) {
  const groups = groupOrderItemsByPrinter(order.items, printers);
  const assignedGroups = groups.filter((group) => group.printerId !== null);
  const hasAssignedItems = assignedGroups.length > 0;

  function openTicket(url: string) {
    window.open(url, "_blank", "noopener,noreferrer,width=420,height=720");
  }

  if (groups.length === 0) return null;

  return (
    <section className={cn(dashboardCard, "p-4")}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <Ticket className="h-3.5 w-3.5 text-neutral-400" />
            <h3 className={dashboardTitle}>Product tickets</h3>
          </div>
          <p className={cn(dashboardSubtitle, "mt-0.5")}>
            Print kitchen or station tickets grouped by printer.
          </p>
        </div>
        {hasAssignedItems && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 shrink-0 rounded-md border-black/[0.06] px-2 text-[11px] dark:border-white/10"
            onClick={() => openTicket(`/api/orders/${order.id}/ticket?all=1`)}
          >
            <Printer className="mr-1.5 h-3 w-3" />
            Print all
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {groups.map((group) => (
          <div
            key={group.printerId ?? "unassigned"}
            className="rounded-[10px] border border-black/[0.05] bg-[#F5F5F7]/70 p-3 dark:border-white/10 dark:bg-white/[0.03]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
                  {group.printerName}
                </p>
                {group.printerLocation && (
                  <p className="text-[10px] text-neutral-400">{group.printerLocation}</p>
                )}
                <p className="mt-0.5 text-[10px] text-neutral-400">
                  {group.items.length} item{group.items.length === 1 ? "" : "s"}
                </p>
              </div>
              {group.printerId ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 rounded-md border-black/[0.06] px-2 text-[11px] dark:border-white/10"
                  onClick={() =>
                    openTicket(`/api/orders/${order.id}/ticket?printer=${group.printerId}`)
                  }
                >
                  <Printer className="mr-1.5 h-3 w-3" />
                  Print
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 rounded-md px-2 text-[11px] text-neutral-400"
                  onClick={() => openTicket(`/api/orders/${order.id}/ticket?printer=`)}
                >
                  Print unassigned
                </Button>
              )}
            </div>

            <ul className="mt-2 space-y-1.5 border-t border-black/[0.05] pt-2 dark:border-white/10">
              {group.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 text-[12px]"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-neutral-900 dark:text-white">
                      {item.title}
                    </p>
                    {item.variant && (
                      <p className="text-[10px] text-neutral-400">
                        {Object.entries(item.variant)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-neutral-400">×{item.quantity}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {!hasAssignedItems && (
        <p className="mt-2.5 text-[10px] text-neutral-400">
          Assign printers to products in{" "}
          <Link href="/dashboard/products" className="text-[#007AFF] hover:underline">
            Products
          </Link>{" "}
          or configure stations in{" "}
          <Link href="/dashboard/settings?tab=printers" className="text-[#007AFF] hover:underline">
            Settings → Printers
          </Link>
          .
        </p>
      )}
    </section>
  );
}
