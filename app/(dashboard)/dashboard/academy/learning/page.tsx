import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { ACADEMY_SUBJECTS } from "@/lib/academy/subjects";
import {
  allSubjectsWithProgress,
  listUserSubjectProgress,
} from "@/lib/academy/progress";
import { AcademyLearningClient } from "@/components/academy/academy-learning-client";

export const metadata = {
  title: "My Learning · Ettajer Academy",
};

export default async function AcademyLearningPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/academy/learning");
  }

  const progressList = await listUserSubjectProgress(session.user.id);
  const bySlug = new Map(
    ACADEMY_SUBJECTS.map((s) => [
      s.slug,
      {
        slug: s.slug,
        title: s.title,
        kicker: s.kicker,
        accent: s.accent,
      },
    ]),
  );

  const continueLearning = progressList
    .filter((p) => p.percent < 100)
    .slice(0, 3)
    .flatMap((progress) => {
      const subject = bySlug.get(progress.subjectSlug);
      if (!subject) return [];
      return [{ subject, progress }];
    });

  const recentlyViewed = progressList
    .filter((p) => p.lastLessonSlug)
    .slice(0, 5)
    .flatMap((progress) => {
      const subject = bySlug.get(progress.subjectSlug);
      if (!subject) return [];
      return [{ subject, progress }];
    });

  const completed = progressList
    .filter((p) => p.percent >= 100)
    .flatMap((progress) => {
      const subject = bySlug.get(progress.subjectSlug);
      if (!subject) return [];
      return [{ subject, progress }];
    });

  const bySubject = allSubjectsWithProgress(progressList).map(
    ({ subject, progress }) => ({
      subject: {
        slug: subject.slug,
        title: subject.title,
        accent: subject.accent,
      },
      progress,
    }),
  );

  return (
    <AcademyLearningClient
      continueLearning={continueLearning}
      recentlyViewed={recentlyViewed}
      completed={completed}
      bySubject={bySubject}
    />
  );
}
