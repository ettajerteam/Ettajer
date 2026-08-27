"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { SaraBriefing } from "@/lib/intelligence/types";
import type {
  ExperienceSectionId,
  SaraExperienceViewModel,
} from "@/lib/intelligence/presentation/experience-model";
import { SaraCommandPalette } from "@/components/admin/dr-sara/sara-command-palette";
import { SaraFloatingNav } from "@/components/admin/dr-sara/sara-floating-nav";
import { SaraArrival } from "@/components/admin/dr-sara/sara-arrival";
import { SaraNow } from "@/components/admin/dr-sara/sara-now";
import { SaraReasoningPath } from "@/components/admin/dr-sara/sara-reasoning-path";
import { SaraSystemMap } from "@/components/admin/dr-sara/sara-system-map";
import { SaraTimeline } from "@/components/admin/dr-sara/sara-timeline";
import { SaraScenarioLab } from "@/components/admin/dr-sara/sara-scenario-lab";
import { SaraDecisionRoom } from "@/components/admin/dr-sara/sara-decision-room";
import { SaraGovernance } from "@/components/admin/dr-sara/sara-governance";
import { SaraLearningLoop } from "@/components/admin/dr-sara/sara-learning-loop";
import { SaraRiskField } from "@/components/admin/dr-sara/sara-risk-field";
import { SaraOpportunityRadar } from "@/components/admin/dr-sara/sara-opportunity-radar";
import { SaraAgentNetwork } from "@/components/admin/dr-sara/sara-agent-network";
import { SoftDivider } from "@/components/admin/dr-sara/sara-ui";

export function IntelligenceRoomV3({
  vm,
  briefing,
}: {
  vm: SaraExperienceViewModel;
  briefing: SaraBriefing;
}) {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState<ExperienceSectionId | null>("now");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const ids = vm.navigation.map((n) => n.id);
    const observers: IntersectionObserver[] = [];
    for (const id of ids) {
      const el = document.getElementById(`sara-section-${id}`);
      if (!el) continue;
      const obs = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) setActive(id);
          }
        },
        { rootMargin: "-35% 0px -50% 0px", threshold: 0.01 }
      );
      obs.observe(el);
      observers.push(obs);
    }
    return () => observers.forEach((o) => o.disconnect());
  }, [vm.navigation]);

  const updatedLabel = mounted
    ? new Date(vm.generatedAt).toLocaleString()
    : "—";

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#060708] font-sans text-white antialiased">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute left-1/2 top-[-10%] h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-sky-500/[0.045] blur-[100px] motion-reduce:opacity-40" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[420px] w-[420px] rounded-full bg-white/[0.02] blur-[90px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 pb-28 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3 pt-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-[12px] text-white/40 transition hover:text-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Console
          </Link>
          <div className="flex items-center gap-3 text-[10px] tracking-[0.08em] text-white/25">
            <span>
              v{vm.engineVersion} · exp {vm.version} · design {vm.designVersion}
            </span>
            <SaraCommandPalette navigation={vm.navigation} />
          </div>
        </header>

        <SaraArrival
          arrival={vm.arrival}
          live={vm.live}
          presence={vm.presence}
        />

        <SaraNow now={vm.now} />

        <SoftDivider className="mx-auto my-4 max-w-md" />

        <SaraSystemMap platformMap={vm.platformMap} />
        <SaraReasoningPath whyChain={vm.whyChain} />
        <SaraTimeline timeline={vm.timeline} />
        <SaraScenarioLab scenarioLab={vm.scenarioLab} />
        <SaraDecisionRoom decisionRoom={vm.decisionRoom} />
        <SaraGovernance execution={vm.execution} />
        <SaraLearningLoop learningLoop={vm.learningLoop} />
        <SaraRiskField riskField={vm.riskField} />
        <SaraOpportunityRadar opportunities={vm.opportunities} />
        <SaraAgentNetwork agentNetwork={vm.agentNetwork} />

        <footer className="mt-10 border-t border-white/[0.05] py-10 text-[11px] text-white/25">
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <span>Cycle · {vm.cycleId ?? "—"}</span>
            <span>Updated · {updatedLabel}</span>
            <span>TOP_ACTION · {vm.preserved.topAction ?? "—"}</span>
            <span>TOP_DECISION · {vm.preserved.topDecision ?? "—"}</span>
            <span>TOP_SCENARIO · {vm.preserved.topScenario ?? "—"}</span>
            <span>productionMutation · {vm.productionMutation}</span>
            <span>Pulse · {briefing.pulse.score}/100</span>
          </div>
          <p className="mt-3">
            Deterministic platform intelligence — no LLM, no ML, no fabricated
            claims.
          </p>
        </footer>
      </div>

      <SaraFloatingNav navigation={vm.navigation} active={active} />
    </div>
  );
}
