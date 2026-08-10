"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type {
  AcademySubject,
  AcademySubjectLayout,
} from "@/lib/academy/subjects";
import type { AcademyRecommendation } from "@/lib/academy/recommendations";
import type { SubjectProgress } from "@/lib/academy/progress-shared";
import { lessonHref, subjectHref } from "@/lib/academy/subjects";
import { usePrefersReducedMotion } from "@/components/academy/use-prefers-reduced-motion";
import {
  AcademyReveal,
  AcademyStagger,
  AcademyStaggerItem,
} from "@/components/academy/academy-motion";
import { useAcademyNav } from "@/components/academy/academy-nav-provider";

export type HomeSubjectCard = Pick<
  AcademySubject,
  "slug" | "kicker" | "title" | "description" | "topics" | "accent" | "layout" | "headline"
> & {
  moduleCount: number;
  lessonCount: number;
  progressPercent: number;
  totalMin: number;
  enterLines: string[];
};

type ContinueItem = {
  subject: Pick<AcademySubject, "slug" | "title" | "kicker" | "accent">;
  progress: SubjectProgress;
  chapterLabel: string;
  lessonNumber: number;
  chapterNumber: number;
};

type FeaturedLesson = {
  title: string;
  summary: string;
  durationMin: number;
  subjectTitle: string;
  level: string;
  href: string;
};

type LearnByDoingItem = {
  lessonTitle: string;
  learn: string;
  cta: string;
  href: string;
};

type ProgressBar = {
  title: string;
  percent: number;
  accent: string;
  href: string;
};

const HERO_WORDS = ["Learn.", "Build.", "Launch.", "Grow."];

