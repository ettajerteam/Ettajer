"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { GoogleIcon } from "@/components/auth/google-auth-button";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  label?: string;
  callbackUrl?: string;
  /** Light text on dark hero */
  tone?: "light" | "dark";
};

/**
 * Branded “Continue with Google” — same OAuth redirect flow as login/signup.
 */
export function ContinueWithGoogleButton({
  className,
  label = "Continue with Google",
  callbackUrl = "/dashboard",
  tone = "dark",
}: Props) {
  const { status } = useSession();
  const [loading, setLoading] = useState(false);

  if (status === "authenticated" || status === "loading") return null;

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => {
        setLoading(true);
        void signIn("google", { callbackUrl }).catch(() => setLoading(false));
      }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-60",
        tone === "light"
          ? "border border-white/25 bg-white/10 text-white hover:bg-white/20"
          : "border border-neutral-200 bg-white text-neutral-800 shadow-sm hover:border-neutral-300 hover:bg-neutral-50",
        className,
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <GoogleIcon />
      )}
      <span className="hidden sm:inline">{loading ? "Connecting…" : label}</span>
      <span className="sm:hidden">{loading ? "…" : "Google"}</span>
    </button>
  );
}
