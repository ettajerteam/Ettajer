/**
 * V10 autonomy resolver — CONTROLLED_AUTO disabled by default.
 */
import { OS_CONFIG } from "@/lib/intelligence/os/config";
import type {
  AutonomyMode,
  AutonomyResolution,
} from "@/lib/intelligence/os/types";
import { getKillSwitch } from "@/lib/intelligence/execution/kill-switch";

export function resolveAutonomy(input: {
  items: {
    interventionType: string;
    risk: string;
    blastRadius: string;
    confidence: number;
    reversibility: number;
    historicalReliability: string;
    approvalRequired: boolean;
  }[];
  dataQuality: string;
  /** Explicit override — default false */
  controlledAutoEnabled?: boolean;
}): AutonomyResolution {
  const controlledAutoEnabled =
    input.controlledAutoEnabled ?? OS_CONFIG.controlledAutoEnabled;

  const perIntervention = input.items.map((it) => {
    const reasons: string[] = [];
    let maxMode: AutonomyMode = "OBSERVE";

    if (input.dataQuality === "INSUFFICIENT" || input.dataQuality === "BLOCKED") {
      maxMode = "OBSERVE";
      reasons.push("Data quality insufficient — observe only.");
    } else if (it.approvalRequired || it.risk === "HIGH" || it.risk === "CRITICAL") {
      maxMode = "APPROVAL_REQUIRED";
      reasons.push("High risk or approval required.");
    } else if (it.blastRadius === "HIGH" || it.blastRadius === "CRITICAL") {
      maxMode = "APPROVAL_REQUIRED";
      reasons.push("High blast radius requires approval.");
    } else if (
      it.risk === "LOW" &&
      it.confidence >= 0.8 &&
      it.reversibility >= 0.7 &&
      it.historicalReliability === "HIGH" &&
      it.blastRadius === "LOW"
    ) {
      maxMode = controlledAutoEnabled ? "CONTROLLED_AUTO" : "APPROVAL_REQUIRED";
      reasons.push(
        controlledAutoEnabled
          ? "Qualifies for CONTROLLED_AUTO under explicit policy."
          : "Would qualify for CONTROLLED_AUTO but policy DISABLED → APPROVAL_REQUIRED."
      );
    } else {
      maxMode = "RECOMMEND";
      reasons.push("Default recommend / approval path.");
    }

    if (getKillSwitch() === "DISABLED" && maxMode === "CONTROLLED_AUTO") {
      maxMode = "APPROVAL_REQUIRED";
      reasons.push("Kill switch DISABLED overrides CONTROLLED_AUTO.");
    }

    return {
      interventionType: it.interventionType,
      maxMode,
      reasons,
    };
  });

  const mode: AutonomyMode =
    perIntervention.some((p) => p.maxMode === "APPROVAL_REQUIRED")
      ? "APPROVAL_REQUIRED"
      : perIntervention.some((p) => p.maxMode === "RECOMMEND")
        ? "RECOMMEND"
        : "OBSERVE";

  return {
    mode: controlledAutoEnabled && mode === "APPROVAL_REQUIRED" ? mode : mode,
    controlledAutoEnabled,
    autoExecute: false,
    perIntervention,
    reasons: [
      `Default autonomy policy: CONTROLLED_AUTO=${controlledAutoEnabled ? "ENABLED" : "DISABLED"}`,
      "autoExecute=false (hard invariant)",
      `Resolved platform mode=${mode}`,
    ],
  };
}
