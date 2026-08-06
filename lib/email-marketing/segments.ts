import { prisma } from "@/lib/db";
import { parseShippingAddress } from "@/lib/orders";
import { normalizeSubscriberEmail } from "@/lib/newsletter";
import {
  DEFAULT_VIP_MIN_SPENT,
  emptySegmentDefinition,
  isSegmentFilterType,
  type AudienceSegmentDefinition,
  type AudienceSegmentRow,
  type SegmentFilter,
} from "@/lib/email-marketing/segment-types";

export type {
  AudienceSegmentDefinition,
  AudienceSegmentRow,
  SegmentFilter,
} from "@/lib/email-marketing/segment-types";

export {
  SEGMENT_FILTER_TYPES,
  SEGMENT_FILTER_DEFS,
  DEFAULT_VIP_MIN_SPENT,
  emptySegmentDefinition,
} from "@/lib/email-marketing/segment-types";

const MAX_RECIPIENTS = 5000;

type PurchaseProfile = {
  orderCount: number;
  totalSpent: number;
  lastOrderAt: Date | null;
  country: string | null;
};

type ContactProfile = {
  email: string;
  signupAt: Date;
  tags: string[];
  language: string | null;
  purchase: PurchaseProfile | null;
  /** Atlas intelligence (optional until scored) */
  churnRisk: number | null;
  purchasePropensity: number | null;
  lifetimeValue: number | null;
  predictiveLabels: string[];
};

function parseDefinition(raw: unknown): AudienceSegmentDefinition {
  if (!raw || typeof raw !== "object") return emptySegmentDefinition();
  const obj = raw as {
    match?: string;
    filters?: unknown[];
  };
  const match = obj.match === "any" ? "any" : "all";
  const filters: SegmentFilter[] = [];
  for (const item of obj.filters ?? []) {
    if (!item || typeof item !== "object") continue;
    const f = item as Record<string, unknown>;
    if (typeof f.type !== "string" || !isSegmentFilterType(f.type)) continue;
    filters.push(item as SegmentFilter);
  }
  if (filters.length === 0) {
    return emptySegmentDefinition();
  }
  return { match, filters };
}

