import type { OrderItemDetail } from "@/types/orders";

export interface TicketPrinter {
  id: string;
  name: string;
  location?: string;
}

export const DEFAULT_TICKET_PRINTERS: TicketPrinter[] = [
  { id: "kitchen", name: "Kitchen", location: "Hot food prep" },
  { id: "bar", name: "Bar", location: "Drinks & beverages" },
];

export function parseTicketPrinters(data: unknown): TicketPrinter[] {
  if (!Array.isArray(data) || data.length === 0) return DEFAULT_TICKET_PRINTERS;
  return data
    .filter(
      (item): item is TicketPrinter =>
        typeof item === "object" &&
        item !== null &&
        "id" in item &&
        "name" in item &&
        typeof (item as TicketPrinter).id === "string" &&
        typeof (item as TicketPrinter).name === "string"
    )
    .map((item, index) => ({
      id: String(item.id || `printer-${index}`),
      name: String(item.name),
      location: typeof item.location === "string" ? item.location : undefined,
    }));
}

export function getPrinterById(
  printers: TicketPrinter[],
  printerId: string | null | undefined
): TicketPrinter | null {
  if (!printerId) return null;
  return printers.find((printer) => printer.id === printerId) ?? null;
}

export function getPrinterLabel(
  printers: TicketPrinter[],
  printerId: string | null | undefined
): string {
  return getPrinterById(printers, printerId)?.name ?? "Unassigned";
}

export interface TicketPrinterGroup {
  printerId: string | null;
  printerName: string;
  printerLocation?: string;
  items: OrderItemDetail[];
}

export function groupOrderItemsByPrinter(
  items: OrderItemDetail[],
  printers: TicketPrinter[]
): TicketPrinterGroup[] {
  const groups = new Map<string | null, OrderItemDetail[]>();

  for (const item of items) {
    const key = item.ticketPrinterId ?? null;
    const bucket = groups.get(key) ?? [];
    bucket.push(item);
    groups.set(key, bucket);
  }

  const sortedKeys = Array.from(groups.keys()).sort((a, b) => {
    if (a === null) return 1;
    if (b === null) return -1;
    const aIndex = printers.findIndex((printer) => printer.id === a);
    const bIndex = printers.findIndex((printer) => printer.id === b);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });

  return sortedKeys.map((printerId) => {
    const printer = getPrinterById(printers, printerId);
    return {
      printerId,
      printerName: printer?.name ?? "Unassigned",
      printerLocation: printer?.location,
      items: groups.get(printerId) ?? [],
    };
  });
}
