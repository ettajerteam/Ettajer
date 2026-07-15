/**
 * CLI entry: `npx tsx lib/builder/verify.ts`
 * Verifies Builder V2 foundation backward compatibility.
 */

import { CORE_BLOCK_IDS } from "./blocks/core-blocks";
import { runBuilderCompatChecks } from "./compat";

const report = runBuilderCompatChecks();

if (report.ok) {
  console.log("✓ Builder V2 compat checks passed");
  console.log(`  Core blocks: ${CORE_BLOCK_IDS.length} registered with components`);
  console.log("  V1 round-trip: OK");
  console.log("  V1 JSON publish shape: OK");
  process.exit(0);
}

console.error("✗ Builder compat checks failed:");
for (const err of report.errors) {
  console.error(`  - ${err}`);
}
process.exit(1);
