import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { normalizeSubscriberEmail } from "@/lib/newsletter";
import {
  parseJourneyEdges,
  parseJourneyNodes,
} from "@/lib/email-marketing/atlas/journeys";
import type { JourneyEdge, JourneyNode } from "@/lib/email-marketing/atlas/types";
import { enqueueEmailJobs } from "@/lib/email-marketing/email-queue";

/**
 * Advance due journey enrollments (cron-friendly, multi-tenant).
 */
export async function runJourneyWorker(options?: {
  batchSize?: number;
}): Promise<{ processed: number; advanced: number; emailed: number }> {
  const batchSize = options?.batchSize ?? 40;
  const now = new Date();

  const due = await prisma.emailJourneyEnrollment.findMany({
    where: {
      status: { in: ["active", "waiting"] },
      OR: [{ nextRunAt: null }, { nextRunAt: { lte: now } }],
    },
    orderBy: { nextRunAt: "asc" },
    take: batchSize,
    include: {
      journey: true,
    },
  });

  let processed = 0;
  let advanced = 0;
  let emailed = 0;

  for (const enrollment of due) {
    processed += 1;
    if (enrollment.journey.status !== "active") {
      await prisma.emailJourneyEnrollment.update({
        where: { id: enrollment.id },
        data: { status: "exited", completedAt: now },
      });
      continue;
    }

    const nodes = parseJourneyNodes(enrollment.journey.nodes);
    const edges = parseJourneyEdges(enrollment.journey.edges);
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const nodeId = enrollment.currentNodeId;
    if (!nodeId) {
      await completeEnrollment(enrollment.id, enrollment.journeyId, "exited");
      continue;
    }
    const node = byId.get(nodeId);
    if (!node) {
      await completeEnrollment(enrollment.id, enrollment.journeyId, "failed");
      continue;
    }

    const result = await processNode({
      storeId: enrollment.storeId,
      enrollmentId: enrollment.id,
      journeyId: enrollment.journeyId,
      email: enrollment.email,
      node,
      edges,
      nodes,
      context:
        enrollment.context && typeof enrollment.context === "object"
          ? (enrollment.context as Record<string, unknown>)
          : {},
    });

    if (result.emailed) emailed += 1;
    if (result.advanced) advanced += 1;
  }

  return { processed, advanced, emailed };
}

async function processNode(input: {
  storeId: string;
  enrollmentId: string;
  journeyId: string;
  email: string;
  node: JourneyNode;
  edges: JourneyEdge[];
  nodes: JourneyNode[];
  context: Record<string, unknown>;
}): Promise<{ advanced: boolean; emailed: boolean }> {
  const { node } = input;

  switch (node.type) {
    case "trigger": {
      const next = nextNode(input.edges, node.id);
      await moveEnrollment(input.enrollmentId, next, new Date());
      return { advanced: true, emailed: false };
    }
    case "delay": {
      const hours =
        typeof node.config.hours === "number"
          ? node.config.hours
          : typeof node.config.minutes === "number"
            ? node.config.minutes / 60
            : 24;
      const next = nextNode(input.edges, node.id);
      const when = new Date(Date.now() + Math.max(0.05, hours) * 3_600_000);
      await prisma.emailJourneyEnrollment.update({
        where: { id: input.enrollmentId },
        data: {
          status: "waiting",
          currentNodeId: next,
          nextRunAt: when,
        },
      });
      return { advanced: true, emailed: false };
    }
    case "wait_until": {
      // Wait until a calendar hour / day — config: { hourUtc?: number }
      const hour =
        typeof node.config.hourUtc === "number" ? node.config.hourUtc : null;
      if (hour == null) {
        const next = nextNode(input.edges, node.id);
        await moveEnrollment(input.enrollmentId, next, new Date());
        return { advanced: true, emailed: false };
      }
      const now = new Date();
      if (now.getUTCHours() === hour) {
        const next = nextNode(input.edges, node.id);
        await moveEnrollment(input.enrollmentId, next, new Date());
        return { advanced: true, emailed: false };
      }
      const nextAt = new Date(now);
      nextAt.setUTCMinutes(0, 0, 0);
      nextAt.setUTCHours(hour);
      if (nextAt.getTime() <= now.getTime()) {
        nextAt.setUTCDate(nextAt.getUTCDate() + 1);
      }
      await prisma.emailJourneyEnrollment.update({
        where: { id: input.enrollmentId },
        data: { status: "waiting", nextRunAt: nextAt },
      });
      return { advanced: false, emailed: false };
    }
    case "email": {
      const emailed = await enqueueJourneyEmail(input);
      const next = nextNode(input.edges, node.id, "done") || nextNode(input.edges, node.id);
      await moveEnrollment(input.enrollmentId, next, new Date());
      return { advanced: true, emailed };
    }
    case "sms":
    case "push":
    case "whatsapp":
    case "messenger": {
      // Channel reserved — skip delivery, advance graph (email-first today)
      const next = nextNode(input.edges, node.id);
      await moveEnrollment(input.enrollmentId, next, new Date());
      return { advanced: true, emailed: false };
    }
    case "condition":
    case "split": {
      const pass = await evaluateCondition(input.storeId, input.email, node);
      const label = pass ? "yes" : "no";
      const next =
        nextNode(input.edges, node.id, label) ||
        nextNode(input.edges, node.id, pass ? "converted" : "done") ||
        nextNode(input.edges, node.id);
      await moveEnrollment(input.enrollmentId, next, new Date());
      return { advanced: true, emailed: false };
    }
    case "tag_customer": {
      const tag =
        typeof node.config.tag === "string" ? node.config.tag.trim() : "";
      if (tag) await addCustomerTag(input.storeId, input.email, tag);
      const next = nextNode(input.edges, node.id);
      await moveEnrollment(input.enrollmentId, next, new Date());
      return { advanced: true, emailed: false };
    }
    case "remove_tag": {
      const tag =
        typeof node.config.tag === "string" ? node.config.tag.trim() : "";
      if (tag) await removeCustomerTag(input.storeId, input.email, tag);
      const next = nextNode(input.edges, node.id);
      await moveEnrollment(input.enrollmentId, next, new Date());
      return { advanced: true, emailed: false };
    }
    case "add_segment":
    case "remove_segment": {
      // Segment membership is filter-based; store intent on context for analytics
      const segmentId =
        typeof node.config.segmentId === "string"
          ? node.config.segmentId
          : null;
      const ctx = {
        ...input.context,
        lastSegmentAction: {
          type: node.type,
          segmentId,
          at: new Date().toISOString(),
        },
      };
      const next = nextNode(input.edges, node.id);
      await prisma.emailJourneyEnrollment.update({
        where: { id: input.enrollmentId },
        data: {
          currentNodeId: next,
          nextRunAt: new Date(),
          context: ctx as Prisma.InputJsonValue,
          status: next ? "active" : "completed",
          ...(next
            ? {}
            : { completedAt: new Date(), status: "completed" }),
        },
      });
      if (!next) {
        await prisma.emailJourney.update({
          where: { id: input.journeyId },
          data: { completedCount: { increment: 1 } },
        });
      }
      return { advanced: true, emailed: false };
    }
    case "goal": {
      await completeEnrollment(input.enrollmentId, input.journeyId, "completed");
      return { advanced: true, emailed: false };
    }
    case "exit": {
      await completeEnrollment(input.enrollmentId, input.journeyId, "exited");
      return { advanced: true, emailed: false };
    }
    default: {
      const next = nextNode(input.edges, node.id);
      await moveEnrollment(input.enrollmentId, next, new Date());
      return { advanced: true, emailed: false };
    }
  }
}

