import { requireAdminPage } from "@/lib/admin/auth";
import { getDrSaraBriefing } from "@/lib/intelligence";
import { AdminLayout } from "@/components/admin/admin-layout";
import { DrSaraPage } from "@/components/admin/dr-sara-page";

export const metadata = { title: "Dr Sara — Ettajer Console" };

export default async function AdminSaraPage() {
  await requireAdminPage();
  const briefing = await getDrSaraBriefing();

  return (
    <AdminLayout>
      <DrSaraPage briefing={briefing} />
    </AdminLayout>
  );
}
