import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import type { OrderDetail } from "@/types/orders";
import { getStatusLabel } from "@/types/orders";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: "#1a1a1a" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 32 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  logo: { width: 48, height: 48, borderRadius: 8, objectFit: "cover" },
  title: { fontSize: 24, fontWeight: "bold", color: "#007AFF" },
  subtitle: { fontSize: 10, color: "#666", marginTop: 4 },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  table: { marginTop: 8 },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingBottom: 6,
    marginBottom: 6,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  colProduct: { flex: 3 },
  colQty: { flex: 1, textAlign: "center" },
  colPrice: { flex: 1, textAlign: "right" },
  colTotal: { flex: 1, textAlign: "right" },
  totals: { marginTop: 16, alignItems: "flex-end" },
  totalRow: { flexDirection: "row", justifyContent: "flex-end", width: 200, marginBottom: 4 },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: 200,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: "#007AFF",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    color: "#999",
    fontSize: 8,
  },
});

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

interface InvoiceDocumentProps {
  order: OrderDetail;
  storeName: string;
  storeLogo: string | null;
  currency: string;
}

export function InvoiceDocument({
  order,
  storeName,
  storeLogo,
  currency,
}: InvoiceDocumentProps) {
  const addr = order.shippingAddress;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {storeLogo ? (
              // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf Image has no alt prop
              <Image src={storeLogo} style={styles.logo} />
            ) : null}
            <View>
              <Text style={styles.title}>{storeName}</Text>
              <Text style={styles.subtitle}>Invoice</Text>
            </View>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontWeight: "bold", fontSize: 12 }}>{order.orderNumber}</Text>
            <Text style={styles.subtitle}>
              {new Date(order.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Text>
            <Text style={{ marginTop: 4, color: "#007AFF" }}>
              {getStatusLabel(order.status)}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 40, marginBottom: 24 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            <Text style={{ fontWeight: "bold" }}>{order.customerName}</Text>
            <Text style={{ color: "#666" }}>{order.customerEmail}</Text>
            {order.customerPhone && (
              <Text style={{ color: "#666" }}>{order.customerPhone}</Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Ship To</Text>
            <Text>{addr.street}</Text>
            <Text>
              {addr.city}
              {addr.state ? `, ${addr.state}` : ""} {addr.postalCode}
            </Text>
            <Text>{addr.country}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.colProduct}>Product</Text>
              <Text style={styles.colQty}>Qty</Text>
              <Text style={styles.colPrice}>Price</Text>
              <Text style={styles.colTotal}>Total</Text>
            </View>
            {order.items.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.colProduct}>
                  {item.title}
                  {item.variant
                    ? ` (${Object.entries(item.variant)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(", ")})`
                    : ""}
                </Text>
                <Text style={styles.colQty}>{item.quantity}</Text>
                <Text style={styles.colPrice}>{formatAmount(item.price, currency)}</Text>
                <Text style={styles.colTotal}>
                  {formatAmount(item.price * item.quantity, currency)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={{ color: "#666" }}>Subtotal</Text>
            <Text style={{ width: 80, textAlign: "right" }}>
              {formatAmount(order.subtotal, currency)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={{ color: "#666" }}>Shipping</Text>
            <Text style={{ width: 80, textAlign: "right" }}>
              {formatAmount(order.shipping, currency)}
            </Text>
          </View>
          {order.discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={{ color: "#16a34a" }}>
                Discount{order.couponCode ? ` (${order.couponCode})` : ""}
              </Text>
              <Text style={{ width: 80, textAlign: "right", color: "#16a34a" }}>
                −{formatAmount(order.discount, currency)}
              </Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={{ color: "#666" }}>Tax</Text>
            <Text style={{ width: 80, textAlign: "right" }}>
              {formatAmount(order.tax, currency)}
            </Text>
          </View>
          <View style={styles.grandTotal}>
            <Text style={{ fontWeight: "bold", marginRight: 16 }}>Total</Text>
            <Text
              style={{
                fontWeight: "bold",
                width: 80,
                textAlign: "right",
                color: "#007AFF",
              }}
            >
              {formatAmount(order.total, currency)}
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Thank you for your purchase · Powered by Ettajer
        </Text>
      </Page>
    </Document>
  );
}
