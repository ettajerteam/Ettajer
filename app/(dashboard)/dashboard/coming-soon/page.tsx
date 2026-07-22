import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { ComingSoon } from "@/components/dashboard/coming-soon";

interface PageProps {
  searchParams: { feature?: string };
}

const featureLabels: Record<string, string> = {
  billing: "Billing",
  users: "Users & permissions",
  taxes: "Taxes & duties",
  security: "Security",
};

export default function ComingSoonPage({ searchParams }: PageProps) {
  const feature = searchParams.feature ?? "feature";
  if (feature === "domains") redirect("/dashboard/domains");

  const title = featureLabels[feature] ?? feature.replace(/-/g, " ");

  return (
    <DashboardLayout>
      <DashboardHeader title={title} description="This feature is on our roadmap" />
      <DashboardPageContent>
        <ComingSoon title={title} />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
