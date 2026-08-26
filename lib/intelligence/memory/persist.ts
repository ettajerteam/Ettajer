/**
 * Load / persist Dr Sara memory via AdminAuditLog (reuse existing model).
 * Soft-fails — empty memory if DB unavailable.
 */
import type { IntelligenceMemory } from "@/lib/intelligence/memory/types";
import { emptyIntelligenceMemory } from "@/lib/intelligence/memory/types";
import { memoryFromSerializable } from "@/lib/intelligence/memory/store";

const MEMORY_ACTION = "dr_sara.memory.snapshot";
const SYSTEM_ACTOR = {
  actorId: "system:dr-sara",
  actorEmail: "dr-sara@ettajer.system",
};

export async function loadIntelligenceMemory(): Promise<IntelligenceMemory> {
  try {
    const { prisma } = await import("@/lib/db");
    const row = await prisma.adminAuditLog.findFirst({
      where: { action: MEMORY_ACTION },
      orderBy: { createdAt: "desc" },
    });
    if (!row?.metadata || typeof row.metadata !== "object") {
      return emptyIntelligenceMemory();
    }
    return memoryFromSerializable(
      row.metadata as Parameters<typeof memoryFromSerializable>[0]
    );
  } catch {
    return emptyIntelligenceMemory();
  }
}

export async function persistIntelligenceMemory(
  memory: IntelligenceMemory
): Promise<boolean> {
  try {
    const { logAdminAction } = await import("@/lib/admin/audit");
    await logAdminAction({
      ...SYSTEM_ACTOR,
      action: MEMORY_ACTION,
      targetType: "platform",
      targetId: "dr-sara",
      metadata: {
        observations: memory.observations.slice(-20),
        interventions: memory.interventions.slice(-50),
        outcomes: memory.outcomes.slice(-50),
        lastCycleId: memory.lastCycleId,
        rulePerformance: memory.rulePerformance,
      },
    });
    return true;
  } catch {
    return false;
  }
}