function nextNode(
  edges: JourneyEdge[],
  source: string,
  label?: string
): string | null {
  if (label) {
    const labeled = edges.find(
      (e) => e.source === source && (e.label || "").toLowerCase() === label
    );
    if (labeled) return labeled.target;
  }
  const any = edges.find((e) => e.source === source);
  return any?.target ?? null;
}

async function moveEnrollment(
  enrollmentId: string,
  nextNodeId: string | null,
  nextRunAt: Date
) {
  if (!nextNodeId) {
    await prisma.emailJourneyEnrollment.update({
      where: { id: enrollmentId },
      data: {
        status: "completed",
        currentNodeId: null,
        completedAt: new Date(),
        nextRunAt: null,
      },
    });
    return;
  }
  await prisma.emailJourneyEnrollment.update({
    where: { id: enrollmentId },
    data: {
      status: "active",
      currentNodeId: nextNodeId,
      nextRunAt,
    },
  });
}

async function completeEnrollment(
  enrollmentId: string,
  journeyId: string,
  status: "completed" | "exited" | "failed"
) {
  await prisma.emailJourneyEnrollment.update({
    where: { id: enrollmentId },
    data: {
      status,
      completedAt: new Date(),
      nextRunAt: null,
    },
  });
  if (status === "completed") {
    await prisma.emailJourney.update({
      where: { id: journeyId },
      data: { completedCount: { increment: 1 } },
    });
  }
}

async function evaluateCondition(
  storeId: string,
  email: string,
  node: JourneyNode
): Promise<boolean> {
  const field =
    typeof node.config.field === "string" ? node.config.field : "has_purchase";
  const normalized = normalizeSubscriberEmail(email);

  if (field === "has_purchase" || field === "purchased") {
    const count = await prisma.order.count({
      where: {
        storeId,
        customerEmail: { equals: normalized, mode: "insensitive" },
        status: { notIn: ["cancelled", "draft"] },
      },
    });
    return count > 0;
  }

  if (field === "vip" || field === "is_vip") {
    const intel = await prisma.customerIntelligence.findUnique({
      where: { storeId_email: { storeId, email: normalized } },
      select: { predictiveLabels: true },
    });
    return intel?.predictiveLabels.includes("vip") ?? false;
  }

  if (field === "opened_last") {
    const opened = await prisma.emailEvent.findFirst({
      where: { storeId, toEmail: normalized, type: "opened" },
      orderBy: { occurredAt: "desc" },
    });
    return Boolean(opened);
  }

  return true;
}

