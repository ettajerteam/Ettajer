/**
 * Smoke: Dr Sara V5 Digital Twin — local only.
 * Run: npx tsx scripts/smoke-dr-sara-v5.ts
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
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL missing");
    process.exit(1);
  }

  const snapshot = await getDrSaraSnapshot();
  const briefing = snapshotToBriefing(snapshot);

  console.log("========================================");
  console.log("DR SARA V5 DIGITAL TWIN REPORT");
  console.log("========================================");
  console.log(
    JSON.stringify(
      {
        version: snapshot.metadata.version,
        platformState: {
          health: snapshot.health.score,
          status: snapshot.health.status,
        },
        digitalTwin: snapshot.digitalTwin,
        signals: snapshot.signals.length,
        diagnoses: snapshot.diagnoses
          .filter((d) => d.diagnosisId !== "NONE")
          .map((d) => d.diagnosisId),
        earlyWarnings: snapshot.earlyWarnings,
        recovery: snapshot.recovery,
        scenarioCandidates: snapshot.scenarios.map((s) => ({
          id: s.scenarioId,
          kind: s.kind,
          label: s.label,
        })),
        noActionScenario: snapshot.scenarios.find((s) => s.kind === "NO_ACTION"),
        topScenario: snapshot.topScenario,
        topAction: snapshot.topAction?.label ?? null,
        interventionAdvantage: snapshot.interventionAdvantage,
        counterfactuals: snapshot.counterfactuals,
        merchantTwins: snapshot.merchantTwins.slice(0, 5),
        portfolioScenarios: snapshot.portfolioScenarios,
        stateTrajectory: snapshot.stateTrajectory,
        uncertainty: snapshot.uncertainty,
        dataQuality: snapshot.dataQualityV2,
        decisionChanges: snapshot.decisionChanges,
        escalationRisk: snapshot.escalationRisk,
        recoverySimulation: snapshot.recoverySimulation,
        executionTrace: snapshot.executionTraceV4,
        autoExecute: snapshot.autonomy.autoExecute,
        uiBriefingScore: briefing.pulse.score,
        uiTopAction: briefing.actions[0]?.label ?? null,
      },
      null,
      2
    )
  );
  console.log("========================================");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
