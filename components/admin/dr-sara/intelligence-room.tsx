"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { SaraBriefing } from "@/lib/intelligence/types";
import type {
  ExperienceSectionId,
  SaraExperienceViewModel,
} from "@/lib/intelligence/presentation/experience-model";
import {
  SaraCommandPalette,
  scrollToSection,
} from "@/components/admin/dr-sara/sara-command-palette";
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
import { cn } from "@/lib/utils";

function SectionNav({
  navigation,
  active,
}: {
  navigation: SaraExperienceViewModel["navigation"];
  active: ExperienceSectionId | null;
}) {
  return (
    <nav
      className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#0a0a0b]/90 backdrop-blur-xl"
      aria-label="Intelligence sections"
    >
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
        {navigation.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => scrollToSection(item.id)}
            className={cn(
              "shrink-0 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300",
              active === item.id
                ? "bg-white/[0.08] text-white"
                : "text-white/40 hover:bg-white/[0.04] hover:text-white/80"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

export function IntelligenceRoom({
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
        { rootMargin: "-30% 0px -55% 0px", threshold: 0.01 }
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
    <div className="min-h-screen bg-[#070708] font-sans text-white antialiased">
      <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-40 motion-reduce:opacity-20">
        <div className="absolute -left-1/4 top-0 h-[420px] w-1/2 rounded-full bg-sky-500/[0.05] blur-3xl motion-safe:animate-[pulse_10s_ease-in-out_infinite]" />
        <div className="absolute -right-1/4 top-40 h-[360px] w-1/2 rounded-full bg-white/[0.03] blur-3xl motion-safe:animate-[pulse_12s_ease-in-out_infinite]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 pt-5">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-white/45 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Console
          </Link>
          <div className="flex items-center gap-3 text-[11px] text-white/35">
            <span>
              Engine v{vm.engineVersion} · Experience v{vm.version} · Design v
              {vm.designVersion}
            </span>
            <SaraCommandPalette navigation={vm.navigation} />
          </div>
        </div>

        <SaraArrival arrival={vm.arrival} live={vm.live} />
      </div>

      <SectionNav navigation={vm.navigation} active={active} />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SaraNow now={vm.now} />
        <SaraReasoningPath whyChain={vm.whyChain} />
        <SaraSystemMap platformMap={vm.platformMap} />
        <SaraTimeline timeline={vm.timeline} />
        <SaraScenarioLab scenarioLab={vm.scenarioLab} />
        <SaraDecisionRoom decisionRoom={vm.decisionRoom} />
        <SaraGovernance execution={vm.execution} />
        <SaraLearningLoop learningLoop={vm.learningLoop} />
        <SaraRiskField riskField={vm.riskField} />
        <SaraOpportunityRadar opportunities={vm.opportunities} />
        <SaraAgentNetwork agentNetwork={vm.agentNetwork} />

        <footer className="mt-8 border-t border-white/[0.06] py-8 text-[11px] text-white/30">
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
            Deterministic platform intelligence — no LLM, no ML, no fabricated claims.
          </p>
        </footer>
      </div>
    </div>
  );
}
