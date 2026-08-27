/**
 * Global execution kill switch — runtime checked, not planning-only.
 * Default DISABLED → blocks all EXECUTE / production-bound paths.
 * Planning (V8) and DRY_RUN validation still work when DISABLED for
 * read-only governance checks; EXECUTE is always blocked when DISABLED.
 */
import type { KillSwitchState } from "@/lib/intelligence/execution/types";
import { EXECUTION_CONFIG } from "@/lib/intelligence/execution/config";

let killSwitch: KillSwitchState = EXECUTION_CONFIG.defaultKillSwitch;

export function getKillSwitch(): KillSwitchState {
  return killSwitch;
}

export function setKillSwitch(state: KillSwitchState): void {
  killSwitch = state;
}

export function resetKillSwitch(): void {
  killSwitch = EXECUTION_CONFIG.defaultKillSwitch;
}

export function isExecutionAllowedByKillSwitch(): boolean {
  return killSwitch === "ENABLED";
}
