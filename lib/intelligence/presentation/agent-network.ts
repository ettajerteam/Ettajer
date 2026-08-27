/**
 * Future agent network placeholder — Dr Sara only active today.
 * Positions are deterministic fixed layout (Design V2).
 */
import type { AgentNetworkView } from "@/lib/intelligence/presentation/experience-model";
import { AGENT_NETWORK_LAYOUT } from "@/lib/intelligence/presentation/design-layout";

export function buildAgentNetworkView(): AgentNetworkView {
  const modules = AGENT_NETWORK_LAYOUT.map((m) => ({
    id: m.id,
    label: m.label,
    subtitle: m.subtitle,
    status: m.status,
    x: m.x,
    y: m.y,
  }));

  return {
    master: { id: "dr-sara", label: "DR SARA", status: "ACTIVE" },
    placeholder: "Specialized intelligence modules will appear here.",
    futureModules: modules
      .filter((m) => m.status === "FUTURE")
      .map((m) => `${m.label} — ${m.subtitle}`),
    modules,
  };
}
