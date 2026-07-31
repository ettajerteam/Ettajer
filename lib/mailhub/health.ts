import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { getEmailSendAdapter } from "@/lib/email-marketing/providers";
import { isEmailSendProviderId } from "@/lib/email-marketing/providers/types";
import { verifyProviderDns } from "@/lib/email-marketing/providers/dns-verify";
import { createMailHubAdapter } from "@/lib/mailhub/adapters";
import { decryptSecretPayload } from "@/lib/mailhub/crypto";
import {
  isMailHubProviderKind,
  type MailHubProviderConfig,
} from "@/lib/mailhub/types";

export interface MailHubHealthBundle {
  healthScore: number;
  bounceRate: number;
  complaintRate: number;
  openRate: number;
  clickRate: number;
  domainReputation: string;
  recommendations: string[];
  domains: Array<{
    id: string;
    domain: string;
    verificationStatus: string;
    spfStatus: string;
    dkimStatus: string;
    dmarcStatus: string;
    returnPathStatus: string;
    isDefault: boolean;
    expectedRecords: unknown;
  }>;
  scoredAt: string;
}

export async function scoreStoreEmailHealth(
  storeId: string
): Promise<MailHubHealthBundle> {
  const since = new Date(Date.now() - 30 * 86_400_000);
  const [events, domains, logs] = await Promise.all([
    prisma.emailEvent.groupBy({
      by: ["type"],
      where: { storeId, occurredAt: { gte: since } },
      _count: { _all: true },
    }),
    prisma.emailSendingDomain.findMany({
      where: { storeId },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.emailLog.groupBy({
      by: ["status"],
      where: { storeId, createdAt: { gte: since } },
      _count: { _all: true },
    }),
  ]);

  const eventCounts: Record<string, number> = {};
  for (const e of events) eventCounts[e.type] = e._count._all;
  const logCounts: Record<string, number> = {};
  for (const l of logs) logCounts[l.status] = l._count._all;

  const sent =
    (eventCounts.sent || 0) +
    (eventCounts.delivered || 0) +
    (logCounts.sent || 0);
  const delivered = eventCounts.delivered || sent;
  const opened = eventCounts.opened || 0;
  const clicked = eventCounts.clicked || 0;
  const bounced = (eventCounts.bounced || 0) + (logCounts.bounced || 0);
  const complained =
    (eventCounts.complained || 0) + (logCounts.complained || 0);

  const denom = Math.max(delivered, sent, 1);
  const bounceRate = Math.round((bounced / denom) * 1000) / 10;
  const complaintRate = Math.round((complained / denom) * 1000) / 10;
  const openRate = Math.round((opened / denom) * 1000) / 10;
  const clickRate = Math.round((clicked / denom) * 1000) / 10;

  const recommendations: string[] = [];
  let healthScore = 100;

  for (const d of domains) {
    if (d.spfStatus !== "verified") {
      recommendations.push(`Missing or invalid SPF on ${d.domain}`);
      healthScore -= 12;
    }
    if (d.dkimStatus !== "verified") {
      recommendations.push(`Weak or missing DKIM on ${d.domain}`);
      healthScore -= 15;
    }
    if (d.dmarcStatus !== "verified") {
      recommendations.push(`Add DMARC for ${d.domain}`);
      healthScore -= 10;
    }
  }
  if (domains.length === 0) {
    recommendations.push("Connect a sending domain to authenticate mail");
    healthScore -= 25;
  }
  if (bounceRate > 5) {
    recommendations.push("High bounce rate — clean your list");
    healthScore -= Math.min(25, Math.round(bounceRate));
  }
  if (complaintRate > 0.3) {
    recommendations.push("Complaint rate elevated — review content & consent");
    healthScore -= 20;
  }

  healthScore = Math.max(0, Math.min(100, healthScore));
  const domainReputation =
    healthScore >= 80 ? "good" : healthScore >= 55 ? "fair" : "poor";

  await prisma.emailHealth.upsert({
    where: { storeId },
    create: {
      storeId,
      healthScore,
      bounceRate,
      complaintRate,
      openRate,
      clickRate,
      domainReputation,
      recommendations: recommendations as unknown as Prisma.InputJsonValue,
      scoredAt: new Date(),
    },
    update: {
      healthScore,
      bounceRate,
      complaintRate,
      openRate,
      clickRate,
      domainReputation,
      recommendations: recommendations as unknown as Prisma.InputJsonValue,
      scoredAt: new Date(),
    },
  });

  return {
    healthScore,
    bounceRate,
    complaintRate,
    openRate,
    clickRate,
    domainReputation,
    recommendations,
    domains: domains.map((d) => ({
      id: d.id,
      domain: d.domain,
      verificationStatus: d.verificationStatus,
      spfStatus: d.spfStatus,
      dkimStatus: d.dkimStatus,
      dmarcStatus: d.dmarcStatus,
      returnPathStatus: d.returnPathStatus,
      isDefault: d.isDefault,
      expectedRecords: d.expectedRecords,
    })),
    scoredAt: new Date().toISOString(),
  };
}

/**
 * Verify domain DNS and update aggregate verificationStatus (MailHub).
 */
export async function verifyMailHubDomain(storeId: string, domainId: string) {
  const row = await prisma.emailSendingDomain.findFirst({
    where: { id: domainId, storeId },
    include: { storeEmailProvider: true },
  });
  if (!row) throw new Error("Domain not found");

  let expectations =
    isEmailSendProviderId(row.provider)
      ? getEmailSendAdapter(row.provider).getDnsExpectations(row.domain)
      : getEmailSendAdapter("resend").getDnsExpectations(row.domain);

  if (
    row.storeEmailProvider &&
    isMailHubProviderKind(row.storeEmailProvider.kind)
  ) {
    try {
      const cfg = decryptSecretPayload<MailHubProviderConfig>(
        row.storeEmailProvider.encryptedConfig
      );
      const adapter = createMailHubAdapter(row.storeEmailProvider.kind, cfg);
      const records = adapter.getDnsRecords(row.domain);
      expectations = {
        provider: isEmailSendProviderId(row.provider) ? row.provider : "resend",
        records: records
          .filter((r) => r.purpose === "spf" || r.purpose === "dkim" || r.purpose === "dmarc")
          .map((r) => ({
            type: r.type === "MX" ? "TXT" : r.type,
            host: r.host,
            recommendedValue: r.recommendedValue,
            valueIncludes: r.valueIncludes,
            purpose: r.purpose as "spf" | "dkim" | "dmarc",
          })),
      };
    } catch {
      // keep platform expectations
    }
  }

  const detail = await verifyProviderDns(expectations);
  const now = new Date();
  const verificationStatus = detail.allVerified
    ? "verified"
    : detail.spf.status === "failed" && detail.dkim.status === "failed"
      ? "failed"
      : "pending";

  const updated = await prisma.emailSendingDomain.update({
    where: { id: row.id },
    data: {
      expectedRecords: expectations as unknown as Prisma.InputJsonValue,
      spfStatus: detail.spf.status,
      dkimStatus: detail.dkim.status,
      dmarcStatus: detail.dmarc.status,
      verificationStatus,
      spfCheckedAt: now,
      dkimCheckedAt: now,
      dmarcCheckedAt: now,
      lastCheckDetail: {
        spf: detail.spf,
        dkim: detail.dkim,
        dmarc: detail.dmarc,
        allVerified: detail.allVerified,
        checkedAt: now.toISOString(),
      } as unknown as Prisma.InputJsonValue,
    },
  });

  return updated;
}
