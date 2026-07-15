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
  searchParams?: { topic?: string; ref?: string };
}) {
  const topicParam = searchParams?.topic;
  const initialTopic =
    topicParam && VALID_TOPICS.includes(topicParam as ContactSupportInput["topic"])
      ? (topicParam as ContactSupportInput["topic"])
      : undefined;

  return (
    <ContactSupportPage
      initialTopic={initialTopic}
      articleRef={searchParams?.ref}
    />
  );
}
