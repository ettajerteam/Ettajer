import { prisma } from "@/lib/db";

function normalizeDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/\.$/, "");
}

export interface EmailIdentityRow {
  id: string;
  email: string;
  displayName: string | null;
  purpose: string;
  status: string;
  isDefault: boolean;
  domainId: string | null;
  storeEmailProviderId: string | null;
  createdAt: string;
  updatedAt: string;
}

export function serializeEmailIdentity(row: {
  id: string;
  email: string;
  displayName: string | null;
  purpose: string;
  status: string;
  isDefault: boolean;
  domainId: string | null;
  storeEmailProviderId: string | null;
  createdAt: Date;
  updatedAt: Date;
}): EmailIdentityRow {
  return {
    id: row.id,
    email: row.email,
    displayName: row.displayName,
    purpose: row.purpose,
    status: row.status,
    isDefault: row.isDefault,
    domainId: row.domainId,
    storeEmailProviderId: row.storeEmailProviderId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listEmailIdentities(storeId: string) {
  const rows = await prisma.emailIdentity.findMany({
    where: { storeId },
    orderBy: [{ isDefault: "desc" }, { email: "asc" }],
  });
  return rows.map(serializeEmailIdentity);
}

export async function upsertEmailIdentity(input: {
  storeId: string;
  id?: string;
  email: string;
  displayName?: string | null;
  purpose?: string;
  isDefault?: boolean;
  storeEmailProviderId?: string | null;
}) {
  const email = input.email.trim().toLowerCase();
  if (!email.includes("@")) throw new Error("Enter a valid email address");
  const domainPart = email.split("@")[1];
  const domain = normalizeDomain(domainPart);

  let domainRow = await prisma.emailSendingDomain.findFirst({
    where: { storeId: input.storeId, domain },
  });
  if (!domainRow) {
    domainRow = await prisma.emailSendingDomain.create({
      data: {
        storeId: input.storeId,
        domain,
        provider: "resend",
        spfStatus: "pending",
        dkimStatus: "pending",
        dmarcStatus: "pending",
        verificationStatus: "pending",
      },
    });
  }

  const verified =
    domainRow.verificationStatus === "verified" ||
    (domainRow.spfStatus === "verified" &&
      domainRow.dkimStatus === "verified" &&
      domainRow.dmarcStatus === "verified");

  const data = {
    email,
    displayName: input.displayName?.trim() || null,
    purpose: input.purpose || "both",
    status: verified ? "verified" : "pending",
    domainId: domainRow.id,
    storeEmailProviderId: input.storeEmailProviderId ?? null,
    isDefault: Boolean(input.isDefault),
  };

  const row = input.id
    ? await prisma.emailIdentity.update({
        where: { id: input.id },
        data,
      })
    : await prisma.emailIdentity.create({
        data: { storeId: input.storeId, ...data },
      });

  if (row.isDefault) {
    await prisma.emailIdentity.updateMany({
      where: {
        storeId: input.storeId,
        id: { not: row.id },
        isDefault: true,
      },
      data: { isDefault: false },
    });
  }

  return serializeEmailIdentity(row);
}

export async function deleteEmailIdentity(storeId: string, id: string) {
  const row = await prisma.emailIdentity.findFirst({
    where: { id, storeId },
    select: { id: true },
  });
  if (!row) throw new Error("Identity not found");
  await prisma.emailIdentity.delete({ where: { id } });
}

export async function recheckEmailIdentity(storeId: string, id: string) {
  const row = await prisma.emailIdentity.findFirst({
    where: { id, storeId },
    include: { domain: true },
  });
  if (!row) throw new Error("Identity not found");
  if (!row.domain) {
    return serializeEmailIdentity(row);
  }
  const { verifySendingDomain } = await import(
    "@/lib/email-marketing/sending-domains"
  );
  await verifySendingDomain(storeId, row.domain.id);
  const domain = await prisma.emailSendingDomain.findUnique({
    where: { id: row.domain.id },
  });
  const verified =
    domain?.verificationStatus === "verified" ||
    (domain?.spfStatus === "verified" &&
      domain?.dkimStatus === "verified" &&
      domain?.dmarcStatus === "verified");
  const updated = await prisma.emailIdentity.update({
    where: { id },
    data: { status: verified ? "verified" : "failed" },
  });
  return serializeEmailIdentity(updated);
}
