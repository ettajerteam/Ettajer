"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AcademySubject } from "@/lib/academy/subjects";
import {
  getModuleState,
  type SubjectProgress,
} from "@/lib/academy/progress-shared";
import { countSubjectLessons, lessonHref } from "@/lib/academy/subjects";
import {
  AcademyReveal,
  AcademyStagger,
  AcademyStaggerItem,
} from "@/components/academy/academy-motion";

export function AcademySubjectClient({
  subject,
  progress,
}: {
  subject: AcademySubject;
  progress: SubjectProgress;
}) {
  const startSlug =
    progress.currentLessonSlug ?? subject.modules[0]?.lessons[0]?.slug ?? null;
  const started =
    progress.completedCount > 0 || progress.lastLessonSlug != null;
  const completed = new Set(progress.completedLessons);
  const totalMin = subject.modules
    .flatMap((m) => m.lessons)
    .reduce((sum, l) => sum + l.durationMin, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-12 sm:px-6 lg:pt-16">
      <AcademyReveal>
        <header className="max-w-xl">
          <p
            className="text-[12px] font-medium"
            style={{ color: subject.accent }}
          >
            {subject.kicker}
          </p>
          <h1 className="mt-3 whitespace-pre-line text-[34px] font-semibold leading-[1.08] tracking-tight text-neutral-900 sm:text-[42px]">
            {subject.headline}
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-neutral-500">
            {subject.subheadline}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-neutral-400">
            <span>{subject.modules.length} chapters</span>
            <span aria-hidden>·</span>
            <span>{countSubjectLessons(subject)} lessons</span>
            <span aria-hidden>·</span>
            <span>~{totalMin} min</span>
            {progress.percent > 0 && (
              <>
                <span aria-hidden>·</span>
                <span className="tabular-nums">{progress.percent}% complete</span>
              </>
            )}
          </div>

          {progress.percent > 0 && (
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-neutral-200/80">
              <div
                className="h-full rounded-full bg-neutral-900 transition-[width] duration-500 motion-reduce:transition-none"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          )}

          {startSlug && (
            <div className="mt-8">
              <Link
                href={lessonHref(subject.slug, startSlug)}
                className="inline-flex h-11 items-center justify-center rounded-full bg-neutral-900 px-7 text-[13px] font-medium text-white transition-colors hover:bg-neutral-800"
              >
                {started ? "Continue learning" : "Start learning"}
              </Link>
            </div>
          )}
        </header>
      </AcademyReveal>

      <section className="mt-16 sm:mt-20">
        <AcademyReveal>
          <h2 className="text-[13px] font-semibold text-neutral-900">
            Curriculum
          </h2>
        </AcademyReveal>

        <AcademyStagger className="mt-8">
          <ol>
            {subject.modules.map((mod, mi) => {
              const state = getModuleState(subject, mi, progress);
              const num = String(mi + 1).padStart(2, "0");
              const isLast = mi === subject.modules.length - 1;

              return (
                <AcademyStaggerItem key={mod.slug}>
                  <li className="flex gap-5 sm:gap-6">
                    <div className="flex w-10 shrink-0 flex-col items-center sm:w-12">
                      <span
                        className={cn(
                          "text-[20px] font-semibold tabular-nums tracking-tight sm:text-[22px]",
                          state === "completed" && "text-[#007AFF]",
                          state === "current" && "text-neutral-900",
                          state === "available" && "text-neutral-400",
                        )}
                      >
                        {state === "completed" ? (
                          <Check className="mx-auto h-5 w-5" strokeWidth={2.5} />
                        ) : (
                          num
                        )}
                      </span>
                      {!isLast && (
                        <span
                          className={cn(
                            "mt-2 w-px min-h-[2.5rem] flex-1",
                            state === "completed"
                              ? "bg-[#007AFF]/30"
                              : "bg-neutral-200",
                          )}
                          aria-hidden
                        />
                      )}
                    </div>

                    <div
                      className={cn(
                        "min-w-0 flex-1 border-t border-black/[0.05] pt-1",
                        isLast ? "pb-2" : "pb-10",
                      )}
                    >
                      <p className="text-[11px] font-medium text-neutral-400">
                        {mod.label}
                      </p>
                      <p className="mt-1 text-[18px] font-semibold tracking-tight text-neutral-900">
                        {mod.title}
                      </p>
                      <p className="mt-1 max-w-md text-[13px] leading-relaxed text-neutral-500">
                        {mod.description}
                      </p>

                      <ul className="mt-4 space-y-2">
                        {mod.lessons.map((lesson, li) => {
                          const done = completed.has(lesson.slug);
                          const current =
                            progress.currentLessonSlug === lesson.slug;
                          return (
                            <li key={lesson.slug}>
                              <Link
                                href={lessonHref(subject.slug, lesson.slug)}
                                className={cn(
                                  "group flex items-baseline gap-3 text-[14px] transition-colors",
                                  done && "text-neutral-400",
                                  current &&
                                    !done &&
                                    "font-medium text-[#007AFF]",
                                  !done &&
                                    !current &&
                                    "text-neutral-700 hover:text-[#007AFF]",
                                )}
                              >
                                <span className="w-5 shrink-0 text-[11px] tabular-nums text-neutral-300">
                                  {String(li + 1).padStart(2, "0")}
                                </span>
                                <span
                                  className={cn(
                                    done &&
                                      "line-through decoration-neutral-300",
                                  )}
                                >
                                  {lesson.title}
                                </span>
                                {done ? (
                                  <Check
                                    className="h-3 w-3 text-[#007AFF] opacity-70"
                                    strokeWidth={2.5}
                                  />
                                ) : (
                                  <span className="text-[11px] text-neutral-300 opacity-0 transition-opacity group-hover:opacity-100">
                                    {lesson.durationMin} min
                                  </span>
                                )}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </li>
                </AcademyStaggerItem>
              );
            })}
          </ol>
        </AcademyStagger>
      </section>

      <p className="mt-6">
        <Link
          href="/dashboard/academy"
          className="text-[12px] font-medium text-neutral-400 hover:text-neutral-700"
        >
          ← All schools
        </Link>
      </p>
    </div>
  );
}
