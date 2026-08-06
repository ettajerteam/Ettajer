import type { OrderDetail, OrderItemDetail } from "@/types/orders";
import { getAbsoluteStoreUrl, getStoreQrImageUrl } from "@/lib/storefront-urls";
import {
  DEFAULT_ETICKET_PREFERENCES,
  type EticketPreferences,
  type EticketSizeId,
  type EticketTemplateId,
} from "@/lib/shop-preferences";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

function formatVariant(variant: Record<string, string> | null): string {
  if (!variant) return "";
  return Object.entries(variant)
    .map(([key, value]) => `${key}: ${value}`)
    .join(" · ");
}

function barcodeValue(item: OrderItemDetail): string {
  return (item.barcode || item.sku || item.productId).slice(0, 48);
}

function formatShortDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

const ETICKET_SIZE_CONFIG: Record<
  EticketSizeId,
  { widthMm: number; heightMm: number; label: string; scale: number; barcodeHeight: number }
> = {
  "80x100": {
    widthMm: 80,
    heightMm: 100,
    label: "80 × 100 mm",
    scale: 1,
    barcodeHeight: 48,
  },
  "58x40": {
    widthMm: 58,
    heightMm: 40,
    label: "58 × 40 mm",
    scale: 0.78,
    barcodeHeight: 32,
  },
  "40x30": {
    widthMm: 40,
    heightMm: 30,
    label: "40 × 30 mm",
    scale: 0.62,
    barcodeHeight: 22,
  },
};

function mergeEticketPreferences(
  preferences?: Partial<EticketPreferences>
): EticketPreferences {
  return {
    ...DEFAULT_ETICKET_PREFERENCES,
    ...preferences,
  };
}

export interface EticketOrderInput {
  order: OrderDetail;
  currency: string;
}

export interface BuildEticketPrintHtmlOptions {
  orders: EticketOrderInput[];
  storeName: string;
  storeSlug: string;
  currency: string;
  /** When true, print one ticket per line item (ignore quantity). Default follows shop prefs. */
  singlePerItem?: boolean;
  /** Only include these order item ids (across the selected orders). */
  itemIds?: string[];
  preferences?: Partial<EticketPreferences>;
}

interface EticketUnit {
  html: string;
}

/**
 * Full-size e-tickets for label / ticket printers.
 * One ticket per page so every field stays readable.
 * Preview toolbar can print all tickets or only one.
 */
