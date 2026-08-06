"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  EMAIL_AUTOMATION_TRIGGER_DEFS,
  type EmailAutomationTrigger,
} from "@/lib/email-marketing/triggers";
import type { EmailAutomationRow } from "@/lib/email-marketing/types";
import type { EmailTemplateRow } from "@/lib/email-marketing/types";

interface EmailAutomationsClientProps {
  initialAutomations: EmailAutomationRow[];
  templates: EmailTemplateRow[];
}

export function EmailAutomationsClient({
  initialAutomations,
  templates,
}: EmailAutomationsClientProps) {
  const [automations, setAutomations] = useState(initialAutomations);
  const [savingTrigger, setSavingTrigger] = useState<string | null>(null);

  function automationFor(trigger: EmailAutomationTrigger) {
    return automations.find((a) => a.trigger === trigger);
  }

  async function save(input: {
    trigger: EmailAutomationTrigger;
    enabled: boolean;
    templateId: string;
  }) {
    setSavingTrigger(input.trigger);
    try {
      const res = await fetch("/api/email/automations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.message === "string" ? data.message : "Save failed",
        );
      }
      const row = data.automation as EmailAutomationRow;
      setAutomations((prev) => {
        const rest = prev.filter((a) => a.trigger !== row.trigger);
        return [...rest, row];
      });
      toast.success("Saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSavingTrigger(null);
    }
  }

  if (templates.length === 0) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-dashed border-neutral-200 px-6 py-12 text-center dark:border-white/15">
        <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
          Add a template first
        </h2>
        <p className="mx-auto mt-1.5 max-w-sm text-[13px] text-neutral-400">
          Automations send a template when a customer takes an action.
        </p>
        <Button
          asChild
          className="mt-5 h-9 rounded-full bg-neutral-950 px-4 text-[13px] font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950"
        >
          <Link href="/dashboard/marketing/email/templates">Go to templates</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <p className="text-[13px] text-neutral-400">
        One email when something happens. Order receipts stay separate. Need
        steps and delays?{" "}
        <Link
          href="/dashboard/marketing/email/journeys"
          className="font-medium text-neutral-700 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white"
        >
          Email flows
        </Link>
        .
      </p>

      <ul className="divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-100 dark:divide-white/10 dark:border-white/10">
        {EMAIL_AUTOMATION_TRIGGER_DEFS.map((def) => {
          const row = automationFor(def.id);
          const enabled = row?.enabled ?? false;
          const templateId = row?.templateId ?? templates[0]!.id;
          const busy = savingTrigger === def.id;

          return (
            <li
              key={def.id}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-medium text-neutral-950 dark:text-white">
                    {def.name}
                  </p>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-medium",
                      enabled
                        ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                        : "bg-neutral-100 text-neutral-400 dark:bg-white/10",
                    )}
                  >
                    {enabled ? "On" : "Off"}
                  </span>
                </div>
                <p className="mt-0.5 text-[12px] text-neutral-400">
                  {def.description}
                </p>
                <label className="mt-3 flex max-w-xs flex-col gap-1">
                  <span className="text-[11px] text-neutral-400">Template</span>
                  <select
                    className="h-9 rounded-xl border border-neutral-200 bg-white px-2.5 text-[13px] dark:border-white/15 dark:bg-transparent"
                    value={templateId}
                    disabled={busy}
                    onChange={(e) => {
                      void save({
                        trigger: def.id,
                        enabled,
                        templateId: e.target.value,
                      });
                    }}
                  >
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <Switch
                checked={enabled}
                disabled={busy}
                onCheckedChange={(next) => {
                  void save({
                    trigger: def.id,
                    enabled: next,
                    templateId,
                  });
                }}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
