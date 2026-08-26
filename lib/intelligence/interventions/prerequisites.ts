/**
 * Prerequisite checks for V8 intervention plans.
 */
import type { PlatformState } from "@/lib/intelligence/engine-types";
import type {
  OrchestratedInterventionType,
  PrerequisiteResult,
} from "@/lib/intelligence/interventions/types";

export function evaluatePrerequisites(input: {
  type: OrchestratedInterventionType;
  state: PlatformState;
}): PrerequisiteResult[] {
  const { type, state } = input;
  const out: PrerequisiteResult[] = [];

  const pass = (
    id: string,
    ok: boolean,
    reason: string,
    evidence: string[]
  ): PrerequisiteResult => ({
    prerequisiteId: id,
    status: ok ? "PASS" : "FAIL",
    reason,
    evidence,
  });

  if (type === "COD_VERIFICATION") {
    out.push(
      pass(
        "pending_orders_gt_0",
        state.pendingRealOrders > 0,
        state.pendingRealOrders > 0
          ? "Pending real COD orders exist."
          : "No pending COD orders.",
        [`pendingRealOrders=${state.pendingRealOrders}`]
      )
    );
    out.push(
      pass(
        "orders_are_real",
        state.pendingRealOrders > 0 || state.realOrders7d > 0,
        "Targets are real COD orders (not fabricated).",
        [
          `pendingRealGmv=${state.pendingRealGmv}`,
          `realOrders7d=${state.realOrders7d}`,
        ]
      )
    );
  } else if (type === "DNS_DIAGNOSIS") {
    out.push(
      pass(
        "failing_domains_gt_0",
        state.domainFailing > 0,
        state.domainFailing > 0
          ? "Failing domains present."
          : "No failing domains.",
        [`domainFailing=${state.domainFailing}`]
      )
    );
  } else if (type === "SUPPORT_ESCALATION") {
    out.push(
      pass(
        "open_support_gt_0",
        state.openSupport > 0,
        state.openSupport > 0
          ? "Open support threads exist."
          : "No open support.",
        [`openSupport=${state.openSupport}`]
      )
    );
  } else if (type === "FIRST_SALE_ASSISTANCE") {
    out.push(
      pass(
        "first_sale_pool_gt_0",
        state.firstSaleCount > 0,
        state.firstSaleCount > 0
          ? "First-sale pool present."
          : "Empty first-sale pool.",
        [`firstSaleCount=${state.firstSaleCount}`]
      )
    );
  } else if (type === "ACTIVATION_OUTREACH") {
    out.push(
      pass(
        "empty_activity_gt_0",
        state.hotEmptyCount > 0 || state.loggedInEmpty7d > 0,
        "Recently active empty stores present.",
        [
          `hotEmptyCount=${state.hotEmptyCount}`,
          `loggedInEmpty7d=${state.loggedInEmpty7d}`,
        ]
      )
    );
  } else if (type === "MERCHANT_ONBOARDING") {
    out.push(
      pass(
        "onboarding_capacity_available",
        state.totalStores >= 0,
        "Platform can observe onboarding capacity (always true for planning).",
        [`totalStores=${state.totalStores}`]
      )
    );
  } else if (type === "REVENUE_CONCENTRATION_REVIEW") {
    out.push(
      pass(
        "concentration_elevated",
        state.concentrationElevated || state.top2SharePct >= 60,
        "Concentration elevated or top2 share ≥ 60%.",
        [`top2SharePct=${state.top2SharePct}`]
      )
    );
  } else if (type === "NO_ACTION") {
    out.push(
      pass("no_action_ok", true, "NO_ACTION has no operational prerequisites.", [])
    );
  }

  if (out.length === 0) {
    out.push(
      pass("unknown_type", false, `No prerequisites defined for ${type}.`, [])
    );
  }

  return out;
}

export function prerequisitesPassed(results: PrerequisiteResult[]): boolean {
  return results.every((r) => r.status === "PASS");
}
