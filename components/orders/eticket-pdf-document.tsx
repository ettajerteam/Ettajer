import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { OrderDetail, OrderItemDetail } from "@/types/orders";
import type { EticketPreferences, EticketSizeId, EticketTemplateId } from "@/lib/shop-preferences";

const MM_TO_PT = 2.83465;

const SIZE_MM: Record<EticketSizeId, { width: number; height: number }> = {
  "80x100": { width: 80, height: 100 },
  "58x40": { width: 58, height: 40 },
  "40x30": { width: 40, height: 30 },
};

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("fr-MA", {
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

function buildStyles(
  size: EticketSizeId,
  template: EticketTemplateId,
  showPrice: boolean
) {
  const dims = SIZE_MM[size] ?? SIZE_MM["80x100"];
  const scale = size === "40x30" ? 0.62 : size === "58x40" ? 0.78 : 1;
  const isBold = template === "bold";

  return StyleSheet.create({
    page: {
      width: dims.width * MM_TO_PT,
      height: dims.height * MM_TO_PT,
      padding: 10 * scale,
      fontSize: 8 * scale,
      color: "#111",
      fontFamily: "Helvetica",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 6 * scale,
    },
    store: {
      fontSize: (isBold ? 10 : 9) * scale,
      fontWeight: "bold",
      textTransform: "uppercase",
      color: "#444",
      maxWidth: dims.width * MM_TO_PT * 0.55,
    },
    date: {
      fontSize: 7 * scale,
      color: "#888",
      marginTop: 2 * scale,
    },
    orderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
      borderBottomWidth: 0.5,
      borderBottomColor: "#eee",
      paddingBottom: 4 * scale,
      marginBottom: 4 * scale,
    },
    orderLabel: {
      fontSize: 6 * scale,
      textTransform: "uppercase",
      color: "#999",
    },
    orderNumber: {
      fontSize: (isBold ? 14 : 11) * scale,
      fontWeight: "bold",
    },
    title: {
      fontSize: (isBold ? 12 : 10) * scale,
      fontWeight: "bold",
      marginBottom: 2 * scale,
    },
    variant: {
      fontSize: 7 * scale,
      color: "#666",
      marginBottom: 4 * scale,
    },
    priceRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: 4 * scale,
    },
    price: {
      fontSize: (isBold ? 16 : showPrice ? 12 : 9) * scale,
      fontWeight: "bold",
    },
    qty: {
      fontSize: 8 * scale,
      color: "#666",
    },
    infoGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 4 * scale,
      marginTop: 4 * scale,
    },
    infoBlock: {
      width: "48%",
    },
    label: {
      fontSize: 6 * scale,
      textTransform: "uppercase",
      color: "#999",
      marginBottom: 1 * scale,
    },
    value: {
      fontSize: 8 * scale,
      fontWeight: "bold",
      color: "#222",
    },
    footer: {
      position: "absolute",
      bottom: 8 * scale,
      left: 10 * scale,
      right: 10 * scale,
      textAlign: "center",
      fontSize: 6 * scale,
      color: "#bbb",
    },
  });
}

interface EticketPdfDocumentProps {
  order: OrderDetail;
  item: OrderItemDetail;
  storeName: string;
  currency: string;
  preferences: EticketPreferences;
  unitIndex?: number;
  unitTotal?: number;
}

export function EticketPdfDocument({
  order,
  item,
  storeName,
  currency,
  preferences,
  unitIndex = 1,
  unitTotal = 1,
}: EticketPdfDocumentProps) {
  const { size, template, showCustomer, showPrice, footerNote } = preferences;
  const dims = SIZE_MM[size] ?? SIZE_MM["80x100"];
  const styles = buildStyles(size, template, showPrice);
  const variant = formatVariant(item.variant);
  const footerText = footerNote.trim() || storeName;

  return (
    <Document>
      <Page
        size={[dims.width * MM_TO_PT, dims.height * MM_TO_PT]}
        style={styles.page}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.store}>{storeName}</Text>
            <Text style={styles.date}>{formatShortDate(order.createdAt)}</Text>
          </View>
        </View>

        <View style={styles.orderRow}>
          <Text style={styles.orderLabel}>Order</Text>
          <Text style={styles.orderNumber}>{order.orderNumber}</Text>
        </View>

        <Text style={styles.title}>{item.title}</Text>
        {variant ? <Text style={styles.variant}>{variant}</Text> : null}

        <View style={styles.priceRow}>
          {showPrice ? (
            <Text style={styles.price}>{formatMoney(item.price, currency)}</Text>
          ) : null}
          <Text style={styles.qty}>
            Qty {unitIndex} / {unitTotal}
          </Text>
        </View>

        <View style={styles.infoGrid}>
          {showCustomer ? (
            <View style={styles.infoBlock}>
              <Text style={styles.label}>Customer</Text>
              <Text style={styles.value}>{order.customerName || "—"}</Text>
            </View>
          ) : null}
          {(item.sku || item.barcode) && (
            <View style={styles.infoBlock}>
              <Text style={styles.label}>SKU</Text>
              <Text style={styles.value}>{item.sku || item.barcode || "—"}</Text>
            </View>
          )}
        </View>

        <Text style={styles.footer}>{footerText}</Text>
      </Page>
    </Document>
  );
}
