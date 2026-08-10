import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { DeveloperConsoleShell } from "@/components/developer/developer-console-shell";
import { DeveloperHelpClient } from "@/components/developer/developer-help-client";

export const metadata = {
  title: "Help — Ettajer for Developers",
  description:
    "Tutorials, articles, and docs for OAuth, MCP, and the developer API.",
};

export default async function DeveloperHelpPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/developer/help");
  }

  return (
    <DeveloperConsoleShell>
      <DeveloperHelpClient />
    </DeveloperConsoleShell>
  );
}
