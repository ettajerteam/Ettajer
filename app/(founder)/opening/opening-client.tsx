"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Bridge after founder claim / activation so the JWT picks up status=active
 * before middleware evaluates /dashboard or /onboarding.
 */
export default function OpeningClient() {
  const { update, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    let cancelled = false;

    async function refreshAndGo() {
      const next = searchParams.get("next") || "/onboarding";
      const safeNext =
        next.startsWith("/") && !next.startsWith("//") ? next : "/onboarding";

      try {
        if (status === "authenticated") {
          await update();
        }
        if (cancelled) return;
        window.location.assign(safeNext);
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
  }, [status, update, router, searchParams]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
      <p className="text-sm text-neutral-600">
        {error ?? "Opening your founder dashboard…"}
      </p>
    </div>
  );
}
