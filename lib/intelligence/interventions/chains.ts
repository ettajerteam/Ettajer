/**
 * Multi-step intervention chains (deterministic orchestration).
 */
export type ChainStep = {
  stepId: string;
  action: string;
  prerequisite: string | null;
  expectedState: string;
  timeoutHours: number;
  nextAction: string | null;
  failureAction: string | null;
};

export type InterventionChain = {
  chainId: string;
  name: string;
  ruleId: string;
  steps: ChainStep[];
};

export const DOMAIN_TO_ACTIVATION_CHAIN: InterventionChain = {
  chainId: "chain-domain-activation",
  name: "Domain repair → activation",
  ruleId: "CHAIN_DOMAIN_TO_ACTIVATION",
  steps: [
    {
      stepId: "detect-domain",
      action: "DOMAIN_FAILURE",
      prerequisite: null,
      expectedState: "domainFailing > 0",
      timeoutHours: 0,
      nextAction: "FIX_DOMAIN",
      failureAction: null,
    },
    {
      stepId: "fix-domain",
      action: "FIX_DOMAIN",
      prerequisite: "DOMAIN_FAILURE",
      expectedState: "DNS remediation started",
      timeoutHours: 24,
      nextAction: "WAIT_FOR_HEALTHY_DNS",
      failureAction: "ESCALATE_DNS",
    },
    {
      stepId: "wait-dns",
      action: "WAIT_FOR_HEALTHY_DNS",
      prerequisite: "FIX_DOMAIN",
      expectedState: "domainFailing = 0",
      timeoutHours: 48,
      nextAction: "REASSESS_STOREFRONT",
      failureAction: "ESCALATE_DNS",
    },
    {
      stepId: "reassess",
      action: "REASSESS_STOREFRONT",
      prerequisite: "WAIT_FOR_HEALTHY_DNS",
      expectedState: "storefront reachable",
      timeoutHours: 6,
      nextAction: "ACTIVATION_INTERVENTION",
      failureAction: "SECONDARY_DIAGNOSIS",
    },
    {
      stepId: "activate",
      action: "ACTIVATION_INTERVENTION",
      prerequisite: "REASSESS_STOREFRONT",
      expectedState: "merchant engaged",
      timeoutHours: 72,
      nextAction: "MEASURE_FIRST_SALE",
      failureAction: "SECONDARY_DIAGNOSIS",
    },
    {
      stepId: "measure",
      action: "MEASURE_FIRST_SALE",
      prerequisite: "ACTIVATION_INTERVENTION",
      expectedState: "realOrders >= 1",
      timeoutHours: 168,
      nextAction: null,
      failureAction: "SECONDARY_DIAGNOSIS",
    },
  ],
};

export const COD_CLEARANCE_CHAIN: InterventionChain = {
  chainId: "chain-cod-clearance",
  name: "COD verification clearance",
  ruleId: "CHAIN_COD_CLEARANCE",
  steps: [
    {
      stepId: "detect-cod",
      action: "COD_BACKLOG",
      prerequisite: null,
      expectedState: "pendingRealOrders > 0",
      timeoutHours: 0,
      nextAction: "COD_VERIFICATION",
      failureAction: null,
    },
    {
      stepId: "verify",
      action: "COD_VERIFICATION",
      prerequisite: "COD_BACKLOG",
      expectedState: "pendingRealOrders reduced ≥50%",
      timeoutHours: 24,
      nextAction: "MEASURE_COD",
      failureAction: "SECONDARY_OPS_DIAGNOSIS",
    },
    {
      stepId: "measure-cod",
      action: "MEASURE_COD",
      prerequisite: "COD_VERIFICATION",
      expectedState: "pendingRealOrders < 5",
      timeoutHours: 24,
      nextAction: null,
      failureAction: "SECONDARY_OPS_DIAGNOSIS",
    },
  ],
};

export function activeChainsFor(input: {
  domainFailing: number;
  pendingRealOrders: number;
}): InterventionChain[] {
  const out: InterventionChain[] = [];
  if (input.domainFailing > 0) out.push(DOMAIN_TO_ACTIVATION_CHAIN);
  if (input.pendingRealOrders > 0) out.push(COD_CLEARANCE_CHAIN);
  return out;
}

export function nextChainStep(
  chain: InterventionChain,
  completedActions: string[]
): ChainStep | null {
  for (const step of chain.steps) {
    if (completedActions.includes(step.action)) continue;
    if (step.prerequisite && !completedActions.includes(step.prerequisite)) {
      return null;
    }
    return step;
  }
  return null;
}
