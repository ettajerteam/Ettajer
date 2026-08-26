import { requireAdminPage } from "@/lib/admin/auth";
import {
  getDrSaraSnapshot,
  snapshotToBriefing,
} from "@/lib/intelligence";
import { AdminLayout } from "@/components/admin/admin-layout";
import { DrSaraPage } from "@/components/admin/dr-sara-page";

export const metadata = { title: "Dr Sara — Ettajer Console" };

export default async function AdminSaraPage() {
  await requireAdminPage();
  const snapshot = await getDrSaraSnapshot();
  const briefing = snapshotToBriefing(snapshot);

  return (
    <AdminLayout>
      <DrSaraPage briefing={briefing} />
    </AdminLayout>
  );
}
