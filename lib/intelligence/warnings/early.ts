/**
 * Early warning + recovery state machines (deterministic).
 */
import { INTELLIGENCE_SCORING_CONFIG as C } from "@/lib/intelligence/config/scoring";
import type { PlatformState } from "@/lib/intelligence/engine-types";
import type { IntelligenceObservation } from "@/lib/intelligence/memory/types";

export type WarningLifecycle =
  | "WATCH"
  | "RISING"
  | "ESCALATING"
  | "CRITICAL"
  | "RECOVERING"
  | "RESOLVED";

export type EarlyWarning = {
  id: string;
  metric: string;
  state: WarningLifecycle;
  current: number;
  previous: number | null;
  velocity: number;
  acceleration: number;
  recoveryScore: number;
  recoveryVelocity: number;
  ruleId: string;
  evidence: string[];
  confidence: number;
};

function seriesFor(
  metric: keyof IntelligenceObservation["metrics"],
  history: IntelligenceObservation[],
  current: number
): number[] {
  const vals = history.map((h) => h.metrics[metric]);
  return [...vals, current];
}

function classifySeries(
  values: number[],
  criticalThreshold: number,
  lowerIsWorse: boolean
): {
  state: WarningLifecycle;
  velocity: number;
  acceleration: number;
  recoveryScore: number;
  recoveryVelocity: number;
} {
  if (values.length === 0) {
    return {
      state: "WATCH",
      velocity: 0,
      acceleration: 0,
      recoveryScore: 0,
      recoveryVelocity: 0,
    };
  }
  const current = values[values.length - 1]!;
  const previous = values.length > 1 ? values[values.length - 2]! : current;
  const older = values.length > 2 ? values[values.length - 3]! : previous;
  const velocity = current - previous;
  const prevVelocity = previous - older;
  const acceleration = velocity - prevVelocity;

  const atCritical = lowerIsWorse
    ? current >= criticalThreshold
    : current <= criticalThreshold;

  // Recovery: decreasing when lowerIsWorse
  const recovering =
    lowerIsWorse &&
    velocity < 0 &&
    Math.abs(velocity) >=
      Math.max(C.earlyWarning.risingDelta, previous * C.earlyWarning.recoveringDropRatio);

  if (current === 0 && previous > 0 && lowerIsWorse) {
    return {
      state: "RESOLVED",
      velocity,
      acceleration,
      recoveryScore: 1,
      recoveryVelocity: -velocity,
    };
  }
  if (recovering) {
    const recoveryScore = Math.min(
      1,
      Math.abs(velocity) / Math.max(1, previous)
    );
    return {
      state: "RECOVERING",
      velocity,
      acceleration,
      recoveryScore,
      recoveryVelocity: -velocity,
    };
  }
  if (atCritical) {
    return {
      state: "CRITICAL",
      velocity,
      acceleration,
      recoveryScore: 0,
      recoveryVelocity: 0,
    };
  }
  if (
    lowerIsWorse &&
    velocity > 0 &&
    prevVelocity > 0 &&
    values.length >= C.earlyWarning.escalatingSteps + 1
  ) {
    return {
      state: "ESCALATING",
      velocity,
      acceleration,
      recoveryScore: 0,
      recoveryVelocity: 0,
    };
  }
  if (lowerIsWorse && velocity >= C.earlyWarning.risingDelta) {
    return {
      state: "RISING",
      velocity,
      acceleration,
      recoveryScore: 0,
      recoveryVelocity: 0,
    };
  }
  if (current > 0 && lowerIsWorse) {
    return {
      state: "WATCH",
      velocity,
      acceleration,
      recoveryScore: 0,
      recoveryVelocity: 0,
    };
  }
  return {
    state: "WATCH",
    velocity,
    acceleration,
    recoveryScore: 0,
    recoveryVelocity: 0,
  };
}

