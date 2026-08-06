"use client";

import { useEffect, useRef } from "react";
import { signIn, useSession } from "next-auth/react";

const GSI_SCRIPT = "https://accounts.google.com/gsi/client";
const DISMISS_KEY = "ettajer_gsi_dismissed_until";
const DISMISS_MS = 1000 * 60 * 60 * 12; // 12h after cancel/dismiss

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          prompt: (
            notification?: (n: {
              isNotDisplayed: () => boolean;
              isSkippedMoment: () => boolean;
              isDismissedMoment: () => boolean;
              getDismissedReason: () => string;
              getNotDisplayedReason: () => string;
            }) => void,
          ) => void;
          cancel: () => void;
        };
      };
    };
  }
}

function loadGsiScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.accounts?.id) return Promise.resolve();

  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${GSI_SCRIPT}"]`,
  );
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Google Identity Services")),
      );
      if (window.google?.accounts?.id) resolve();
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GSI_SCRIPT;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });
}

function isDismissedRecently() {
  try {
    const until = Number(localStorage.getItem(DISMISS_KEY) || "0");
    return until > Date.now();
  } catch {
    return false;
  }
}

function markDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_MS));
  } catch {
    /* ignore */
  }
}

type GoogleOneTapProps = {
  clientId: string;
  /** Prefer auto sign-in for returning Google users (continuity). */
  autoSelect?: boolean;
  context?: "signin" | "signup" | "use";
};

/**
 * Google One Tap / FedCM prompt — same “Continue as …” experience
 * used by major sites when you open them while signed into Google.
 */
export function GoogleOneTap({
  clientId,
  autoSelect = true,
  context = "signin",
}: GoogleOneTapProps) {
  const { status } = useSession();
  const started = useRef(false);

  useEffect(() => {
    if (!clientId || status !== "unauthenticated") return;
    if (started.current || isDismissedRecently()) return;
    started.current = true;

    let cancelled = false;

    const run = async () => {
      try {
        await loadGsiScript();
        if (cancelled || !window.google?.accounts?.id) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          auto_select: autoSelect,
          cancel_on_tap_outside: true,
          context,
          itp_support: true,
          use_fedcm_for_prompt: true,
          callback: async (response: { credential?: string }) => {
            const credential = response?.credential;
            if (!credential) return;

            const result = await signIn("google-one-tap", {
              credential,
              redirect: false,
              callbackUrl: "/dashboard",
            });

            if (result?.ok) {
              try {
                const targetRes = await fetch("/api/auth/redirect-target");
                const targetData = (await targetRes.json()) as {
                  redirect?: string;
                };
                window.location.assign(targetData.redirect ?? "/dashboard");
              } catch {
                window.location.assign("/dashboard");
              }
            }
          },
        });

        window.google.accounts.id.prompt((notification) => {
          if (
            notification.isNotDisplayed() ||
            notification.isSkippedMoment() ||
            notification.isDismissedMoment()
          ) {
            const reason =
              notification.getDismissedReason?.() ||
              notification.getNotDisplayedReason?.() ||
              "";
            if (
              reason === "credential_returned" ||
              reason === "suppress_by_user" ||
              reason === "tap_outside" ||
              reason === "user_cancel"
            ) {
              markDismissed();
            }
          }
        });
      } catch (err) {
        console.warn("Google One Tap unavailable:", err);
      }
    };

    void run();

    return () => {
      cancelled = true;
      try {
        window.google?.accounts?.id?.cancel();
      } catch {
        /* ignore */
      }
    };
  }, [clientId, autoSelect, context, status]);

  return null;
}

/** Server-friendly host: only renders One Tap when Google OAuth is configured. */
export function GoogleOneTapHost({
  clientId,
  autoSelect = true,
  context = "signin",
}: {
  clientId?: string | null;
  autoSelect?: boolean;
  context?: "signin" | "signup" | "use";
}) {
  const id = clientId?.trim();
  if (!id) return null;
  return (
    <GoogleOneTap clientId={id} autoSelect={autoSelect} context={context} />
  );
}
