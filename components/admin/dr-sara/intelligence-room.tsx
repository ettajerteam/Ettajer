"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SaraBriefing } from "@/lib/intelligence/types";
import type { SaraExperienceViewModel } from "@/lib/intelligence/presentation/experience-model";
import {
  SaraCommandPalette,
  scrollToSection,
} from "@/components/admin/dr-sara/sara-command-palette";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
      {children}
    </h2>
  );
}

function StatusDot({ status }: { status: string }) {
  const color =
    status === "critical" || status === "HIGH" || status === "CRITICAL"
      ? "bg-red-500"
      : status === "attention" || status === "MEDIUM"
        ? "bg-orange-500"
        : status === "watch"
          ? "bg-amber-400"
          : "bg-emerald-500";
  return (
    <span
      className={cn(
        "inline-block h-1.5 w-1.5 rounded-full motion-safe:animate-pulse",
        color
      )}
    />
  );
}

function MetricPill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-black/[0.06] bg-white/80 px-2 py-1 text-[10px] dark:border-white/10 dark:bg-white/[0.04]">
      <span className="text-neutral-400">{label}</span>
      <span className="font-medium text-neutral-700 dark:text-neutral-200">
        {value}
      </span>
    </span>
  );
}

function WhyChain({ vm }: { vm: SaraExperienceViewModel }) {
  const [open, setOpen] = useState(false);
  return (
    <section id="sara-section-why" className="scroll-mt-24">
      <SectionLabel>Why</SectionLabel>
      <div className="mt-3 rounded-2xl border border-black/[0.06] bg-white p-5 dark:border-white/10 dark:bg-[#1C1C1E]">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-2 text-left"
        >
          <span className="text-[13px] font-medium text-neutral-800 dark:text-neutral-100">
            Structured reasoning chain
          </span>
          {open ? (
            <ChevronDown className="h-4 w-4 text-neutral-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-neutral-400" />
          )}
        </button>
        {open ? (
          <div className="mt-4 space-y-0">
            {vm.whyChain.map((step, i) => (
              <div key={step.id} className="relative pl-4">
                {i < vm.whyChain.length - 1 ? (
                  <span className="absolute left-[7px] top-6 h-full w-px bg-black/[0.08] dark:bg-white/10" />
                ) : null}
                <div className="flex gap-3 pb-4">
                  <ArrowDown className="mt-0.5 h-3 w-3 shrink-0 text-[#007AFF]/60" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-semibold tracking-[0.1em] text-[#007AFF]">
                      {step.label}
                    </p>
                    {step.href ? (
                      <Link
                        href={step.href}
                        className="mt-0.5 block text-[13px] text-neutral-800 hover:text-[#007AFF] dark:text-neutral-100"
                      >
                        {step.detail}
                      </Link>
                    ) : (
                      <p className="mt-0.5 text-[13px] text-neutral-800 dark:text-neutral-100">
                        {step.detail}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-[12px] text-neutral-500">
            Signal → diagnosis → decision → scenario → intervention → expected
            outcome
          </p>
        )}
      </div>
    </section>
  );
}

function PlatformMapSection({ vm }: { vm: SaraExperienceViewModel }) {
  const [active, setActive] = useState<string | null>(null);
  const node = vm.platformMap.nodes.find((n) => n.id === active);

  return (
    <section id="sara-section-system" className="scroll-mt-24">
      <SectionLabel>Platform map</SectionLabel>
      <div className="mt-3 overflow-x-auto rounded-2xl border border-black/[0.06] bg-white p-5 dark:border-white/10 dark:bg-[#1C1C1E]">
        <div className="grid min-w-[640px] grid-cols-4 gap-3">
          {vm.platformMap.nodes.map((n) => (
            <button
              key={n.id}
              type="button"
              onMouseEnter={() => setActive(n.id)}
              onFocus={() => setActive(n.id)}
              onClick={() => setActive(n.id)}
              className={cn(
                "rounded-xl border px-3 py-3 text-left transition-all duration-200",
                active === n.id
                  ? "border-[#007AFF]/40 bg-[#007AFF]/[0.04] shadow-sm"
                  : "border-black/[0.04] hover:border-black/[0.08] dark:border-white/[0.06]"
              )}
            >
              <div className="flex items-center gap-1.5">
                <StatusDot status={n.status} />
                <p className="text-[10px] font-semibold tracking-[0.08em] text-neutral-400">
                  {n.category}
                </p>
              </div>
              <p className="mt-1 text-[13px] font-medium text-neutral-900 dark:text-white">
                {n.label}
              </p>
              <p className="mt-1 text-[18px] font-semibold tracking-tight text-neutral-900 dark:text-white">
                {n.metric}
              </p>
            </button>
          ))}
        </div>
        {node ? (
          <div className="mt-4 rounded-xl border border-black/[0.04] bg-black/[0.02] p-4 dark:border-white/[0.06] dark:bg-white/[0.03]">
            <p className="text-[12px] font-medium text-neutral-800 dark:text-neutral-100">
              {node.label} · {node.status}
            </p>
            {node.signals.length > 0 ? (
              <p className="mt-2 text-[11px] text-neutral-500">
                Signals: {node.signals.join(" · ")}
              </p>
            ) : null}
            {node.risks.length > 0 ? (
              <p className="mt-1 text-[11px] text-neutral-500">
                Risks: {node.risks.join(" · ")}
              </p>
            ) : null}
            {node.connectedDecisions.length > 0 ? (
              <p className="mt-1 text-[11px] text-[#007AFF]">
                Decisions: {node.connectedDecisions.join(", ")}
              </p>
            ) : null}
          </div>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          {vm.platformMap.edges.slice(0, 6).map((e) => (
            <span
              key={`${e.from}-${e.to}-${e.label}`}
              className="text-[10px] text-neutral-400"
            >
              {e.from} → {e.to}
              <span className="text-neutral-300"> · </span>
              {e.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function TimelineSection({ vm }: { vm: SaraExperienceViewModel }) {
  return (
    <section id="sara-section-outcome" className="scroll-mt-24">
      <SectionLabel>Time · memory</SectionLabel>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {vm.timeline.map((seg) => (
          <article
            key={seg.id}
            className="rounded-xl border border-black/[0.06] bg-white p-4 dark:border-white/10 dark:bg-[#1C1C1E]"
          >
            <p className="text-[9px] font-semibold tracking-[0.12em] text-[#007AFF]">
              {seg.phase}
            </p>
            <p className="mt-2 text-[13px] font-medium text-neutral-900 dark:text-white">
              {seg.label}
            </p>
            <p
              className={cn(
                "mt-1 text-[12px]",
                seg.insufficientEvidence
                  ? "font-medium text-orange-600 dark:text-orange-400"
                  : "text-neutral-500"
              )}
            >
              {seg.detail}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ScenarioLab({ vm }: { vm: SaraExperienceViewModel }) {
  return (
    <section id="sara-section-scenario" className="scroll-mt-24">
      <SectionLabel>Scenario lab</SectionLabel>
      <div className="mt-3 space-y-3">
        {vm.scenarioLab.length === 0 ? (
          <p className="text-[13px] text-neutral-500">No scenarios available.</p>
        ) : (
          vm.scenarioLab.map((row) => (
            <article
              key={row.scenarioId}
              className="rounded-2xl border border-black/[0.06] bg-white p-5 dark:border-white/10 dark:bg-[#1C1C1E]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.1em] text-neutral-400">
                    {row.scenarioId}
                  </p>
                  <p className="mt-1 text-[15px] font-semibold text-neutral-900 dark:text-white">
                    {row.label}
                  </p>
                </div>
                <MetricPill
                  label="Confidence"
                  value={`${Math.round(row.confidence * 100)}%`}
                />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-black/[0.02] p-3 dark:bg-white/[0.03]">
                  <p className="text-[9px] font-semibold tracking-[0.1em] text-neutral-400">
                    BASELINE
                  </p>
                  <pre className="mt-2 whitespace-pre-wrap font-mono text-[11px] text-neutral-600 dark:text-neutral-300">
                    {JSON.stringify(row.baseline, null, 0) || "—"}
                  </pre>
                </div>
                <div className="rounded-lg bg-[#007AFF]/[0.04] p-3">
                  <p className="text-[9px] font-semibold tracking-[0.1em] text-[#007AFF]">
                    SIMULATED
                  </p>
                  <p className="mt-2 text-[13px] font-medium text-neutral-800 dark:text-neutral-100">
                    {row.simulated}
                  </p>
                </div>
                <div className="rounded-lg bg-black/[0.02] p-3 dark:bg-white/[0.03]">
                  <p className="text-[9px] font-semibold tracking-[0.1em] text-neutral-400">
                    EXPECTED
                  </p>
                  <pre className="mt-2 whitespace-pre-wrap font-mono text-[11px] text-neutral-600 dark:text-neutral-300">
                    {JSON.stringify(row.expectedRange, null, 0) || "—"}
                  </pre>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <MetricPill label="Risk" value={row.risk} />
                <MetricPill label="Uncertainty" value={row.uncertainty} />
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function DecisionRoom({ vm }: { vm: SaraExperienceViewModel }) {
  const d = vm.decisionRoom;
  if (!d) {
    return (
      <section id="sara-section-decision" className="scroll-mt-24">
        <SectionLabel>Decision room</SectionLabel>
        <p className="mt-3 text-[13px] text-neutral-500">
          No dominant decision in current snapshot.
        </p>
      </section>
    );
  }

  return (
    <section id="sara-section-decision" className="scroll-mt-24">
      <SectionLabel>Decision room</SectionLabel>
      <article className="mt-3 rounded-2xl border border-black/[0.06] bg-white p-5 dark:border-white/10 dark:bg-[#1C1C1E]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.1em] text-neutral-400">
              TOP DECISION
            </p>
            <p className="mt-1 font-mono text-[11px] text-[#007AFF]">
              {d.decisionId}
            </p>
            <h3 className="mt-2 text-[18px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
              {d.title}
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <MetricPill label="Score" value={String(d.score)} />
            <MetricPill label="Confidence" value={d.confidenceLabel} />
            <MetricPill label="Mode" value={d.mode} />
            <MetricPill label="Governance" value={d.governance} />
            <MetricPill label="Risk" value={d.risk} />
            <MetricPill label="Blast radius" value={d.blastRadius} />
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.1em] text-neutral-400">
              WHY THIS DECISION?
            </p>
            <ul className="mt-2 space-y-1 text-[12px] text-neutral-600 dark:text-neutral-300">
              {d.whyThis.map((w) => (
                <li key={w}>· {w}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.1em] text-neutral-400">
              WHAT MUST HAPPEN BEFORE EXECUTION?
            </p>
            <ul className="mt-2 space-y-1 text-[12px] text-neutral-600 dark:text-neutral-300">
              {d.beforeExecution.map((b) => (
                <li key={b}>· {b}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-black/[0.02] p-3 dark:bg-white/[0.03]">
            <p className="text-[10px] font-semibold text-neutral-400">
              IF WE DO NOTHING
            </p>
            <pre className="mt-2 font-mono text-[11px] text-neutral-600 dark:text-neutral-300">
              {JSON.stringify(d.ifNothing.baseline)}
            </pre>
          </div>
          <div className="rounded-lg bg-[#007AFF]/[0.04] p-3">
            <p className="text-[10px] font-semibold text-[#007AFF]">
              IF WE ACT
            </p>
            <pre className="mt-2 font-mono text-[11px] text-neutral-700 dark:text-neutral-200">
              {JSON.stringify(d.ifAct.expected)}
            </pre>
          </div>
        </div>

        <Link
          href={d.href}
          className="mt-4 inline-flex rounded-lg bg-[#007AFF] px-4 py-2 text-[12px] font-medium text-white transition-opacity hover:opacity-90"
        >
          {d.cta}
        </Link>
      </article>
    </section>
  );
}

function ExecutionSection({ vm }: { vm: SaraExperienceViewModel }) {
  const e = vm.execution;
  return (
    <section id="sara-section-execution" className="scroll-mt-24">
      <SectionLabel>Execution · governance</SectionLabel>
      <article className="mt-3 rounded-2xl border border-black/[0.06] bg-white p-5 dark:border-white/10 dark:bg-[#1C1C1E]">
        <div className="flex flex-wrap gap-2">
          {e.sandboxReady ? (
            <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
              SANDBOX READY
            </span>
          ) : null}
          {e.productionExecutionDisabled ? (
            <span className="rounded-md border border-orange-500/30 bg-orange-500/10 px-2 py-1 text-[10px] font-semibold text-orange-700 dark:text-orange-400">
              PRODUCTION EXECUTION DISABLED
            </span>
          ) : null}
          <span className="rounded-md border border-black/[0.06] px-2 py-1 text-[10px] font-medium text-neutral-500 dark:border-white/10">
            autoExecute: false
          </span>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {e.flow.map((step, i) => (
            <span key={step} className="flex items-center gap-2">
              {i > 0 ? (
                <ChevronRight className="h-3 w-3 text-neutral-300" />
              ) : null}
              <span className="rounded-md bg-black/[0.03] px-2 py-1 text-[10px] font-medium text-neutral-600 dark:bg-white/[0.06] dark:text-neutral-300">
                {step}
              </span>
            </span>
          ))}
        </div>
        <p className="mt-4 text-[12px] text-neutral-500">{e.note}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <MetricPill label="Status" value={e.status} />
          <MetricPill label="Kill switch" value={e.killSwitch} />
          <MetricPill label="Governor" value={e.governanceVerdict} />
        </div>
      </article>
    </section>
  );
}

function LearningSection({ vm }: { vm: SaraExperienceViewModel }) {
  const l = vm.learningLoop;
  return (
    <section id="sara-section-learning" className="scroll-mt-24">
      <SectionLabel>Learning loop</SectionLabel>
      <article className="mt-3 rounded-2xl border border-black/[0.06] bg-white p-5 dark:border-white/10 dark:bg-[#1C1C1E]">
        <div className="flex flex-wrap items-center gap-2">
          {l.steps.map((step, i) => (
            <span key={step} className="flex items-center gap-2">
              {i > 0 ? (
                <ArrowDown className="h-3 w-3 rotate-[-90deg] text-neutral-300" />
              ) : null}
              <span className="text-[10px] font-medium text-neutral-500">
                {step}
              </span>
            </span>
          ))}
        </div>
        {l.insufficientHistory ? (
          <p className="mt-4 text-[13px] font-medium text-orange-600 dark:text-orange-400">
            NOT ENOUGH HISTORY
          </p>
        ) : null}
        <ul className="mt-3 space-y-1 text-[12px] text-neutral-500">
          {l.evidenceNotes.map((n) => (
            <li key={n}>· {n}</li>
          ))}
        </ul>
        {l.confidenceAdjustment ? (
          <p className="mt-3 text-[12px] text-neutral-600 dark:text-neutral-300">
            Confidence {Math.round(l.confidenceAdjustment.before * 100)}% →{" "}
            {Math.round(l.confidenceAdjustment.after * 100)}% (
            {l.confidenceAdjustment.reason})
          </p>
        ) : null}
      </article>
    </section>
  );
}

function OpportunitiesSection({ vm }: { vm: SaraExperienceViewModel }) {
  const grouped = vm.opportunities.reduce(
    (acc, o) => {
      (acc[o.category] ??= []).push(o);
      return acc;
    },
    {} as Record<string, typeof vm.opportunities>
  );

  return (
    <section id="sara-section-opportunities" className="scroll-mt-24">
      <SectionLabel>Opportunity radar</SectionLabel>
      <div className="mt-3 space-y-4">
        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat}>
            <p className="text-[10px] font-semibold tracking-[0.1em] text-[#007AFF]">
              {cat}
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {items.map((o) => (
                <article
                  key={o.id}
                  className="rounded-xl border border-black/[0.06] bg-white p-3 dark:border-white/10 dark:bg-[#1C1C1E]"
                >
                  <p className="text-[13px] font-medium text-neutral-900 dark:text-white">
                    {o.title}
                  </p>
                  <p className="mt-1 text-[11px] text-neutral-500">{o.signal}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-neutral-400">
                    <span>{o.impact}</span>
                    <span>·</span>
                    <span>{o.affected}</span>
                    <span>·</span>
                    <span>{Math.round(o.confidence * 100)}%</span>
                  </div>
                  {o.href ? (
                    <Link
                      href={o.href}
                      className="mt-2 inline-flex text-[11px] font-medium text-[#007AFF] hover:underline"
                    >
                      {o.action}
                    </Link>
                  ) : (
                    <p className="mt-2 text-[11px] text-neutral-500">{o.action}</p>
                  )}
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function RiskFieldSection({ vm }: { vm: SaraExperienceViewModel }) {
  return (
    <section id="sara-section-risks" className="scroll-mt-24">
      <SectionLabel>Risk field</SectionLabel>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {vm.riskField.map((r) => (
          <article
            key={r.id}
            className="rounded-xl border border-black/[0.06] bg-white p-4 dark:border-white/10 dark:bg-[#1C1C1E]"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[13px] font-medium text-neutral-900 dark:text-white">
                {r.title}
              </p>
              <span className="text-[10px] font-semibold uppercase text-orange-600 dark:text-orange-400">
                {r.level}
              </span>
            </div>
            <p className="mt-2 text-[11px] text-neutral-500">{r.evidence}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-neutral-400">
              <span>Scope: {r.scope}</span>
              <span>·</span>
              <span>Reversibility: {r.reversibility}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AgentNetworkSection({ vm }: { vm: SaraExperienceViewModel }) {
  return (
    <section className="scroll-mt-24">
      <SectionLabel>Intelligence network</SectionLabel>
      <article className="mt-3 rounded-2xl border border-dashed border-black/[0.08] bg-black/[0.01] p-5 dark:border-white/10 dark:bg-white/[0.02]">
        <p className="text-[13px] font-semibold text-neutral-900 dark:text-white">
          {vm.agentNetwork.master.label}
        </p>
        <p className="text-[10px] font-medium tracking-[0.1em] text-[#007AFF]">
          MASTER INTELLIGENCE · {vm.agentNetwork.master.status}
        </p>
        <p className="mt-3 text-[12px] text-neutral-500">
          {vm.agentNetwork.placeholder}
        </p>
        <ul className="mt-2 space-y-1 text-[11px] text-neutral-400">
          {vm.agentNetwork.futureModules.map((m) => (
            <li key={m}>· {m}</li>
          ))}
        </ul>
      </article>
    </section>
  );
}

function SectionNav({
  navigation,
}: {
  navigation: SaraExperienceViewModel["navigation"];
}) {
  return (
    <nav className="sticky top-0 z-10 -mx-4 mb-6 overflow-x-auto border-b border-black/[0.06] bg-[#F5F5F7]/95 px-4 py-2 backdrop-blur dark:border-white/10 dark:bg-[#0A0A0A]/95 sm:-mx-6 sm:px-6">
      <div className="flex min-w-max gap-1">
        {navigation.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => scrollToSection(item.id)}
            className="rounded-md px-2.5 py-1.5 text-[11px] font-medium text-neutral-500 transition-colors hover:bg-black/[0.04] hover:text-neutral-900 dark:hover:bg-white/[0.06] dark:hover:text-white"
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
  useEffect(() => setMounted(true), []);

  const updatedLabel = mounted
    ? new Date(vm.generatedAt as string | Date).toLocaleString()
    : "Loading…";

  return (
    <div className="relative mx-auto max-w-6xl px-4 pb-16 font-sans sm:px-6 lg:px-8">
      {/* Ambient field */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64 overflow-hidden opacity-40 motion-reduce:opacity-20"
      >
        <div className="absolute -left-1/4 top-0 h-64 w-1/2 rounded-full bg-[#007AFF]/[0.04] blur-3xl motion-safe:animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute -right-1/4 top-8 h-48 w-1/2 rounded-full bg-neutral-400/[0.06] blur-3xl motion-safe:animate-[pulse_10s_ease-in-out_infinite]" />
      </div>

      <header className="relative space-y-4 border-b border-black/[0.06] pb-6 dark:border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Console
          </Link>
          <SaraCommandPalette navigation={vm.navigation} />
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] text-neutral-400">
              DR SARA
            </p>
            <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-neutral-900 dark:text-white">
              Platform Intelligence
            </h1>
            <p className="mt-1 text-[13px] text-neutral-500">
              The intelligence room of Ettajer
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 font-medium text-emerald-700 dark:text-emerald-400">
              <Circle className="h-2 w-2 fill-current motion-safe:animate-pulse" />
              LIVE
            </span>
            <span className="rounded-full border border-black/[0.06] px-2.5 py-1 text-neutral-500 dark:border-white/10">
              INTELLIGENCE CYCLE
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-[11px] text-neutral-500">
          <span>
            Last cycle ·{" "}
            <span className="text-neutral-700 dark:text-neutral-300">
              {vm.cycleId ?? "—"}
            </span>
          </span>
          <span>·</span>
          <span>
            State ·{" "}
            <span className="text-neutral-700 dark:text-neutral-300">
              {vm.platformStateSummary}
            </span>
          </span>
          <span>·</span>
          <span>
            Engine v{vm.engineVersion} · Experience v{vm.version}
          </span>
          <span>·</span>
          <span>{updatedLabel}</span>
        </div>
      </header>

      <SectionNav navigation={vm.navigation} />

      {/* NOW — central intelligence */}
      <section id="sara-section-now" className="scroll-mt-28">
        <SectionLabel>Now</SectionLabel>
        <article className="relative mt-3 overflow-hidden rounded-2xl border border-black/[0.08] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1C1C1E] sm:p-8">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#007AFF]/30 to-transparent" />
          <p className="text-[11px] font-semibold tracking-[0.2em] text-[#007AFF]">
            NOW
          </p>
          <h2 className="mt-3 max-w-2xl text-[26px] font-semibold leading-tight tracking-[-0.03em] text-neutral-900 dark:text-white sm:text-[32px]">
            {vm.now.headline}
          </h2>
          <div className="mt-4 max-w-xl space-y-2">
            {vm.now.narrative.map((line) => (
              <p
                key={line}
                className="text-[14px] leading-relaxed text-neutral-600 dark:text-neutral-300"
              >
                {line}
              </p>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href={vm.now.href}
              className="inline-flex rounded-lg bg-[#007AFF] px-4 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
            >
              {vm.now.cta}
            </Link>
            <MetricPill
              label="Confidence"
              value={
                vm.now.confidence != null
                  ? `${Math.round(vm.now.confidence * 100)}%`
                  : vm.now.confidenceLabel
              }
            />
            <MetricPill label="Risk" value={vm.now.risk} />
            <MetricPill label="Governance" value={vm.now.approval} />
          </div>
          {!vm.live ? (
            <p className="mt-4 text-[12px] font-medium text-orange-600 dark:text-orange-400">
              INSUFFICIENT EVIDENCE — intelligence claims degraded
            </p>
          ) : null}
        </article>
      </section>

      <div className="mt-10 space-y-10 lg:grid lg:grid-cols-[1fr_320px] lg:items-start lg:gap-8 lg:space-y-0">
        <div className="space-y-10">
          <WhyChain vm={vm} />
          <DecisionRoom vm={vm} />
          <ScenarioLab vm={vm} />
          <PlatformMapSection vm={vm} />
          <TimelineSection vm={vm} />
        </div>
        <aside className="space-y-10 lg:sticky lg:top-14">
          <ExecutionSection vm={vm} />
          <LearningSection vm={vm} />
          <RiskFieldSection vm={vm} />
          <OpportunitiesSection vm={vm} />
          <AgentNetworkSection vm={vm} />
          <section className="rounded-xl border border-black/[0.06] bg-white p-4 dark:border-white/10 dark:bg-[#1C1C1E]">
            <SectionLabel>Preserved engine outputs</SectionLabel>
            <dl className="mt-3 space-y-2 text-[11px]">
              <div className="flex justify-between gap-2">
                <dt className="text-neutral-400">TOP_ACTION</dt>
                <dd className="truncate font-mono text-neutral-700 dark:text-neutral-200">
                  {vm.preserved.topAction ?? "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-neutral-400">TOP_SCENARIO</dt>
                <dd className="truncate font-mono text-neutral-700 dark:text-neutral-200">
                  {vm.preserved.topScenario ?? "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-neutral-400">TOP_DECISION</dt>
                <dd className="truncate font-mono text-neutral-700 dark:text-neutral-200">
                  {vm.preserved.topDecision ?? "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-neutral-400">productionMutation</dt>
                <dd className="font-mono text-neutral-700 dark:text-neutral-200">
                  {vm.productionMutation}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-[10px] text-neutral-400">
              Pulse · {briefing.pulse.score}/100 · {briefing.pulse.label}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
