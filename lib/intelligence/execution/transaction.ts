/**
 * Sandbox transaction — atomic apply / rollback of sandbox mutations.
 * Never touches Prisma.
 */
import type { PlatformState } from "@/lib/intelligence/engine-types";
import type {
  SandboxMutation,
  TransactionResult,
} from "@/lib/intelligence/execution/types";
import type { InterventionHandler } from "@/lib/intelligence/execution/registry";

export function runSandboxTransaction(input: {
  state: PlatformState;
  handler: InterventionHandler;
  targetCount: number;
  baseline: Record<string, number>;
  /** Simulate failure after N mutations (0 = no forced failure) */
  failAfter?: number;
}): {
  result: TransactionResult;
  state: PlatformState;
  snapshotBefore: PlatformState;
} {
  const snapshotBefore = cloneState(input.state);
  const applied: SandboxMutation[] = [];

  try {
    const out = input.handler({
      state: cloneState(input.state),
      targetCount: input.targetCount,
      baseline: input.baseline,
    });

    for (let i = 0; i < out.mutations.length; i++) {
      const m = out.mutations[i]!;
      applied.push(m);
      if (input.failAfter !== undefined && i + 1 >= input.failAfter) {
        throw new Error(`Forced failure after mutation ${m.opId}`);
      }
    }

    return {
      result: {
        committed: true,
        rolledBack: false,
        partialFailure: false,
        mutations: applied,
        reason: "Sandbox transaction committed.",
      },
      state: out.state,
      snapshotBefore,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Transaction failed";
    const reversible = applied.every((m) => m.reversible);
    if (reversible) {
      return {
        result: {
          committed: false,
          rolledBack: true,
          partialFailure: false,
          mutations: applied,
          reason: `Rolled back: ${msg}`,
        },
        state: snapshotBefore,
        snapshotBefore,
      };
    }
    return {
      result: {
        committed: false,
        rolledBack: false,
        partialFailure: true,
        mutations: applied,
        reason: `Partial failure (irreversible ops): ${msg}`,
      },
      state: input.state,
      snapshotBefore,
    };
  }
}

function cloneState(s: PlatformState): PlatformState {
  return structuredClone(s);
}
