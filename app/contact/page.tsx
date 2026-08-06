import type { Metadata } from "next";
import { ContactSupportPage } from "@/components/contact/contact-support-page";
import { getContactSeo } from "@/lib/contact/contact-i18n";
import { buildPageMetadata, getServerLocale } from "@/lib/seo/page-metadata";
import type { ContactSupportInput } from "@/lib/validations/contact";

const VALID_TOPICS: ContactSupportInput["topic"][] = [
  "general",
  "billing",
  "technical",
  "cod",
  "migration",
];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return buildPageMetadata({
    seo: getContactSeo(locale),
    path: "/contact",
    locale,
  });
}

export default function ContactPage({
  searchParams,
}: {
  searchParams?: { topic?: string; ref?: string; plan?: string; period?: string };
}) {
  const topicParam = searchParams?.topic;
  const initialTopic =
    topicParam && VALID_TOPICS.includes(topicParam as ContactSupportInput["topic"])
      ? (topicParam as ContactSupportInput["topic"])
      : undefined;

  const plan = searchParams?.plan?.trim();
  const period = searchParams?.period?.trim();
  const initialMessage =
    plan && ["starter", "growth", "business"].includes(plan.toLowerCase())
      ? `I would like to upgrade to the ${plan.charAt(0).toUpperCase()}${plan.slice(1)} plan${period === "annually" || period === "monthly" ? ` (${period})` : ""}.`
      : undefined;

  return (
    <ContactSupportPage
      initialTopic={initialTopic}
      articleRef={searchParams?.ref}
      initialMessage={initialMessage}
    />
  );
}