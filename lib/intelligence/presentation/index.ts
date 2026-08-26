/**
 * Dr Sara V11 — Experience presentation layer exports.
 */
export { EXPERIENCE_VERSION } from "@/lib/intelligence/presentation/experience-model";
export type {
  SaraExperienceViewModel,
  ExperienceSectionId,
  WhyChainStep,
  PlatformMapNode,
  PlatformMapEdge,
  TimelineSegment,
  ScenarioLabRow,
  DecisionRoomView,
  ExecutionView,
  LearningLoopView,
  OpportunityRadarItem,
  RiskFieldItem,
  AgentNetworkView,
} from "@/lib/intelligence/presentation/experience-model";
export { buildSaraExperienceViewModel } from "@/lib/intelligence/presentation/view-model";
export { buildTimelineView } from "@/lib/intelligence/presentation/timeline";
export { buildPlatformMapView } from "@/lib/intelligence/presentation/platform-map";
export { buildDecisionRoomView } from "@/lib/intelligence/presentation/decision-view";
export { buildScenarioLabView } from "@/lib/intelligence/presentation/scenario-view";
export {
  buildRiskFieldView,
  buildLearningLoopView,
} from "@/lib/intelligence/presentation/risk-view";
export { buildAgentNetworkView } from "@/lib/intelligence/presentation/agent-network";
