/**
 * Autonomy levels + safe cycle runner (recommend-only by default).
 */
import { INTELLIGENCE_SCORING_CONFIG as C } from "@/lib/intelligence/config/scoring";

export type AutonomyLevel = 0 | 1 | 2 | 3 | 4;

export const AUTONOMY_LABELS: Record<AutonomyLevel, string> = {
  0: "OBSERVE_ONLY",
  1: "RECOMMEND",
  2: "PREPARE",
  3: "EXECUTE_SAFE_ACTIONS",
  4: "MULTI_STEP_AUTONOMY",
};

export type AutonomyPolicy = {
  level: AutonomyLevel;
  autoExecute: boolean;
  label: string;
};

export function getAutonomyPolicy(
  override?: Partial<AutonomyPolicy>
): AutonomyPolicy {
  const level = (override?.level ??
    C.autonomy.defaultLevel) as AutonomyLevel;
  return {
    level,
    autoExecute: override?.autoExecute ?? C.autonomy.autoExecute,
    label: AUTONOMY_LABELS[level],
  };
}

/** Only explicitly safe reversible ops — still gated by autoExecute=false default */
export const SAFE_AUTO_EXECUTE_TYPES = new Set<string>([
  // Intentionally empty for V4 default — classification only
]);

export function mayAutoExecute(
  type: string,
  policy: AutonomyPolicy
): { allowed: boolean; reason: string } {
  if (!policy.autoExecute || policy.level < 3) {
    return {
      allowed: false,
      reason: "AUTO_EXECUTE disabled — recommend only.",
    };
  }
  if (!SAFE_AUTO_EXECUTE_TYPES.has(type)) {
    return {
      allowed: false,
      reason: `${type} is not classified as safely auto-executable.`,
    };
  }
  return { allowed: true, reason: "Safe auto-execute permitted." };
}
