import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { buildFounderCardId, formatFounderNumber } from "@/lib/founder/constants";

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 36,
    paddingHorizontal: 36,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#171717",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  brand: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
    letterSpacing: 1.5,
  },
  brandSub: {
    fontSize: 7,
    color: "#737373",
    marginTop: 2,
    letterSpacing: 0.5,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#eff6ff",
    color: "#1d4ed8",
    fontSize: 8,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#171717",
    textAlign: "center",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 9,
    color: "#737373",
    textAlign: "center",
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  cardWrap: {
    alignItems: "center",
    marginBottom: 14,
  },
  cardImage: {
    width: 320,
    height: 202,
    borderRadius: 10,
    objectFit: "contain",
  },
  memberBox: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  memberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  memberName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#171717",
    marginBottom: 2,
  },
  founderNo: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#007AFF",
  },
  memberMeta: {
    fontSize: 8,
    color: "#525252",
    marginBottom: 2,
    textAlign: "right",
  },
  bodyText: {
    fontSize: 8,
    color: "#525252",
    lineHeight: 1.45,
    marginBottom: 8,
  },
  benefitsTitle: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#737373",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  benefitsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  benefitRow: {
    flexDirection: "row",
    width: "50%",
    marginBottom: 4,
    paddingRight: 6,
    alignItems: "flex-start",
  },
  benefitDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#007AFF",
    marginTop: 3,
    marginRight: 5,
  },
  benefitText: {
    fontSize: 7.5,
    color: "#525252",
    flex: 1,
    lineHeight: 1.35,
  },
  footer: {
    position: "absolute",
    bottom: 22,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: "#a3a3a3",
  },
  signatureLine: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  signatureLabel: {
    fontSize: 7,
    color: "#a3a3a3",
    marginBottom: 2,
  },
  signatureName: {
    fontSize: 11,
    color: "#171717",
    fontStyle: "italic",
  },
});

const BENEFITS = [
  "Exclusive founder identity and badge",
  "Early access to new features",
  "Priority support from the Ettajer team",
  "Future rewards from Ettajer partners",
];

interface FounderMembershipPdfProps {
  name: string;
  founderNumber: number;
  cardPngBase64: string;
}

export function FounderMembershipPdf({
  name,
  founderNumber,
  cardPngBase64,
}: FounderMembershipPdfProps) {
  const displayName = name?.trim() || "Founding Merchant";
  const padded = String(founderNumber).padStart(4, "0");
  const cardId = buildFounderCardId(founderNumber);
  const issuedDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Document title={`Ettajer Founder Certificate #${padded}`}>
      <Page size="A4" style={styles.page} wrap={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>ETTAJER</Text>
            <Text style={styles.brandSub}>Morocco&apos;s COD Commerce Platform</Text>
          </View>
          <Text style={styles.badge}>{formatFounderNumber(founderNumber).toUpperCase()}</Text>
        </View>

        <Text style={styles.title}>Founding Merchant Certificate</Text>
        <Text style={styles.subtitle}>Early Access Program · First 100 Members</Text>

        <View style={styles.cardWrap}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf Image has no alt prop */}
          <Image src={`data:image/png;base64,${cardPngBase64}`} style={styles.cardImage} />
        </View>

        <View style={styles.memberBox}>
          <View style={styles.memberRow}>
            <View>
              <Text style={styles.memberName}>{displayName}</Text>
              <Text style={styles.founderNo}>You are {formatFounderNumber(founderNumber)}</Text>
            </View>
            <View>
              <Text style={styles.memberMeta}>ID: {cardId}</Text>
              <Text style={styles.memberMeta}>Issued: {issuedDate}</Text>
              <Text style={styles.memberMeta}>Status: Early Access</Text>
            </View>
          </View>

          <Text style={styles.bodyText}>
            This certificate confirms that the above-named merchant is officially recognized as a
            Founding Member of Ettajer — among the first 100 merchants in our early community.
            Your account is active; your store dashboard unlocks at launch and we will notify you
            by email.
          </Text>

          <Text style={styles.benefitsTitle}>Your Founder Benefits</Text>
          <View style={styles.benefitsGrid}>
            {BENEFITS.map((benefit) => (
              <View key={benefit} style={styles.benefitRow}>
                <View style={styles.benefitDot} />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>

          <View style={styles.signatureLine}>
            <View>
              <Text style={styles.signatureLabel}>Authorized Member</Text>
              <Text style={styles.signatureName}>{displayName}</Text>
            </View>
            <Text style={styles.footerText}>Non-transferable · Privileged Member</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© {new Date().getFullYear()} Ettajer · ettajer.com</Text>
        </View>
      </Page>
    </Document>
  );
}
