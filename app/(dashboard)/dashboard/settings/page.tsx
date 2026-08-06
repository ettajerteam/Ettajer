import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { serializeStoreWithSettings } from "@/lib/store-settings";
import { loadUserPlan, serializeAccountProfile } from "@/lib/account-profile";
import { serializeStorePage } from "@/lib/pages";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { SettingsDashboardHeader } from "@/components/settings/settings-dashboard-header";
import { SettingsPageClient } from "@/components/settings/settings-page-client";
import type { PlanSettingsUsage } from "@/components/settings/plan-settings";
import { LEGAL_POLICY_DEFS } from "@/lib/legal-settings";

export const metadata = { title: "Settings" };

export default async function DashboardSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [store, user] = await Promise.all([
    prisma.store.findFirst({
      where: { userId: session.user.id },
      include: { settings: true },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        marketingEmails: true,
        founderNumber: true,
        passwordHash: true,
        createdAt: true,
        lastLoginAt: true,
      },
    }),
  ]);

  if (!store) redirect("/onboarding");
  if (!user) redirect("/login");

  const legalSlugs = LEGAL_POLICY_DEFS.map((d) => d.slug);

  const [plan, productCount, storeCount, legalPageRows] = await Promise.all([
    loadUserPlan(user.id),
    prisma.product.count({ where: { storeId: store.id } }),
    prisma.store.count({ where: { userId: user.id } }),
    prisma.storePage.findMany({
      where: { storeId: store.id, slug: { in: legalSlugs } },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const customDomain = store.settings?.customDomain?.trim() || "";
  const planUsage: PlanSettingsUsage = {
    products: productCount,
    domains: customDomain ? 1 : 0,
    stores: storeCount,
  };

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
          <SettingsPageClient
            initialStore={serializeStoreWithSettings(store)}
            initialProfile={serializeAccountProfile({ ...user, plan })}
            planUsage={planUsage}
            legalPages={legalPageRows.map(serializeStorePage)}
          />
        </Suspense>
      </DashboardPageContent>
    </DashboardLayout>
  );
}