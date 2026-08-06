"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PrefsPayload {
  email: string;
  status: string;
  statusLabel: string;
  store: {
    name: string;
    slug: string;
    address: string | null;
    contactEmail: string | null;
  };
}

export default function EmailPreferencesClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("t")?.trim() || "";
  const unsubscribedFlag = searchParams.get("unsubscribed") === "1";
  const errorParam = searchParams.get("error");

  const [data, setData] = useState<PrefsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(
    unsubscribedFlag ? "You have been unsubscribed." : errorParam
  );
  const [error, setError] = useState<string | null>(
    !token ? "Missing preferences link." : null
  );

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/email/preferences?t=${encodeURIComponent(token)}`
        );
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(
            typeof json.message === "string"
              ? json.message
              : "Invalid preferences link"
          );
        }
        if (!cancelled) setData(json as PrefsPayload);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function runAction(action: "unsubscribe" | "subscribe") {
    if (!token) return;
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/email/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ t: token, action }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof json.message === "string" ? json.message : "Update failed"
        );
      }
      setMessage(typeof json.message === "string" ? json.message : "Updated");
      const refresh = await fetch(
        `/api/email/preferences?t=${encodeURIComponent(token)}`
      );
      const refreshed = await refresh.json().catch(() => null);
      if (refresh.ok && refreshed) setData(refreshed as PrefsPayload);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  const isActive = data?.status === "active";

  return (
    <div className="min-h-screen bg-[#F5F5F7] px-4 py-16 text-neutral-900">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-black/[0.06] bg-white p-6 shadow-sm">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-400">
          Email preferences
        </p>
        {loading ? (
          <p className="mt-4 text-[14px] text-neutral-500">Loading…</p>
        ) : error && !data ? (
          <p className="mt-4 text-[14px] text-red-600">{error}</p>
        ) : data ? (
          <>
            <h1 className="mt-2 text-[22px] font-semibold tracking-[-0.03em]">
              {data.store.name}
            </h1>
            <p className="mt-1 text-[13px] text-neutral-500">
              Managing marketing emails for{" "}
              <span className="font-medium text-neutral-800">{data.email}</span>
            </p>

            <div className="mt-5 rounded-xl bg-[#F5F5F7] px-3.5 py-3">
              <p className="text-[11px] text-neutral-400">Status</p>
              <p className="mt-0.5 text-[14px] font-medium">{data.statusLabel}</p>
            </div>

            {(data.store.address || data.store.contactEmail) && (
              <div className="mt-4 space-y-1 text-[12px] text-neutral-500">
                {data.store.address ? <p>{data.store.address}</p> : null}
                {data.store.contactEmail ? (
                  <p>
                    <a
                      className="text-[#007AFF] hover:underline"
                      href={`mailto:${data.store.contactEmail}`}
                    >
                      {data.store.contactEmail}
                    </a>
                  </p>
                ) : null}
              </div>
            )}

            {message ? (
              <p className="mt-4 text-[13px] text-emerald-700">{message}</p>
            ) : null}
            {error && data ? (
              <p className="mt-2 text-[13px] text-red-600">{error}</p>
            ) : null}

            <div className="mt-6 flex flex-col gap-2">
              {isActive ? (
                <Button
                  type="button"
                  className="h-10 rounded-lg bg-neutral-900 text-[13px] text-white shadow-none [background-image:none] hover:bg-neutral-800"
                  loading={busy}
                  onClick={() => void runAction("unsubscribe")}
                >
                  Unsubscribe from marketing emails
                </Button>
              ) : (
                <Button
                  type="button"
                  className={cn(
                    "h-10 rounded-lg bg-[#007AFF] text-[13px] text-white shadow-none [background-image:none] hover:bg-[#0071EB]"
                  )}
                  loading={busy}
                  onClick={() => void runAction("subscribe")}
                >
                  Opt in to marketing emails
                </Button>
              )}
              <p className="text-center text-[11px] text-neutral-400">
                You can change this anytime from links in our emails.
              </p>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
