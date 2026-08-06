import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import {
  getActiveEmailProviderId,
  getEmailSendAdapter,
} from "@/lib/email-marketing/providers";
import { verifyProviderDns } from "@/lib/email-marketing/providers/dns-verify";
import type {
  EmailDnsStatus,
  EmailSendProviderId,
} from "@/lib/email-marketing/providers/types";
import { isEmailSendProviderId } from "@/lib/email-marketing/providers/types";

export interface EmailSendingDomainRow {
  id: string;
  domain: string;
  provider: string;
  spfStatus: EmailDnsStatus | string;
  dkimStatus: EmailDnsStatus | string;
  dmarcStatus: EmailDnsStatus | string;
  spfCheckedAt: string | null;
  dkimCheckedAt: string | null;
  dmarcCheckedAt: string | null;
  lastCheckDetail: unknown;
  expectedRecords: unknown;
  createdAt: string;
  updatedAt: string;
}

function normalizeDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/\.$/, "");
}

export function serializeSendingDomain(row: {
  id: string;
  domain: string;
  provider: string;
  spfStatus: string;
  dkimStatus: string;
  dmarcStatus: string;
  returnPathStatus?: string;
  mxStatus?: string;
  verificationStatus?: string;
  isDefault?: boolean;
  spfCheckedAt: Date | null;
  dkimCheckedAt: Date | null;
  dmarcCheckedAt: Date | null;
  lastCheckDetail: unknown;
  expectedRecords: unknown;
  createdAt: Date;
  updatedAt: Date;
}): EmailSendingDomainRow & {
  returnPathStatus: string;
  mxStatus: string;
  verificationStatus: string;
  isDefault: boolean;
} {
  return {
    id: row.id,
    domain: row.domain,
    provider: row.provider,
    spfStatus: row.spfStatus,
    dkimStatus: row.dkimStatus,
    dmarcStatus: row.dmarcStatus,
    returnPathStatus: row.returnPathStatus ?? "pending",
    mxStatus: row.mxStatus ?? "unknown",
    verificationStatus: row.verificationStatus ?? "pending",
    isDefault: Boolean(row.isDefault),
    spfCheckedAt: row.spfCheckedAt?.toISOString() ?? null,
    dkimCheckedAt: row.dkimCheckedAt?.toISOString() ?? null,
    dmarcCheckedAt: row.dmarcCheckedAt?.toISOString() ?? null,
    lastCheckDetail: row.lastCheckDetail,
    expectedRecords: row.expectedRecords,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listSendingDomains(storeId: string) {
  const rows = await prisma.emailSendingDomain.findMany({
    where: { storeId },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(serializeSendingDomain);
}

export async function upsertSendingDomain(input: {
  storeId: string;
  domain: string;
  provider?: string | null;
}) {
  const domain = normalizeDomain(input.domain);
  if (!domain || !domain.includes(".")) {
    throw new Error("Enter a valid domain (e.g. example.com)");
  }
  const providerRaw = (input.provider || getActiveEmailProviderId()).toLowerCase();
  const provider: EmailSendProviderId = isEmailSendProviderId(providerRaw)
    ? providerRaw
    : getActiveEmailProviderId();

  const expectations = getEmailSendAdapter(provider).getDnsExpectations(domain);

  const row = await prisma.emailSendingDomain.upsert({
    where: { storeId_domain: { storeId: input.storeId, domain } },
    create: {
      storeId: input.storeId,
      domain,
      provider,
      expectedRecords: expectations as unknown as Prisma.InputJsonValue,
      spfStatus: "pending",
      dkimStatus: "pending",
      dmarcStatus: "pending",
    },
    update: {
      provider,
      expectedRecords: expectations as unknown as Prisma.InputJsonValue,
    },
  });
  return serializeSendingDomain(row);
}

export async function verifySendingDomain(storeId: string, domainId: string) {
  const row = await prisma.emailSendingDomain.findFirst({
    where: { id: domainId, storeId },
  });
  if (!row) throw new Error("Domain not found");

  const provider = isEmailSendProviderId(row.provider)
    ? row.provider
    : getActiveEmailProviderId();
  const expectations = getEmailSendAdapter(provider).getDnsExpectations(
    row.domain
  );
  const result = await verifyProviderDns(expectations);
  const now = new Date();

  const updated = await prisma.emailSendingDomain.update({
    where: { id: row.id },
    data: {
      provider,
      spfStatus: result.spf.status,
      dkimStatus: result.dkim.status,
      dmarcStatus: result.dmarc.status,
      verificationStatus: result.allVerified
        ? "verified"
        : result.spf.status === "failed" && result.dkim.status === "failed"
          ? "failed"
          : "pending",
      spfCheckedAt: now,
      dkimCheckedAt: now,
      dmarcCheckedAt: now,
      expectedRecords: expectations as unknown as Prisma.InputJsonValue,
      lastCheckDetail: {
        spf: result.spf,
        dkim: result.dkim,
        dmarc: result.dmarc,
        allVerified: result.allVerified,
        checkedAt: now.toISOString(),
      } as unknown as Prisma.InputJsonValue,
    },
  });

  return {
    domain: serializeSendingDomain(updated),
    checks: result,
  };
}

export async function deleteSendingDomain(storeId: string, domainId: string) {
  const existing = await prisma.emailSendingDomain.findFirst({
    where: { id: domainId, storeId },
    select: { id: true },
  });
  if (!existing) throw new Error("Domain not found");
  await prisma.emailSendingDomain.delete({ where: { id: domainId } });
}
