/**
 * Structured why-first explainability for TOP decisions.
 */

export type WhyFirstExplanation = {
  decision: string;
  whyThis: string;
  whyNow: string;
  whyThisMerchant: string | null;
  whyThisAction: string;
  whyThisPriority: string;
  whyNotAlternative: string;
  evidence: string[];
  confidence: number;
  ruleIds: string[];
};

export function explainTopDecision(input: {
  topLabel: string;
  topHref: string;
  topScore: number;
  topReason: string;
  pendingRealOrders: number;
  firstSaleCount: number;
  domainFailing: number;
  openSupport: number;
  alternativeLabel?: string;
  merchantName?: string | null;
  calculation: string;
  ruleIds: string[];
  confidence: number;
}): WhyFirstExplanation {
  const evidence: string[] = [];
  if (input.pendingRealOrders > 0) {
    evidence.push(`${input.pendingRealOrders} real COD orders pending verification`);
  }
  if (input.domainFailing > 0) {
    evidence.push(`${input.domainFailing} domains failing DNS`);
  }
  if (input.openSupport > 0) {
    evidence.push(`${input.openSupport} support threads unanswered`);
  }
  if (input.firstSaleCount > 0) {
    evidence.push(`${input.firstSaleCount} first-sale targets in pool`);
  }

  const isCod = /COD|pending|payments/i.test(input.topLabel + input.topHref);
  const isDns = /domain|DNS/i.test(input.topLabel + input.topHref);
  const isSupport = /support|inbox/i.test(input.topLabel + input.topHref);

  return {
    decision: input.topLabel,
    whyThis: input.topReason,
    whyNow: isCod
      ? `${input.pendingRealOrders} real orders are waiting for verification.`
      : isDns
        ? `${input.domainFailing} domains currently fail live DNS checks.`
        : isSupport
          ? `${input.openSupport} merchants are waiting on support.`
          : "Live platform evidence indicates this is the highest-urgency actionable item.",
    whyThisMerchant: input.merchantName
      ? `Target merchant/context: ${input.merchantName}.`
      : "Platform-level action — applies across affected merchants.",
    whyThisAction: `Recommended route ${input.topHref} maps to an existing admin workflow.`,
    whyThisPriority: `Deterministic extended score ${input.topScore}. ${input.calculation}`,
    whyNotAlternative: input.alternativeLabel
      ? isCod
        ? `${input.alternativeLabel} affects a larger long-horizon pool (${input.firstSaleCount} first-sale) but has lower immediate reversibility than COD handoff.`
        : `${input.alternativeLabel} ranks lower on impact×urgency×actionability given current live evidence.`
      : input.firstSaleCount > 0 && isCod
        ? `First-sale affects ${input.firstSaleCount} merchants but has a longer intervention horizon than clearing live COD.`
        : "No higher-scoring actionable alternative under current live evidence.",
    evidence,
    confidence: input.confidence,
    ruleIds: input.ruleIds,
  };
}
