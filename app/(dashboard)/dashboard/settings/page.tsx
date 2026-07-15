import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { serializeStoreWithSettings } from "@/lib/store-settings";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { SettingsPageClient } from "@/components/settings/settings-page-client";

export const metadata = { title: "Settings" };

export default async function DashboardSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { tab } = await searchParams;
  const isPreferences = !tab || tab === "general";

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
    include: { settings: true },
  });
  if (!store) redirect("/onboarding");

  return (
    <DashboardLayout>
      <DashboardHeader
        title={isPreferences ? "Online Store" : "Store Settings"}
        description={
          isPreferences
            ? "Store preferences and contact details"
            : "Manage your store configuration"
        }
      />
      <DashboardPageContent>
        <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-muted" />}>
          <SettingsPageClient initialStore={serializeStoreWithSettings(store)} />
        </Suspense>
      </DashboardPageContent>
    </DashboardLayout>
  );
}
