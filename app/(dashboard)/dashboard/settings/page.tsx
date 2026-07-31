import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { serializeStoreWithSettings } from "@/lib/store-settings";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { SettingsDashboardHeader } from "@/components/settings/settings-dashboard-header";
import { SettingsPageClient } from "@/components/settings/settings-page-client";

export const metadata = { title: "Settings" };

export default async function DashboardSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
    include: { settings: true },
  });
  if (!store) redirect("/onboarding");

  return (
    <DashboardLayout>
      <SettingsDashboardHeader />
      <DashboardPageContent>
        <Suspense
          fallback={
            <div className="space-y-3">
              <div className="h-10 animate-pulse rounded-[12px] bg-black/[0.04] dark:bg-white/[0.06]" />
              <div className="grid gap-3 lg:grid-cols-[220px_1fr]">
                <div className="hidden h-64 animate-pulse rounded-[12px] bg-black/[0.04] lg:block dark:bg-white/[0.06]" />
                <div className="h-80 animate-pulse rounded-[12px] bg-black/[0.04] dark:bg-white/[0.06]" />
              </div>
            </div>
          }
        >
          <SettingsPageClient initialStore={serializeStoreWithSettings(store)} />
        </Suspense>
      </DashboardPageContent>
    </DashboardLayout>
  );
}
