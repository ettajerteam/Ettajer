import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import {
  JOURNEY_KINDS,
  JOURNEY_STATUSES,
  isJourneyNodeType,
  isJourneyTrigger,
  type JourneyEdge,
  type JourneyKind,
  type JourneyNode,
  type JourneySettings,
  type JourneyStatus,
  type JourneyTrigger,
} from "@/lib/email-marketing/atlas/types";

export interface EmailJourneyRow {
  id: string;
  name: string;
  description: string | null;
  kind: JourneyKind | string;
  status: JourneyStatus | string;
  trigger: string;
  nodes: JourneyNode[];
  edges: JourneyEdge[];
  settings: JourneySettings;
  enrolledCount: number;
  completedCount: number;
  revenue: number;
  createdAt: string;
  updatedAt: string;
}

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function parseJourneyNodes(raw: unknown): JourneyNode[] {
  if (!Array.isArray(raw)) return [];
  const nodes: JourneyNode[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    if (typeof obj.id !== "string" || typeof obj.type !== "string") continue;
    if (!isJourneyNodeType(obj.type)) continue;
    const pos = (obj.position || {}) as Record<string, unknown>;
    nodes.push({
      id: obj.id,
      type: obj.type,
      label: typeof obj.label === "string" ? obj.label : obj.type,
      position: {
        x: typeof pos.x === "number" ? pos.x : 0,
        y: typeof pos.y === "number" ? pos.y : 0,
      },
      channel:
        typeof obj.channel === "string"
          ? (obj.channel as JourneyNode["channel"])
          : obj.type === "email"
            ? "email"
            : undefined,
      config:
        obj.config && typeof obj.config === "object"
          ? (obj.config as Record<string, unknown>)
          : {},
    });
  }
  return nodes;
}

export function parseJourneyEdges(raw: unknown): JourneyEdge[] {
  if (!Array.isArray(raw)) return [];
  const edges: JourneyEdge[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    if (typeof obj.id !== "string") continue;
    if (typeof obj.source !== "string" || typeof obj.target !== "string")
      continue;
    edges.push({
      id: obj.id,
      source: obj.source,
      target: obj.target,
      label: typeof obj.label === "string" ? obj.label : null,
    });
  }
  return edges;
}

