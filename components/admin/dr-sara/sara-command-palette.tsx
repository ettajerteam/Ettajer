"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type {
  ExperienceSectionId,
  SaraExperienceViewModel,
} from "@/lib/intelligence/presentation/experience-model";

type SaraCommand = {
  id: string;
  label: string;
  hint: string;
  section: ExperienceSectionId;
};

const SARA_COMMANDS: SaraCommand[] = [
  { id: "now", label: "What matters now", hint: "Central intelligence", section: "now" },
  { id: "risks", label: "Show risks", hint: "Risk field", section: "risks" },
  { id: "opportunities", label: "Show opportunities", hint: "Opportunity radar", section: "opportunities" },
  { id: "decision", label: "Show decisions", hint: "Decision room", section: "decision" },
  { id: "scenario", label: "Show scenarios", hint: "Scenario lab", section: "scenario" },
  { id: "system", label: "Show platform map", hint: "System graph", section: "system" },
  { id: "learning", label: "Show learning", hint: "Learning loop", section: "learning" },
  { id: "execution", label: "Show execution state", hint: "Governance & sandbox", section: "execution" },
  { id: "outcome", label: "Show timeline", hint: "Past · now · expected", section: "outcome" },
  { id: "why", label: "Show reasoning", hint: "Why chain", section: "why" },
  { id: "network", label: "Show intelligence network", hint: "Future agents", section: "network" },
];

function scrollToSection(section: ExperienceSectionId) {
  const el = document.getElementById(`sara-section-${section}`);
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function SaraCommandPalette({
  navigation,
}: {
  navigation: SaraExperienceViewModel["navigation"];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "k") return;
      e.preventDefault();
      e.stopPropagation();
      setOpen((v) => !v);
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActive(0);
    }
  }, [open]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const navBySection = new Map(navigation.map((n) => [n.id, n.label]));
    const list = SARA_COMMANDS.map((cmd) => ({
      ...cmd,
      group: "Dr Sara",
      navLabel: navBySection.get(cmd.section) ?? cmd.section,
    }));
    if (!q) return list;
    return list.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.hint.toLowerCase().includes(q) ||
        item.navLabel.toLowerCase().includes(q)
    );
  }, [query, navigation]);

  useEffect(() => {
    setActive(0);
  }, [items.length, query]);

  const activate = useCallback((section: ExperienceSectionId) => {
    setOpen(false);
    scrollToSection(section);
  }, []);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, Math.max(items.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = items[active];
      if (item) activate(item.section);
    }
  }

  const shortcutLabel =
    mounted && /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘K" : "Ctrl K";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-7 items-center gap-1.5 rounded-md border border-black/[0.06] bg-black/[0.02] px-2 text-[10px] text-neutral-500 transition-colors hover:bg-black/[0.04] dark:border-white/10 dark:bg-white/[0.04]"
        aria-label="Open Dr Sara command palette"
      >
        <Search className="h-3 w-3" />
        <span className="hidden sm:inline">Sara</span>
        <kbd
          suppressHydrationWarning
          className="rounded border border-black/[0.06] bg-white px-1 py-0.5 font-mono text-[9px] dark:border-white/10 dark:bg-black/30"
        >
          {shortcutLabel}
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg gap-0 overflow-hidden p-0 sm:rounded-xl">
          <DialogTitle className="sr-only">Dr Sara command palette</DialogTitle>
          <div className="flex items-center gap-2 border-b border-black/[0.06] px-3 dark:border-white/10">
            <Search className="h-4 w-4 shrink-0 text-[#007AFF]" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Navigate Dr Sara — try “risks” or “what matters now”"
              className="h-11 w-full bg-transparent text-[13px] outline-none placeholder:text-neutral-400"
            />
          </div>
          <div className="max-h-[360px] overflow-y-auto p-1.5">
            {items.length === 0 ? (
              <p className="px-3 py-6 text-center text-[12px] text-neutral-400">
                No matches
              </p>
            ) : (
              items.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onMouseEnter={() => setActive(index)}
                  onClick={() => activate(item.section)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12px] transition-colors",
                    index === active
                      ? "bg-[#007AFF]/10 text-neutral-900 dark:text-white"
                      : "text-neutral-600 dark:text-neutral-300"
                  )}
                >
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {item.label}
                  </span>
                  <span className="truncate text-[11px] text-neutral-400">
                    {item.hint}
                  </span>
                </button>
              ))
            )}
          </div>
          <div className="flex items-center justify-between border-t border-black/[0.06] px-3 py-2 text-[10px] text-neutral-400 dark:border-white/10">
            <span>Deterministic navigation · no LLM</span>
            <button
              type="button"
              className="text-[#007AFF] hover:underline"
              onClick={() => {
                setOpen(false);
                router.push("/admin");
              }}
            >
              Exit to Console
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { scrollToSection };
