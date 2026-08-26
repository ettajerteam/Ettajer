/**
 * Smoke: Dr Sara briefing loads from live platform overview.
 * Run: npx tsx scripts/smoke-dr-sara.ts
 */
import fs from "fs";
import { getDrSaraBriefing } from "../lib/intelligence";

function loadEnv(path: string) {
  if (!fs.existsSync(path)) return;
  for (const line of fs.readFileSync(path, "utf8").split("\n")) {
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    const k = line.slice(0, i);
    let v = line.slice(i + 1);
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

async function main() {
  loadEnv(".env.local");
  loadEnv(".env");

  const start = Date.now();
  const briefing = await getDrSaraBriefing();
  const ms = Date.now() - start;

  console.log(
    JSON.stringify(
      {
        ms,
        score: briefing.pulse.score,
        label: briefing.pulse.label,
        dimensions: briefing.pulse.dimensions.map((d) => ({
          id: d.id,
          status: d.status,
          statusLabel: d.statusLabel,
        })),
        priorities: briefing.priorities.length,
        criticalCount: briefing.criticalCount,
        feed: briefing.feed.length,
        opportunities: briefing.opportunities.length,
        risks: briefing.risks.length,
        segments: briefing.segments.map((s) => ({
          id: s.id,
          count: s.count,
        })),
        actions: briefing.actions.map((a) => a.href),
        samplePriority: briefing.priorities[0]
          ? {
              signal: briefing.priorities[0].signal,
              rule: briefing.priorities[0].explanation.rule,
              source: briefing.priorities[0].explanation.source,
            }
          : null,
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
