/**
 * Dr Sara — shared intelligence types.
 * All insights are deterministic (rules + platform data), never LLM-generated.
 */

export type SaraSeverity = "high" | "medium" | "low" | "positive";

export type SaraDimensionId =
  | "operations"
  | "activation"
  | "revenue"
  | "support"
  | "technical";

export type SaraDimensionStatus = "ok" | "watch" | "attention" | "critical";

export type SaraExplanation = {
  signal: string;
  evidence: string;
  rule: string;
  impact: string;
  recommendation: string;
  source: "deterministic";
};

export type SaraPulseDimension = {
  id: SaraDimensionId;
  label: string;
  status: SaraDimensionStatus;
  statusLabel: string;
  detail: string;
};

export type SaraPlatformPulse = {
  score: number;
  label: string;
  summary: string;
  dimensions: SaraPulseDimension[];
};

export type SaraPriority = {
  id: string;
  severity: SaraSeverity;
  severityLabel: string;
  signal: string;
  why: string;
  evidence: string;
  recommendation: string;
  affectedLabel: string;
  affectedCount: number;
  href: string;
  cta: string;
  explanation: SaraExplanation;
};

export type SaraFeedItem = {
  id: string;
  category: string;
  signal: string;
  context: string;
  interpretation: string;
  conclusion: string;
  recommendation: string;
  href: string;
  cta: string;
  severity: SaraSeverity;
  explanation: SaraExplanation;
};

export type SaraOpportunity = {
  id: string;
  title: string;
  potentialImpact: string;
  merchantCount: number;
  reason: string;
  href: string;
  cta: string;
  explanation: SaraExplanation;
};

export type SaraRisk = {
  id: string;
  category: string;
  title: string;
  metric: string;
  detail: string;
  riskLevel: "high" | "medium" | "low" | "none";
  href: string;
  cta: string;
  explanation: SaraExplanation;
};

export type SaraSegmentId =
  | "hot"
  | "first-sale"
  | "growing"
  | "power"
  | "at-risk"
  | "dormant";

export type SaraSegment = {
  id: SaraSegmentId;
  label: string;
  description: string;
  count: number;
  href: string;
};

export type SaraAction = {
  id: string;
  label: string;
  description: string;
  href: string;
  urgency: "critical" | "high" | "normal";
};

export type SaraBriefing = {
  generatedAt: Date;
  headline: string;
  pulse: SaraPlatformPulse;
  priorities: SaraPriority[];
  feed: SaraFeedItem[];
  opportunities: SaraOpportunity[];
  risks: SaraRisk[];
  segments: SaraSegment[];
  actions: SaraAction[];
  criticalCount: number;
};
