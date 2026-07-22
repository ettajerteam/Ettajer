"use client";

import { useEffect, useState } from "react";

export interface AuthProvidersState {
  google: boolean;
  email: boolean;
}

/**
 * Prefer live `/api/auth/providers` so Google shows even when the page
 * was prerendered before env vars were set on Vercel.
 */
export function useAuthProviders(initial: Partial<AuthProvidersState> = {}) {
  const [providers, setProviders] = useState<AuthProvidersState>({
    google: !!initial.google,
    email: !!initial.email,
  });

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/providers")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data || typeof data !== "object") return;
        setProviders({
          google: !!data.google,
          email: !!data.email,
        });
      })
      .catch(() => {
        // Keep server-provided initial values
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return providers;
}
