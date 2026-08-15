"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

type Kind = "first_product" | "share_store" | "both";

export function AdminActivationNudgeButtons() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function run(kind: Kind, dryRun: boolean) {
    setMessage(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/activation/nudge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind, dryRun }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setMessage(data.message ?? "Request failed");
          return;
        }
        const s = data.summary;
        setMessage(
          `${dryRun ? "Dry-run" : "Sent"} — first product: ${s.firstProduct.sent}/${s.firstProduct.considered} (skip ${s.firstProduct.skipped}), share: ${s.shareStore.sent}/${s.shareStore.considered} (skip ${s.shareStore.skipped})`,
        );
      } catch {
        setMessage("Network error");
      }
    });
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => run("first_product", false)}
      >
        Nudge empties
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => run("share_store", false)}
      >
        Nudge share
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={() => run("both", true)}
      >
        Dry-run both
      </Button>
      {message ? (
        <p className="text-[11px] text-neutral-500 sm:ml-1">{message}</p>
      ) : null}
    </div>
  );
}