export function detectEarlyWarnings(
  state: PlatformState,
  history: IntelligenceObservation[]
): EarlyWarning[] {
  const out: EarlyWarning[] = [];

  const codSeries = seriesFor(
    "pendingRealOrders",
    history,
    state.pendingRealOrders
  );
  const cod = classifySeries(codSeries, 10, true);
  if (state.pendingRealOrders > 0 || cod.state !== "WATCH" || history.length > 0) {
    if (state.pendingRealOrders > 0 || ["RISING", "ESCALATING", "CRITICAL", "RECOVERING", "RESOLVED"].includes(cod.state)) {
      out.push({
        id: "ew-cod",
        metric: "pendingRealOrders",
        state: cod.state,
        current: state.pendingRealOrders,
        previous:
          history.length > 0
            ? history[history.length - 1]!.metrics.pendingRealOrders
            : null,
        velocity: cod.velocity,
        acceleration: cod.acceleration,
        recoveryScore: cod.recoveryScore,
        recoveryVelocity: cod.recoveryVelocity,
        ruleId: "EARLY_WARNING_COD",
        evidence: [
          `pendingCOD series=${codSeries.join("→")}`,
          `velocity=${cod.velocity}`,
          `acceleration=${cod.acceleration}`,
        ],
        confidence: 0.9,
      });
    }
  }

  const supportSeries = seriesFor("openSupport", history, state.openSupport);
  const support = classifySeries(supportSeries, 3, true);
  if (state.openSupport > 0 || ["RISING", "ESCALATING", "CRITICAL", "RECOVERING"].includes(support.state)) {
    out.push({
      id: "ew-support",
      metric: "openSupport",
      state: support.state,
      current: state.openSupport,
      previous:
        history.length > 0
          ? history[history.length - 1]!.metrics.openSupport
          : null,
      velocity: support.velocity,
      acceleration: support.acceleration,
      recoveryScore: support.recoveryScore,
      recoveryVelocity: support.recoveryVelocity,
      ruleId: "EARLY_WARNING_SUPPORT",
      evidence: [`support series=${supportSeries.join("→")}`],
      confidence: 0.85,
    });
  }

  const dnsSeries = seriesFor("domainFailing", history, state.domainFailing);
  const dns = classifySeries(dnsSeries, 3, true);
  if (state.domainFailing > 0 || ["RISING", "ESCALATING", "CRITICAL", "RECOVERING"].includes(dns.state)) {
    out.push({
      id: "ew-dns",
      metric: "domainFailing",
      state: dns.state,
      current: state.domainFailing,
      previous:
        history.length > 0
          ? history[history.length - 1]!.metrics.domainFailing
          : null,
      velocity: dns.velocity,
      acceleration: dns.acceleration,
      recoveryScore: dns.recoveryScore,
      recoveryVelocity: dns.recoveryVelocity,
      ruleId: "EARLY_WARNING_DNS",
      evidence: [`dns series=${dnsSeries.join("→")}`],
      confidence: 0.9,
    });
  }

  return out;
}

export function shouldSuppressIntervention(input: {
  type: string;
  warnings: EarlyWarning[];
  cooldownActive: boolean;
}): { suppress: boolean; reason: string } {
  if (input.cooldownActive) {
    return {
      suppress: true,
      reason: "Cooldown active and no retrigger condition met.",
    };
  }
  if (input.type === "COD_VERIFICATION") {
    const w = input.warnings.find((x) => x.metric === "pendingRealOrders");
    if (w && (w.state === "RECOVERING" || w.state === "RESOLVED")) {
      return {
        suppress: true,
        reason: "COD backlog is recovering — do not re-recommend.",
      };
    }
  }
  if (input.type === "DNS_DIAGNOSIS") {
    const w = input.warnings.find((x) => x.metric === "domainFailing");
    if (w && (w.state === "RECOVERING" || w.state === "RESOLVED")) {
      return {
        suppress: true,
        reason: "DNS failures recovering — do not re-recommend.",
      };
    }
  }
  return { suppress: false, reason: "" };
}
