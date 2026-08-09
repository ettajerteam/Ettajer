"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ActivityItem = {
  id: string;
  action: string;
  resource: string | null;
  resourceId: string | null;
  actorType: string;
  applicationName: string | null;
  createdAt: string;
};

export default function DeveloperActivityPage() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/dashboard/developer/activity");
        const data = (await res.json()) as { activity?: ActivityItem[] };
        setItems(data.activity ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Developer Activity</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Recent actions from connected AI apps.{" "}
          <Link href="/dashboard/developer" className="text-[#007AFF]">
            Manage apps
          </Link>
        </p>
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No activity yet.</p>
      ) : (
        <ul className="divide-y rounded-2xl border bg-white">
          {items.map((item) => (
            <li key={item.id} className="px-5 py-4">
              <p className="text-sm font-medium text-neutral-900">
                {item.applicationName || item.actorType} · {item.action}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.resource}
                {item.resourceId ? ` ${item.resourceId}` : ""} ·{" "}
                {new Date(item.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
