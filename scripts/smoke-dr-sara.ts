/**
 * Smoke: Dr Sara Intelligence OS V3 against live platform overview.
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
  // Prefer real DATABASE_URL from env files over empty shell overrides
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL missing");
    process.exit(1);
  }

  const start = Date.now();
  const snapshot = await getDrSaraSnapshot();
  const briefing = snapshotToBriefing(snapshot);
  const ms = Date.now() - start;
  const trace = snapshot.executionTrace;

  console.log("======== Dr Sara V3 Intelligence Execution Report ========");
  console.log(
    JSON.stringify(
      {
        ms,
        version: snapshot.metadata.version,
        health: snapshot.health.score,
        status: snapshot.health.status,
        executionTrace: trace,
        rulesEvaluated: trace.rulesEvaluated,
        rulesFired: trace.rulesFired,
        signals: snapshot.signals.length,
        diagnoses: snapshot.diagnoses
          .filter((d) => d.diagnosisId !== "NONE")
          .map((d) => d.diagnosisId),
        topAction: snapshot.topAction,
        topIntervention: snapshot.topIntervention,
        merchantTargets: snapshot.merchantIntelligence.slice(0, 8).map((m) => ({
          id: m.merchantId,
          name: m.storeName,
          stage: m.lifecycleStage,
          bottleneck: m.bottleneck,
          interventionScore: m.interventionScore,
        })),
        interventions: snapshot.interventions.slice(0, 6).map((i) => ({
          type: i.type,
          merchantId: i.merchantId,
          priority: i.priority,
          route: i.recommendedRoute,
        })),
        causalHypotheses: snapshot.causalHypotheses.map((c) => ({
          ruleId: c.ruleId,
          confidence: c.confidence,
          hypothesis: c.hypothesis.slice(0, 100),
        })),
        anomalies: snapshot.anomalies.map((a) => ({
          ruleId: a.ruleId,
          title: a.title,
          deltaPct: a.deltaPct,
        })),
        forecasts: snapshot.forecasts.map((f) => ({
          id: f.id,
          direction: f.forecastDirection,
          confidence: f.confidence,
          statement: f.statement.slice(0, 80),
        })),
        bottlenecks: snapshot.bottlenecks.slice(0, 4),
        richSegments: snapshot.richSegments.slice(0, 8),
        dataQualityWarnings: snapshot.dataQualityWarnings,
        whyFirst: snapshot.whyFirst,
        graph: snapshot.graph,
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
