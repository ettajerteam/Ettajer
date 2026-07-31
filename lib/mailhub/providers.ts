import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import {
  decryptSecretPayload,
  encryptSecretPayload,
  maskSecret,
} from "@/lib/mailhub/crypto";
import {
  createMailHubAdapter,
  platformManagedAvailable,
} from "@/lib/mailhub/adapters";
import {
  formatFromHeader,
  isMailHubProviderKind,
  MAILHUB_PROVIDER_KINDS,
  MAILHUB_PROVIDER_LABELS,
  type MailHubProviderConfig,
  type MailHubProviderKind,
  type MailHubPurpose,
  type MailHubSendMessage,
  type MailHubSendResult,
} from "@/lib/mailhub/types";
import { getEmailFrom } from "@/lib/resend";

export interface StoreEmailProviderRow {
  id: string;
  name: string;
  kind: MailHubProviderKind | string;
  kindLabel: string;
  status: string;
  isDefaultMarketing: boolean;
  isDefaultTransactional: boolean;
  publicConfig: Record<string, unknown>;
  /** Masked hints only — never raw secrets */
  secretHints: Record<string, string | null>;
  lastTestAt: string | null;
  lastTestOk: boolean | null;
  lastTestLatencyMs: number | null;
  lastTestError: string | null;
  createdAt: string;
  updatedAt: string;
}

function asPublicConfig(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return {};
}

function secretHintsFromConfig(config: MailHubProviderConfig) {
  return {
    apiKey: maskSecret(config.apiKey),
    serverToken: maskSecret(config.serverToken),
    password: maskSecret(config.password),
    secretAccessKey: maskSecret(config.secretAccessKey),
    webhookSecret: maskSecret(config.webhookSecret),
  };
}

