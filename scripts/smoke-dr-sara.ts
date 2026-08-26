/**
 * Smoke: Dr Sara intelligence engine against live platform overview.
 * Run: npx tsx scripts/smoke-dr-sara.ts
 */
import fs from "fs";
import { getDrSaraSnapshot, snapshotToBriefing } from "../lib/intelligence";

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
  const snapshot = await getDrSaraSnapshot();
  const briefing = snapshotToBriefing(snapshot);
  const ms = Date.now() - start;

  console.log(
    JSON.stringify(
      {
        ms,
        engine: snapshot.metadata,
        health: {
          score: snapshot.health.score,
          status: snapshot.health.status,
          dimensions: snapshot.health.dimensions,
          reasons: snapshot.health.reasons,
        },
        signals: snapshot.signals.map((s) => ({
          id: s.id,
          severity: s.severity,
          ruleId: s.ruleId,
        })),
        correlations: snapshot.correlations.map((c) => c.id),
        diagnoses: snapshot.diagnoses.map((d) => d.diagnosisId),
        priorities: snapshot.priorities.map((p) => ({
          id: p.signalId,
          score: p.priorityScore,
          band: p.band,
        })),
        criticalCount: snapshot.criticalCount,
        opportunities: snapshot.opportunities.length,
        risks: snapshot.risks.length,
        actions: snapshot.recommendedActions.map((a) => a.href),
        uiBriefingScore: briefing.pulse.score,
        samplePriority: snapshot.priorities[0]
          ? {
              title: snapshot.priorities[0].title,
              ruleId: snapshot.priorities[0].ruleId,
              calculation: snapshot.priorities[0].calculation,
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
