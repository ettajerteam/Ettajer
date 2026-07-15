import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { listGiftCards } from "@/lib/gift-cards";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { GiftCardsClient } from "@/components/gift-cards/gift-cards-client";

export const metadata = { title: "Gift Cards" };

export default async function GiftCardsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const store = await prisma.store.findFirst({ where: { userId: session.user.id } });
  if (!store) redirect("/onboarding");

  const cards = await listGiftCards(store.id);

  return (
    <DashboardLayout>
      <DashboardHeader title="Gift cards" description="Create and manage gift cards" />
      <DashboardPageContent>
        <GiftCardsClient
          initial={cards.map((c) => ({
            ...c,
            expiresAt: c.expiresAt?.toISOString() ?? null,
          }))}
          currency={store.currency}
        />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
