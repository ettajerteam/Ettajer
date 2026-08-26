/**
 * Dr Sara V11 — Experience presentation types (UI only; engine unchanged).
 */

export const EXPERIENCE_VERSION = "11.0.0";

export type ExperienceSectionId =
  | "now"
  | "why"
  | "system"
  | "scenario"
  | "decision"
  | "execution"
  | "outcome"
  | "learning"
  | "opportunities"
  | "risks";

export type WhyChainStep = {
  id: string;
  label: string;
  detail: string;
  href?: string;
};

export type PlatformMapNode = {
  id: string;
  label: string;
  category: string;
  metric: string;
  status: "ok" | "watch" | "attention" | "critical";
  signals: string[];
  risks: string[];
  opportunities: string[];
  connectedDecisions: string[];
};

export type PlatformMapEdge = {
  from: string;
  to: string;
  label: string;
};

export type TimelineSegment = {
  id: string;
  phase: "PAST" | "NOW" | "EXPECTED";
  label: string;
  detail: string;
  evidence: string[];
  insufficientEvidence: boolean;
};

export type ScenarioLabRow = {
  scenarioId: string;
  label: string;
  baseline: Record<string, number | string>;
  simulated: string;
  expectedRange: Record<string, [number, number] | string>;
  impact: string;
  risk: string;
  confidence: number;
  assumptions: string[];
  uncertainty: string;
};

export type DecisionRoomView = {
  decisionId: string;
  title: string;
  score: number;
  confidence: number;
  confidenceLabel: string;
  mode: string;
  governance: string;
  risk: string;
  blastRadius: string;
  whyThis: string[];
  whyNot: { id: string; title: string; reasons: string[] }[];
  ifNothing: { label: string; baseline: Record<string, number | string> };
  ifAct: { label: string; expected: Record<string, [number, number] | string> };
  beforeExecution: string[];
  href: string;
  cta: string;
};

export type ExecutionView = {
  status: string;
  killSwitch: string;
  autoExecute: false;
  approvalRequired: boolean;
  governanceVerdict: string;
  productionExecutionDisabled: boolean;
  sandboxReady: boolean;
  flow: string[];
  note: string;
};

export type LearningLoopView = {
  steps: string[];
  evidenceNotes: string[];
  confidenceAdjustment: {
    before: number;
    after: number;
    delta: number;
    reason: string;
  } | null;
  insufficientHistory: boolean;
};

export type OpportunityRadarItem = {
  id: string;
  category: "ACTIVATION" | "REVENUE" | "OPERATIONS" | "TECHNICAL" | "MERCHANTS" | "GROWTH";
  title: string;
  signal: string;
  impact: string;
  affected: string;
  action: string;
  confidence: number;
  href?: string;
};

export type RiskFieldItem = {
  id: string;
  title: string;
  impact: string;
  evidence: string;
  scope: string;
  reversibility: string;
  level: string;
};

export type AgentNetworkView = {
  master: { id: string; label: string; status: "ACTIVE" };
  placeholder: string;
  futureModules: string[];
};

export type SaraExperienceViewModel = {
  version: string;
  generatedAt: Date;
  engineVersion: string;
  cycleId: string | null;
  cycleStatus: string | null;
  platformStateSummary: string;
  live: boolean;
  autoExecute: false;
  productionMutation: "NONE";
  now: {
    headline: string;
    narrative: string[];
    cta: string;
    href: string;
    confidence: number | null;
    confidenceLabel: string;
    risk: string;
    approval: string;
    decisionId: string | null;
    interventionType: string | null;
  };
  whyChain: WhyChainStep[];
  platformMap: { nodes: PlatformMapNode[]; edges: PlatformMapEdge[] };
  timeline: TimelineSegment[];
  scenarioLab: ScenarioLabRow[];
  decisionRoom: DecisionRoomView | null;
  execution: ExecutionView;
  learningLoop: LearningLoopView;
  opportunities: OpportunityRadarItem[];
  riskField: RiskFieldItem[];
  agentNetwork: AgentNetworkView;
  preserved: {
    topAction: string | null;
    topScenario: string | null;
    topDecision: string | null;
  };
  navigation: { id: ExperienceSectionId; label: string }[];
};
