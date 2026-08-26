/**
 * Dr Sara V10 — Platform Intelligence OS
 */
export type * from "@/lib/intelligence/os/types";
export { OS_CONFIG, TRACE_STAGES } from "@/lib/intelligence/os/config";
export { buildCycleId } from "@/lib/intelligence/os/cycle-id";
export {
  composeIntelligenceOS,
  toSnapshotIntelligenceOS,
} from "@/lib/intelligence/os/compose";
export {
  runDrSaraCycle,
} from "@/lib/intelligence/os/engine";
export { buildInterventionPortfolio } from "@/lib/intelligence/os/portfolio";
export { buildStrategyPortfolio } from "@/lib/intelligence/os/strategies";
export { detectPortfolioConflicts } from "@/lib/intelligence/os/conflicts";
export {
  listDependencyEdges,
  dependenciesFor,
  topologicalOrder,
} from "@/lib/intelligence/os/dependencies";
export { resolveAutonomy } from "@/lib/intelligence/os/autonomy";
export { runOsGovernor } from "@/lib/intelligence/os/governor";
export { buildLearningState, buildAdaptation } from "@/lib/intelligence/os/learning";
export { buildPlatformHealthModel } from "@/lib/intelligence/os/health";
export {
  detectOsEarlyWarnings,
  detectOsOpportunities,
} from "@/lib/intelligence/os/warnings";
export { buildIntelligenceGraph } from "@/lib/intelligence/os/graph";
export { buildDecisionExplanation } from "@/lib/intelligence/os/explainability";
export { buildIntelligenceTrace } from "@/lib/intelligence/os/trace";
export { evaluateBudgets } from "@/lib/intelligence/os/budgets";
