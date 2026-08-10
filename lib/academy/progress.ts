import { prisma } from "@/lib/db";
import {
  ACADEMY_SUBJECTS,
  getAcademySubject,
  getAllLessons,
  type AcademySubject,
} from "@/lib/academy/subjects";
import {
  computeSubjectProgress,
  type SubjectProgress,
} from "@/lib/academy/progress-shared";

export type { SubjectProgress, ModuleProgressState } from "@/lib/academy/progress-shared";
export { computeSubjectProgress, getModuleState } from "@/lib/academy/progress-shared";

export async function listUserSubjectProgress(
  userId: string,
): Promise<SubjectProgress[]> {
  const rows = await prisma.academyProgress.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  const out: SubjectProgress[] = [];
  for (const row of rows) {
    const subject = getAcademySubject(row.courseSlug);
    if (!subject) continue;
    out.push(computeSubjectProgress(subject, row));
  }
  return out;
}

export async function getSubjectProgressForUser(
  userId: string,
  subjectSlug: string,
): Promise<SubjectProgress | null> {
  const subject = getAcademySubject(subjectSlug);
  if (!subject) return null;
  const row = await prisma.academyProgress.findUnique({
    where: {
      userId_courseSlug: { userId, courseSlug: subjectSlug },
    },
  });
  return computeSubjectProgress(subject, row);
}

export async function markLessonComplete(input: {
  userId: string;
  subjectSlug: string;
  lessonSlug: string;
}): Promise<SubjectProgress | null> {
  const subject = getAcademySubject(input.subjectSlug);
  if (!subject) return null;
  const all = getAllLessons(subject);
  if (!all.some((l) => l.slug === input.lessonSlug)) return null;

  const existing = await prisma.academyProgress.findUnique({
    where: {
      userId_courseSlug: {
        userId: input.userId,
        courseSlug: input.subjectSlug,
      },
    },
  });

  const completed = new Set(existing?.completedLessons ?? []);
  completed.add(input.lessonSlug);
  const completedLessons = all
    .map((l) => l.slug)
    .filter((s) => completed.has(s));

  const row = await prisma.academyProgress.upsert({
    where: {
      userId_courseSlug: {
        userId: input.userId,
        courseSlug: input.subjectSlug,
      },
    },
    create: {
      userId: input.userId,
      courseSlug: input.subjectSlug,
      completedLessons,
      lastLessonSlug: input.lessonSlug,
    },
    update: {
      completedLessons,
      lastLessonSlug: input.lessonSlug,
    },
  });

  return computeSubjectProgress(subject, row);
}

export async function touchLessonProgress(input: {
  userId: string;
  subjectSlug: string;
  lessonSlug: string;
}): Promise<SubjectProgress | null> {
  const subject = getAcademySubject(input.subjectSlug);
  if (!subject) return null;
  if (!getAllLessons(subject).some((l) => l.slug === input.lessonSlug)) {
    return null;
  }

  const row = await prisma.academyProgress.upsert({
    where: {
      userId_courseSlug: {
        userId: input.userId,
        courseSlug: input.subjectSlug,
      },
    },
    create: {
      userId: input.userId,
      courseSlug: input.subjectSlug,
      completedLessons: [],
      lastLessonSlug: input.lessonSlug,
    },
    update: {
      lastLessonSlug: input.lessonSlug,
    },
  });

  return computeSubjectProgress(subject, row);
}

export function subjectProgressMap(
  list: SubjectProgress[],
): Map<string, SubjectProgress> {
  return new Map(list.map((p) => [p.subjectSlug, p]));
}

export function allSubjectsWithProgress(
  list: SubjectProgress[],
): { subject: AcademySubject; progress: SubjectProgress }[] {
  const map = subjectProgressMap(list);
  return ACADEMY_SUBJECTS.map((subject) => ({
    subject,
    progress: map.get(subject.slug) ?? computeSubjectProgress(subject, null),
  }));
}