export function buildEticketPrintHtml({
  orders,
  storeName,
  storeSlug,
  currency,
  singlePerItem,
  itemIds,
  preferences,
}: BuildEticketPrintHtmlOptions): string {
  const prefs = mergeEticketPreferences(preferences);
  const size = ETICKET_SIZE_CONFIG[prefs.size] ?? ETICKET_SIZE_CONFIG["80x100"];
  const template = prefs.template ?? "classic";
  const perLineItem = singlePerItem ?? !prefs.onePerUnit;

  const storeUrl = getAbsoluteStoreUrl(storeSlug);
  const storeHost = storeUrl.replace(/^https?:\/\//, "");
  const storeQr = getStoreQrImageUrl(storeSlug, 180);
  const itemIdSet = itemIds?.length ? new Set(itemIds) : null;
  const footerText = prefs.footerNote.trim() || storeHost;

  const units: EticketUnit[] = [];

  for (const { order, currency: orderCurrency } of orders) {
    const money = orderCurrency || currency;
    const orderDate = formatShortDate(order.createdAt);

    for (const item of order.items) {
      if (itemIdSet && !itemIdSet.has(item.id)) continue;

      const variant = formatVariant(item.variant);
      const code = barcodeValue(item);
      const sku = (item.sku || "").trim();
      const barcode = (item.barcode || "").trim();
      const count = perLineItem ? 1 : Math.max(1, item.quantity);

      for (let unit = 1; unit <= count; unit++) {
        const ticketId = `t${units.length}`;

        const customerBlock = prefs.showCustomer
          ? `<div>
              <span class="label">Customer</span>
              <span class="value">${escapeHtml(order.customerName || "—")}</span>
            </div>`
          : "";

        const barcodeInfoBlock = prefs.showBarcode
          ? `<div>
              <span class="label">Barcode</span>
              <span class="value mono">${escapeHtml(barcode || code)}</span>
            </div>`
          : "";

        const priceBlock = prefs.showPrice
          ? `<div class="price-row">
              <span class="price">${escapeHtml(formatMoney(item.price, money))}</span>
              <span class="qty">Qty ${unit} / ${count}</span>
            </div>`
          : `<div class="price-row">
              <span class="qty">Qty ${unit} / ${count}</span>
            </div>`;

        const barcodeVisualBlock = prefs.showBarcode
          ? `<div class="barcode-wrap">
              <svg class="barcode"></svg>
              <div class="code-label">${escapeHtml(barcode || code)}</div>
              <div class="code-hint">Scan to find product</div>
            </div>`
          : "";

        const qrBlock = prefs.showStoreQr
          ? `<div class="qr-wrap">
              <img src="${escapeHtml(storeQr)}" alt="Store QR" width="88" height="88" />
              <div class="code-label">Store</div>
            </div>`
          : "";

        const codesBlock =
          barcodeVisualBlock || qrBlock
            ? `<div class="codes${barcodeVisualBlock && qrBlock ? "" : " codes-single"}">
                ${barcodeVisualBlock}
                ${qrBlock}
              </div>`
            : "";

        units.push({
          html: `
            <section class="page" data-ticket-id="${ticketId}">
              <article class="ticket" data-barcode="${escapeHtml(code)}">
                <header class="ticket-head">
                  <div>
                    <div class="store">${escapeHtml(storeName)}</div>
                    <div class="date">${escapeHtml(orderDate)}</div>
                  </div>
                  <button type="button" class="print-one" data-print-one="${ticketId}">Print only this</button>
                </header>

                <div class="order-row">
                  <span class="label">Order</span>
                  <span class="order-number">${escapeHtml(order.orderNumber)}</span>
                </div>

                <h1 class="title">${escapeHtml(item.title)}</h1>
                ${variant ? `<p class="variant">${escapeHtml(variant)}</p>` : ""}

                ${priceBlock}

                <div class="info-grid">
                  ${customerBlock}
                  <div>
                    <span class="label">SKU</span>
                    <span class="value mono">${escapeHtml(sku || "—")}</span>
                  </div>
                  ${barcodeInfoBlock}
                  <div>
                    <span class="label">Product</span>
                    <span class="value mono">${escapeHtml(item.productId.slice(0, 12))}…</span>
                  </div>
                </div>

                ${codesBlock}

                <footer class="footer">${escapeHtml(footerText)}</footer>
              </article>
            </section>
          `,
        });
      }
    }
  }

  const pagesHtml =
    units.length === 0
      ? `<section class="page"><div class="empty">No products to print.</div></section>`
      : units.map((u) => u.html).join("");

  const qrSizeMm = Math.max(12, Math.round(20 * size.scale));
  const pageWidth = `${size.widthMm}mm`;
  const pageHeight = `${size.heightMm}mm`;
  const templateClass = `template-${template}`;

  return `<!DOCTYPE html>
<html lang="en" class="${templateClass}">
<head>
  <meta charset="utf-8" />
  <title>E-tickets · ${escapeHtml(storeName)}</title>
  <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: #ececec;
      color: #111;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      --scale: ${size.scale};
    }
    html.template-bold .order-number {
      font-size: calc(16pt * var(--scale));
    }
    html.template-bold .price {
      font-size: calc(22pt * var(--scale));
    }
    html.template-bold .title {
      font-size: calc(14pt * var(--scale));
    }
    html.template-compact .info-grid {
      margin-top: calc(2mm * var(--scale));
    }
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 5;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      padding: 10px 14px;
      background: rgba(255,255,255,0.96);
      border-bottom: 1px solid #ddd;
      backdrop-filter: blur(8px);
    }
    .toolbar p { margin: 0; font-size: 12px; color: #555; }
    .toolbar-actions { display: flex; gap: 8px; }
    .toolbar button, .print-one {
      border: 0;
      background: #111;
      color: #fff;
      border-radius: 8px;
      padding: 8px 14px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }
    .toolbar button.secondary {
      background: #fff;
      color: #111;
      border: 1px solid #ccc;
    }
    .print-one {
      padding: 5px 8px;
      font-size: 10px;
      background: #f4f4f4;
      color: #333;
      border: 1px solid #ddd;
      white-space: nowrap;
    }
    .preview {
      padding: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 18px;
    }
    .page {
      width: ${pageWidth};
      height: ${pageHeight};
      background: #fff;
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
    }
    .ticket {
      width: ${pageWidth};
      height: ${pageHeight};
      padding: calc(4.5mm * var(--scale));
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #fff;
    }
    .ticket-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: calc(3mm * var(--scale));
    }
    .store {
      font-size: calc(9pt * var(--scale));
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #444;
      max-width: calc(48mm * var(--scale));
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .date {
      margin-top: calc(0.6mm * var(--scale));
      font-size: calc(7.5pt * var(--scale));
      color: #888;
    }
    .order-row {
      margin-top: calc(3mm * var(--scale));
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: calc(2mm * var(--scale));
      border-bottom: 0.35mm solid #eee;
      padding-bottom: calc(1.8mm * var(--scale));
    }
    .order-number {
      font-size: calc(12pt * var(--scale));
      font-weight: 700;
      letter-spacing: -0.02em;
      font-variant-numeric: tabular-nums;
    }
    .title {
      margin: calc(2.5mm * var(--scale)) 0 0;
      font-size: calc(13pt * var(--scale));
      font-weight: 700;
      line-height: 1.2;
      letter-spacing: -0.02em;
      max-height: 2.5em;
      overflow: hidden;
    }
    .variant {
      margin: calc(1mm * var(--scale)) 0 0;
      font-size: calc(8pt * var(--scale));
      color: #666;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .price-row {
      margin-top: calc(2.5mm * var(--scale));
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: calc(2mm * var(--scale));
    }
    .price {
      font-size: calc(18pt * var(--scale));
      font-weight: 700;
      letter-spacing: -0.03em;
    }
    .qty {
      font-size: calc(9pt * var(--scale));
      color: #666;
      font-variant-numeric: tabular-nums;
    }
    .info-grid {
      margin-top: calc(3mm * var(--scale));
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: calc(2mm * var(--scale)) calc(3mm * var(--scale));
    }
    .label {
      display: block;
      font-size: calc(6.5pt * var(--scale));
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #999;
      margin-bottom: calc(0.4mm * var(--scale));
    }
    .value {
      display: block;
      font-size: calc(8.5pt * var(--scale));
      font-weight: 600;
      color: #222;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-weight: 500; }
    .codes {
      margin-top: auto;
      display: grid;
      grid-template-columns: 1fr ${qrSizeMm}mm;
      gap: calc(3mm * var(--scale));
      align-items: end;
      padding-top: calc(2.5mm * var(--scale));
      border-top: 0.35mm solid #eee;
    }
    .codes.codes-single {
      grid-template-columns: 1fr;
    }
    .barcode { width: 100%; height: calc(16mm * var(--scale)); }
    .qr-wrap { text-align: center; }
    .qr-wrap img {
      display: block;
      width: ${qrSizeMm}mm;
      height: ${qrSizeMm}mm;
      margin: 0 auto;
      border: 0.25mm solid #eee;
      border-radius: calc(1.2mm * var(--scale));
    }
    .code-label {
      margin-top: calc(1mm * var(--scale));
      font-size: calc(7pt * var(--scale));
      color: #555;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .barcode-wrap .code-label { text-align: left; }
    .qr-wrap .code-label { text-align: center; }
    .code-hint {
      margin-top: calc(0.4mm * var(--scale));
      font-size: calc(6pt * var(--scale));
      color: #aaa;
    }
    .footer {
      margin-top: calc(2mm * var(--scale));
      font-size: calc(6.5pt * var(--scale));
      color: #bbb;
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .empty {
      height: 100%;
      display: grid;
      place-items: center;
      color: #888;
      font-size: 12px;
    }
    @media print {
      html, body { background: #fff; }
      .toolbar, .preview { padding: 0; }
      .toolbar, .print-one { display: none !important; }
      .preview { gap: 0; }
      .page {
        box-shadow: none;
        page-break-after: always;
        break-after: page;
      }
      .page:last-child,
      .page.print-solo {
        page-break-after: auto;
        break-after: auto;
      }
      body.print-single .page { display: none !important; }
      body.print-single .page.print-solo { display: block !important; }
      @page {
        size: ${pageWidth} ${pageHeight};
        margin: 0;
      }
    }
  </style>
</head>
<body class="${templateClass}">
  <div class="toolbar">
    <p>${units.length} e-ticket${units.length === 1 ? "" : "s"} · ${escapeHtml(size.label)} · 1 / page · ${escapeHtml(storeName)}</p>
    <div class="toolbar-actions">
      <button type="button" class="secondary" onclick="window.close()">Close</button>
      <button type="button" onclick="printAll()">Print ${units.length === 1 ? "ticket" : "all"}</button>
    </div>
  </div>
  <div class="preview">
    ${pagesHtml}
  </div>
  <script>
    var BARCODE_HEIGHT = ${size.barcodeHeight};

    function renderBarcodes() {
      document.querySelectorAll(".ticket[data-barcode]").forEach(function (ticket) {
        var value = ticket.getAttribute("data-barcode") || "";
        var svg = ticket.querySelector(".barcode");
        if (!svg || !value || typeof JsBarcode === "undefined") return;
        try {
          JsBarcode(svg, value, {
            format: /^\\d{12,14}$/.test(value) ? "EAN13" : "CODE128",
            displayValue: false,
            margin: 0,
            height: BARCODE_HEIGHT,
            width: 1.6,
            background: "#ffffff",
            lineColor: "#111111"
          });
        } catch (e) {
          try {
            JsBarcode(svg, value.replace(/[^A-Za-z0-9\\-]/g, "").slice(0, 32) || "ETICKET", {
              format: "CODE128",
              displayValue: false,
              margin: 0,
              height: BARCODE_HEIGHT,
              width: 1.4
            });
          } catch (_) {}
        }
      });
    }

    function clearSolo() {
      document.body.classList.remove("print-single");
      document.querySelectorAll(".page.print-solo").forEach(function (el) {
        el.classList.remove("print-solo");
      });
    }

    function printAll() {
      clearSolo();
      window.print();
    }

    function printOne(ticketId) {
      clearSolo();
      var page = document.querySelector('.page[data-ticket-id="' + ticketId + '"]');
      if (!page) return;
      document.body.classList.add("print-single");
      page.classList.add("print-solo");
      window.print();
    }

    window.addEventListener("afterprint", clearSolo);

    document.querySelectorAll("[data-print-one]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        printOne(btn.getAttribute("data-print-one"));
      });
    });

    window.addEventListener("load", function () {
      renderBarcodes();
      ${units.length === 1 ? "setTimeout(function () { printAll(); }, 400);" : ""}
    });
  </script>
</body>
</html>`;
}
