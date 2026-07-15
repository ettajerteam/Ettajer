import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { listCustomers } from "@/lib/customers";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { CustomersClient } from "@/components/customers/customers-client";

export const metadata = { title: "Customers" };

export default async function CustomersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({ where: { userId: session.user.id } });
  if (!store) redirect("/onboarding");

  const customers = await listCustomers(store.id);

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Customers"
        description="People who have ordered from your store"
      />
      <DashboardPageContent>
        <CustomersClient initialCustomers={customers} currency={store.currency} />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
