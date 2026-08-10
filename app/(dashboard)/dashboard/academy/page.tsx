import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import {
  ACADEMY_SUBJECTS,
  countSubjectLessons,
  findLesson,
  getAllLessons,
  lessonHref,
} from "@/lib/academy/subjects";
import { getAcademyRecommendations } from "@/lib/academy/recommendations";
import {
  allSubjectsWithProgress,
  listUserSubjectProgress,
} from "@/lib/academy/progress";
import { AcademyHomeClient } from "@/components/academy/academy-home-client";

export const metadata = {
  title: "Ettajer Academy",
  description: "Your ecommerce school inside Ettajer.",
};

const ENTER_LINES: Record<string, string[]> = {
  platform: ["Master the tools", "behind your store."],
  ecommerce: ["Build a business,", "not just a store."],
  dropshipping: ["Find.", "Validate.", "Sell.", "Scale."],
  pod: ["Create something", "people want to wear."],
};

export default async function AcademyHomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/dashboard/academy");

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
  });
  if (!store) redirect("/onboarding");

  const [recommendations, progressList] = await Promise.all([
    getAcademyRecommendations(store.id),
    listUserSubjectProgress(session.user.id),
  ]);

  const progressBySlug = new Map(
    progressList.map((p) => [p.subjectSlug, p]),
  );

  const subjects = ACADEMY_SUBJECTS.map((s) => ({
    slug: s.slug,
    kicker: s.kicker,
    title: s.title,
    description: s.description,
    headline: s.headline,
    topics: s.topics,
    accent: s.accent,
    layout: s.layout,
    moduleCount: s.modules.length,
    lessonCount: countSubjectLessons(s),
    progressPercent: progressBySlug.get(s.slug)?.percent ?? 0,
    totalMin: s.modules
      .flatMap((m) => m.lessons)
      .reduce((sum, l) => sum + l.durationMin, 0),
    enterLines: ENTER_LINES[s.slug] ?? [s.description],
  }));

  const bySlug = new Map(
    ACADEMY_SUBJECTS.map((s) => [
      s.slug,
      { slug: s.slug, title: s.title, kicker: s.kicker, accent: s.accent },
    ]),
  );

  const continueLearning = progressList
    .filter((p) => p.percent < 100)
    .slice(0, 1)
    .flatMap((progress) => {
      const subjectMeta = bySlug.get(progress.subjectSlug);
      const subject = ACADEMY_SUBJECTS.find(
        (s) => s.slug === progress.subjectSlug,
      );
      if (!subjectMeta || !subject) return [];
      const found = progress.currentLessonSlug
        ? findLesson(subject.slug, progress.currentLessonSlug)
        : null;
      return [
        {
          subject: subjectMeta,
          progress,
          chapterLabel: found?.module.title ?? "Chapter",
          chapterNumber: (found?.moduleIndex ?? 0) + 1,
          lessonNumber: (found?.lessonIndexInModule ?? 0) + 1,
        },
      ];
    });

  const featuredFound =
    findLesson("ecommerce", "demand-signals") ??
    findLesson("dropshipping", "ds-research");
  const featured = featuredFound
    ? {
        title: featuredFound.lesson.title,
        summary: featuredFound.lesson.summary,
        durationMin: featuredFound.lesson.durationMin,
        subjectTitle: featuredFound.subject.title,
        level: featuredFound.subject.kicker,
        href: lessonHref(
          featuredFound.subject.slug,
          featuredFound.lesson.slug,
        ),
      }
    : null;

  const learnByDoing = [
    {
      lessonTitle: "Add your first product",
      learn: "How to structure a product listing.",
      cta: "Try it in my store",
      href: "/dashboard/products/new",
    },
    {
      lessonTitle: "Customize your storefront",
      learn: "Pick a theme and make it feel like your brand.",
      cta: "Open themes",
      href: "/dashboard/themes",
    },
    {
      lessonTitle: "Connect your domain",
      learn: "Brand credibility for returning buyers.",
      cta: "Open domains",
      href: "/dashboard/domains",
    },
    {
      lessonTitle: "Understand your orders",
      learn: "Confirm, fulfill, and stay organized.",
      cta: "Open orders",
      href: "/dashboard/orders",
    },
  ];

  const progressBySchool = allSubjectsWithProgress(progressList).map(
    ({ subject, progress }) => ({
      title: subject.title,
      percent: progress.percent,
      accent: subject.accent,
      href: `/dashboard/academy/${subject.slug}`,
    }),
  );

  const totals = {
    schools: ACADEMY_SUBJECTS.length,
    lessons: ACADEMY_SUBJECTS.reduce(
      (n, s) => n + getAllLessons(s).length,
      0,
    ),
  };

  return (
    <AcademyHomeClient
      subjects={subjects}
      recommendation={recommendations[0] ?? null}
      continueLearning={continueLearning}
      featured={featured}
      learnByDoing={learnByDoing}
      progressBySchool={progressBySchool}
      totals={totals}
    />
  );
}
