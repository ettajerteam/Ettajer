/**
 * Future agent network placeholder — Dr Sara only active today.
 */
import type { AgentNetworkView } from "@/lib/intelligence/presentation/experience-model";

export function buildAgentNetworkView(): AgentNetworkView {
  return {
    master: { id: "dr-sara", label: "DR SARA", status: "ACTIVE" },
    placeholder: "Specialized intelligence modules will appear here.",
    futureModules: [
      "NORA — Content Intelligence",
      "Commerce Agent",
      "Growth Agent",
      "Operations Agent",
      "Domain Agent",
    ],
  };
}
