/**
 * Smoke: Dr Sara Intelligence OS V4 against live platform overview.
 * Run: npx tsx scripts/smoke-dr-sara-v4.ts
 */
import fs from "fs";
import {
  getDrSaraSnapshot,
  snapshotToBriefing,
} from "../lib/intelligence";

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
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL missing");
    process.exit(1);
  }

  const start = Date.now();
  const snapshot = await getDrSaraSnapshot();
  const briefing = snapshotToBriefing(snapshot);
  const ms = Date.now() - start;

  console.log("======== DR SARA V4 EXECUTION REPORT ========");
  console.log(
    JSON.stringify(
      {
        ms,
        version: snapshot.metadata.version,
        rulesEvaluated: snapshot.executionTrace.rulesEvaluated,
        rulesFired: snapshot.executionTrace.rulesFired,
        signals: snapshot.signals.length,
        diagnoses: snapshot.diagnoses
          .filter((d) => d.diagnosisId !== "NONE")
          .map((d) => d.diagnosisId),
        earlyWarnings: snapshot.earlyWarnings.map((w) => ({
          metric: w.metric,
          state: w.state,
          current: w.current,
        })),
        recovery: snapshot.recovery,
        interventionCandidates: snapshot.interventions.length,
        blockedInterventions: snapshot.blockedInterventions.length,
        topAction: snapshot.topAction?.label ?? null,
        topIntervention: snapshot.topIntervention,
        historicalEffectiveness: snapshot.decisionV4.historicalEffectiveness,
        scoreComponents: snapshot.decisionV4.scoreComponents,
        whyThisActionWon: snapshot.decisionV4.whyThisActionWon,
        merchantTargets: snapshot.merchantIntelligence.slice(0, 8).map((m) => ({
          id: m.merchantId,
          name: m.storeName,
          stage: m.lifecycleStage,
          bottleneck: m.bottleneck,
        })),
        forecasts: snapshot.forecasts.map((f) => ({
          id: f.id,
          direction: f.forecastDirection,
          confidence: f.confidence,
        })),
        anomalies: snapshot.anomalies.map((a) => ({
          ruleId: a.ruleId,
          title: a.title,
        })),
        stateTransitions: snapshot.stateTransitions
          ? {
              overall: snapshot.stateTransitions.overall,
              evidence: snapshot.stateTransitions.evidence,
            }
          : null,
        interventionChains: snapshot.interventionChains,
        learning: snapshot.learning,
        dataQuality: snapshot.dataQualityV2,
        autonomy: snapshot.autonomy,
        executionTrace: snapshot.executionTraceV4,
        explainabilityV4: snapshot.explainabilityV4
          ? {
              decision: snapshot.explainabilityV4.decision,
              whatWeExpect: snapshot.explainabilityV4.whatWeExpect,
              whatHappenedLastTime:
                snapshot.explainabilityV4.whatHappenedLastTime,
            }
          : null,
        uiBriefingScore: briefing.pulse.score,
        uiTopAction: briefing.actions[0]?.label ?? null,
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
