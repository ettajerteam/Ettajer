import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { DeveloperConsoleShell } from "@/components/developer/developer-console-shell";
import { DeveloperActivityClient } from "@/components/developer/developer-activity-client";

export const metadata = {
  title: "Activity — Ettajer for Developers",
};

export default async function DeveloperActivityPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/developer/activity");
  }

  return (
    <DeveloperConsoleShell>
      <DeveloperActivityClient />
    </DeveloperConsoleShell>
  );
}
