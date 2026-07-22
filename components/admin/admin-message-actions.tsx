"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SUPPORT_MESSAGE_STATUS } from "@/lib/admin/constants";

interface AdminMessageActionsProps {
  messageId: string;
  status: string;
}

export function AdminMessageActions({ messageId, status }: AdminMessageActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function updateStatus(next: string) {
    await fetch(`/api/admin/messages/${messageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex items-center gap-2">
      {status === SUPPORT_MESSAGE_STATUS.NEW ? (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => updateStatus(SUPPORT_MESSAGE_STATUS.READ)}>
          Mark read
        </Button>
      ) : null}
      {status !== SUPPORT_MESSAGE_STATUS.ARCHIVED ? (
        <Button
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() => updateStatus(SUPPORT_MESSAGE_STATUS.ARCHIVED)}
        >
          Archive
        </Button>
      ) : (
        <Badge variant="secondary">archived</Badge>
      )}
    </div>
  );
}
