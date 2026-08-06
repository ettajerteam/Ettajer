import { createHash } from "crypto";
import { prisma } from "@/lib/db";

const META_GRAPH_VERSION = process.env.META_GRAPH_VERSION?.trim() || "v21.0";
const BATCH_SIZE = 10_000;

export type MetaAudienceListType = "purchasers" | "abandoners";

export interface MetaAdAccountOption {
  id: string;
  name: string;
}

export interface MetaAudienceContact {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

export interface MetaAudienceSyncResult {
  audienceId: string;
  list: MetaAudienceListType;
  uploaded: number;
  skipped: number;
  adAccountId: string;
  created: boolean;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function hashEmail(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (!normalized || !normalized.includes("@")) return null;
  return sha256(normalized);
}

function hashPhone(value: string | null | undefined): string | null {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  if (digits.length < 7) return null;
  return sha256(digits);
}

function hashName(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase().replace(/[^a-z]/g, "");
  if (!normalized) return null;
  return sha256(normalized);
}

function splitName(fullName: string | null | undefined): {
  firstName: string | null;
  lastName: string | null;
} {
  if (!fullName?.trim()) return { firstName: null, lastName: null };
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0]!, lastName: null };
  return {
    firstName: parts[0]!,
    lastName: parts.slice(1).join(" "),
  };
}

/** Normalize to act_123… form Meta expects. */
export function normalizeMetaAdAccountId(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("act_")) return trimmed;
  if (/^\d+$/.test(trimmed)) return `act_${trimmed}`;
  return null;
}

async function graphRequest<T>(
  method: "GET" | "POST",
  path: string,
  accessToken: string,
  body?: Record<string, unknown>
): Promise<T> {
  const url = new URL(`https://graph.facebook.com/${META_GRAPH_VERSION}${path}`);
  url.searchParams.set("access_token", accessToken);

  if (method === "GET" && body) {
    for (const [key, value] of Object.entries(body)) {
      if (value == null) continue;
      url.searchParams.set(
        key,
        typeof value === "string" ? value : JSON.stringify(value)
      );
    }
  }

  const res = await fetch(url.toString(), {
    method,
    cache: "no-store",
    headers:
      method === "POST"
        ? { "Content-Type": "application/json" }
        : undefined,
    body: method === "POST" && body ? JSON.stringify(body) : undefined,
  });

  const json = (await res.json()) as T & {
    error?: { message?: string; error_user_msg?: string; code?: number };
  };

  if (!res.ok || json.error) {
    throw new Error(
      json.error?.error_user_msg ||
        json.error?.message ||
        `Meta Graph error (${res.status})`
    );
  }

  return json;
}

