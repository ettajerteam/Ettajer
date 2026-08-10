import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { USER_ROLE } from "@/lib/admin/constants";
import { AcademyShell } from "@/components/academy/academy-shell";
import { AcademyEntryTransition } from "@/components/academy/academy-entry-transition";
import { AcademyNavProvider } from "@/components/academy/academy-nav-provider";

export default async function AcademyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/academy");
  }

  // Academy is admin-preview only until public launch
  if (session.user.role !== USER_ROLE.ADMIN) {
    redirect("/dashboard?academy=coming-soon");
  }

  return (
    <AcademyShell>
      <AcademyNavProvider>
        <AcademyEntryTransition>{children}</AcademyEntryTransition>
      </AcademyNavProvider>
    </AcademyShell>
  );
}
