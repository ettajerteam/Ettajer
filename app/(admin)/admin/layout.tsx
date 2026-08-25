import { AdminDbNotice } from "@/components/admin/admin-db-notice";

export default function AdminSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminDbNotice />
      {children}
    </>
  );
}