export function serializeAudienceSegment(row: {
  id: string;
  name: string;
  description: string | null;
  filters: unknown;
  cachedCount: number;
  cachedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): AudienceSegmentRow {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    filters: parseDefinition(row.filters),
    cachedCount: row.cachedCount,
    cachedAt: row.cachedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function loadPurchaseProfiles(
  storeId: string
): Promise<Map<string, PurchaseProfile>> {
  const orders = await prisma.order.findMany({
    where: { storeId, status: { not: "draft" }, customerEmail: { not: "" } },
    select: {
      customerEmail: true,
      total: true,
      createdAt: true,
      shippingAddress: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const map = new Map<string, PurchaseProfile>();
  for (const order of orders) {
    const email = normalizeSubscriberEmail(order.customerEmail);
    if (!email) continue;
    const existing = map.get(email);
    const country =
      parseShippingAddress(order.shippingAddress)?.country?.trim() || null;
    if (existing) {
      existing.orderCount += 1;
      existing.totalSpent += order.total;
      if (!existing.lastOrderAt || order.createdAt > existing.lastOrderAt) {
        existing.lastOrderAt = order.createdAt;
      }
      if (!existing.country && country) existing.country = country;
    } else {
      map.set(email, {
        orderCount: 1,
        totalSpent: order.total,
        lastOrderAt: order.createdAt,
        country,
      });
    }
  }
  return map;
}

async function loadContactProfiles(storeId: string): Promise<ContactProfile[]> {
  const [subscribers, purchases, customers, intelligence] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      where: { storeId, status: "active" },
      select: {
        email: true,
        createdAt: true,
        tags: true,
        language: true,
      },
    }),
    loadPurchaseProfiles(storeId),
    prisma.customer.findMany({
      where: { storeId },
      select: { email: true, tags: true, language: true },
    }),
    prisma.customerIntelligence.findMany({
      where: { storeId },
      select: {
        email: true,
        churnRisk: true,
        purchasePropensity: true,
        lifetimeValue: true,
        predictiveLabels: true,
      },
    }),
  ]);

  const customerMeta = new Map(
    customers.map((c) => [
      normalizeSubscriberEmail(c.email),
      { tags: c.tags ?? [], language: c.language },
    ])
  );

  const intelMap = new Map(
    intelligence.map((i) => [normalizeSubscriberEmail(i.email), i])
  );

  return subscribers.map((sub) => {
    const email = normalizeSubscriberEmail(sub.email);
    const meta = customerMeta.get(email);
    const intel = intelMap.get(email);
    const tags = Array.from(
      new Set([...(sub.tags ?? []), ...(meta?.tags ?? [])])
    );
    const language = sub.language || meta?.language || null;
    return {
      email,
      signupAt: sub.createdAt,
      tags,
      language,
      purchase: purchases.get(email) ?? null,
      churnRisk: intel?.churnRisk ?? null,
      purchasePropensity: intel?.purchasePropensity ?? null,
      lifetimeValue: intel?.lifetimeValue ?? null,
      predictiveLabels: intel?.predictiveLabels ?? [],
    };
  });
}

function inDateWindow(
  date: Date | null,
  opts: {
    after?: string | null;
    before?: string | null;
    withinDays?: number | null;
  }
): boolean {
  if (!date) return false;
  const t = date.getTime();
  if (opts.withinDays != null && opts.withinDays > 0) {
    const since = Date.now() - opts.withinDays * 24 * 60 * 60 * 1000;
    if (t < since) return false;
  }
  if (opts.after) {
    const after = new Date(opts.after).getTime();
    if (!Number.isNaN(after) && t < after) return false;
  }
  if (opts.before) {
    const before = new Date(opts.before).getTime();
    if (!Number.isNaN(before) && t > before) return false;
  }
  return true;
}

function matchesFilter(contact: ContactProfile, filter: SegmentFilter): boolean {
  const purchase = contact.purchase;
  switch (filter.type) {
    case "subscribers":
      return true;
    case "customers":
      return (purchase?.orderCount ?? 0) >= 1;
    case "never_purchased":
      return !purchase || purchase.orderCount === 0;
    case "returning_customers":
      return (purchase?.orderCount ?? 0) >= 2;
    case "vip_customers": {
      const min = filter.minSpent ?? DEFAULT_VIP_MIN_SPENT;
      return (purchase?.totalSpent ?? 0) > min;
    }
    case "spent_gt":
      return (purchase?.totalSpent ?? 0) > filter.value;
    case "orders_gt":
      return (purchase?.orderCount ?? 0) > filter.value;
    case "country": {
      if (!filter.values?.length) return true;
      const country = (purchase?.country || "").toLowerCase();
      return filter.values.some((v) => v.trim().toLowerCase() === country);
    }
    case "language": {
      if (!filter.values?.length) return true;
      const lang = (contact.language || "").toLowerCase();
      return filter.values.some((v) => v.trim().toLowerCase() === lang);
    }
    case "tag": {
      if (!filter.values?.length) return true;
      const tags = contact.tags.map((t) => t.toLowerCase());
      return filter.values.some((v) => tags.includes(v.trim().toLowerCase()));
    }
    case "last_purchase":
      return inDateWindow(purchase?.lastOrderAt ?? null, filter);
    case "signup_date":
      return inDateWindow(contact.signupAt, filter);
    case "predictive_label": {
      const label = (filter.label || "").toLowerCase();
      if (!label) return false;
      return contact.predictiveLabels.some((l) => l.toLowerCase() === label);
    }
    case "churn_risk_gte":
      return (contact.churnRisk ?? -1) >= filter.value;
    case "purchase_propensity_gte":
      return (contact.purchasePropensity ?? -1) >= filter.value;
    case "ltv_gte":
      return (
        (contact.lifetimeValue ?? contact.purchase?.totalSpent ?? 0) >=
        filter.value
      );
    default:
      return false;
  }
}

export function contactMatchesDefinition(
  contact: ContactProfile,
  definition: AudienceSegmentDefinition
): boolean {
  const filters = definition.filters ?? [];
  if (filters.length === 0) return true;
  if (definition.match === "any") {
    return filters.some((f) => matchesFilter(contact, f));
  }
  return filters.every((f) => matchesFilter(contact, f));
}

/**
 * Resolve emails for a segment definition. Always scoped to active subscribers.
 * Re-evaluated every call — segments stay automatically up to date.
 */
export async function resolveSegmentEmails(
  storeId: string,
  definition: AudienceSegmentDefinition
): Promise<string[]> {
  const contacts = await loadContactProfiles(storeId);
  return contacts
    .filter((c) => contactMatchesDefinition(c, definition))
    .map((c) => c.email);
}

export async function resolveSegmentIdsEmails(
  storeId: string,
  segmentIds: string[]
): Promise<string[]> {
  if (segmentIds.length === 0) {
    const all = await prisma.newsletterSubscriber.findMany({
      where: { storeId, status: "active" },
      select: { email: true },
    });
    return all.map((s) => normalizeSubscriberEmail(s.email));
  }

  const segments = await prisma.audienceSegment.findMany({
    where: { storeId, id: { in: segmentIds } },
  });
  if (segments.length === 0) {
    throw new Error("No matching segments found");
  }

  const contacts = await loadContactProfiles(storeId);
  const emails = new Set<string>();
  for (const segment of segments) {
    const definition = parseDefinition(segment.filters);
    for (const contact of contacts) {
      if (contactMatchesDefinition(contact, definition)) {
        emails.add(contact.email);
      }
    }
  }
  return Array.from(emails);
}

export async function countSegmentMembers(
  storeId: string,
  definition: AudienceSegmentDefinition
): Promise<number> {
  const emails = await resolveSegmentEmails(storeId, definition);
  return emails.length;
}

export async function refreshSegmentCachedCount(segmentId: string) {
  const segment = await prisma.audienceSegment.findUnique({
    where: { id: segmentId },
  });
  if (!segment) return null;
  const count = await countSegmentMembers(
    segment.storeId,
    parseDefinition(segment.filters)
  );
  return prisma.audienceSegment.update({
    where: { id: segmentId },
    data: { cachedCount: count, cachedAt: new Date() },
  });
}

export async function listAudienceSegments(storeId: string) {
  return prisma.audienceSegment.findMany({
    where: { storeId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function createAudienceSegment(input: {
  storeId: string;
  name: string;
  description?: string | null;
  filters: AudienceSegmentDefinition;
}) {
  const name = input.name.trim();
  if (!name) throw new Error("Name is required");
  const filters = parseDefinition(input.filters);
  const count = await countSegmentMembers(input.storeId, filters);
  return prisma.audienceSegment.create({
    data: {
      storeId: input.storeId,
      name,
      description: input.description?.trim() || null,
      filters: filters as object,
      cachedCount: count,
      cachedAt: new Date(),
    },
  });
}

export async function updateAudienceSegment(input: {
  storeId: string;
  id: string;
  name?: string;
  description?: string | null;
  filters?: AudienceSegmentDefinition;
}) {
  const existing = await prisma.audienceSegment.findFirst({
    where: { id: input.id, storeId: input.storeId },
  });
  if (!existing) throw new Error("Segment not found");

  const filters = input.filters
    ? parseDefinition(input.filters)
    : parseDefinition(existing.filters);
  const count = await countSegmentMembers(input.storeId, filters);

  return prisma.audienceSegment.update({
    where: { id: existing.id },
    data: {
      ...(input.name?.trim() ? { name: input.name.trim() } : {}),
      ...(input.description !== undefined
        ? { description: input.description?.trim() || null }
        : {}),
      filters: filters as object,
      cachedCount: count,
      cachedAt: new Date(),
    },
  });
}

export async function deleteAudienceSegment(storeId: string, id: string) {
  const existing = await prisma.audienceSegment.findFirst({
    where: { id, storeId },
  });
  if (!existing) throw new Error("Segment not found");
  await prisma.audienceSegment.delete({ where: { id } });
}

export async function previewSegment(
  storeId: string,
  definition: AudienceSegmentDefinition,
  take = 25
) {
  const emails = await resolveSegmentEmails(storeId, definition);
  return {
    count: emails.length,
    sample: emails.slice(0, take),
    capped: emails.length > MAX_RECIPIENTS,
  };
}

/** Validate + normalize filters from API body */
export function normalizeSegmentDefinitionInput(
  raw: unknown
): AudienceSegmentDefinition {
  return parseDefinition(raw);
}

export { MAX_RECIPIENTS as SEGMENT_MAX_RECIPIENTS };
