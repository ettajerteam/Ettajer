import { requireAdminPage } from "@/lib/admin/auth";
import {
  getDrSaraSnapshot,
  snapshotToBriefing,
} from "@/lib/intelligence";
import { buildSaraExperienceViewModel } from "@/lib/intelligence/presentation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { DrSaraPage } from "@/components/admin/dr-sara-page";

export const metadata = { title: "Dr Sara — Ettajer Console" };

export default async function AdminSaraPage() {
  await requireAdminPage();
  const snapshot = await getDrSaraSnapshot();
  const briefing = snapshotToBriefing(snapshot);
  const experience = buildSaraExperienceViewModel(snapshot);

  return (
    <AdminLayout immersive>
      <DrSaraPage briefing={briefing} experience={experience} />
    </AdminLayout>
  );
}
