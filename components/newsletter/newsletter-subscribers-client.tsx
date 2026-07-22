"use client";

import { Mail } from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  source: string | null;
  status: string;
  createdAt: string;
}

export function NewsletterSubscribersClient({ initial }: { initial: Subscriber[] }) {
  if (initial.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-white px-6 py-16 text-center">
        <Mail className="mb-3 h-8 w-8 text-neutral-300" />
        <p className="text-sm font-medium text-neutral-900">No subscribers yet</p>
        <p className="mt-1 max-w-sm text-sm text-neutral-500">
          When shoppers join from your storefront newsletter sections, their emails appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
      <div className="border-b border-neutral-100 px-4 py-3">
        <p className="text-sm text-neutral-600">
          <span className="font-semibold text-neutral-900">{initial.length}</span>{" "}
          {initial.length === 1 ? "subscriber" : "subscribers"}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50/80 text-xs uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {initial.map((row) => (
              <tr key={row.id} className="border-b border-neutral-50 last:border-0">
                <td className="px-4 py-3 font-medium text-neutral-900">{row.email}</td>
                <td className="px-4 py-3 capitalize text-neutral-600">
                  {row.source?.replace(/-/g, " ") || "—"}
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {new Date(row.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
