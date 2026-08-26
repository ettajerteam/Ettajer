/**
 * Smoke: Dr Sara intelligence engine V2 against live platform overview.
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
        version: snapshot.metadata.version,
        health: snapshot.health.score,
        status: snapshot.health.status,
        topAction: snapshot.topAction,
        topActions: snapshot.topActions.slice(0, 4),
        bottlenecks: snapshot.bottlenecks.slice(0, 4),
        temporalTrends: snapshot.temporalTrends.map((t) => ({
          id: t.id,
          deltaPct: t.deltaPct,
          direction: t.direction,
          acceleration: t.acceleration,
        })),
        forecasts: snapshot.forecasts.map((f) => ({
          id: f.id,
          direction: f.forecastDirection,
          statement: f.statement.slice(0, 80),
        })),
        correlations: snapshot.correlations.map((c) => c.id),
        diagnoses: snapshot.diagnoses.map((d) => d.diagnosisId),
        registryFired: snapshot.registryFired,
        events: snapshot.events.length,
        journeys: snapshot.merchantJourneys.length,
        dataQualityWarnings: snapshot.dataQualityWarnings,
        actionOutcomes: snapshot.actionOutcomes,
        confidence: snapshot.confidence,
        uiBriefingScore: briefing.pulse.score,
        uiTopAction: briefing.actions[0]?.label,
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
