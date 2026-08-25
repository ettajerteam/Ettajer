"use client";

import { useEffect, useState } from "react";

export interface AuthProvidersState {
  google: boolean;
  email: boolean;
  /** Email + password (Credentials provider) — always on in Ettajer. */
  credentials: boolean;
}

/**
 * Prefer live `/api/auth/providers` so Google shows even when the page
 * was prerendered before env vars were set on Vercel.
 *
 * NextAuth returns keys like `{ google, email, credentials }` — not
 * `{ google: true }`. Treat presence of those keys as configured.
 */
export function useAuthProviders(initial: Partial<AuthProvidersState> = {}) {
  const [providers, setProviders] = useState<AuthProvidersState>({
    google: !!initial.google,
    email: !!initial.email,
    // Credentials are registered in lib/auth.ts even without Google/Resend.
    credentials: initial.credentials !== false,
  });

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/providers")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data || typeof data !== "object") return;
        setProviders({
          google: Boolean(data.google),
          email: Boolean(data.email),
          credentials: Boolean(data.credentials) || initial.credentials !== false,
        });
      })
      .catch(() => {
        // Keep server-provided initial values
      });

    return () => {
      cancelled = true;
    };
  }, [initial.credentials]);

  return providers;
}
