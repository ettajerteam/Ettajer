"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { AcademyLesson, AcademySubject } from "@/lib/academy/subjects";
import type { SubjectProgress } from "@/lib/academy/progress-shared";
import {
  getAllLessons,
  lessonHref,
  subjectHref,
} from "@/lib/academy/subjects";
import { usePrefersReducedMotion } from "@/components/academy/use-prefers-reduced-motion";

export function AcademyLessonClient({
  subject,
  moduleLabel,
  moduleIndex,
  lesson,
  lessonIndexInSubject,
  prev,
  next,
  initialProgress,
}: {
  subject: AcademySubject;
  moduleLabel: string;
  moduleIndex: number;
  lesson: AcademyLesson;
  lessonIndexInSubject: number;
  prev: AcademyLesson | null;
  next: AcademyLesson | null;
  initialProgress: SubjectProgress;
}) {
  const router = useRouter();
  const reduced = usePrefersReducedMotion();
  const [progress, setProgress] = useState(initialProgress);
  const [pending, startTransition] = useTransition();
  const [justCompleted, setJustCompleted] = useState(false);
  const isDone = progress.completedLessons.includes(lesson.slug);
  const allLessons = getAllLessons(subject);
  const completed = new Set(progress.completedLessons);

  const tryIt = lesson.resources?.find((r) =>
    r.href.startsWith("/dashboard"),
  );

  useEffect(() => {
    void fetch("/api/dashboard/academy/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "touch",
        subjectSlug: subject.slug,
        lessonSlug: lesson.slug,
      }),
    }).catch(() => {});
  }, [subject.slug, lesson.slug]);

  function markComplete() {
    startTransition(async () => {
      const res = await fetch("/api/dashboard/academy/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete",
          subjectSlug: subject.slug,
          lessonSlug: lesson.slug,
        }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { progress: SubjectProgress };
      setProgress(data.progress);
      setJustCompleted(true);
      router.refresh();
      if (next) {
        window.setTimeout(() => {
          router.push(lessonHref(subject.slug, next.slug));
        }, reduced ? 200 : 700);
      }
    });
  }

  return (
    <div className="mx-auto flex max-w-5xl gap-10 px-4 pb-28 pt-8 sm:px-6 lg:pt-10">
      <aside className="hidden w-52 shrink-0 lg:block xl:w-56">
        <Link
          href={subjectHref(subject.slug)}
          className="text-[12px] font-medium text-neutral-400 hover:text-neutral-700"
        >
          {subject.title}
        </Link>
        <p className="mt-1 text-[12px] text-neutral-500">
          Lesson {lessonIndexInSubject + 1} of {allLessons.length}
        </p>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-neutral-200/80">
          <div
            className="h-full rounded-full bg-neutral-900 transition-[width] duration-500 motion-reduce:transition-none"
            style={{ width: `${progress.percent}%` }}
          />
        </div>

        <nav className="mt-6 max-h-[65vh] space-y-4 overflow-y-auto pr-1">
          {subject.modules.map((mod, mi) => (
            <div key={mod.slug}>
              <p
                className={cn(
                  "text-[11px] font-medium",
                  mi === moduleIndex ? "text-neutral-700" : "text-neutral-400",
                )}
              >
                {String(mi + 1).padStart(2, "0")} · {mod.label}
              </p>
              <ul className="mt-1.5 space-y-0.5">
                {mod.lessons.map((l) => {
                  const active = l.slug === lesson.slug;
                  const done = completed.has(l.slug);
                  return (
                    <li key={l.slug}>
                      <Link
                        href={lessonHref(subject.slug, l.slug)}
                        className={cn(
                          "flex items-center gap-1.5 truncate rounded-md px-2 py-1.5 text-[12px] transition-colors",
                          active &&
                            "bg-white font-medium text-neutral-900 shadow-sm ring-1 ring-black/[0.04]",
                          !active &&
                            done &&
                            "text-neutral-400 hover:text-neutral-600",
                          !active &&
                            !done &&
                            "text-neutral-500 hover:bg-black/[0.03] hover:text-neutral-800",
                        )}
                      >
                        {done ? (
                          <Check
                            className="h-3 w-3 shrink-0 text-[#007AFF]"
                            strokeWidth={2.5}
                          />
                        ) : null}
                        <span className="truncate">{l.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <article className="min-w-0 flex-1">
        <div className="mx-auto max-w-xl">
          <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-neutral-400">
            <Link href="/dashboard/academy" className="hover:text-neutral-700">
              Academy
            </Link>
            <span>/</span>
            <Link
              href={subjectHref(subject.slug)}
              className="hover:text-neutral-700"
            >
              {subject.title}
            </Link>
            <span>/</span>
            <span className="text-neutral-600">{moduleLabel}</span>
          </nav>

          <header className="mt-5 space-y-2">
            <h1 className="text-[28px] font-semibold tracking-tight text-neutral-900 sm:text-[34px]">
              {lesson.title}
            </h1>
            <p className="text-[14px] leading-relaxed text-neutral-500">
              {lesson.summary}
            </p>
            <p className="text-[12px] text-neutral-400">
              {lesson.durationMin} min · {subject.kicker}
            </p>
          </header>

          <div className="mt-8 overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
            <div className="flex aspect-[16/9] flex-col items-center justify-center gap-3 px-6 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                <Play className="h-5 w-5 fill-current" />
              </span>
              <div>
                <p className="text-[13px] font-medium text-neutral-700">
                  Video coming soon
                </p>
                <p className="mt-1 text-[12px] text-neutral-400">
                  Lesson text is ready below · {lesson.durationMin} min
                </p>
              </div>
            </div>
          </div>

          <div className="mt-9 space-y-4 text-[15px] leading-[1.75] text-neutral-700">
            {lesson.body.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {tryIt ? (
            <div className="mt-8 rounded-2xl border border-black/[0.06] bg-white p-5">
              <p className="text-[12px] font-medium text-neutral-400">
                Learn by doing
              </p>
              <p className="mt-1 text-[14px] font-semibold text-neutral-900">
                Apply this lesson in your store
              </p>
              <Link
                href={tryIt.href}
                className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-[#007AFF]"
              >
                {tryIt.label} →
              </Link>
            </div>
          ) : null}

          {lesson.resources && lesson.resources.length > 0 && (
            <div className="mt-10 border-t border-black/[0.06] pt-8">
              <h2 className="text-[13px] font-semibold text-neutral-900">
                Resources
              </h2>
              <ul className="mt-3 space-y-2">
                {lesson.resources.map((r) => (
                  <li key={r.href + r.label}>
                    <Link
                      href={r.href}
                      className="text-[14px] font-medium text-[#007AFF] hover:underline"
                    >
                      {r.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-12 flex flex-col gap-4 border-t border-black/[0.06] pt-8 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              disabled={pending || isDone}
              onClick={markComplete}
              className={cn(
                "relative inline-flex h-11 items-center justify-center gap-1.5 rounded-full px-5 text-[13px] font-medium transition-colors",
                isDone
                  ? "bg-[#007AFF]/10 text-[#007AFF]"
                  : "bg-neutral-900 text-white hover:bg-neutral-800",
              )}
            >
              <AnimatePresence>
                {(isDone || justCompleted) && (
                  <motion.span
                    initial={reduced ? false : { scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 420, damping: 22 }}
                  >
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  </motion.span>
                )}
              </AnimatePresence>
              {isDone ? "Completed" : "Mark as complete"}
            </button>

            <div className="flex items-center gap-2">
              {prev ? (
                <Link
                  href={lessonHref(subject.slug, prev.slug)}
                  className="inline-flex h-11 items-center gap-1 rounded-full border border-black/[0.08] bg-white px-4 text-[13px] font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Link>
              ) : null}
              {next ? (
                <Link
                  href={lessonHref(subject.slug, next.slug)}
                  className="inline-flex h-11 items-center gap-1 rounded-full bg-neutral-900 px-4 text-[13px] font-medium text-white hover:bg-neutral-800"
                >
                  Next lesson
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  href={subjectHref(subject.slug)}
                  className="inline-flex h-11 items-center gap-1 rounded-full bg-neutral-900 px-4 text-[13px] font-medium text-white hover:bg-neutral-800"
                >
                  Back to school
                </Link>
              )}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