export async function listMetaAdAccounts(
  accessToken: string
): Promise<MetaAdAccountOption[]> {
  const json = await graphRequest<{
    data?: Array<{ id?: string; account_id?: string; name?: string }>;
  }>("GET", "/me/adaccounts", accessToken, {
    fields: "name,account_id",
    limit: "100",
  });

  return (json.data ?? [])
    .map((account) => {
      const id = normalizeMetaAdAccountId(account.id ?? account.account_id);
      if (!id) return null;
      return {
        id,
        name: account.name?.trim() || id,
      };
    })
    .filter((account): account is MetaAdAccountOption => Boolean(account))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function contactsToRows(contacts: MetaAudienceContact[]): {
  rows: string[][];
  skipped: number;
} {
  const seen = new Set<string>();
  const rows: string[][] = [];
  let skipped = 0;

  for (const contact of contacts) {
    const email = hashEmail(contact.email);
    const phone = hashPhone(contact.phone);
    if (!email && !phone) {
      skipped += 1;
      continue;
    }

    const key = `${email ?? ""}|${phone ?? ""}`;
    if (seen.has(key)) {
      skipped += 1;
      continue;
    }
    seen.add(key);

    const firstName = contact.firstName ?? null;
    const lastName = contact.lastName ?? null;

    rows.push([
      email ?? "",
      phone ?? "",
      hashName(firstName) ?? "",
      hashName(lastName) ?? "",
    ]);
  }

  return { rows, skipped };
}

export async function createMetaCustomAudience(input: {
  adAccountId: string;
  accessToken: string;
  name: string;
  description: string;
  audienceLabel: string;
}): Promise<string> {
  const adAccountId = normalizeMetaAdAccountId(input.adAccountId);
  if (!adAccountId) throw new Error("Invalid Meta ad account ID");

  const json = await graphRequest<{ id?: string }>(
    "POST",
    `/${adAccountId}/customaudiences`,
    input.accessToken,
    {
      name: input.name,
      subtype: "CUSTOM",
      description: input.description,
      customer_file_source: "USER_PROVIDED_ONLY",
      audience_labels: [input.audienceLabel],
    }
  );

  if (!json.id) throw new Error("Meta did not return a Custom Audience ID");
  return json.id;
}

async function uploadAudienceUsers(input: {
  audienceId: string;
  accessToken: string;
  rows: string[][];
  replace: boolean;
}): Promise<number> {
  if (input.rows.length === 0) return 0;

  const sessionId = Math.floor(Math.random() * 1_000_000_000);
  const total = input.rows.length;
  let uploaded = 0;
  const endpoint = input.replace
    ? `/${input.audienceId}/usersreplace`
    : `/${input.audienceId}/users`;

  for (let i = 0; i < input.rows.length; i += BATCH_SIZE) {
    const batch = input.rows.slice(i, i + BATCH_SIZE);
    const batchSeq = Math.floor(i / BATCH_SIZE) + 1;
    const lastBatch = i + BATCH_SIZE >= input.rows.length;

    await graphRequest("POST", endpoint, input.accessToken, {
      session: {
        session_id: sessionId,
        batch_seq: batchSeq,
        last_batch_flag: lastBatch,
        estimated_num_total: total,
      },
      payload: {
        schema: ["EMAIL", "PHONE", "FN", "LN"],
        data: batch,
      },
    });

    uploaded += batch.length;
  }

  return uploaded;
}

/** Collect unique purchaser contacts from paid/completed-style orders. */
export async function collectPurchaserContacts(
  storeId: string
): Promise<MetaAudienceContact[]> {
  const orders = await prisma.order.findMany({
    where: {
      storeId,
      status: { notIn: ["cancelled", "canceled", "refunded", "returned"] },
      OR: [
        { customerEmail: { not: "" } },
        { customerPhone: { not: null } },
      ],
    },
    select: {
      customerEmail: true,
      customerPhone: true,
      customerName: true,
    },
    take: 50_000,
    orderBy: { createdAt: "desc" },
  });

  const byKey = new Map<string, MetaAudienceContact>();
  for (const order of orders) {
    const email = order.customerEmail?.trim().toLowerCase() || null;
    const phone = order.customerPhone?.trim() || null;
    if (!email && !phone) continue;
    const key = email ?? `phone:${phone}`;
    if (byKey.has(key)) continue;
    const { firstName, lastName } = splitName(order.customerName);
    byKey.set(key, { email, phone, firstName, lastName });
  }

  return Array.from(byKey.values());
}

/** Collect unique abandoner contacts (not recovered), excluding known purchasers. */
export async function collectAbandonerContacts(
  storeId: string
): Promise<MetaAudienceContact[]> {
  const [abandoners, purchasers] = await Promise.all([
    prisma.abandonedCheckout.findMany({
      where: {
        storeId,
        recoveredAt: null,
        OR: [{ email: { not: null } }, { phone: { not: null } }],
      },
      select: {
        email: true,
        phone: true,
        customerName: true,
      },
      take: 50_000,
      orderBy: { createdAt: "desc" },
    }),
    collectPurchaserContacts(storeId),
  ]);

  const purchaserEmails = new Set(
    purchasers
      .map((p) => p.email?.trim().toLowerCase())
      .filter((email): email is string => Boolean(email))
  );
  const purchaserPhones = new Set(
    purchasers
      .map((p) => p.phone?.replace(/\D/g, ""))
      .filter((phone): phone is string => Boolean(phone && phone.length >= 7))
  );

  const byKey = new Map<string, MetaAudienceContact>();
  for (const row of abandoners) {
    const email = row.email?.trim().toLowerCase() || null;
    const phone = row.phone?.trim() || null;
    if (!email && !phone) continue;
    if (email && purchaserEmails.has(email)) continue;
    const phoneDigits = phone?.replace(/\D/g, "") ?? "";
    if (phoneDigits && purchaserPhones.has(phoneDigits)) continue;

    const key = email ?? `phone:${phone}`;
    if (byKey.has(key)) continue;
    const { firstName, lastName } = splitName(row.customerName);
    byKey.set(key, { email, phone, firstName, lastName });
  }

  return Array.from(byKey.values());
}

export async function syncMetaCustomAudience(input: {
  storeId: string;
  storeName: string;
  accessToken: string;
  adAccountId: string;
  list: MetaAudienceListType;
  existingAudienceId?: string | null;
}): Promise<MetaAudienceSyncResult> {
  const adAccountId = normalizeMetaAdAccountId(input.adAccountId);
  if (!adAccountId) throw new Error("Select a Meta ad account first");

  const contacts =
    input.list === "purchasers"
      ? await collectPurchaserContacts(input.storeId)
      : await collectAbandonerContacts(input.storeId);

  const { rows, skipped } = contactsToRows(contacts);
  if (rows.length === 0) {
    throw new Error(
      input.list === "purchasers"
        ? "No purchaser emails or phones to upload yet"
        : "No abandoner emails or phones to upload yet"
    );
  }

  let audienceId = input.existingAudienceId?.trim() || null;
  let created = false;

  if (!audienceId) {
    const label =
      input.list === "purchasers" ? "GENERAL_CUSTOMERS" : "ENGAGED_USERS";
    const name =
      input.list === "purchasers"
        ? `Ettajer · ${input.storeName} · Purchasers`
        : `Ettajer · ${input.storeName} · Abandoners`;
    const description =
      input.list === "purchasers"
        ? "Customers who placed an order on this Ettajer store"
        : "Customers who started checkout but did not complete an order";

    audienceId = await createMetaCustomAudience({
      adAccountId,
      accessToken: input.accessToken,
      name,
      description,
      audienceLabel: label,
    });
    created = true;
  }

  const uploaded = await uploadAudienceUsers({
    audienceId,
    accessToken: input.accessToken,
    rows,
    replace: !created,
  });

  return {
    audienceId,
    list: input.list,
    uploaded,
    skipped,
    adAccountId,
    created,
  };
}
