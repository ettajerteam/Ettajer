"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { USER_STATUS } from "@/lib/founder/constants";
import { USER_ROLE } from "@/lib/admin/constants";
import { cn } from "@/lib/utils";

interface AdminUserActionsProps {
  userId: string;
  status: string;
  role: string;
}

export function AdminUserActions({
  userId,
  status,
  role,
}: AdminUserActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function patchUser(data: Record<string, string>) {
    setError(null);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message ?? "Update failed");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <div className="flex flex-wrap items-center gap-1.5">
        {status === USER_STATUS.WAITING ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => patchUser({ status: USER_STATUS.ACTIVE })}
            className="h-7 rounded-md bg-[#007AFF] px-2.5 text-[11px] font-medium text-white transition hover:bg-[#0066D6] disabled:opacity-50"
          >
            Activate
          </button>
        ) : (
          <button
            type="button"
            disabled={pending || role === USER_ROLE.ADMIN}
            onClick={() => patchUser({ status: USER_STATUS.WAITING })}
            className="h-7 rounded-md border border-black/[0.06] bg-white px-2.5 text-[11px] font-medium text-neutral-600 transition hover:bg-black/[0.03] disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300"
          >
            Set waiting
          </button>
        )}
        <span
          className={cn(
            "inline-flex h-7 items-center rounded-md px-2 text-[10px] font-semibold uppercase tracking-wide",
            role === USER_ROLE.ADMIN
              ? "bg-[#007AFF]/10 text-[#007AFF]"
              : "bg-black/[0.04] text-neutral-500 dark:bg-white/10 dark:text-neutral-300"
          )}
        >
          {role === USER_ROLE.ADMIN ? "admin" : "merchant"}
        </span>
      </div>
      {error ? <span className="text-[10px] text-rose-600">{error}</span> : null}
    </div>
  );
}
