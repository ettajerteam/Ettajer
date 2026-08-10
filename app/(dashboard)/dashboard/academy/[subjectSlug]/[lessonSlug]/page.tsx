import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import {
  findLesson,
  getAdjacentLessons,
} from "@/lib/academy/subjects";
import { getSubjectProgressForUser } from "@/lib/academy/progress";
import { AcademyLessonClient } from "@/components/academy/academy-lesson-client";

export async function generateMetadata({
  params,
}: {
  params: { subjectSlug: string; lessonSlug: string };
}) {
  const found = findLesson(params.subjectSlug, params.lessonSlug);
  return {
    title: found
      ? `${found.lesson.title} · Ettajer Academy`
      : "Lesson · Ettajer Academy",
  };
}

export default async function AcademyLessonPage({
  params,
}: {
  params: { subjectSlug: string; lessonSlug: string };
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(
      `/login?callbackUrl=/dashboard/academy/${params.subjectSlug}/${params.lessonSlug}`,
    );
  }

  const found = findLesson(params.subjectSlug, params.lessonSlug);
  if (!found) notFound();

  const progress = await getSubjectProgressForUser(
    session.user.id,
    found.subject.slug,
  );
  if (!progress) notFound();

  const { prev, next } = getAdjacentLessons(
    found.subject.slug,
    found.lesson.slug,
  );

  return (
    <AcademyLessonClient
      subject={found.subject}
      moduleLabel={found.module.title}
      moduleIndex={found.moduleIndex}
      lesson={found.lesson}
      lessonIndexInSubject={found.lessonIndexInSubject}
      prev={prev}
      next={next}
      initialProgress={progress}
    />
  );
}
