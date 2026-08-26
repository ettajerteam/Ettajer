/**
 * Global V10 safety / autonomy governor — fail closed.
 */
import type { GovernanceVerdict, GovernorDecision } from "@/lib/intelligence/os/types";
import { getKillSwitch } from "@/lib/intelligence/execution/kill-switch";
import type { AutonomyResolution } from "@/lib/intelligence/os/types";
import type { ConflictResult } from "@/lib/intelligence/os/types";

export function runOsGovernor(input: {
  dataQuality: string;
  stateFresh: boolean;
  interventionRegistered: boolean;
  approvalValid: boolean;
  approvalRequired: boolean;
  riskAcceptable: boolean;
  blastAcceptable: boolean;
  dependenciesSatisfied: boolean;
  conflicts: ConflictResult;
  budgetExceeded: boolean;
  autonomy: AutonomyResolution;
  /** Intelligence alone never authorizes */
  authorizeViaIntelligence: boolean;
}): GovernanceVerdict {
  const checks: GovernanceVerdict["checks"] = [];
  const add = (id: string, ok: boolean, reason: string) => {
    checks.push({ id, status: ok ? "PASS" : "FAIL", reason });
  };

  add(
    "data_quality",
    !["INSUFFICIENT", "BLOCKED"].includes(input.dataQuality),
    `dataQuality=${input.dataQuality}`
  );
  add("state_fresh", input.stateFresh, input.stateFresh ? "State fresh." : "Stale state.");
  add(
    "registry",
    input.interventionRegistered,
    input.interventionRegistered ? "Registered." : "Unregistered intervention."
  );
  add(
    "kill_switch",
    true,
    `Kill switch=${getKillSwitch()} (EXECUTE still gated by V9).`
  );
  add(
    "risk",
    input.riskAcceptable,
    input.riskAcceptable ? "Risk acceptable for recommend." : "Risk not acceptable."
  );
  add(
    "blast",
    input.blastAcceptable,
    input.blastAcceptable ? "Blast acceptable." : "Blast too high."
  );
  add(
    "dependencies",
    input.dependenciesSatisfied,
    input.dependenciesSatisfied ? "Dependencies OK." : "Unresolved dependencies."
  );
  add(
    "conflicts",
    !input.conflicts.conflicts.some((c) => c.severity === "BLOCK"),
    input.conflicts.status === "NO_CONFLICT"
      ? "NO_CONFLICT"
      : "Conflicts present."
  );
  add(
    "budget",
    !input.budgetExceeded,
    input.budgetExceeded ? "Budget exceeded." : "Budget OK."
  );
  add(
    "intelligence_not_auth",
    !input.authorizeViaIntelligence,
    "Intelligence ≠ authorization (separation held)."
  );

  if (input.approvalRequired) {
    add(
      "approval",
      input.approvalValid,
      input.approvalValid
        ? "Approval present."
        : "APPROVAL_REQUIRED — human approval not yet granted."
    );
  } else {
    add("approval", true, "Approval not required for recommend-only.");
  }

  const hardFail = checks.filter((c) => c.status === "FAIL");
  let decision: GovernorDecision = "ALLOWED";
  const reasons: string[] = [];

  if (hardFail.some((c) => c.id === "intelligence_not_auth")) {
    decision = "BLOCKED";
    reasons.push("Intelligence cannot authorize execution.");
  } else if (
    hardFail.some((c) =>
      ["data_quality", "state_fresh", "registry", "dependencies", "conflicts", "budget"].includes(
        c.id
      )
    )
  ) {
    decision = "BLOCKED";
    reasons.push(...hardFail.map((c) => c.reason));
  } else if (input.approvalRequired && !input.approvalValid) {
    decision = "APPROVAL_REQUIRED";
    reasons.push("Human approval required before V9 execute.");
  } else if (input.autonomy.mode === "OBSERVE") {
    decision = "DEFERRED";
    reasons.push("Autonomy OBSERVE — no execution path.");
  } else if (getKillSwitch() === "DISABLED") {
    decision = "APPROVAL_REQUIRED";
    reasons.push("Kill switch DISABLED — V9 EXECUTE blocked; approval/recommend only.");
  } else {
    decision = "APPROVAL_REQUIRED";
    reasons.push(
      "Even when checks pass, default policy requires approval (CONTROLLED_AUTO disabled)."
    );
  }

  // Never ALLOWED for production execute under default policy
  if (decision === "ALLOWED" && !input.autonomy.controlledAutoEnabled) {
    decision = "APPROVAL_REQUIRED";
    reasons.push("CONTROLLED_AUTO disabled — demote ALLOWED → APPROVAL_REQUIRED.");
  }

  return { decision, reasons, checks };
}
