import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { serializeStoreWithSettings } from "@/lib/store-settings";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
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
      <DashboardPageContent>
        <Suspense
          fallback={
            <div className="space-y-4">
              <div className="h-16 animate-pulse rounded-2xl bg-muted" />
              <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
                <div className="hidden h-80 animate-pulse rounded-2xl bg-muted lg:block" />
                <div className="h-96 animate-pulse rounded-2xl bg-muted" />
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
