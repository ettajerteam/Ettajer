"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  ChevronDown,
  ChevronUp,
  LayoutTemplate,
  Package,
  Pencil,
  Rocket,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "ettajer-editor-launch-checklist";

export type LaunchChecklistStepId = "template" | "hero" | "products" | "publish";

interface StoredProgress {
  dismissed?: boolean;
  minimized?: boolean;
  completed?: Partial<Record<LaunchChecklistStepId, boolean>>;
}

interface LaunchChecklistProps {
  className?: string;
  hasTemplate: boolean;
  hasProducts: boolean;
  hasPublished?: boolean;
  onChooseTemplate: () => void;
  onEditHero: () => void;
  onPublish: () => void;
  onStepComplete?: (step: LaunchChecklistStepId) => void;
}

function readProgress(): StoredProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as StoredProgress;
  } catch {
    return {};
  }
}

function writeProgress(next: StoredProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

const STEPS: {
  id: LaunchChecklistStepId;
  title: string;
  description: string;
  icon: typeof LayoutTemplate;
}[] = [
  {
    id: "template",
    title: "Choose a template",
    description: "Start from a polished storefront design",
    icon: LayoutTemplate,
  },
  {
    id: "hero",
    title: "Edit your hero",
    description: "Set the headline shoppers see first",
    icon: Pencil,
  },
  {
    id: "products",
    title: "Add products",
    description: "Fill your catalog so the shop feels real",
    icon: Package,
  },
  {
    id: "publish",
    title: "Go live",
    description: "Push your storefront updates for customers",
    icon: Rocket,
  },
];

export function EditorGettingStarted({
  className,
  hasTemplate,
  hasProducts,
  hasPublished = false,
  onChooseTemplate,
  onEditHero,
  onPublish,
}: LaunchChecklistProps) {
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState<StoredProgress>({});

  useEffect(() => {
    setProgress(readProgress());
    setReady(true);
  }, []);

  const persist = useCallback((patch: StoredProgress) => {
    setProgress((prev) => {
      const next = {
        ...prev,
        ...patch,
        completed: { ...prev.completed, ...patch.completed },
      };
      writeProgress(next);
      return next;
    });
  }, []);

  const markComplete = useCallback(
    (id: LaunchChecklistStepId) => {
      persist({ completed: { [id]: true } });
    },
    [persist]
  );

  const doneMap = useMemo(() => {
    const completed = progress.completed ?? {};
    return {
      template: Boolean(hasTemplate || completed.template),
      hero: Boolean(completed.hero),
      products: Boolean(hasProducts || completed.products),
      publish: Boolean(hasPublished || completed.publish),
    } satisfies Record<LaunchChecklistStepId, boolean>;
  }, [progress.completed, hasTemplate, hasProducts, hasPublished]);

  const doneCount = STEPS.filter((s) => doneMap[s.id]).length;
  const allDone = doneCount === STEPS.length;
  const nextStep = STEPS.find((s) => !doneMap[s.id]) ?? null;

  // Sync live signals into storage so progress survives refresh.
  useEffect(() => {
    if (!ready) return;
    const patch: Partial<Record<LaunchChecklistStepId, boolean>> = {};
    if (hasTemplate && !progress.completed?.template) patch.template = true;
    if (hasProducts && !progress.completed?.products) patch.products = true;
    if (hasPublished && !progress.completed?.publish) patch.publish = true;
    if (Object.keys(patch).length) persist({ completed: patch });
  }, [ready, hasTemplate, hasProducts, hasPublished, progress.completed, persist]);

  if (!ready || progress.dismissed) return null;

  if (allDone) {
    return (
      <div
        className={cn(
          "w-[min(100%,22rem)] overflow-hidden rounded-2xl border border-emerald-200/80 bg-white/95 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.45)] backdrop-blur-md",
          className
        )}
      >
        <div className="flex items-start gap-3 px-4 py-3.5">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
            <Check className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-neutral-900">You’re set to sell</p>
            <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">
              Template, hero, products, and go live — all done. Keep refining anytime.
            </p>
          </div>
          <button
            type="button"
            onClick={() => persist({ dismissed: true })}
            className="rounded-lg p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
            aria-label="Dismiss checklist"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  if (progress.minimized) {
    return (
      <button
        type="button"
        onClick={() => persist({ minimized: false })}
        className={cn(
          "inline-flex items-center gap-2.5 rounded-full border border-neutral-200/90 bg-white/95 px-3.5 py-2 text-left shadow-[0_12px_40px_-20px_rgba(15,23,42,0.5)] backdrop-blur-md transition hover:border-[#007AFF]/35 hover:shadow-md",
          className
        )}
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#007AFF] text-[10px] font-bold text-white">
          {doneCount}
        </span>
        <span className="text-xs font-medium text-neutral-800">
          Launch checklist
          <span className="ml-1.5 text-neutral-400">{doneCount}/4</span>
        </span>
        <ChevronUp className="h-3.5 w-3.5 text-neutral-400" />
      </button>
    );
  }

  return (
    <div
      className={cn(
        "w-[min(100%,22rem)] overflow-hidden rounded-2xl border border-neutral-200/90 bg-white/95 shadow-[0_22px_60px_-28px_rgba(15,23,42,0.5)] backdrop-blur-md",
        className
      )}
    >
      <div className="border-b border-neutral-100 px-4 pb-3 pt-3.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
              Launch checklist
            </p>
            <p className="mt-1 text-sm font-semibold tracking-tight text-neutral-900">
              Go live in four steps
            </p>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => persist({ minimized: true })}
              className="rounded-lg p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
              aria-label="Minimize checklist"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => persist({ dismissed: true })}
              className="rounded-lg p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
              aria-label="Dismiss checklist"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-[#007AFF] transition-all duration-500"
              style={{ width: `${(doneCount / STEPS.length) * 100}%` }}
            />
          </div>
          <span className="text-[11px] font-medium tabular-nums text-neutral-500">
            {doneCount}/{STEPS.length}
          </span>
        </div>
      </div>

      <ol className="divide-y divide-neutral-100">
        {STEPS.map((step, index) => {
          const done = doneMap[step.id];
          const isNext = nextStep?.id === step.id;
          const Icon = step.icon;

          return (
            <li
              key={step.id}
              className={cn(
                "flex items-start gap-3 px-4 py-3 transition-colors",
                isNext && "bg-[#007AFF]/[0.04]"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                  done
                    ? "bg-emerald-500 text-white"
                    : isNext
                      ? "bg-[#007AFF] text-white"
                      : "bg-neutral-100 text-neutral-500"
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm font-medium",
                    done ? "text-neutral-400 line-through" : "text-neutral-900"
                  )}
                >
                  {step.title}
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-neutral-500">
                  {step.description}
                </p>
              </div>

              {!done ? (
                step.id === "products" ? (
                  <Button
                    asChild
                    size="sm"
                    variant={isNext ? "default" : "outline"}
                    className={cn(
                      "h-8 shrink-0 rounded-lg px-2.5 text-xs",
                      isNext && "bg-[#007AFF] hover:bg-[#0071EB]"
                    )}
                  >
                    <Link href="/dashboard/products">
                      <Icon className="mr-1 h-3 w-3" />
                      Open
                    </Link>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant={isNext ? "default" : "outline"}
                    className={cn(
                      "h-8 shrink-0 rounded-lg px-2.5 text-xs",
                      isNext && "bg-[#007AFF] hover:bg-[#0071EB]"
                    )}
                    onClick={() => {
                      if (step.id === "template") onChooseTemplate();
                      if (step.id === "hero") {
                        onEditHero();
                        markComplete("hero");
                      }
                      if (step.id === "publish") onPublish();
                    }}
                  >
                    <Icon className="mr-1 h-3 w-3" />
                    {step.id === "publish" ? "Go live" : "Go"}
                  </Button>
                )
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Call after a successful publish so the checklist can complete step 4. */
export function markLaunchChecklistPublished() {
  try {
    const prev = readProgress();
    writeProgress({
      ...prev,
      completed: { ...prev.completed, publish: true },
    });
  } catch {
    /* ignore */
  }
}

/** Call after applying a website template. */
export function markLaunchChecklistTemplate() {
  try {
    const prev = readProgress();
    writeProgress({
      ...prev,
      completed: { ...prev.completed, template: true },
    });
  } catch {
    /* ignore */
  }
}