export function serializeStoreEmailProvider(row: {
  id: string;
  name: string;
  kind: string;
  status: string;
  isDefaultMarketing: boolean;
  isDefaultTransactional: boolean;
  encryptedConfig: string;
  publicConfig: unknown;
  lastTestAt: Date | null;
  lastTestOk: boolean | null;
  lastTestLatencyMs: number | null;
  lastTestError: string | null;
  createdAt: Date;
  updatedAt: Date;
}): StoreEmailProviderRow {
  let hints: Record<string, string | null> = {};
  try {
    const cfg = decryptSecretPayload<MailHubProviderConfig>(row.encryptedConfig);
    hints = secretHintsFromConfig(cfg);
  } catch {
    hints = {};
  }
  return {
    id: row.id,
    name: row.name,
    kind: row.kind,
    kindLabel:
      MAILHUB_PROVIDER_LABELS[row.kind as MailHubProviderKind] || row.kind,
    status: row.status,
    isDefaultMarketing: row.isDefaultMarketing,
    isDefaultTransactional: row.isDefaultTransactional,
    publicConfig: asPublicConfig(row.publicConfig),
    secretHints: hints,
    lastTestAt: row.lastTestAt?.toISOString() ?? null,
    lastTestOk: row.lastTestOk,
    lastTestLatencyMs: row.lastTestLatencyMs,
    lastTestError: row.lastTestError,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function listMailHubProviderCatalog() {
  return MAILHUB_PROVIDER_KINDS.map((kind) => ({
    kind,
    label: MAILHUB_PROVIDER_LABELS[kind],
    available:
      kind === "ettajer_managed" ? platformManagedAvailable() : true,
    requiresSecrets: kind !== "ettajer_managed",
  }));
}

export async function listStoreEmailProviders(storeId: string) {
  const rows = await prisma.storeEmailProvider.findMany({
    where: { storeId },
    orderBy: [{ isDefaultMarketing: "desc" }, { updatedAt: "desc" }],
  });
  return rows.map(serializeStoreEmailProvider);
}

function buildPublicConfig(
  kind: MailHubProviderKind,
  config: MailHubProviderConfig
): Record<string, unknown> {
  return {
    host: config.host || null,
    port: config.port || null,
    encryption: config.encryption || null,
    region: config.region || null,
    domain: config.domain || null,
    fromEmail: config.fromEmail || null,
    fromName: config.fromName || null,
    username: config.username || null,
    hasApiKey: Boolean(config.apiKey || config.serverToken),
  };
}

export async function upsertStoreEmailProvider(input: {
  storeId: string;
  id?: string;
  name: string;
  kind: string;
  status?: string;
  isDefaultMarketing?: boolean;
  isDefaultTransactional?: boolean;
  config: MailHubProviderConfig;
}) {
  if (!isMailHubProviderKind(input.kind)) {
    throw new Error("Unsupported email provider");
  }
  const name = input.name.trim();
  if (!name) throw new Error("Name is required");

  let config = { ...input.config };
  if (input.id) {
    const existing = await prisma.storeEmailProvider.findFirst({
      where: { id: input.id, storeId: input.storeId },
    });
    if (!existing) throw new Error("Provider not found");
    try {
      const prev = decryptSecretPayload<MailHubProviderConfig>(
        existing.encryptedConfig
      );
      // Keep previous secrets when UI sends empty / masked
      for (const key of [
        "apiKey",
        "serverToken",
        "password",
        "secretAccessKey",
        "webhookSecret",
      ] as const) {
        const next = config[key];
        if (
          next == null ||
          next === "" ||
          (typeof next === "string" && next.startsWith("••••"))
        ) {
          config[key] = prev[key];
        }
      }
    } catch {
      // replace fully
    }
  }

  if (input.kind === "ettajer_managed") {
    config = {
      fromEmail: config.fromEmail,
      fromName: config.fromName,
    };
  }

  const encryptedConfig = encryptSecretPayload(config);
  const publicConfig = buildPublicConfig(input.kind, config);

  const status = input.status || "active";

  const row = input.id
    ? await prisma.storeEmailProvider.update({
        where: { id: input.id },
        data: {
          name,
          kind: input.kind,
          status,
          encryptedConfig,
          publicConfig: publicConfig as Prisma.InputJsonValue,
          ...(input.isDefaultMarketing != null
            ? { isDefaultMarketing: input.isDefaultMarketing }
            : {}),
          ...(input.isDefaultTransactional != null
            ? { isDefaultTransactional: input.isDefaultTransactional }
            : {}),
        },
      })
    : await prisma.storeEmailProvider.create({
        data: {
          storeId: input.storeId,
          name,
          kind: input.kind,
          status,
          encryptedConfig,
          publicConfig: publicConfig as Prisma.InputJsonValue,
          isDefaultMarketing: Boolean(input.isDefaultMarketing),
          isDefaultTransactional: Boolean(input.isDefaultTransactional),
        },
      });

  if (row.isDefaultMarketing) {
    await prisma.storeEmailProvider.updateMany({
      where: {
        storeId: input.storeId,
        id: { not: row.id },
        isDefaultMarketing: true,
      },
      data: { isDefaultMarketing: false },
    });
  }
  if (row.isDefaultTransactional) {
    await prisma.storeEmailProvider.updateMany({
      where: {
        storeId: input.storeId,
        id: { not: row.id },
        isDefaultTransactional: true,
      },
      data: { isDefaultTransactional: false },
    });
  }

  return serializeStoreEmailProvider(row);
}

export async function deleteStoreEmailProvider(storeId: string, id: string) {
  const row = await prisma.storeEmailProvider.findFirst({
    where: { id, storeId },
    select: { id: true },
  });
  if (!row) throw new Error("Provider not found");
  await prisma.storeEmailProvider.delete({ where: { id } });
}

export async function setDefaultStoreEmailProvider(input: {
  storeId: string;
  id: string;
  purpose: "marketing" | "transactional" | "both";
}) {
  const row = await prisma.storeEmailProvider.findFirst({
    where: { id: input.id, storeId: input.storeId },
  });
  if (!row) throw new Error("Provider not found");

  if (input.purpose === "marketing" || input.purpose === "both") {
    await prisma.storeEmailProvider.updateMany({
      where: { storeId: input.storeId, isDefaultMarketing: true },
      data: { isDefaultMarketing: false },
    });
  }
  if (input.purpose === "transactional" || input.purpose === "both") {
    await prisma.storeEmailProvider.updateMany({
      where: { storeId: input.storeId, isDefaultTransactional: true },
      data: { isDefaultTransactional: false },
    });
  }

  const updated = await prisma.storeEmailProvider.update({
    where: { id: input.id },
    data: {
      status: "active",
      ...(input.purpose === "marketing" || input.purpose === "both"
        ? { isDefaultMarketing: true }
        : {}),
      ...(input.purpose === "transactional" || input.purpose === "both"
        ? { isDefaultTransactional: true }
        : {}),
    },
  });
  return serializeStoreEmailProvider(updated);
}

async function loadActiveProvider(
  storeId: string,
  purpose: MailHubPurpose
) {
  const where =
    purpose === "transactional"
      ? { storeId, status: "active", isDefaultTransactional: true }
      : purpose === "marketing"
        ? { storeId, status: "active", isDefaultMarketing: true }
        : { storeId, status: "active" };

  let row = await prisma.storeEmailProvider.findFirst({
    where,
    orderBy: { updatedAt: "desc" },
  });
  if (!row && purpose !== "test") {
    row = await prisma.storeEmailProvider.findFirst({
      where: { storeId, status: "active" },
      orderBy: { updatedAt: "desc" },
    });
  }
  return row;
}

export async function resolveMailHubTransport(input: {
  storeId: string;
  purpose: MailHubPurpose;
  providerId?: string | null;
  fromOverride?: string | null;
}) {
  const row = input.providerId
    ? await prisma.storeEmailProvider.findFirst({
        where: {
          id: input.providerId,
          storeId: input.storeId,
          status: { in: ["active", "draft"] },
        },
      })
    : await loadActiveProvider(input.storeId, input.purpose);

  if (!row) {
    // Platform fallback — Ettajer Managed / env ESP
    const kind: MailHubProviderKind = "ettajer_managed";
    const adapter = createMailHubAdapter(kind, {});
    return {
      providerRow: null as null,
      kind,
      adapter,
      from: input.fromOverride || getEmailFrom(),
    };
  }

  if (!isMailHubProviderKind(row.kind)) {
    throw new Error(`Unknown provider kind: ${row.kind}`);
  }
  const config = decryptSecretPayload<MailHubProviderConfig>(
    row.encryptedConfig
  );
  const adapter = createMailHubAdapter(row.kind, config);

  let from = input.fromOverride || null;
  if (!from) {
    const identity = await prisma.emailIdentity.findFirst({
      where: {
        storeId: input.storeId,
        status: "verified",
        OR: [{ isDefault: true }, { purpose: { in: ["both", input.purpose] } }],
      },
      orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
    });
    if (identity) {
      from = formatFromHeader(identity.displayName, identity.email);
    } else if (config.fromEmail) {
      from = formatFromHeader(config.fromName, config.fromEmail);
    } else {
      from = getEmailFrom();
    }
  }

  return { providerRow: row, kind: row.kind, adapter, from };
}

export async function sendViaMailHub(input: {
  storeId: string;
  purpose: MailHubPurpose;
  message: MailHubSendMessage;
  providerId?: string | null;
  category?: string | null;
  campaignId?: string | null;
  automationId?: string | null;
  emailJobId?: string | null;
}): Promise<MailHubSendResult & { logId?: string }> {
  const transport = await resolveMailHubTransport({
    storeId: input.storeId,
    purpose: input.purpose,
    providerId: input.providerId,
    fromOverride: input.message.from,
  });

  const toList = Array.isArray(input.message.to)
    ? input.message.to
    : [input.message.to];
  const primaryTo = toList[0] || "";

  const log = await prisma.emailLog.create({
    data: {
      storeId: input.storeId,
      storeEmailProviderId: transport.providerRow?.id ?? null,
      provider: transport.kind,
      toEmail: primaryTo.toLowerCase(),
      fromEmail: transport.from,
      subject: input.message.subject.slice(0, 500),
      type: input.purpose === "test" ? "test" : input.purpose,
      category: input.category ?? null,
      campaignId: input.campaignId ?? null,
      automationId: input.automationId ?? null,
      emailJobId: input.emailJobId ?? null,
      status: "queued",
    },
  });

  const result = await transport.adapter.send({
    ...input.message,
    from: transport.from,
  });

  await prisma.emailLog.update({
    where: { id: log.id },
    data: {
      status: result.success ? "sent" : "failed",
      providerMessageId: result.id ?? null,
      latencyMs: result.latencyMs ?? null,
      error: result.error?.slice(0, 2000) ?? null,
    },
  });

  return { ...result, logId: log.id };
}

export async function testStoreEmailProvider(input: {
  storeId: string;
  providerId: string;
  toEmail: string;
}) {
  const row = await prisma.storeEmailProvider.findFirst({
    where: { id: input.providerId, storeId: input.storeId },
  });
  if (!row) throw new Error("Provider not found");
  if (!isMailHubProviderKind(row.kind)) {
    throw new Error("Unsupported provider");
  }

  const config = decryptSecretPayload<MailHubProviderConfig>(
    row.encryptedConfig
  );
  const adapter = createMailHubAdapter(row.kind, config);
  const connection = await adapter.testConnection();

  let sendResult: MailHubSendResult | null = null;
  if (connection.ok) {
    sendResult = await sendViaMailHub({
      storeId: input.storeId,
      purpose: "test",
      providerId: row.id,
      category: "mailhub.test",
      message: {
        to: input.toEmail.trim().toLowerCase(),
        subject: `Ettajer test · ${row.name}`,
        html: `<div style="font-family:system-ui,sans-serif;padding:24px">
          <h1 style="font-size:18px;margin:0 0 8px">Email connection works</h1>
          <p style="margin:0;color:#666;font-size:14px">Provider <strong>${adapter.label}</strong> accepted this test message.</p>
        </div>`,
      },
    });
  }

  const updated = await prisma.storeEmailProvider.update({
    where: { id: row.id },
    data: {
      lastTestAt: new Date(),
      lastTestOk: connection.ok && (sendResult?.success ?? true),
      lastTestLatencyMs:
        sendResult?.latencyMs ?? connection.latencyMs ?? null,
      lastTestError:
        !connection.ok
          ? connection.message
          : sendResult && !sendResult.success
            ? sendResult.error || "Send failed"
            : null,
      status:
        connection.ok && (sendResult?.success ?? true) ? "active" : row.status,
    },
  });

  return {
    connection,
    send: sendResult,
    provider: serializeStoreEmailProvider(updated),
  };
}

export async function ensureEttajerManagedProvider(storeId: string) {
  const existing = await prisma.storeEmailProvider.findFirst({
    where: { storeId, kind: "ettajer_managed" },
  });
  if (existing) return serializeStoreEmailProvider(existing);
  if (!platformManagedAvailable()) return null;

  const hasAny = await prisma.storeEmailProvider.count({ where: { storeId } });
  return upsertStoreEmailProvider({
    storeId,
    name: "Ettajer Managed",
    kind: "ettajer_managed",
    status: "active",
    isDefaultMarketing: hasAny === 0,
    isDefaultTransactional: hasAny === 0,
    config: {},
  });
}
