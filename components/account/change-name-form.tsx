"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

type PreviewState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      email: string;
      currentName: string | null;
      founderNumber: number | null;
    }
  | { status: "success"; name: string; previousName: string | null };

export function ChangeNameForm() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") ?? "";
  const tokenParam = searchParams.get("token") ?? "";

  const [preview, setPreview] = useState<PreviewState>({ status: "loading" });
  const [newName, setNewName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!emailParam || !tokenParam) {
        setPreview({
          status: "error",
          message: "This link is incomplete. Please use the link from your email.",
        });
        return;
      }

      try {
        const res = await fetch(
          `/api/account/change-name?email=${encodeURIComponent(emailParam)}&token=${encodeURIComponent(tokenParam)}`
        );
        const data = await res.json();
        if (!res.ok) {
          if (!cancelled) {
            setPreview({
              status: "error",
              message: data.message ?? "This link is invalid or has expired.",
            });
          }
          return;
        }
        if (!cancelled) {
          setPreview({
            status: "ready",
            email: data.email,
            currentName: data.currentName,
            founderNumber: data.founderNumber,
          });
          if (typeof data.currentName === "string" && data.currentName.trim()) {
            setNewName(data.currentName.trim());
          }
        }
      } catch {
        if (!cancelled) {
          setPreview({
            status: "error",
            message: "Could not open this page. Please try again.",
          });
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [emailParam, tokenParam]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (preview.status !== "ready") return;
    setFormError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/account/change-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailParam,
          token: tokenParam,
          newName,
          locale: "ar",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.message ?? "Could not update your name.");
        return;
      }
      setPreview({
        status: "success",
        name: data.name,
        previousName: data.previousName,
      });
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (preview.status === "loading") {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-[1.25rem] border border-white/80 bg-white/80 p-10 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.08)] backdrop-blur-xl">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (preview.status === "error") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[1.25rem] border border-white/80 bg-white/80 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.08)] backdrop-blur-xl"
      >
        <div className="px-7 py-10 text-center sm:px-9">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
            <AlertCircle className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
            Link unavailable
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-neutral-500">
            {preview.message}
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-neutral-900 px-6 text-[13px] font-semibold text-white"
          >
            Contact support
          </Link>
        </div>
      </motion.div>
    );
  }

  if (preview.status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[1.25rem] border border-white/80 bg-white/80 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.08)] backdrop-blur-xl"
      >
        <div className="px-7 py-10 text-center sm:px-9">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
            Name updated
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-neutral-500">
            Your account name is now{" "}
            <span className="font-medium text-neutral-800">{preview.name}</span>.
            {preview.previousName ? (
              <>
                {" "}
                It was previously{" "}
                <span className="text-neutral-600">{preview.previousName}</span>.
              </>
            ) : null}
          </p>
          <p className="mx-auto mt-3 max-w-sm text-sm text-neutral-400">
            Your founder card and profile will use this name going forward. A
            confirmation email is on its way.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 text-[13px] font-semibold text-white"
          >
            Sign in
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>
    );
  }

  const currentLabel = preview.currentName?.trim() || "Not set";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-[1.25rem] border border-white/80 bg-white/80 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.08)] backdrop-blur-xl"
    >
      <div className="border-b border-neutral-100/80 px-7 pb-6 pt-8 text-center sm:px-9 sm:pt-9">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 text-white">
          <UserRound className="h-5 w-5" />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
          Official name update
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
          Confirm your legal name
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-neutral-500">
          Support reviewed your request. Enter the name that matches your
          official documents — it will appear on your account and founder card.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 px-7 py-7 sm:px-9 sm:py-8">
        <div className="rounded-2xl bg-[#F2F2F7] px-4 py-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
            Current name
          </p>
          <p className="mt-1 text-[15px] font-medium text-neutral-800">{currentLabel}</p>
          <p className="mt-1 truncate text-[12px] text-neutral-400">{preview.email}</p>
          {preview.founderNumber ? (
            <p className="mt-2 text-[12px] font-medium text-neutral-500">
              Founder #{String(preview.founderNumber).padStart(4, "0")}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="newName"
            className="mb-1.5 block text-[13px] font-medium text-neutral-700"
          >
            Correct name
          </label>
          <input
            id="newName"
            name="newName"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Salwa Aboudrar"
            autoComplete="name"
            required
            minLength={2}
            maxLength={80}
            className={cn(
              "w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[15px] text-neutral-900 outline-none transition",
              "placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
            )}
          />
          <p className="mt-1.5 text-[12px] text-neutral-400">
            Letters and spaces only. This should match your ID documents.
          </p>
        </div>

        {formError ? (
          <div className="flex items-start gap-2 rounded-xl bg-red-50 px-3.5 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{formError}</span>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting || newName.trim().length < 2}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-neutral-900 text-[13px] font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              Save official name
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <p className="text-center text-[12px] leading-relaxed text-neutral-400">
          This secure link expires in 7 days and can be used once. Need help?{" "}
          <Link href="/contact" className="font-medium text-neutral-700 underline-offset-2 hover:underline">
            Contact support
          </Link>
        </p>
      </form>
    </motion.div>
  );
}
