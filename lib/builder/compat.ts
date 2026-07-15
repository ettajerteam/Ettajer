/**
 * Backward-compatibility checks for Builder V2 foundation.
 * Safe to run in CI or locally — no side effects.
 */

import { blockRegistry } from "./block-registry-service";
import { CORE_BLOCK_IDS } from "./blocks/core-blocks";
import { getDefaultHomeLayout } from "@/lib/sections/defaults";
import { serializeHomeLayout } from "@/lib/sections/parse";
import {
  homeLayoutToV2,
  v2ToHomeLayout,
  isV1V2Compatible,
} from "./v2/adapters";

export interface BuilderCompatReport {
  ok: boolean;
  coreBlocksRegistered: boolean;
  coreBlocksImplemented: boolean;
  defaultLayoutRoundTrip: boolean;
  missingCoreBlocks: string[];
  errors: string[];
}

/** Ensure all five core storefront blocks are registered with React components. */
export function verifyCoreBlocks(): Pick<
  BuilderCompatReport,
  "coreBlocksRegistered" | "coreBlocksImplemented" | "missingCoreBlocks"
> {
  const missingCoreBlocks: string[] = [];
  let coreBlocksImplemented = true;

  for (const id of CORE_BLOCK_IDS) {
    const block = blockRegistry.get(id);
    if (!block) {
      missingCoreBlocks.push(id);
      coreBlocksImplemented = false;
      continue;
    }
    if (!block.implemented || !block.component) {
      coreBlocksImplemented = false;
      missingCoreBlocks.push(id);
    }
  }

  return {
    coreBlocksRegistered: missingCoreBlocks.length === 0,
    coreBlocksImplemented: coreBlocksImplemented && missingCoreBlocks.length === 0,
    missingCoreBlocks,
  };
}

/** V1 JSON serialization must remain stable for publish paths. */
export function verifyV1JsonStable(): boolean {
  const layout = getDefaultHomeLayout();
  const a = JSON.stringify(serializeHomeLayout(layout));
  const b = JSON.stringify(
    serializeHomeLayout(JSON.parse(JSON.stringify(layout)) as ReturnType<typeof getDefaultHomeLayout>)
  );
  return a === b;
}

/** Structural V1 → V2 → V1 (ids, types, visibility) — settings may gain merged defaults. */
export function verifyDefaultLayoutRoundTrip(): boolean {
  const layout = getDefaultHomeLayout();
  const doc = homeLayoutToV2(layout);
  if (!isV1V2Compatible(doc)) return false;
  const restored = v2ToHomeLayout(doc);
  if (restored.sections.length !== layout.sections.length) return false;
  return layout.sections.every((section, index) => {
    const back = restored.sections[index];
    return (
      back &&
      section.id === back.id &&
      section.type === back.type &&
      section.visible === back.visible
    );
  });
}

export function runBuilderCompatChecks(): BuilderCompatReport {
  const errors: string[] = [];
  const core = verifyCoreBlocks();

  if (!core.coreBlocksRegistered) {
    errors.push(`Missing core blocks: ${core.missingCoreBlocks.join(", ")}`);
  }
  if (!core.coreBlocksImplemented) {
    errors.push("One or more core blocks lack an implemented React component.");
  }

  const defaultLayoutRoundTrip = verifyDefaultLayoutRoundTrip();
  if (!defaultLayoutRoundTrip) {
    errors.push("Default home layout failed V1 → V2 → V1 round-trip.");
  }

  const v1Stable = verifyV1JsonStable();
  if (!v1Stable) {
    errors.push("V1 layout JSON serialization is not stable.");
  }

  return {
    ok:
      core.coreBlocksRegistered &&
      core.coreBlocksImplemented &&
      defaultLayoutRoundTrip &&
      v1Stable,
    ...core,
    defaultLayoutRoundTrip,
    errors,
  };
}
