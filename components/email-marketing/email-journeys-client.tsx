"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Clock,
  GitBranch,
  Mail,
  MessageSquare,
  Pause,
  Play,
  Plus,
  Tag,
  Target,
  Trash2,
  Workflow,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { EmailJourneyRow } from "@/lib/email-marketing/atlas/journeys";
import {
  JOURNEY_TRIGGERS,
  type JourneyEdge,
  type JourneyNode,
  type JourneyNodeType,
} from "@/lib/email-marketing/atlas/types";

interface EmailJourneysClientProps {
  initialJourneys: EmailJourneyRow[];
  storeName: string;
  openAi?: boolean;
}

const NODE_PALETTE: {
  type: JourneyNodeType;
  label: string;
  group: "message" | "logic" | "audience";
  icon: typeof Mail;
}[] = [
  { type: "email", label: "Email", group: "message", icon: Mail },
  { type: "sms", label: "SMS", group: "message", icon: MessageSquare },
  { type: "delay", label: "Delay", group: "logic", icon: Clock },
  { type: "wait_until", label: "Wait until", group: "logic", icon: Clock },
  { type: "condition", label: "Condition", group: "logic", icon: GitBranch },
  { type: "split", label: "Split", group: "logic", icon: GitBranch },
  { type: "goal", label: "Goal", group: "logic", icon: Target },
  { type: "exit", label: "Exit", group: "logic", icon: X },
  { type: "tag_customer", label: "Tag", group: "audience", icon: Tag },
  { type: "remove_tag", label: "Untag", group: "audience", icon: Tag },
  { type: "add_segment", label: "Add segment", group: "audience", icon: Workflow },
  {
    type: "remove_segment",
    label: "Remove segment",
    group: "audience",
    icon: Workflow,
  },
];

const NODE_TINT: Record<string, string> = {
  trigger: "border-violet-500/25 bg-violet-500/[0.06]",
  email: "border-neutral-300/60 bg-neutral-500/[0.05]",
  sms: "border-teal-500/25 bg-teal-500/[0.06]",
  push: "border-teal-500/20 bg-teal-500/[0.05]",
  whatsapp: "border-emerald-500/25 bg-emerald-500/[0.06]",
  messenger: "border-sky-500/25 bg-sky-500/[0.06]",
  delay: "border-amber-500/25 bg-amber-500/[0.06]",
  wait_until: "border-amber-500/20 bg-amber-500/[0.05]",
  condition: "border-emerald-500/25 bg-emerald-500/[0.06]",
  split: "border-emerald-500/20 bg-emerald-500/[0.05]",
  goal: "border-sky-500/25 bg-sky-500/[0.06]",
  exit: "border-neutral-400/30 bg-neutral-500/[0.06]",
  tag_customer: "border-pink-500/25 bg-pink-500/[0.06]",
  remove_tag: "border-pink-500/20 bg-pink-500/[0.05]",
  add_segment: "border-indigo-500/25 bg-indigo-500/[0.06]",
  remove_segment: "border-indigo-500/20 bg-indigo-500/[0.05]",
};

const STATUS_STYLE: Record<string, string> = {
  draft: "bg-neutral-500/10 text-neutral-600 dark:text-neutral-300",
  active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  paused: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  archived: "bg-neutral-500/10 text-neutral-400",
};

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

function triggerLabel(trigger: string) {
  return trigger.replace(/_/g, " ");
}

