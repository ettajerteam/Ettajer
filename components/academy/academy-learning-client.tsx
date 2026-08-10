"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AcademySubject } from "@/lib/academy/subjects";
import type { SubjectProgress } from "@/lib/academy/progress-shared";
import { lessonHref, subjectHref } from "@/lib/academy/subjects";
import { AcademyReveal } from "@/components/academy/academy-motion";

type ContinueItem = {
  subject: Pick<AcademySubject, "slug" | "title" | "kicker" | "accent">;
  progress: SubjectProgress;
};

type SubjectBar = {
  subject: Pick<AcademySubject, "slug" | "title" | "accent">;
  progress: SubjectProgress;
};

export function AcademyLearningClient({
  continueLearning,
  recentlyViewed,
  completed,
  bySubject,
}: {
  continueLearning: ContinueItem[];
  recentlyViewed: ContinueItem[];
  completed: ContinueItem[];
  bySubject: SubjectBar[];
}) {
  const hasAny =
    continueLearning.length > 0 ||
    recentlyViewed.length > 0 ||
    completed.length > 0 ||
    bySubject.some(
      (b) => b.progress.completedCount > 0 || b.progress.lastLessonSlug,
    );

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-12 sm:px-6 lg:pt-16">
      <AcademyReveal>
        <header>
          <h1 className="text-[28px] font-semibold tracking-tight text-neutral-900 sm:text-[34px]">
            My Learning
          </h1>
          <p className="mt-2 text-[14px] text-neutral-500">
            Continue where you left off. Track progress by school.
          </p>
        </header>
      </AcademyReveal>

      {!hasAny ? (
        <AcademyReveal className="mt-16" delay={0.05}>
          <div className="rounded-2xl border border-black/[0.06] bg-white px-6 py-14 text-center">
            <p className="text-[15px] font-medium text-neutral-900">
              You haven&apos;t started a school yet.
            </p>
            <p className="mt-2 text-[13px] text-neutral-500">
              Choose a school and begin your first lesson.
            </p>
            <Link
              href="/dashboard/academy"
              className="mt-6 inline-flex h-10 items-center rounded-full bg-neutral-900 px-5 text-[13px] font-medium text-white"
            >
              Browse schools
            </Link>
          </div>
        </AcademyReveal>
      ) : (
        <div className="mt-12 space-y-14">
          {continueLearning.length > 0 && (
            <AcademyReveal>
              <section className="space-y-4">
                <h2 className="text-[13px] font-semibold text-neutral-900">
                  Continue learning
                </h2>
                <ul className="space-y-3">
                  {continueLearning.map(({ subject, progress }) => (
                    <ContinueCard
                      key={subject.slug}
                      subject={subject}
                      progress={progress}
                    />
                  ))}
                </ul>
              </section>
            </AcademyReveal>
          )}

          {recentlyViewed.length > 0 && (
            <AcademyReveal>
              <section className="space-y-4">
                <h2 className="text-[13px] font-semibold text-neutral-900">
                  Recently viewed
                </h2>
                <ul className="divide-y divide-black/[0.06] overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
                  {recentlyViewed.map(({ subject, progress }) => (
                    <li key={subject.slug}>
                      <Link
                        href={
                          progress.lastLessonSlug
                            ? lessonHref(subject.slug, progress.lastLessonSlug)
                            : subjectHref(subject.slug)
                        }
                        className="flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-[#FAFAFA]"
                      >
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-neutral-900">
                            {subject.title}
                          </p>
                          <p className="truncate text-[12px] text-neutral-500">
                            {progress.currentLessonTitle ?? "Continue"}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-neutral-300" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </AcademyReveal>
          )}

          {completed.length > 0 && (
            <AcademyReveal>
              <section className="space-y-4">
                <h2 className="text-[13px] font-semibold text-neutral-900">
                  Completed
                </h2>
                <ul className="space-y-2">
                  {completed.map(({ subject }) => (
                    <li key={subject.slug}>
                      <Link
                        href={subjectHref(subject.slug)}
                        className="inline-flex items-center gap-2 text-[14px] font-medium text-neutral-700 hover:text-[#007AFF]"
                      >
                        <Check
                          className="h-3.5 w-3.5 text-[#007AFF]"
                          strokeWidth={2.5}
                        />
                        {subject.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </AcademyReveal>
          )}

          <AcademyReveal>
            <section className="space-y-5">
              <h2 className="text-[13px] font-semibold text-neutral-900">
                Progress by school
              </h2>
              <ul className="space-y-5">
                {bySubject.map(({ subject, progress }) => (
                  <li key={subject.slug}>
                    <Link
                      href={subjectHref(subject.slug)}
                      className="block space-y-2"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="inline-flex items-center gap-2 text-[14px] font-medium text-neutral-900">
                          {subject.title}
                          {progress.percent >= 100 ? (
                            <Check
                              className="h-3.5 w-3.5 text-[#007AFF]"
                              strokeWidth={2.5}
                            />
                          ) : null}
                        </span>
                        <span className="text-[12px] tabular-nums text-neutral-500">
                          {progress.percent}%
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-neutral-200/80">
                        <div
                          className={cn(
                            "h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none",
                          )}
                          style={{
                            width: `${progress.percent}%`,
                            backgroundColor: subject.accent,
                          }}
                        />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </AcademyReveal>
        </div>
      )}
    </div>
  );
}

function ContinueCard({
  subject,
  progress,
}: {
  subject: ContinueItem["subject"];
  progress: SubjectProgress;
}) {
  const href = progress.currentLessonSlug
    ? lessonHref(subject.slug, progress.currentLessonSlug)
    : subjectHref(subject.slug);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-black/[0.06] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-2">
        <p className="text-[12px] font-medium" style={{ color: subject.accent }}>
          {subject.kicker}
        </p>
        <p className="text-[15px] font-semibold tracking-tight text-neutral-900">
          {subject.title}
        </p>
        <p className="text-[12px] text-neutral-500">
          {progress.currentLessonTitle
            ? `Next: ${progress.currentLessonTitle}`
            : "Continue"}
          {" · "}
          {progress.percent}%
        </p>
        <div className="h-1 w-36 overflow-hidden rounded-full bg-neutral-100">
          <div
            className="h-full rounded-full bg-neutral-900"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      </div>
      <Link
        href={href}
        className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-neutral-900 px-5 text-[12px] font-medium text-white hover:bg-neutral-800"
      >
        Continue
      </Link>
    </div>
  );
}
