"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface Submission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  createdAt: string;
}

export function ContactMessagesClient({ initial }: { initial: Submission[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(initial[0]?.id ?? null);
  const selected = initial.find((s) => s.id === selectedId) ?? null;

  if (initial.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-white px-6 py-16 text-center">
        <MessageSquare className="mb-3 h-8 w-8 text-neutral-300" />
        <p className="text-sm font-medium text-neutral-900">No messages yet</p>
        <p className="mt-1 max-w-sm text-sm text-neutral-500">
          When shoppers submit your Contact form block, messages show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_1fr]">
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <div className="border-b border-neutral-100 px-4 py-3 text-sm text-neutral-600">
          <span className="font-semibold text-neutral-900">{initial.length}</span>{" "}
          {initial.length === 1 ? "message" : "messages"}
        </div>
        <ul className="max-h-[28rem] overflow-y-auto">
          {initial.map((row) => (
            <li key={row.id}>
              <button
                type="button"
                onClick={() => setSelectedId(row.id)}
                className={cn(
                  "w-full border-b border-neutral-50 px-4 py-3 text-left transition last:border-0 hover:bg-neutral-50",
                  selectedId === row.id && "bg-neutral-50"
                )}
              >
                <p className="truncate text-sm font-medium text-neutral-900">{row.name}</p>
                <p className="truncate text-xs text-neutral-500">{row.email}</p>
                <p className="mt-1 line-clamp-1 text-xs text-neutral-400">{row.message}</p>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        {selected ? (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">{selected.name}</h2>
              <p className="text-sm text-neutral-500">
                <a href={`mailto:${selected.email}`} className="hover:text-neutral-800">
                  {selected.email}
                </a>
                {selected.phone ? ` · ${selected.phone}` : ""}
              </p>
              <p className="mt-1 text-xs text-neutral-400">
                {new Date(selected.createdAt).toLocaleString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
              {selected.message}
            </p>
          </div>
        ) : (
          <p className="text-sm text-neutral-500">Select a message</p>
        )}
      </div>
    </div>
  );
}
