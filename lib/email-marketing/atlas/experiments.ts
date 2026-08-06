import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export interface ExperimentVariant {
  id: string;
  label: string;
  /** subject | preview | cta | image | discount | content | layout */
  kind: string;
  value: string;
  impressions: number;
  opens: number;
  clicks: number;
  conversions: number;
  revenue: number;
}

export interface EmailExperimentRow {
  id: string;
  name: string;
  targetKind: string;
  targetId: string;
  status: string;
  variants: ExperimentVariant[];
  winnerVariantId: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

function parseVariants(raw: unknown): ExperimentVariant[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      if (typeof o.id !== "string" || typeof o.value !== "string") return null;
      return {
        id: o.id,
        label: typeof o.label === "string" ? o.label : o.id,
        kind: typeof o.kind === "string" ? o.kind : "subject",
        value: o.value,
        impressions: typeof o.impressions === "number" ? o.impressions : 0,
        opens: typeof o.opens === "number" ? o.opens : 0,
        clicks: typeof o.clicks === "number" ? o.clicks : 0,
        conversions: typeof o.conversions === "number" ? o.conversions : 0,
        revenue: typeof o.revenue === "number" ? o.revenue : 0,
      } satisfies ExperimentVariant;
    })
    .filter((v): v is ExperimentVariant => Boolean(v));
}

export function serializeExperiment(row: {
  id: string;
  name: string;
  targetKind: string;
  targetId: string;
  status: string;
  variants: unknown;
  winnerVariantId: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): EmailExperimentRow {
  return {
    id: row.id,
    name: row.name,
    targetKind: row.targetKind,
    targetId: row.targetId,
    status: row.status,
    variants: parseVariants(row.variants),
    winnerVariantId: row.winnerVariantId,
    startedAt: row.startedAt?.toISOString() ?? null,
    completedAt: row.completedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function createExperiment(input: {
  storeId: string;
  name: string;
  targetKind: string;
  targetId: string;
  variants: Array<{ label: string; kind: string; value: string }>;
}) {
  const variants: ExperimentVariant[] = input.variants.map((v, i) => ({
    id: `var_${i + 1}_${Math.random().toString(36).slice(2, 7)}`,
    label: v.label,
    kind: v.kind,
    value: v.value,
    impressions: 0,
    opens: 0,
    clicks: 0,
    conversions: 0,
    revenue: 0,
  }));

  const row = await prisma.emailExperiment.create({
    data: {
      storeId: input.storeId,
      name: input.name.trim(),
      targetKind: input.targetKind,
      targetId: input.targetId,
      status: "draft",
      variants: variants as unknown as Prisma.InputJsonValue,
      trafficSplit: Object.fromEntries(
        variants.map((v) => [v.id, Math.floor(100 / variants.length)])
      ) as Prisma.InputJsonValue,
    },
  });
  return serializeExperiment(row);
}

export async function startExperiment(storeId: string, id: string) {
  const existing = await prisma.emailExperiment.findFirst({
    where: { id, storeId },
  });
  if (!existing) throw new Error("Experiment not found");
  const row = await prisma.emailExperiment.update({
    where: { id },
    data: { status: "running", startedAt: new Date() },
  });
  return serializeExperiment(row);
}

/**
 * Pick a variant for a recipient (deterministic hash for sticky assignment).
 */
export function pickExperimentVariant(
  experiment: EmailExperimentRow,
  email: string
): ExperimentVariant | null {
  if (experiment.status === "completed" && experiment.winnerVariantId) {
    return (
      experiment.variants.find((v) => v.id === experiment.winnerVariantId) ||
      null
    );
  }
  if (experiment.variants.length === 0) return null;
  if (experiment.status !== "running") return experiment.variants[0];
  let hash = 0;
  const key = `${experiment.id}:${email.toLowerCase()}`;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return experiment.variants[hash % experiment.variants.length];
}

/**
 * Auto-promote winner when sample is large enough and lift is clear.
 */
export async function evaluateAndPromoteWinners(
  storeId: string
): Promise<{ promoted: number }> {
  const running = await prisma.emailExperiment.findMany({
    where: { storeId, status: "running" },
  });
  let promoted = 0;
  for (const exp of running) {
    const variants = parseVariants(exp.variants);
    if (variants.length < 2) continue;
    const ranked = [...variants].sort((a, b) => {
      const scoreA = a.clicks + a.conversions * 3 + a.revenue * 0.01;
      const scoreB = b.clicks + b.conversions * 3 + b.revenue * 0.01;
      return scoreB - scoreA;
    });
    const winner = ranked[0];
    const runner = ranked[1];
    const minSample = Math.min(...variants.map((v) => v.impressions));
    if (minSample < 40) continue;
    const lift =
      runner.impressions > 0
        ? (winner.clicks / Math.max(winner.impressions, 1) -
            runner.clicks / Math.max(runner.impressions, 1)) /
          Math.max(runner.clicks / Math.max(runner.impressions, 1), 0.001)
        : 1;
    if (lift < 0.1) continue;

    await prisma.emailExperiment.update({
      where: { id: exp.id },
      data: {
        status: "completed",
        winnerVariantId: winner.id,
        completedAt: new Date(),
        variants: variants as unknown as Prisma.InputJsonValue,
      },
    });
    promoted += 1;
  }
  return { promoted };
}

export async function listExperiments(storeId: string) {
  const rows = await prisma.emailExperiment.findMany({
    where: { storeId },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(serializeExperiment);
}
