import { prisma } from "@/lib/db";

export interface EmailLogRow {
  id: string;
  provider: string;
  toEmail: string;
  fromEmail: string;
  subject: string;
  type: string;
  category: string | null;
  status: string;
  campaignId: string | null;
  latencyMs: number | null;
  error: string | null;
  providerMessageId: string | null;
  createdAt: string;
}

export async function listEmailLogs(
  storeId: string,
  options?: {
    q?: string;
    status?: string;
    type?: string;
    page?: number;
    pageSize?: number;
  }
) {
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, options?.pageSize ?? 25));
  const q = options?.q?.trim().toLowerCase() || "";

  const where = {
    storeId,
    ...(options?.status && options.status !== "all"
      ? { status: options.status }
      : {}),
    ...(options?.type && options.type !== "all" ? { type: options.type } : {}),
    ...(q
      ? {
          OR: [
            { toEmail: { contains: q, mode: "insensitive" as const } },
            { subject: { contains: q, mode: "insensitive" as const } },
            { fromEmail: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.emailLog.count({ where }),
    prisma.emailLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    logs: rows.map(
      (row): EmailLogRow => ({
        id: row.id,
        provider: row.provider,
        toEmail: row.toEmail,
        fromEmail: row.fromEmail,
        subject: row.subject,
        type: row.type,
        category: row.category,
        status: row.status,
        campaignId: row.campaignId,
        latencyMs: row.latencyMs,
        error: row.error,
        providerMessageId: row.providerMessageId,
        createdAt: row.createdAt.toISOString(),
      })
    ),
  };
}

export async function updateEmailLogStatusByProviderMessage(input: {
  providerMessageId: string;
  status: string;
  storeId?: string;
}) {
  const where = {
    providerMessageId: input.providerMessageId,
    ...(input.storeId ? { storeId: input.storeId } : {}),
  };
  await prisma.emailLog.updateMany({
    where,
    data: { status: input.status },
  });
}