export function EmailJourneysClient({
  initialJourneys,
  storeName,
  openAi = false,
}: EmailJourneysClientProps) {
  const router = useRouter();
  const [journeys, setJourneys] = useState(initialJourneys);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialJourneys[0]?.id ?? null
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [aiDesc, setAiDesc] = useState(
    openAi ? `I sell products at ${storeName}.` : ""
  );
  const [showAi, setShowAi] = useState(openAi);
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("Welcome Series");
  const [createTrigger, setCreateTrigger] =
    useState<(typeof JOURNEY_TRIGGERS)[number]>("newsletter_signup");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [listFilter, setListFilter] = useState<"all" | "active" | "draft">(
    "all"
  );

  const selected = useMemo(
    () => journeys.find((j) => j.id === selectedId) ?? null,
    [journeys, selectedId]
  );

  const filtered = useMemo(() => {
    if (listFilter === "all") return journeys;
    return journeys.filter((j) => j.status === listFilter);
  }, [journeys, listFilter]);

  async function createJourney() {
    setBusy("create");
    try {
      const res = await fetch("/api/email/journeys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName,
          trigger: createTrigger,
          kind: "welcome",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.message === "string" ? data.message : "Create failed"
        );
      }
      const journey = data.journey as EmailJourneyRow;
      setJourneys((prev) => [journey, ...prev]);
      setSelectedId(journey.id);
      setCreateOpen(false);
      toast.success("Flow created");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Create failed");
    } finally {
      setBusy(null);
    }
  }

  async function generateAi() {
    setBusy("ai");
    try {
      const res = await fetch("/api/email/journeys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_ai",
          businessDescription: aiDesc,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.message === "string" ? data.message : "AI failed"
        );
      }
      const created = (data.journeys || []) as EmailJourneyRow[];
      setJourneys((prev) => [...created, ...prev]);
      if (created[0]) setSelectedId(created[0].id);
      setShowAi(false);
      toast.success(`Generated ${created.length} flows`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI failed");
    } finally {
      setBusy(null);
    }
  }

  async function saveGraph(nodes: JourneyNode[], edges: JourneyEdge[]) {
    if (!selected) return;
    setBusy("save");
    try {
      const res = await fetch("/api/email/journeys", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, nodes, edges }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.message === "string" ? data.message : "Save failed"
        );
      }
      const journey = data.journey as EmailJourneyRow;
      setJourneys((prev) =>
        prev.map((j) => (j.id === journey.id ? journey : j))
      );
      toast.success("Saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(null);
    }
  }

  async function setStatus(status: "draft" | "active" | "paused" | "archived") {
    if (!selected) return;
    setBusy("status");
    try {
      const res = await fetch("/api/email/journeys", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.message === "string" ? data.message : "Update failed"
        );
      }
      const journey = data.journey as EmailJourneyRow;
      setJourneys((prev) =>
        prev.map((j) => (j.id === journey.id ? journey : j))
      );
      toast.success(
        status === "active"
          ? "Flow live"
          : status === "paused"
            ? "Flow paused"
            : `Flow ${status}`
      );
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(null);
    }
  }

  async function removeJourney(id: string) {
    setBusy(`del-${id}`);
    try {
      const res = await fetch(
        `/api/email/journeys?id=${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.message === "string" ? data.message : "Delete failed"
        );
      }
      setJourneys((prev) => prev.filter((j) => j.id !== id));
      if (selectedId === id) setSelectedId(null);
      toast.success("Flow deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(null);
    }
  }

  function addNode(type: JourneyNodeType) {
    if (!selected) return;
    const node: JourneyNode = {
      id: newId(type.slice(0, 3)),
      type,
      label: type.replace(/_/g, " "),
      position: {
        x: 100 + (selected.nodes.length % 5) * 40,
        y: 80 + Math.floor(selected.nodes.length / 5) * 90,
      },
      channel: type === "email" ? "email" : undefined,
      config:
        type === "delay"
          ? { hours: 24 }
          : type === "email"
            ? {
                subject: `Hello from ${storeName}`,
                title: "A note for you",
                body: "Discover what’s new.",
                ctaLabel: "Shop now",
              }
            : type === "tag_customer" || type === "remove_tag"
              ? { tag: "atlas" }
              : {},
    };
    const nodes = [...selected.nodes, node];
    const last = selected.nodes[selected.nodes.length - 1];
    const edges = last
      ? [
          ...selected.edges,
          { id: newId("edg"), source: last.id, target: node.id },
        ]
      : selected.edges;
    setJourneys((prev) =>
      prev.map((j) => (j.id === selected.id ? { ...j, nodes, edges } : j))
    );
    void saveGraph(nodes, edges);
  }

  function moveNode(id: string, dx: number, dy: number) {
    if (!selected) return;
    const nodes = selected.nodes.map((n) =>
      n.id === id
        ? {
            ...n,
            position: {
              x: Math.max(8, n.position.x + dx),
              y: Math.max(8, n.position.y + dy),
            },
          }
        : n
    );
    setJourneys((prev) =>
      prev.map((j) => (j.id === selected.id ? { ...j, nodes } : j))
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setShowAi((v) => !v)}
          className={cn(
            "inline-flex h-9 items-center rounded-full px-3.5 text-[12px] font-medium transition-colors",
            showAi
              ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
              : "border border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-white/10 dark:text-neutral-300"
          )}
        >
          AI generator
        </button>
        <button
          type="button"
          onClick={() => setCreateOpen((v) => !v)}
          className="inline-flex h-9 items-center gap-1 rounded-full bg-neutral-950 px-3.5 text-[12px] font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950"
        >
          <Plus className="h-3.5 w-3.5" />
          New
        </button>
      </div>

      {showAi ? (
        <div
          className={cn(
            "overflow-hidden rounded-2xl border border-neutral-100 p-0 dark:border-white/10",
            "animate-in fade-in slide-in-from-top-1 duration-200"
          )}
        >
          <div className="flex items-start justify-between gap-3 border-b border-neutral-100 px-4 py-3 dark:border-white/10">
            <div>
              <p className="text-[13px] font-semibold text-neutral-950 dark:text-white">
                AI flow generator
              </p>
              <p className="mt-0.5 text-[12px] text-neutral-400">
                Describe your niche — we scaffold Welcome, Cart, Win-back,
                Post-purchase & VIP
              </p>
            </div>
            <button
              type="button"
              className="rounded-md p-1 text-neutral-400 hover:bg-black/[0.04] hover:text-neutral-700 dark:hover:bg-white/[0.06]"
              onClick={() => setShowAi(false)}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3 p-4">
            <Textarea
              value={aiDesc}
              onChange={(e) => setAiDesc(e.target.value)}
              rows={2}
              placeholder='e.g. "I sell luxury perfumes."'
              className="min-h-[72px] resize-none rounded-[10px] border-black/[0.06] bg-[#F5F5F7] text-[13px] dark:border-white/10 dark:bg-white/[0.04]"
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[10px] text-neutral-400">
                Draft flows only — review before activating
              </p>
              <Button
                type="button"
                className="h-8 rounded-full bg-neutral-950 px-3 text-[12px] text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950"
                loading={busy === "ai"}
                disabled={!aiDesc.trim()}
                onClick={() => void generateAi()}
              >
                Generate flows
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {createOpen ? (
        <div
          className={cn(
            "flex flex-wrap items-end gap-2 rounded-2xl border border-neutral-100 p-3 dark:border-white/10",
            "animate-in fade-in duration-200"
          )}
        >
          <div className="min-w-[160px] flex-1 space-y-1">
            <label className="text-[10px] font-medium text-neutral-400">
              Name
            </label>
            <Input
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              className="h-8 rounded-md bg-[#F5F5F7] text-[12px] dark:bg-white/[0.04]"
            />
          </div>
          <div className="min-w-[160px] flex-1 space-y-1">
            <label className="text-[10px] font-medium text-neutral-400">
              Trigger
            </label>
            <select
              value={createTrigger}
              onChange={(e) =>
                setCreateTrigger(
                  e.target.value as (typeof JOURNEY_TRIGGERS)[number]
                )
              }
              className="h-8 w-full rounded-md border border-black/[0.06] bg-[#F5F5F7] px-2 text-[12px] dark:border-white/10 dark:bg-white/[0.04]"
            >
              {JOURNEY_TRIGGERS.map((t) => (
                <option key={t} value={t}>
                  {triggerLabel(t)}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="button"
            className="h-8 rounded-full bg-neutral-950 px-3 text-[12px] text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950"
            loading={busy === "create"}
            onClick={() => void createJourney()}
          >
            Create
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-8 px-2 text-[12px] text-neutral-400"
            onClick={() => setCreateOpen(false)}
          >
            Cancel
          </Button>
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
        <aside className="overflow-hidden rounded-2xl border border-neutral-100 p-0 dark:border-white/10">
          <div className="border-b border-neutral-100 px-3 py-2.5 dark:border-white/10">
            <div className="flex flex-wrap gap-1">
              {(
                [
                  { id: "all", label: "All" },
                  { id: "active", label: "Live" },
                  { id: "draft", label: "Draft" },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setListFilter(f.id)}
                  className={cn(
                    "rounded-full px-3 py-1 text-[11px] font-medium transition-colors",
                    listFilter === f.id
                      ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                      : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <ul className="max-h-[min(620px,70vh)] space-y-0.5 overflow-auto p-1.5">
            {filtered.map((j) => {
              const active = selectedId === j.id;
              return (
                <li key={j.id}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedId(j.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedId(j.id);
                      }
                    }}
                    className={cn(
                      "group flex w-full cursor-pointer items-start gap-2 rounded-xl px-2.5 py-2.5 text-left transition-colors",
                      active
                        ? "bg-neutral-100 dark:bg-white/[0.08]"
                        : "hover:bg-neutral-50 dark:hover:bg-white/[0.04]"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 h-2 w-2 shrink-0 rounded-full",
                        j.status === "active"
                          ? "bg-emerald-500"
                          : j.status === "paused"
                            ? "bg-amber-400"
                            : "bg-neutral-300 dark:bg-neutral-600"
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-medium text-neutral-900 dark:text-white">
                        {j.name}
                      </span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] text-neutral-400">
                        <span
                          className={cn(
                            "rounded px-1 py-px font-medium capitalize",
                            STATUS_STYLE[j.status] || STATUS_STYLE.draft
                          )}
                        >
                          {j.status}
                        </span>
                        <span>{j.enrolledCount} enrolled</span>
                      </span>
                    </span>
                    <button
                      type="button"
                      className="rounded-md p-1 text-neutral-300 opacity-0 transition-opacity hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100"
                      aria-label="Delete flow"
                      onClick={(e) => {
                        e.stopPropagation();
                        void removeJourney(j.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
            {filtered.length === 0 ? (
              <li className="px-3 py-10 text-center">
                <Workflow className="mx-auto h-5 w-5 text-neutral-300" />
                <p className="mt-2 text-[12px] text-neutral-400">
                  {journeys.length === 0
                    ? "No flows yet"
                    : "Nothing in this filter"}
                </p>
              </li>
            ) : null}
          </ul>
        </aside>

        <div className="min-h-[520px] overflow-hidden rounded-2xl border border-neutral-100 p-0 dark:border-white/10">
          {selected ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3 dark:border-white/10">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-[14px] font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
                      {selected.name}
                    </h3>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                        STATUS_STYLE[selected.status] || STATUS_STYLE.draft
                      )}
                    >
                      {selected.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-neutral-400">
                    {triggerLabel(selected.trigger)}
                    {selected.completedCount > 0
                      ? ` · ${selected.completedCount} completed`
                      : ""}
                    {selected.revenue > 0
                      ? ` · ${selected.revenue.toLocaleString()} revenue`
                      : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {selected.status !== "active" ? (
                    <Button
                      type="button"
                      className="h-8 gap-1 rounded-full bg-neutral-950 px-3 text-[12px] text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950"
                      loading={busy === "status"}
                      onClick={() => void setStatus("active")}
                    >
                      <Play className="h-3 w-3" />
                      Activate
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-8 gap-1 rounded-full border-neutral-200 px-3 text-[12px] dark:border-white/10"
                      loading={busy === "status"}
                      onClick={() => void setStatus("paused")}
                    >
                      <Pause className="h-3 w-3" />
                      Pause
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 rounded-full border-neutral-200 px-3 text-[12px] dark:border-white/10"
                    loading={busy === "save"}
                    onClick={() =>
                      void saveGraph(selected.nodes, selected.edges)
                    }
                  >
                    Save
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto border-b border-black/[0.05] px-3 py-2 dark:border-white/10">
                {(["message", "logic", "audience"] as const).map((group) => (
                  <div key={group} className="flex shrink-0 items-center gap-1">
                    <span className="mr-0.5 text-[9px] font-medium uppercase tracking-wide text-neutral-300 dark:text-neutral-600">
                      {group}
                    </span>
                    {NODE_PALETTE.filter((n) => n.group === group).map((n) => {
                      const Icon = n.icon;
                      return (
                        <button
                          key={n.type}
                          type="button"
                          title={`Add ${n.label}`}
                          onClick={() => addNode(n.type)}
                          className={cn(
                            "inline-flex h-7 items-center gap-1 rounded-md border border-black/[0.06] bg-white px-2 text-[10px] font-medium text-neutral-600 transition-colors",
                            "hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900 dark:hover:border-white/20 dark:hover:bg-white/[0.04] dark:hover:text-white",
                            "dark:border-white/10 dark:bg-transparent dark:text-neutral-300"
                          )}
                        >
                          <Icon className="h-3 w-3" strokeWidth={1.75} />
                          {n.label}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div
                className={cn(
                  "relative h-[min(560px,62vh)] overflow-auto",
                  "bg-[#FAFAFA] dark:bg-black/20",
                  "bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.045)_1px,transparent_0)] bg-[length:20px_20px]",
                  "dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)]"
                )}
              >
                <svg
                  className="pointer-events-none absolute inset-0 h-full w-[1200px] min-w-full"
                  style={{ minHeight: "100%" }}
                >
                  {selected.edges.map((e) => {
                    const s = selected.nodes.find((n) => n.id === e.source);
                    const t = selected.nodes.find((n) => n.id === e.target);
                    if (!s || !t) return null;
                    const x1 = s.position.x + 96;
                    const y1 = s.position.y + 32;
                    const x2 = t.position.x + 8;
                    const y2 = t.position.y + 32;
                    const mx = (x1 + x2) / 2;
                    return (
                      <g key={e.id}>
                        <path
                          d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
                          fill="none"
                          stroke="currentColor"
                          className="text-neutral-300 dark:text-neutral-600"
                          strokeWidth={1.5}
                        />
                        {e.label ? (
                          <text
                            x={mx}
                            y={(y1 + y2) / 2 - 6}
                            textAnchor="middle"
                            className="fill-neutral-400 text-[9px]"
                          >
                            {e.label}
                          </text>
                        ) : null}
                      </g>
                    );
                  })}
                </svg>

                {selected.nodes.map((node) => (
                  <div
                    key={node.id}
                    className={cn(
                      "absolute w-[192px] select-none rounded-[12px] border p-3 shadow-sm backdrop-blur-sm transition-[box-shadow,transform]",
                      "bg-white/95 dark:bg-[#1C1C1E]/95",
                      NODE_TINT[node.type] || "border-black/[0.06]",
                      draggingId === node.id
                        ? "z-10 cursor-grabbing shadow-md scale-[1.02]"
                        : "cursor-grab hover:shadow-md"
                    )}
                    style={{ left: node.position.x, top: node.position.y }}
                    onMouseDown={(ev) => {
                      if ((ev.target as HTMLElement).closest("button")) return;
                      ev.preventDefault();
                      setDraggingId(node.id);
                      let lastX = ev.clientX;
                      let lastY = ev.clientY;
                      const onMoveDelta = (e: MouseEvent) => {
                        moveNode(node.id, e.clientX - lastX, e.clientY - lastY);
                        lastX = e.clientX;
                        lastY = e.clientY;
                      };
                      const onUp = () => {
                        setDraggingId(null);
                        window.removeEventListener("mousemove", onMoveDelta);
                        window.removeEventListener("mouseup", onUp);
                      };
                      window.addEventListener("mousemove", onMoveDelta);
                      window.addEventListener("mouseup", onUp);
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-neutral-400">
                        {node.type.replace(/_/g, " ")}
                      </span>
                      {node.channel ? (
                        <span className="rounded bg-black/[0.04] px-1 py-px text-[9px] text-neutral-500 dark:bg-white/[0.06]">
                          {node.channel}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1.5 text-[12px] font-semibold capitalize tracking-[-0.01em] text-neutral-900 dark:text-white">
                      {node.label}
                    </p>
                    {typeof node.config.subject === "string" ? (
                      <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-neutral-400">
                        {node.config.subject}
                      </p>
                    ) : typeof node.config.hours === "number" ? (
                      <p className="mt-1 text-[10px] text-neutral-400">
                        Wait {node.config.hours}h
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-[520px] flex-col items-center justify-center px-6 text-center">
              <p className="text-[14px] font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
                Pick a flow to edit
              </p>
              <p className="mt-1 max-w-xs text-[12px] text-neutral-400">
                Or generate a starter pack with AI for your product niche.
              </p>
              <div className="mt-4 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 rounded-full text-[12px]"
                  onClick={() => setShowAi(true)}
                >
                  AI generator
                </Button>
                <Button
                  type="button"
                  className="h-8 rounded-full bg-neutral-950 px-3 text-[12px] text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950"
                  onClick={() => setCreateOpen(true)}
                >
                  New flow
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
