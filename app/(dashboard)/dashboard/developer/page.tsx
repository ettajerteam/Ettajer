import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { DeveloperConsoleShell } from "@/components/developer/developer-console-shell";
import { DeveloperAppsClient } from "@/components/developer/developer-apps-client";

export const metadata = {
  title: "Ettajer for Developers",
  description: "Manage OAuth apps, API keys, and AI integrations for your Ettajer store.",
};

export default async function DeveloperPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/dashboard/developer");

  return (
    <DeveloperConsoleShell>
      <DeveloperAppsClient />
    </DeveloperConsoleShell>
  );
}
