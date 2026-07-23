"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Bridge after founder claim / activation / post-launch exit from early-access
 * so the JWT picks up the latest status before entering the dashboard.
 * Runs exactly once to avoid assign/refresh loops.
 */
export default function OpeningClient() {
  const { update, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (status === "loading") return;
    if (started.current) return;
    started.current = true;

    let cancelled = false;

    async function refreshAndGo() {
      const nextParam = searchParams.get("next") || "/dashboard";
      const safeNext =
        nextParam.startsWith("/") && !nextParam.startsWith("//")
          ? nextParam
          : "/dashboard";

      try {
        if (status === "authenticated") {
          await update();
        }
        if (cancelled) return;

        // Resolve final destination from the server so waiters without a store
        // land on onboarding instead of bouncing dashboard ↔ onboarding.
        try {
          const res = await fetch("/api/auth/redirect-target");
          if (res.ok) {
            const data = (await res.json()) as { redirect?: string };
            const target = data.redirect;
            if (
              target &&
              target.startsWith("/") &&
              !target.startsWith("//") &&
              target !== "/opening"
            ) {
              window.location.replace(target);
              return;
            }
          }
        } catch {
          // Fall through to safeNext
        }

        if (safeNext === "/opening") {
          window.location.replace("/dashboard");
          return;
        }

        window.location.replace(safeNext);
      } catch {
        if (cancelled) return;
        setError("Could not refresh your session. Try signing in again.");
        router.replace("/login");
      }
    }

    void refreshAndGo();
    return () => {
      cancelled = true;
    };
    // Intentionally omit `update` — its identity can change and re-trigger loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router, searchParams]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
      <p className="text-sm text-neutral-600">
        {error ?? "Opening your dashboard…"}
      </p>
    </div>
  );
}
