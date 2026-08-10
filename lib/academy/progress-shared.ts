import type { AcademySubject } from "@/lib/academy/subjects";
import { getAllLessons } from "@/lib/academy/subjects";

export type SubjectProgress = {
  subjectSlug: string;
  completedLessons: string[];
  lastLessonSlug: string | null;
  startedAt: string;
  updatedAt: string;
  percent: number;
  completedCount: number;
  totalLessons: number;
  currentLessonSlug: string | null;
  currentLessonTitle: string | null;
  currentModuleIndex: number;
};

export type ModuleProgressState = "completed" | "current" | "available";

/**
 * While Academy videos are still being recorded, every chapter stays open.
 * Flip to false later to re-enable sequential unlocking.
 */
export const ACADEMY_UNLOCK_ALL = true;

export function computeSubjectProgress(
  subject: AcademySubject,
  row: {
    completedLessons: string[];
    lastLessonSlug: string | null;
    startedAt: Date;
    updatedAt: Date;
  } | null,
): SubjectProgress {
  const all = getAllLessons(subject);
  const completed = new Set(row?.completedLessons ?? []);
  const validCompleted = all.map((l) => l.slug).filter((s) => completed.has(s));
  const total = all.length;
  const completedCount = validCompleted.length;
  const percent = total === 0 ? 0 : Math.round((completedCount / total) * 100);

  let currentIndex = all.findIndex((l) => !completed.has(l.slug));
  if (currentIndex < 0) currentIndex = Math.max(0, total - 1);

  if (row?.lastLessonSlug) {
    const lastIdx = all.findIndex((l) => l.slug === row.lastLessonSlug);
    if (lastIdx >= 0) {
      const nextIncomplete = all.findIndex(
        (l, i) => i >= lastIdx && !completed.has(l.slug),
      );
      if (nextIncomplete >= 0) currentIndex = nextIncomplete;
      else {
        const any = all.findIndex((l) => !completed.has(l.slug));
        if (any >= 0) currentIndex = any;
      }
    }
  }

  const current = all[currentIndex] ?? null;

  let currentModuleIndex = 0;
  let cursor = 0;
  for (let mi = 0; mi < subject.modules.length; mi++) {
    const len = subject.modules[mi]!.lessons.length;
    if (currentIndex < cursor + len) {
      currentModuleIndex = mi;
      break;
    }
    cursor += len;
  }

  return {
    subjectSlug: subject.slug,
    completedLessons: validCompleted,
    lastLessonSlug: row?.lastLessonSlug ?? null,
    startedAt: (row?.startedAt ?? new Date()).toISOString(),
    updatedAt: (row?.updatedAt ?? new Date()).toISOString(),
    percent,
    completedCount,
    totalLessons: total,
    currentLessonSlug: current?.slug ?? null,
    currentLessonTitle: current?.title ?? null,
    currentModuleIndex,
  };
}

export function getModuleState(
  subject: AcademySubject,
  moduleIndex: number,
  progress: SubjectProgress,
): ModuleProgressState {
  const completed = new Set(progress.completedLessons);
  const mod = subject.modules[moduleIndex];
  if (!mod) return "available";

  const allDone = mod.lessons.every((l) => completed.has(l.slug));
  if (allDone) return "completed";

  if (ACADEMY_UNLOCK_ALL) {
    return moduleIndex === progress.currentModuleIndex
      ? "current"
      : "available";
  }

  for (let i = 0; i < moduleIndex; i++) {
    const prev = subject.modules[i]!;
    if (!prev.lessons.every((l) => completed.has(l.slug))) {
      return "available";
    }
  }
  return "current";
}
