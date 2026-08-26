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
  const top = snapshot.topScenario;
  const codForecast = snapshot.scenarioForecasts.find(
    (s) =>
      s.label.includes("COD") || s.scenarioId.includes("cod")
  );
  const pendingBefore =
    codForecast?.metrics.pendingCOD?.before ??
    snapshot.digitalTwin?.metrics.pendingCOD ??
    null;
  const pendingAfter =
    codForecast?.metrics.pendingCOD?.expectedAfter ?? null;

  console.log("========================================");
  console.log("DR SARA V5 EXECUTION REPORT");
  console.log("========================================");
  console.log(`Version: ${snapshot.metadata.version}`);
  console.log(
    `Twin status: hash=${snapshot.digitalTwin?.twinHash} confidence=${snapshot.digitalTwin?.confidence}`
  );
  console.log(
    `Data quality: ${snapshot.scenarioDataQuality?.status} warnings=${snapshot.scenarioDataQuality?.warnings.length ?? 0}`
  );
  console.log(
    `Rules evaluated: signals=${snapshot.signals.length} diagnoses=${snapshot.diagnoses.filter((d) => d.diagnosisId !== "NONE").length}`
  );
  console.log(`Scenarios evaluated: ${snapshot.scenarios.length}`);
  console.log(`Top scenario: ${top?.label ?? "none"}`);
  console.log(`Top scenario score: ${top?.score ?? "n/a"}`);
  console.log(`Baseline pendingCOD: ${pendingBefore}`);
  console.log(
    `Projected pendingCOD: ${pendingAfter ? `[${pendingAfter[0]}, ${pendingAfter[1]}]` : "n/a"} (SIMULATED range)`
  );
  console.log(
    `Expected impact: ${top ? `score-driven; intervention=${top.intervention}` : "n/a"}`
  );
  console.log(`Confidence: ${snapshot.uncertainty.confidence}`);
  console.log(
    `Uncertainty: evidenceQuality=${snapshot.uncertainty.evidenceQuality} assumptionCount=${snapshot.uncertainty.assumptionCount} dqPenalty=${snapshot.uncertainty.dataQualityPenalty}`
  );
  console.log(
    `Assumptions: ${snapshot.assumptions
      .slice(0, 6)
      .map((a) => a.id)
      .join(", ")}`
  );
  console.log(
    `Trade-offs SHORT: ${snapshot.tradeoffs.shortTerm.slice(0, 3).join(" | ") || "none"}`
  );
  console.log(
    `Trade-offs MEDIUM: ${snapshot.tradeoffs.mediumTerm.slice(0, 3).join(" | ") || "none"}`
  );
  console.log(
    `Trade-offs LONG: ${snapshot.tradeoffs.longTerm.slice(0, 3).join(" | ") || "none"}`
  );
  console.log(
    `Counterfactuals: ${snapshot.counterfactuals.map((c) => `${c.id}:${c.evidenceStrength}`).join(", ") || "none"}`
  );
  if (snapshot.formalCounterfactual) {
    console.log(
      `Formal CF: ${snapshot.formalCounterfactual.kind} strength=${snapshot.formalCounterfactual.evidenceStrength}`
    );
  }
  console.log(
    `Execution trace: ${snapshot.simulationTrace?.stages.map((s) => s.stage).join("→")}`
  );
  console.log(`TOP_ACTION: ${snapshot.topAction?.label ?? "none"}`);
  console.log(`autoExecute: ${snapshot.autonomy.autoExecute}`);
  console.log(`UI briefing score: ${briefing.pulse.score}`);
  console.log("========================================");
  console.log(
    JSON.stringify(
      {
        version: snapshot.metadata.version,
        topScenario: snapshot.topScenario,
        interventionAdvantage: snapshot.interventionAdvantage,
        scenarioComparisons: snapshot.scenarioComparisons.slice(0, 5),
        scenarioDataQuality: snapshot.scenarioDataQuality,
        simulationTrace: snapshot.simulationTrace,
        uncertainty: snapshot.uncertainty,
        assumptions: snapshot.assumptions.map((a) => a.id),
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
