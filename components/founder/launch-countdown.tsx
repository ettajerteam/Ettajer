"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Loader2, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

export type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  isLive: boolean;
};

export function getCountdownParts(targetIso: string, nowMs = Date.now()): CountdownParts {
  const totalMs = Math.max(0, new Date(targetIso).getTime() - nowMs);
  const totalSec = Math.floor(totalMs / 1000);
  return {
    totalMs,
    isLive: totalMs <= 0,
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
  };
}

function Pad({ value }: { value: number }) {
  return <span className="tabular-nums">{String(value).padStart(2, "0")}</span>;
}

interface LaunchCountdownProps {
  targetIso: string;
  title: string;
  subtitle: string;
  liveTitle: string;
  liveSubtitle: string;
  claimLabel: string;
  claimingLabel: string;
  unitDays: string;
  unitHours: string;
  unitMinutes: string;
  unitSeconds: string;
}

export function LaunchCountdown({
  targetIso,
  title,
  subtitle,
  liveTitle,
  liveSubtitle,
  claimLabel,
  claimingLabel,
  unitDays,
  unitHours,
  unitMinutes,
  unitSeconds,
}: LaunchCountdownProps) {
  const router = useRouter();
  const { update } = useSession();
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const parts = useMemo(() => getCountdownParts(targetIso, now), [targetIso, now]);

  async function claimAccess() {
    setError(null);
    try {
      const res = await fetch("/api/founder/claim-access", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        redirect?: string;
        success?: boolean;
      };
      if (!res.ok) {
        if (data.redirect) {
          startTransition(() => router.push(data.redirect!));
          return;
        }
        setError(data.message ?? "Unable to open your dashboard yet.");
        return;
      }
      const next = data.redirect ?? "/onboarding";
      try {
        await update();
      } catch {
        // Still continue via opening bridge — JWT refresh happens there too.
      }
      window.location.assign(`/opening?next=${encodeURIComponent(next)}`);
    } catch {
      setError("Network error. Please try again.");
    }
  }

  const units = [
    { label: unitDays, value: parts.days },
    { label: unitHours, value: parts.hours },
    { label: unitMinutes, value: parts.minutes },
    { label: unitSeconds, value: parts.seconds },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={cn(
        "relative overflow-hidden rounded-[1.25rem] border p-5 sm:p-7",
        parts.isLive
          ? "border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-teal-50"
          : "border-blue-200/70 bg-gradient-to-br from-[#007AFF]/10 via-white to-indigo-50/80",
      )}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#007AFF]/15 blur-3xl"
        aria-hidden
      />

      <div className="relative">
        <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#007AFF] ring-1 ring-[#007AFF]/15">
          <Rocket className="h-3.5 w-3.5" />
          {parts.isLive ? liveTitle : title}
        </div>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-600">
          {parts.isLive ? liveSubtitle : subtitle}
        </p>

        {!parts.isLive ? (
          <div className="mt-5 grid grid-cols-4 gap-2 sm:gap-3">
            {units.map((unit) => (
              <div
                key={unit.label}
                className="rounded-2xl border border-white/80 bg-white/90 px-2 py-3 text-center shadow-sm"
              >
                <p className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
                  <Pad value={unit.value} />
                </p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-neutral-400">
                  {unit.label}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5">
            <button
              type="button"
              onClick={() => void claimAccess()}
              disabled={pending}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 text-sm font-semibold text-white shadow-lg transition hover:bg-neutral-800 disabled:opacity-60"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
              {pending ? claimingLabel : claimLabel}
            </button>
            {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
          </div>
        )}
      </div>
    </motion.section>
  );
}
