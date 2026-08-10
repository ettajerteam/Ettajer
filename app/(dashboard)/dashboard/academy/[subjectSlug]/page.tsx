import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { getAcademySubject } from "@/lib/academy/subjects";
import { getSubjectProgressForUser } from "@/lib/academy/progress";
import { AcademySubjectClient } from "@/components/academy/academy-subject-client";

export async function generateMetadata({
  params,
}: {
  params: { subjectSlug: string };
}) {
  const subject = getAcademySubject(params.subjectSlug);
  return {
    title: subject
      ? `${subject.title} · Ettajer Academy`
      : "Subject · Ettajer Academy",
  };
}

export default async function AcademySubjectPage({
  params,
}: {
  params: { subjectSlug: string };
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(
      `/login?callbackUrl=/dashboard/academy/${params.subjectSlug}`,
    );
  }

  // Reserve static segment
  if (params.subjectSlug === "learning") notFound();

  const subject = getAcademySubject(params.subjectSlug);
  if (!subject) notFound();

  const progress = await getSubjectProgressForUser(
    session.user.id,
    subject.slug,
  );
  if (!progress) notFound();

  return <AcademySubjectClient subject={subject} progress={progress} />;
}
