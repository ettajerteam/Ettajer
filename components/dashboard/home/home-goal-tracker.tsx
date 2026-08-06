"use client";

import { useEffect, useState } from "react";
import { Check, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency, cn } from "@/lib/utils";

interface HomeGoalTrackerProps {
  currentRevenue: number;
  suggestedGoal: number;
  currency: string;
  rangeLabel: string;
}

export function HomeGoalTracker({
  currentRevenue,
  suggestedGoal,
  currency,
  rangeLabel,
}: HomeGoalTrackerProps) {
  const [goal, setGoal] = useState(suggestedGoal);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(suggestedGoal));

  useEffect(() => {
    const stored = window.localStorage.getItem("ettajer-revenue-goal");
    if (stored) {
      const parsed = Number.parseInt(stored, 10);
      if (!Number.isNaN(parsed) && parsed > 0) {
        setGoal(parsed);
        setDraft(String(parsed));
      }
    }
  }, []);

  function saveGoal() {
    const parsed = Number.parseInt(draft.replace(/[^\d]/g, ""), 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      setGoal(parsed);
      window.localStorage.setItem("ettajer-revenue-goal", String(parsed));
    }
    setEditing(false);
  }

  const progress = goal > 0 ? Math.min((currentRevenue / goal) * 100, 100) : 0;
  const remaining = Math.max(goal - currentRevenue, 0);
  const onTrack = progress >= 70;

  return (
    <div className="rounded-2xl border border-black/[0.06] bg-neutral-50/80 px-4 py-3 dark:border-white/[0.08] dark:bg-white/[0.03]">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-neutral-700 dark:text-neutral-200">
          Monthly goal · {rangeLabel}
        </p>
        {editing ? (
          <div className="flex items-center gap-1">
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="h-7 w-24 rounded-md text-xs"
              autoFocus
              onKeyDown={(event) => event.key === "Enter" && saveGoal()}
            />
            <Button size="icon" className="h-7 w-7 rounded-md" onClick={saveGoal}>
              <Check className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" className="h-7 rounded-md px-2 text-[11px]" onClick={() => setEditing(true)}>
            <Pencil className="mr-1 h-3 w-3" />
            Edit
          </Button>
        )}
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-white/10">
        <div
          className={cn("h-full rounded-full", onTrack ? "bg-neutral-900" : "bg-neutral-400")}
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-1.5 text-[11px] text-neutral-500">
        {formatCurrency(currentRevenue, currency)} of {formatCurrency(goal, currency)}
        {" · "}
        <span className="font-medium text-neutral-700 dark:text-neutral-200">
          {Math.round(progress)}%
        </span>
        {progress < 100 ? ` · ${formatCurrency(remaining, currency)} left` : " · goal reached"}
      </p>
    </div>
  );
}
