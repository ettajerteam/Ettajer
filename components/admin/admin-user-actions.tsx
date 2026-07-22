"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { USER_STATUS } from "@/lib/founder/constants";
import { USER_ROLE } from "@/lib/admin/constants";

interface AdminUserActionsProps {
  userId: string;
  status: string;
  role: string;
}

export function AdminUserActions({ userId, status, role }: AdminUserActionsProps) {
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
    <div className="flex flex-wrap items-center gap-2">
      {status === USER_STATUS.WAITING ? (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => patchUser({ status: USER_STATUS.ACTIVE })}
        >
          Activate
        </Button>
      ) : (
        <Button
          size="sm"
          variant="outline"
          disabled={pending || role === USER_ROLE.ADMIN}
          onClick={() => patchUser({ status: USER_STATUS.WAITING })}
        >
          Set waiting
        </Button>
      )}
      {role !== USER_ROLE.ADMIN ? (
        <Badge variant="secondary" className="text-[10px]">
          merchant
        </Badge>
      ) : (
        <Badge className="bg-violet-600 text-[10px]">admin</Badge>
      )}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </div>
  );
}