export function serializeJourney(row: {
  id: string;
  name: string;
  description: string | null;
  kind: string;
  status: string;
  trigger: string;
  nodes: unknown;
  edges: unknown;
  settings: unknown;
  enrolledCount: number;
  completedCount: number;
  revenue: number;
  createdAt: Date;
  updatedAt: Date;
}): EmailJourneyRow {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    kind: row.kind,
    status: row.status,
    trigger: row.trigger,
    nodes: parseJourneyNodes(row.nodes),
    edges: parseJourneyEdges(row.edges),
    settings:
      row.settings && typeof row.settings === "object"
        ? (row.settings as JourneySettings)
        : {},
    enrolledCount: row.enrolledCount,
    completedCount: row.completedCount,
    revenue: row.revenue,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function createStarterJourneyGraph(input: {
  kind: JourneyKind;
  trigger: JourneyTrigger;
  storeName?: string;
}): { nodes: JourneyNode[]; edges: JourneyEdge[]; settings: JourneySettings } {
  const triggerId = newId("trg");
  const email1 = newId("eml");
  const delay1 = newId("dly");
  const email2 = newId("eml");
  const goal = newId("gol");
  const exit = newId("xit");

  const brand = input.storeName || "your store";

  const templates: Record<
    string,
    { subject: string; title: string; body: string; delayHours: number }
  > = {
    welcome: {
      subject: `Welcome to ${brand}`,
      title: "Glad you're here",
      body: "Discover our collection and enjoy a warm welcome.",
      delayHours: 24,
    },
    cart_recovery: {
      subject: "You left something behind",
      title: "Your cart is waiting",
      body: "Complete your order before items sell out.",
      delayHours: 1,
    },
    win_back: {
      subject: "We miss you",
      title: "Come back for something new",
      body: "It's been a while — here's what's new for you.",
      delayHours: 72,
    },
    post_purchase: {
      subject: "Thank you for your order",
      title: "You're going to love it",
      body: "Care tips and ideas for what to try next.",
      delayHours: 48,
    },
    vip: {
      subject: "A private invitation",
      title: "VIP access",
      body: "Early access and exclusive picks, just for you.",
      delayHours: 24,
    },
  };

  const copy =
    templates[input.kind] ||
    templates.welcome;

  const nodes: JourneyNode[] = [
    {
      id: triggerId,
      type: "trigger",
      label: "Trigger",
      position: { x: 80, y: 120 },
      config: { trigger: input.trigger },
    },
    {
      id: email1,
      type: "email",
      label: "Email 1",
      channel: "email",
      position: { x: 280, y: 120 },
      config: {
        subject: copy.subject,
        title: copy.title,
        body: copy.body,
        ctaLabel: "Shop now",
      },
    },
    {
      id: delay1,
      type: "delay",
      label: `Wait ${copy.delayHours}h`,
      position: { x: 480, y: 120 },
      config: { hours: copy.delayHours },
    },
    {
      id: email2,
      type: "email",
      label: "Email 2",
      channel: "email",
      position: { x: 680, y: 120 },
      config: {
        subject: `${copy.subject} — follow up`,
        title: copy.title,
        body: "A gentle reminder with a personalized pick.",
        ctaLabel: "Continue shopping",
      },
    },
    {
      id: goal,
      type: "goal",
      label: "Purchase",
      position: { x: 880, y: 60 },
      config: { goalType: "purchase" },
    },
    {
      id: exit,
      type: "exit",
      label: "Exit",
      position: { x: 880, y: 180 },
      config: {},
    },
  ];

  const edges: JourneyEdge[] = [
    { id: newId("edg"), source: triggerId, target: email1 },
    { id: newId("edg"), source: email1, target: delay1 },
    { id: newId("edg"), source: delay1, target: email2 },
    { id: newId("edg"), source: email2, target: goal, label: "converted" },
    { id: newId("edg"), source: email2, target: exit, label: "done" },
  ];

  return {
    nodes,
    edges,
    settings: { goalType: "purchase", exitOnPurchase: true },
  };
}

export async function listJourneys(storeId: string) {
  const rows = await prisma.emailJourney.findMany({
    where: { storeId },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(serializeJourney);
}

export async function getJourney(storeId: string, id: string) {
  const row = await prisma.emailJourney.findFirst({
    where: { id, storeId },
  });
  return row ? serializeJourney(row) : null;
}

export async function createJourney(input: {
  storeId: string;
  name: string;
  description?: string | null;
  kind?: string;
  trigger: string;
  storeName?: string;
  nodes?: JourneyNode[];
  edges?: JourneyEdge[];
  settings?: JourneySettings;
}) {
  if (!isJourneyTrigger(input.trigger)) {
    throw new Error("Unknown journey trigger");
  }
  const kind = (JOURNEY_KINDS as readonly string[]).includes(input.kind || "")
    ? (input.kind as JourneyKind)
    : "custom";

  const starter =
    input.nodes && input.edges
      ? {
          nodes: input.nodes,
          edges: input.edges,
          settings: input.settings || {},
        }
      : createStarterJourneyGraph({
          kind,
          trigger: input.trigger,
          storeName: input.storeName,
        });

  const row = await prisma.emailJourney.create({
    data: {
      storeId: input.storeId,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      kind,
      trigger: input.trigger,
      status: "draft",
      nodes: starter.nodes as unknown as Prisma.InputJsonValue,
      edges: starter.edges as unknown as Prisma.InputJsonValue,
      settings: starter.settings as unknown as Prisma.InputJsonValue,
    },
  });
  return serializeJourney(row);
}

export async function updateJourney(
  storeId: string,
  id: string,
  input: {
    name?: string;
    description?: string | null;
    status?: string;
    nodes?: JourneyNode[];
    edges?: JourneyEdge[];
    settings?: JourneySettings;
  }
) {
  const existing = await prisma.emailJourney.findFirst({
    where: { id, storeId },
  });
  if (!existing) throw new Error("Journey not found");

  if (
    input.status &&
    !(JOURNEY_STATUSES as readonly string[]).includes(input.status)
  ) {
    throw new Error("Invalid journey status");
  }

  const row = await prisma.emailJourney.update({
    where: { id },
    data: {
      ...(input.name != null ? { name: input.name.trim() } : {}),
      ...(input.description !== undefined
        ? { description: input.description?.trim() || null }
        : {}),
      ...(input.status ? { status: input.status } : {}),
      ...(input.nodes
        ? { nodes: input.nodes as unknown as Prisma.InputJsonValue }
        : {}),
      ...(input.edges
        ? { edges: input.edges as unknown as Prisma.InputJsonValue }
        : {}),
      ...(input.settings
        ? { settings: input.settings as unknown as Prisma.InputJsonValue }
        : {}),
    },
  });
  return serializeJourney(row);
}

export async function deleteJourney(storeId: string, id: string) {
  const existing = await prisma.emailJourney.findFirst({
    where: { id, storeId },
    select: { id: true, status: true },
  });
  if (!existing) throw new Error("Journey not found");
  if (existing.status === "active") {
    throw new Error("Pause the journey before deleting");
  }
  await prisma.emailJourney.delete({ where: { id } });
}

/**
 * Enroll a contact into an active journey (idempotent per journey+email).
 */
export async function enrollInJourney(input: {
  storeId: string;
  journeyId: string;
  email: string;
  context?: Record<string, unknown>;
}) {
  const journey = await prisma.emailJourney.findFirst({
    where: {
      id: input.journeyId,
      storeId: input.storeId,
      status: "active",
    },
  });
  if (!journey) throw new Error("Active journey not found");

  const nodes = parseJourneyNodes(journey.nodes);
  const triggerNode = nodes.find((n) => n.type === "trigger");
  const firstEdge = parseJourneyEdges(journey.edges).find(
    (e) => e.source === triggerNode?.id
  );
  const startNodeId = firstEdge?.target || triggerNode?.id || null;

  const enrollment = await prisma.emailJourneyEnrollment.upsert({
    where: {
      journeyId_email: {
        journeyId: input.journeyId,
        email: input.email.toLowerCase(),
      },
    },
    create: {
      storeId: input.storeId,
      journeyId: input.journeyId,
      email: input.email.toLowerCase(),
      status: "active",
      currentNodeId: startNodeId,
      context: (input.context || {}) as Prisma.InputJsonValue,
      nextRunAt: new Date(),
    },
    update: {},
  });

  if (enrollment.enteredAt.getTime() === enrollment.updatedAt.getTime()) {
    await prisma.emailJourney.update({
      where: { id: input.journeyId },
      data: { enrolledCount: { increment: 1 } },
    });
  }

  return enrollment;
}