export function AcademyHomeClient({
  subjects,
  recommendation,
  continueLearning,
  featured,
  learnByDoing,
  progressBySchool,
  totals,
}: {
  subjects: HomeSubjectCard[];
  recommendation: AcademyRecommendation | null;
  continueLearning: ContinueItem[];
  featured: FeaturedLesson | null;
  learnByDoing: LearnByDoingItem[];
  progressBySchool: ProgressBar[];
  totals: { schools: number; lessons: number };
}) {
  const { enterSchool } = useAcademyNav();
  const reduced = usePrefersReducedMotion();
  const [wordIndex, setWordIndex] = useState(0);
  const primaryContinue = continueLearning[0] ?? null;

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      setWordIndex((i) => (i + 1) % HERO_WORDS.length);
    }, 2200);
    return () => window.clearInterval(id);
  }, [reduced]);

  function goToSchool(subject: HomeSubjectCard) {
    enterSchool(subject.slug, {
      title: subject.title,
      lines: subject.enterLines,
    });
  }

  return (
    <div className="relative">
      <div className="mx-auto max-w-6xl px-4 pb-28 pt-10 sm:px-6 lg:px-8 lg:pb-32 lg:pt-14">
        {/* Hero */}
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-[12px] font-medium text-neutral-400">
            Ettajer Academy
          </p>
          <h1 className="mt-4 text-[40px] font-semibold leading-[1.08] tracking-tight text-neutral-900 sm:text-[52px] lg:text-[56px]">
            {HERO_WORDS.map((word, i) => (
              <span key={word} className="block">
                <motion.span
                  animate={
                    reduced
                      ? { opacity: 1 }
                      : {
                          opacity: wordIndex === i ? 1 : 0.28,
                        }
                  }
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h1>
          <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-neutral-500">
            Your ecommerce school inside Ettajer.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#schools"
              className="inline-flex h-11 items-center rounded-full bg-neutral-900 px-6 text-[13px] font-medium text-white transition-colors hover:bg-neutral-800"
            >
              Explore schools
            </a>
            {primaryContinue ? (
              <Link
                href={
                  primaryContinue.progress.currentLessonSlug
                    ? lessonHref(
                        primaryContinue.subject.slug,
                        primaryContinue.progress.currentLessonSlug,
                      )
                    : subjectHref(primaryContinue.subject.slug)
                }
                className="inline-flex h-11 items-center rounded-full border border-black/[0.08] bg-white px-6 text-[13px] font-medium text-neutral-800 transition-colors hover:bg-neutral-50"
              >
                Continue learning
              </Link>
            ) : null}
          </div>
        </header>

        {/* Continue / Start */}
        <AcademyReveal className="mx-auto mt-14 max-w-2xl" delay={0.05}>
          {primaryContinue ? (
            <ContinueBlock item={primaryContinue} />
          ) : (
            <div className="rounded-2xl border border-black/[0.06] bg-white px-6 py-8 text-center">
              <p className="text-[12px] font-medium text-neutral-400">
                Start your journey
              </p>
              <p className="mt-2 text-[15px] font-semibold text-neutral-900">
                Choose your first school.
              </p>
              <a
                href="#schools"
                className="mt-5 inline-flex h-10 items-center rounded-full bg-neutral-900 px-5 text-[12px] font-medium text-white"
              >
                Explore schools
              </a>
            </div>
          )}
        </AcademyReveal>

        {/* Contextual tip — one only */}
        {recommendation ? (
          <AcademyReveal className="mx-auto mt-8 max-w-2xl">
            <Link
              href={recommendation.href}
              className="group flex items-center justify-between gap-4 rounded-xl px-1 py-2"
            >
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-neutral-800">
                  {recommendation.title}
                </p>
                <p className="mt-0.5 text-[12px] text-neutral-500">
                  {recommendation.body}
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 text-[12px] font-medium text-[#007AFF]">
                {recommendation.cta}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
              </span>
            </Link>
          </AcademyReveal>
        ) : null}

        {/* Schools */}
        <section id="schools" className="mt-16 scroll-mt-24 lg:mt-20">
          <AcademyReveal>
            <h2 className="text-[15px] font-semibold tracking-tight text-neutral-900">
              Choose your school
            </h2>
            <p className="mt-1 text-[13px] text-neutral-500">
              Four schools. One destination at a time.
            </p>
          </AcademyReveal>

          <ul className="mt-7 grid gap-4 md:grid-cols-2 md:gap-5">
            {subjects.map((subject, i) => (
              <li
                key={subject.slug}
                className={cn(
                  subject.layout === "featured-dark" && "md:col-span-2",
                )}
              >
                <AcademyReveal delay={i * 0.04}>
                  <SubjectPathCard
                    subject={subject}
                    onEnter={() => goToSchool(subject)}
                  />
                </AcademyReveal>
              </li>
            ))}
          </ul>
        </section>

        {/* Journey */}
        <AcademyReveal className="mt-20 lg:mt-24">
          <JourneyStrip
            stageIndex={journeyStageFromProgress(progressBySchool)}
          />
        </AcademyReveal>

        {/* Progress */}
        {progressBySchool.some((p) => p.percent > 0) ? (
          <AcademyReveal className="mx-auto mt-16 max-w-2xl lg:mt-20">
            <h2 className="text-[13px] font-semibold text-neutral-900">
              Your progress
            </h2>
            <ul className="mt-5 space-y-4">
              {progressBySchool.map((row) => (
                <li key={row.href}>
                  <Link href={row.href} className="block space-y-2">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[13px] font-medium text-neutral-800">
                        {row.title}
                      </span>
                      <span className="text-[12px] tabular-nums text-neutral-400">
                        {row.percent}%
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-neutral-200/80">
                      <div
                        className="h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none"
                        style={{
                          width: `${row.percent}%`,
                          backgroundColor: row.accent,
                        }}
                      />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </AcademyReveal>
        ) : null}

        {/* Learn by doing */}
        {learnByDoing.length > 0 ? (
          <section className="mt-20 lg:mt-24">
            <AcademyReveal>
              <h2 className="text-[15px] font-semibold tracking-tight text-neutral-900">
                Learn by doing
              </h2>
              <p className="mt-1 text-[13px] text-neutral-500">
                Don&apos;t just watch. Build while you learn.
              </p>
            </AcademyReveal>
            <AcademyStagger className="mt-6 grid gap-3 sm:grid-cols-2">
              {learnByDoing.map((item) => (
                <AcademyStaggerItem key={item.href + item.lessonTitle}>
                  <div className="rounded-2xl border border-black/[0.06] bg-white p-5">
                    <p className="text-[11px] font-medium text-neutral-400">
                      Lesson
                    </p>
                    <p className="mt-1 text-[14px] font-semibold text-neutral-900">
                      {item.lessonTitle}
                    </p>
                    <p className="mt-2 text-[12px] leading-relaxed text-neutral-500">
                      Learn: {item.learn}
                    </p>
                    <Link
                      href={item.href}
                      className="mt-4 inline-flex items-center gap-1 text-[12px] font-medium text-[#007AFF]"
                    >
                      {item.cta}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </AcademyStaggerItem>
              ))}
            </AcademyStagger>
          </section>
        ) : null}

        {/* Featured */}
        {featured ? (
          <AcademyReveal className="mt-20 lg:mt-24">
            <div className="rounded-[20px] border border-black/[0.06] bg-white p-7 sm:p-9">
              <p className="text-[12px] font-medium text-neutral-400">
                Featured lesson
              </p>
              <h3 className="mt-3 max-w-lg text-[24px] font-semibold tracking-tight text-neutral-900 sm:text-[28px]">
                {featured.title}
              </h3>
              <p className="mt-2 max-w-md text-[14px] text-neutral-500">
                {featured.summary}
              </p>
              <p className="mt-4 text-[12px] text-neutral-400">
                {featured.durationMin} min · {featured.subjectTitle} ·{" "}
                {featured.level}
              </p>
              <Link
                href={featured.href}
                className="mt-6 inline-flex h-10 items-center rounded-full bg-neutral-900 px-5 text-[12px] font-medium text-white"
              >
                Open lesson
              </Link>
            </div>
          </AcademyReveal>
        ) : null}

        {/* What you'll learn */}
        <section className="mt-20 lg:mt-24">
          <AcademyReveal>
            <h2 className="text-[15px] font-semibold tracking-tight text-neutral-900">
              What you&apos;ll learn
            </h2>
          </AcademyReveal>
          <AcademyStagger className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: "01", t: "Build", d: "Build your store and offer." },
              { n: "02", t: "Sell", d: "Understand conversion and customers." },
              { n: "03", t: "Acquire", d: "Learn how to get traffic." },
              { n: "04", t: "Scale", d: "Build a repeatable system." },
            ].map((item) => (
              <AcademyStaggerItem key={item.n}>
                <p className="text-[12px] tabular-nums text-neutral-300">
                  {item.n}
                </p>
                <p className="mt-2 text-[16px] font-semibold tracking-tight text-neutral-900">
                  {item.t}
                </p>
                <p className="mt-1 text-[13px] text-neutral-500">{item.d}</p>
              </AcademyStaggerItem>
            ))}
          </AcademyStagger>
        </section>

        {/* Explore footer */}
        <AcademyReveal className="mt-20 border-t border-black/[0.06] pt-12 text-center lg:mt-24">
          <p className="text-[12px] font-medium text-neutral-400">
            Explore the Academy
          </p>
          <p className="mt-2 text-[15px] font-semibold text-neutral-900">
            {totals.schools} schools · {totals.lessons}+ lessons
          </p>
          <a
            href="#schools"
            className="mt-5 inline-flex h-10 items-center rounded-full border border-black/[0.08] bg-white px-5 text-[12px] font-medium text-neutral-800"
          >
            Browse all schools
          </a>
        </AcademyReveal>
      </div>
    </div>
  );
}

function ContinueBlock({ item }: { item: ContinueItem }) {
  const href = item.progress.currentLessonSlug
    ? lessonHref(item.subject.slug, item.progress.currentLessonSlug)
    : subjectHref(item.subject.slug);

  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-5 sm:p-6">
      <p className="text-[12px] font-medium text-neutral-400">
        Continue learning
      </p>
      <p className="mt-2 text-[15px] font-semibold text-neutral-900">
        {item.subject.title}
      </p>
      <p className="mt-1 text-[13px] text-neutral-500">
        {item.progress.currentLessonTitle ?? "Continue"}
      </p>
      <p className="mt-1 text-[12px] text-neutral-400">
        Chapter {item.chapterNumber} · Lesson {item.lessonNumber}
      </p>
      <div className="mt-4 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
          <div
            className="h-full rounded-full bg-neutral-900"
            style={{ width: `${item.progress.percent}%` }}
          />
        </div>
        <span className="text-[11px] tabular-nums text-neutral-400">
          {item.progress.percent}%
        </span>
      </div>
      <Link
        href={href}
        className="mt-5 inline-flex h-10 items-center rounded-full bg-neutral-900 px-5 text-[12px] font-medium text-white"
      >
        Continue lesson
      </Link>
    </div>
  );
}

function JourneyStrip({ stageIndex }: { stageIndex: number }) {
  const stages = ["Learn", "Build", "Launch", "Sell", "Scale"];
  return (
    <div>
      <h2 className="text-[13px] font-semibold text-neutral-900">
        Your journey
      </h2>
      <ol className="mt-6 flex flex-col gap-0 sm:flex-row sm:items-center sm:justify-between">
        {stages.map((label, i) => {
          const active = i <= stageIndex;
          return (
            <li
              key={label}
              className="flex items-center gap-3 sm:flex-1 sm:flex-col sm:gap-2"
            >
              <div className="flex items-center gap-3 sm:w-full sm:flex-col">
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums",
                    active
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-400",
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "text-[13px] font-medium",
                    active ? "text-neutral-900" : "text-neutral-400",
                  )}
                >
                  {label}
                </span>
              </div>
              {i < stages.length - 1 ? (
                <span
                  className={cn(
                    "ml-4 hidden h-px flex-1 sm:ml-0 sm:mt-[-1.75rem] sm:block sm:w-full sm:self-start",
                    i < stageIndex ? "bg-neutral-900" : "bg-neutral-200",
                  )}
                  aria-hidden
                />
              ) : null}
              {i < stages.length - 1 ? (
                <span
                  className={cn(
                    "ml-[15px] h-6 w-px sm:hidden",
                    i < stageIndex ? "bg-neutral-900" : "bg-neutral-200",
                  )}
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function journeyStageFromProgress(rows: ProgressBar[]): number {
  const max = Math.max(0, ...rows.map((r) => r.percent));
  if (max <= 0) return 0;
  if (max < 25) return 1;
  if (max < 50) return 2;
  if (max < 75) return 3;
  return 4;
}

function SubjectPathCard({
  subject,
  onEnter,
}: {
  subject: HomeSubjectCard;
  onEnter: () => void;
}) {
  const layout = subject.layout as AcademySubjectLayout;
  const meta = `${subject.moduleCount} chapters · ${subject.lessonCount} lessons`;

  const base =
    "group relative w-full text-left transition-transform duration-300 motion-reduce:transition-none hover:scale-[1.015] active:scale-[0.995]";

  if (layout === "featured-dark") {
    return (
      <button type="button" onClick={onEnter} className={cn(base)}>
        <div className="flex min-h-[220px] flex-col justify-between overflow-hidden rounded-[20px] bg-[#0B0D10] p-8 text-white sm:min-h-[250px] sm:p-10 lg:flex-row lg:items-end lg:gap-16 lg:p-11">
          <div>
            <p className="text-[12px] font-medium text-white/45">
              {subject.kicker}
            </p>
            <h3 className="mt-2 max-w-lg text-[26px] font-semibold tracking-tight transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transform-none sm:text-[32px]">
              {subject.title}
            </h3>
            <p className="mt-3 max-w-md text-[14px] leading-relaxed text-white/55">
              {subject.description}
            </p>
            <p className="mt-5 text-[12px] text-white/35">{meta}</p>
          </div>
          <span className="mt-8 inline-flex items-center gap-2 text-[13px] font-medium text-white lg:mt-0">
            Enter school
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" />
          </span>
        </div>
      </button>
    );
  }

  if (layout === "chapters") {
    return (
      <button type="button" onClick={onEnter} className={cn(base, "h-full")}>
        <div className="flex h-full flex-col justify-between rounded-[20px] border border-black/[0.06] bg-white p-7 transition-colors group-hover:border-black/[0.12] sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[12px] font-medium" style={{ color: subject.accent }}>
                {subject.kicker}
              </p>
              <h3 className="mt-2 text-[22px] font-semibold tracking-tight text-neutral-900">
                {subject.title}
              </h3>
              <p className="mt-3 whitespace-pre-line text-[18px] font-semibold leading-snug tracking-tight text-neutral-900">
                {subject.enterLines.join("\n")}
              </p>
            </div>
            <span className="text-[36px] font-semibold leading-none tracking-tight text-neutral-200 tabular-nums transition-colors group-hover:text-neutral-300">
              {String(subject.moduleCount).padStart(2, "0")}
            </span>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-black/[0.05] pt-4">
            <span className="text-[11px] text-neutral-400">
              {subject.lessonCount} lessons
            </span>
            <span className="inline-flex items-center gap-1 text-[13px] font-medium text-neutral-900">
              Start
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
            </span>
          </div>
        </div>
      </button>
    );
  }

  if (layout === "quiet") {
    return (
      <button type="button" onClick={onEnter} className={cn(base, "h-full")}>
        <div className="flex h-full flex-col rounded-[20px] border border-dashed border-black/[0.1] bg-[#F2F2F3] p-7 transition-colors group-hover:border-solid group-hover:border-black/[0.14] group-hover:bg-white sm:p-8">
          <p className="text-[12px] font-medium text-neutral-400">
            {subject.kicker}
          </p>
          <h3 className="mt-2 text-[22px] font-semibold tracking-tight text-neutral-900">
            {subject.title}
          </h3>
          <p className="mt-3 text-[13px] leading-relaxed text-neutral-500">
            {subject.description}
          </p>
          <ul className="mt-5 space-y-1">
            {subject.topics.slice(0, 4).map((t) => (
              <li key={t} className="text-[12px] text-neutral-400">
                {t}
              </li>
            ))}
          </ul>
          <span className="mt-auto inline-flex items-center gap-1 pt-6 text-[13px] font-medium text-neutral-900">
            Explore
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
          </span>
        </div>
      </button>
    );
  }

  return (
    <button type="button" onClick={onEnter} className={cn(base, "h-full")}>
      <div className="flex h-full flex-col rounded-[20px] border border-black/[0.06] bg-white p-7 transition-colors group-hover:border-black/[0.12] sm:p-8">
        <p className="text-[12px] font-medium" style={{ color: subject.accent }}>
          {subject.kicker}
        </p>
        <h3 className="mt-2 text-[22px] font-semibold tracking-tight text-neutral-900 sm:text-[24px]">
          {subject.title}
        </h3>
        <p className="mt-3 text-[13px] leading-relaxed text-neutral-500">
          {subject.description}
        </p>
        <div className="mt-auto flex items-center justify-between pt-7">
          <span className="text-[11px] text-neutral-400">{meta}</span>
          <span className="inline-flex items-center gap-1 text-[13px] font-medium text-neutral-900">
            Enter school
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
          </span>
        </div>
      </div>
    </button>
  );
}
