import type { DrSaraSnapshot } from "@/lib/intelligence/engine-types";
import {
  explainPriority,
  explainSignal,
  toUiExplanation,
} from "@/lib/intelligence/explainability/why";
import type { SaraBriefing, SaraSeverity } from "@/lib/intelligence/types";

function mapSeverity(s: string): SaraSeverity {
  if (s === "critical" || s === "high") return "high";
  if (s === "medium") return "medium";
  if (s === "positive") return "positive";
  return "low";
}

function mapSegmentId(
  id: string
): SaraBriefing["segments"][number]["id"] {
  const key = id.toLowerCase().replace(/_/g, "-");
  if (key === "hot") return "hot";
  if (key === "first-sale") return "first-sale";
  if (key === "growing") return "growing";
  if (key === "power") return "power";
  if (key === "at-risk") return "at-risk";
  return "dormant";
}

function healthLabel(status: DrSaraSnapshot["health"]["status"]): string {
  if (status === "healthy") return "Healthy";
  if (status === "stable") return "Stable";
  if (status === "critical") return "Critical";
  return "Needs attention";
}

function healthSummary(snapshot: DrSaraSnapshot): string {
  if (snapshot.health.status === "healthy") {
    return "Platform is stable. No urgent operational blockers.";
  }
  if (snapshot.health.status === "stable") {
    return snapshot.health.reasons.some((r) => !r.includes("No dimension"))
      ? "Stable, but operational attention is required."
      : "Generally stable with a few watch items.";
  }
  if (snapshot.health.status === "critical") {
    return "High-severity operational issues need immediate review.";
  }
  return (
    snapshot.health.reasons[0] ??
    "Several signals require action to protect merchant trust and GMV."
  );
}

/**
 * Adapt engine snapshot → existing Dr Sara UI contract (SaraBriefing).
 * Keeps /admin/sara visually stable.
 */
export function snapshotToBriefing(snapshot: DrSaraSnapshot): SaraBriefing {
  return {
    generatedAt: snapshot.generatedAt,
    headline: snapshot.headline,
    pulse: {
      score: snapshot.health.score,
      label: healthLabel(snapshot.health.status),
      summary: healthSummary(snapshot),
      dimensions: snapshot.pulseDimensions.map((d) => ({
        id: d.id,
        label: d.label,
        status: d.status,
        statusLabel: d.statusLabel,
        detail: `${d.label} score ${d.score}/100`,
      })),
    },
    priorities: snapshot.priorities.map((p) => {
      const why = toUiExplanation(explainPriority(p));
      return {
        id: p.signalId,
        severity: mapSeverity(p.severity),
        severityLabel:
          p.band === "critical" ? "CRITICAL" : p.band.toUpperCase(),
        signal: p.title,
        why: p.summary,
        evidence: p.evidence
          .map((e) => `${e.label}: ${String(e.value)}`)
          .join(" · "),
        recommendation: p.calculation,
        affectedLabel: p.affectedCount === 1 ? "item" : "items",
        affectedCount: p.affectedCount,
        href: p.href,
        cta: p.cta,
        explanation: why,
      };
    }),
    feed: [
      ...snapshot.correlations.map((c) => ({
        id: c.id,
        category: "CORRELATION",
        signal: c.title,
        context: c.evidence
          .map((e) => `${e.label}=${String(e.value)}`)
          .join(" · "),
        interpretation: c.explanation,
        conclusion: c.explanation,
        recommendation:
          c.recommendedAction?.label ?? "Review related signals",
        href: c.recommendedAction?.href ?? "/admin",
        cta: c.recommendedAction?.label ?? "Open",
        severity: "medium" as SaraSeverity,
        explanation: {
          signal: c.title,
          evidence: c.evidence
            .map((e) => `${e.label}=${String(e.value)}`)
            .join(" · "),
          rule: `correlate:${c.id}`,
          impact: c.explanation,
          recommendation: c.recommendedAction?.label ?? "",
          source: "deterministic" as const,
        },
      })),
      ...snapshot.signals
        .filter((s) => s.severity === "positive" || s.category === "revenue")
        .slice(0, 6)
        .map((s) => {
          const why = toUiExplanation(explainSignal(s));
          return {
            id: `signal-${s.id}`,
            category: s.category.toUpperCase(),
            signal: s.title,
            context: s.evidence
              .map((e) => `${e.label}=${String(e.value)}`)
              .join(" · "),
            interpretation: s.summary,
            conclusion: s.summary,
            recommendation: s.cta ?? "Review",
            href: s.href ?? "/admin",
            cta: s.cta ?? "Open",
            severity: mapSeverity(s.severity),
            explanation: why,
          };
        }),
      ...snapshot.diagnoses
        .filter((d) => d.diagnosisId !== "NONE")
        .slice(0, 4)
        .map((d) => ({
          id: `diag-${d.id}`,
          category: d.domain.toUpperCase(),
          signal: d.title,
          context: d.evidence
            .map((e) => `${e.label}=${String(e.value)}`)
            .join(" · "),
          interpretation: d.explanation,
          conclusion: d.explanation,
          recommendation: d.recommendedAction?.label ?? "Review",
          href: d.recommendedAction?.href ?? "/admin",
          cta: d.recommendedAction?.label ?? "Open",
          severity: "medium" as SaraSeverity,
          explanation: {
            signal: d.title,
            evidence: d.evidence
              .map((e) => `${e.label}=${String(e.value)}`)
              .join(" · "),
            rule: d.diagnosisId,
            impact: d.explanation,
            recommendation: d.recommendedAction?.label ?? "",
            source: "deterministic" as const,
          },
        })),
    ].slice(0, 8),
    opportunities: snapshot.opportunities.map((o) => ({
      id: o.id,
      title: o.title,
      potentialImpact: o.impact,
      merchantCount: o.affectedCount,
      reason: o.reason,
      href: o.href,
      cta: o.cta,
      explanation: {
        signal: o.title,
        evidence: o.evidence
          .map((e) => `${e.label}=${String(e.value)}`)
          .join(" · "),
        rule: o.ruleId,
        impact: o.impact,
        recommendation: o.cta,
        source: "deterministic" as const,
      },
    })),
    risks: snapshot.risks.map((r) => ({
      id: r.id,
      category: r.category,
      title: r.title,
      metric: r.metric,
      detail: r.detail,
      riskLevel: r.riskLevel,
      href: r.href,
      cta: r.cta,
      explanation: {
        signal: r.title,
        evidence: r.evidence
          .map((e) => `${e.label}=${String(e.value)}`)
          .join(" · "),
        rule: r.ruleId,
        impact: r.detail,
        recommendation: r.cta,
        source: "deterministic" as const,
      },
    })),
    segments: snapshot.merchantSegments.summary.map((s) => ({
      id: mapSegmentId(s.id),
      label: s.label,
      description: s.description,
      count: s.count,
      href: s.href,
    })),
    actions: [
      ...(snapshot.topAction
        ? [
            {
              id: "TOP_ACTION",
              label: snapshot.topAction.label,
              description: snapshot.topAction.whyThisFirst,
              href: snapshot.topAction.href,
              urgency: "critical" as const,
            },
          ]
        : []),
      ...snapshot.recommendedActions
        .filter((a) => a.label !== snapshot.topAction?.label)
        .map((a) => ({
          id: a.id,
          label: a.label,
          description: a.description,
          href: a.href,
          urgency: a.urgency,
        })),
    ],
    criticalCount: snapshot.criticalCount,
  };
}
