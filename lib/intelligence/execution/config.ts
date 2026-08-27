/**
 * V9 execution config — deterministic thresholds only.
 */

export const EXECUTION_CONFIG = {
  /** Default approval TTL (ms) — fixed for determinism in tests via nowIso + ttl */
  approvalTtlMs: 60 * 60 * 1000,
  /** Material change thresholds for precondition re-check */
  materialChange: {
    pendingCODAbs: 1,
    supportAbs: 1,
    domainFailAbs: 1,
    revenuePct: 0.15,
  },
  /** Max blast radius allowed without elevated confirmation (still needs approval) */
  criticalBlastRequiresElevated: true,
  /** Default kill switch — DISABLED blocks all EXECUTE (planning still works) */
  defaultKillSwitch: "DISABLED" as const,
  /** Snapshot note */
  snapshotNote:
    "V9 governs execution. Snapshot never auto-executes. Default mode DRY_RUN. productionMutation=NONE.",
};

export const BLAST_RANK: Record<string, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
};
