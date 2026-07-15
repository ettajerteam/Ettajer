import type { OrderDetail } from "@/types/orders";
import type { TicketPrinter } from "@/lib/ticket-printers";
import { getPrinterById } from "@/lib/ticket-printers";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatVariant(variant: Record<string, string> | null): string {
  if (!variant) return "";
  return Object.entries(variant)
    .map(([key, value]) => `${key}: ${value}`)
    .join(" · ");
}

interface TicketPrintOptions {
  order: OrderDetail;
  storeName: string;
  printers: TicketPrinter[];
  printerId?: string | null;
  printAll?: boolean;
}

export function buildTicketPrintHtml({
  order,
  storeName,
  printers,
  printerId,
  printAll = false,
}: TicketPrintOptions): string {
  const groups = printAll
    ? printers
        .map((printer) => ({
          printer,
          items: order.items.filter((item) => item.ticketPrinterId === printer.id),
        }))
        .filter((group) => group.items.length > 0)
    : [
        {
          printer: printerId ? getPrinterById(printers, printerId) : null,
          items: order.items.filter((item) =>
            printerId ? item.ticketPrinterId === printerId : !item.ticketPrinterId
          ),
        },
      ].filter((group) => group.items.length > 0);

  const createdAt = new Date(order.createdAt).toLocaleString();
  const sections = groups
    .map((group) => {
      const title = group.printer?.name ?? "Unassigned";
      const location = group.printer?.location;
      const itemsHtml = group.items
        .map((item) => {
          const variant = formatVariant(item.variant);
          return `
            <div class="item">
              <div class="item-title">${escapeHtml(item.title)}</div>
              ${variant ? `<div class="item-variant">${escapeHtml(variant)}</div>` : ""}
              <div class="item-qty">Qty: ${item.quantity}</div>
            </div>
          `;
        })
        .join("");

      return `
        <section class="ticket-section">
          <div class="station">${escapeHtml(title)}</div>
          ${location ? `<div class="station-meta">${escapeHtml(location)}</div>` : ""}
          <div class="divider"></div>
          ${itemsHtml}
        </section>
      `;
    })
    .join('<div class="page-break"></div>');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Ticket ${escapeHtml(order.orderNumber)}</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 12px;
        width: 80mm;
        font-family: "Courier New", Courier, monospace;
        color: #111;
        background: #fff;
      }
      .header { text-align: center; margin-bottom: 10px; }
      .store { font-size: 16px; font-weight: 700; text-transform: uppercase; }
      .meta { font-size: 11px; margin-top: 4px; }
      .customer { font-size: 11px; margin-top: 6px; }
      .ticket-section { margin-top: 8px; }
      .station {
        font-size: 14px;
        font-weight: 700;
        text-transform: uppercase;
        text-align: center;
      }
      .station-meta {
        font-size: 10px;
        text-align: center;
        color: #444;
        margin-top: 2px;
      }
      .divider {
        border-top: 1px dashed #111;
        margin: 8px 0;
      }
      .item { margin-bottom: 10px; }
      .item-title { font-size: 13px; font-weight: 700; }
      .item-variant { font-size: 11px; margin-top: 2px; }
      .item-qty { font-size: 12px; font-weight: 700; margin-top: 4px; }
      .footer {
        margin-top: 12px;
        padding-top: 8px;
        border-top: 1px dashed #111;
        font-size: 10px;
        text-align: center;
      }
      .page-break { page-break-after: always; }
      @media print {
        body { padding: 0; }
        @page { margin: 4mm; size: 80mm auto; }
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="store">${escapeHtml(storeName)}</div>
      <div class="meta">${escapeHtml(order.orderNumber)} · ${escapeHtml(createdAt)}</div>
      <div class="customer">${escapeHtml(order.customerName)}</div>
    </div>
    ${sections}
    <div class="footer">Printed from Ettajer</div>
    <script>
      window.addEventListener("load", function () {
        window.print();
      });
    </script>
  </body>
</html>`;
}
