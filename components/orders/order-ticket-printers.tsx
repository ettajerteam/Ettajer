"use client";

import { Printer, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OrderDetail } from "@/types/orders";
import type { TicketPrinter } from "@/lib/ticket-printers";
import { groupOrderItemsByPrinter } from "@/lib/ticket-printers";
import Link from "next/link";

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
    <section className="premium-card p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Ticket className="h-4 w-4 text-[#007AFF]" />
            <h3 className="text-lg font-semibold tracking-[-0.02em]">Product tickets</h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Print kitchen or station tickets grouped by printer.
          </p>
        </div>
        {hasAssignedItems && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 shrink-0 rounded-lg"
            onClick={() => openTicket(`/api/orders/${order.id}/ticket?all=1`)}
          >
            <Printer className="mr-1.5 h-3.5 w-3.5" />
            Print all
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {groups.map((group) => (
          <div
            key={group.printerId ?? "unassigned"}
            className="rounded-xl border border-border/80 bg-muted/20 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{group.printerName}</p>
                {group.printerLocation && (
                  <p className="text-xs text-muted-foreground">{group.printerLocation}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  {group.items.length} item{group.items.length === 1 ? "" : "s"}
                </p>
              </div>
              {group.printerId ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg"
                  onClick={() =>
                    openTicket(`/api/orders/${order.id}/ticket?printer=${group.printerId}`)
                  }
                >
                  <Printer className="mr-1.5 h-3.5 w-3.5" />
                  Print
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-lg text-muted-foreground"
                  onClick={() => openTicket(`/api/orders/${order.id}/ticket?printer=`)}
                >
                  Print unassigned
                </Button>
              )}
            </div>

            <ul className="mt-3 space-y-2 border-t border-border/60 pt-3">
              {group.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.title}</p>
                    {item.variant && (
                      <p className="text-xs text-muted-foreground">
                        {Object.entries(item.variant)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-muted-foreground">×{item.quantity}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {!hasAssignedItems && (
        <p className="mt-3 text-xs text-muted-foreground">
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