async function addCustomerTag(storeId: string, email: string, tag: string) {
  const normalized = normalizeSubscriberEmail(email);
  const customer = await prisma.customer.findUnique({
    where: { storeId_email: { storeId, email: normalized } },
    select: { tags: true },
  });
  if (customer) {
    const tags = Array.from(new Set([...(customer.tags || []), tag]));
    await prisma.customer.update({
      where: { storeId_email: { storeId, email: normalized } },
      data: { tags },
    });
  }
  const sub = await prisma.newsletterSubscriber.findUnique({
    where: { storeId_email: { storeId, email: normalized } },
    select: { tags: true },
  });
  if (sub) {
    const tags = Array.from(new Set([...(sub.tags || []), tag]));
    await prisma.newsletterSubscriber.update({
      where: { storeId_email: { storeId, email: normalized } },
      data: { tags },
    });
  }
}

async function removeCustomerTag(storeId: string, email: string, tag: string) {
  const normalized = normalizeSubscriberEmail(email);
  const customer = await prisma.customer.findUnique({
    where: { storeId_email: { storeId, email: normalized } },
    select: { tags: true },
  });
  if (customer) {
    await prisma.customer.update({
      where: { storeId_email: { storeId, email: normalized } },
      data: { tags: (customer.tags || []).filter((t) => t !== tag) },
    });
  }
  const sub = await prisma.newsletterSubscriber.findUnique({
    where: { storeId_email: { storeId, email: normalized } },
    select: { tags: true },
  });
  if (sub) {
    await prisma.newsletterSubscriber.update({
      where: { storeId_email: { storeId, email: normalized } },
      data: { tags: (sub.tags || []).filter((t) => t !== tag) },
    });
  }
}

async function enqueueJourneyEmail(input: {
  storeId: string;
  enrollmentId: string;
  journeyId: string;
  email: string;
  node: JourneyNode;
}): Promise<boolean> {
  const templateId =
    typeof input.node.config.templateId === "string"
      ? input.node.config.templateId
      : null;

  const store = await prisma.store.findUnique({
    where: { id: input.storeId },
    select: {
      id: true,
      name: true,
      slug: true,
      primaryColor: true,
      contactEmail: true,
      address: true,
      currency: true,
    },
  });
  if (!store) return false;

  let template = templateId
    ? await prisma.emailTemplate.findFirst({
        where: { id: templateId, storeId: input.storeId },
      })
    : null;

  const subject =
    (typeof input.node.config.subject === "string" &&
      input.node.config.subject.trim()) ||
    template?.subject ||
    "A note for you";
  const title =
    (typeof input.node.config.title === "string" &&
      input.node.config.title.trim()) ||
    template?.title ||
    subject;
  const body =
    (typeof input.node.config.body === "string" &&
      input.node.config.body.trim()) ||
    template?.body ||
    "We thought you might like this.";
  const ctaLabel =
    (typeof input.node.config.ctaLabel === "string" &&
      input.node.config.ctaLabel.trim()) ||
    template?.ctaLabel ||
    "Shop now";
  const ctaUrl =
    (typeof input.node.config.ctaUrl === "string" &&
      input.node.config.ctaUrl.trim()) ||
    template?.ctaUrl ||
    "";

  const { created } = await enqueueEmailJobs({
    storeId: input.storeId,
    kind: "journey",
    subject,
    payload: {
      storeId: store.id,
      currency: store.currency || "MAD",
      storeName: store.name,
      storeSlug: store.slug,
      storePrimaryColor: store.primaryColor,
      storeAddress: store.address,
      storeSupportEmail: store.contactEmail,
      replyTo: store.contactEmail,
      template: {
        themeId: template?.themeId || "store",
        subject,
        title,
        body,
        ctaLabel,
        ctaUrl,
        galleryId: template?.galleryId ?? null,
        blocks: (template?.blocks as never) ?? [],
      },
    },
    items: [
      {
        toEmail: input.email,
        idempotencyKey: `journey:${input.journeyId}:${input.enrollmentId}:${input.node.id}`,
        emailTemplateId: template?.id ?? null,
      },
    ],
  });

  return created > 0;
}

/**
 * Enroll contacts into active journeys matching a trigger (idempotent).
 */
export async function enrollByTrigger(input: {
  storeId: string;
  trigger: string;
  email: string;
  context?: Record<string, unknown>;
}): Promise<{ enrolled: number }> {
  const { enrollInJourney } = await import(
    "@/lib/email-marketing/atlas/journeys"
  );
  const journeys = await prisma.emailJourney.findMany({
    where: {
      storeId: input.storeId,
      status: "active",
      trigger: input.trigger,
    },
    select: { id: true },
  });
  let enrolled = 0;
  for (const j of journeys) {
    try {
      await enrollInJourney({
        storeId: input.storeId,
        journeyId: j.id,
        email: input.email,
        context: input.context,
      });
      enrolled += 1;
    } catch {
      // ignore inactive / duplicate
    }
  }
  return { enrolled };
}
