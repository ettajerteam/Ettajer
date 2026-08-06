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
import type { InvoiceTemplateId } from "@/lib/shop-preferences";

function buildStyles(template: InvoiceTemplateId) {
  const accent = template === "minimal" ? "#666" : "#007AFF";
  const titleSize = template === "minimal" ? 18 : template === "branded" ? 26 : 24;
  const logoSize = template === "branded" ? 56 : 48;
  const borderWeight = template === "minimal" ? 0.5 : 1;
  const grandBorderWeight = template === "minimal" ? 1 : 2;

  return StyleSheet.create({
    page: { padding: 40, fontSize: 10, color: "#1a1a1a" },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: template === "branded" ? 36 : 32,
      ...(template === "branded"
        ? {
            backgroundColor: "#f0f7ff",
            marginHorizontal: -40,
            marginTop: -40,
            paddingHorizontal: 40,
            paddingTop: 32,
            paddingBottom: 24,
          }
        : {}),
    },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    logo: {
      width: logoSize,
      height: logoSize,
      borderRadius: template === "branded" ? 10 : 8,
      objectFit: "cover",
    },
    title: { fontSize: titleSize, fontWeight: "bold", color: accent },
    subtitle: { fontSize: 10, color: "#666", marginTop: 4 },
    section: { marginBottom: 20 },
    sectionTitle: {
      fontSize: template === "minimal" ? 9 : 11,
      fontWeight: "bold",
      marginBottom: 8,
      color: template === "minimal" ? "#888" : "#333",
      textTransform: "uppercase",
      letterSpacing: template === "minimal" ? 0.5 : 1,
    },
    table: { marginTop: 8 },
    tableHeader: {
      flexDirection: "row",
      borderBottomWidth: borderWeight,
      borderBottomColor: template === "minimal" ? "#eee" : "#e0e0e0",
      paddingBottom: 6,
      marginBottom: 6,
    },
    tableRow: {
      flexDirection: "row",
      paddingVertical: 6,
      borderBottomWidth: borderWeight,
      borderBottomColor: template === "minimal" ? "#f5f5f5" : "#f0f0f0",
    },
    colProduct: { flex: 3 },
    colQty: { flex: 1, textAlign: "center" },
    colPrice: { flex: 1, textAlign: "right" },
    colTotal: { flex: 1, textAlign: "right" },
    totals: { marginTop: 16, alignItems: "flex-end" },
    totalRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      width: 200,
      marginBottom: 4,
    },
    grandTotal: {
      flexDirection: "row",
      justifyContent: "flex-end",
      width: 200,
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: grandBorderWeight,
      borderTopColor: accent,
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
}

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
  documentTitle?: string;
  footerNote?: string;
  showLogo?: boolean;
  showPaymentStatus?: boolean;
  companyDetails?: string;
  template?: InvoiceTemplateId;
  showTax?: boolean;
  taxLabel?: string;
}

export function InvoiceDocument({
  order,
  storeName,
  storeLogo,
  currency,
  documentTitle = "Invoice",
  footerNote = "Thank you for your purchase",
  showLogo = true,
  showPaymentStatus = true,
  companyDetails = "",
  template = "classic",
  showTax = true,
  taxLabel = "Tax",
}: InvoiceDocumentProps) {
  const styles = buildStyles(template);
  const accent = template === "minimal" ? "#666" : "#007AFF";
  const addr = order.shippingAddress;
  const companyLines = companyDetails
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const footerText = footerNote.trim()
    ? `${footerNote.trim()} · Powered by Ettajer`
    : "Thank you for your purchase · Powered by Ettajer";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {showLogo !== false && storeLogo ? (
              // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf Image has no alt prop
              <Image src={storeLogo} style={styles.logo} />
            ) : null}
            <View>
              <Text style={styles.title}>{storeName}</Text>
              <Text style={styles.subtitle}>{documentTitle}</Text>
              {companyLines.map((line, index) => (
                <Text key={index} style={{ ...styles.subtitle, marginTop: index === 0 ? 2 : 0 }}>
                  {line}
                </Text>
              ))}
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
            {showPaymentStatus !== false && (
              <>
                <Text style={{ marginTop: 4, color: accent }}>
                  {getStatusLabel(order.status)}
                </Text>
                {order.paymentMethod && (
                  <Text style={{ marginTop: 2, color: "#666", fontSize: 9 }}>
                    {order.paymentMethod === "cod"
                      ? "Cash on Delivery"
                      : order.paymentMethod === "stripe"
                        ? "Card"
                        : order.paymentMethod === "paypal"
                          ? "PayPal"
                          : "Other"}{" "}
                    · {order.paymentStatus}
                  </Text>
                )}
              </>
            )}
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
          {showTax !== false && order.tax > 0 ? (
            <View style={styles.totalRow}>
              <Text style={{ color: "#666" }}>{taxLabel || "Tax"}</Text>
              <Text style={{ width: 80, textAlign: "right" }}>
                {formatAmount(order.tax, currency)}
              </Text>
            </View>
          ) : null}
          <View style={styles.grandTotal}>
            <Text style={{ fontWeight: "bold", marginRight: 16 }}>Total</Text>
            <Text
              style={{
                fontWeight: "bold",
                width: 80,
                textAlign: "right",
                color: accent,
              }}
            >
              {formatAmount(order.total, currency)}
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>{footerText}</Text>
      </Page>
    </Document>
  );
}
