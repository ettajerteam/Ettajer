import type { Metadata } from "next";
import { DataDeletionPage } from "@/components/legal/data-deletion-page";
import { buildPageMetadata, getServerLocale } from "@/lib/seo/page-metadata";

interface PageProps {
  searchParams: { code?: string };
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return buildPageMetadata({
    seo: {
      title: "Data deletion | Ettajer",
      description:
        "Request deletion of your Ettajer account data and Meta-connected marketing data.",
    },
    path: "/data-deletion",
    locale,
  });
}

export default function DataDeletionRoutePage({ searchParams }: PageProps) {
  const confirmationCode = searchParams.code?.trim() || undefined;
  return <DataDeletionPage confirmationCode={confirmationCode} />;
}
