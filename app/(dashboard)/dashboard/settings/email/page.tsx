import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";

export const metadata = { title: "Email" };

/** Legacy route — Email lives inside Settings as ?tab=email */
export default async function SettingsEmailPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!store) redirect("/onboarding");

  redirect("/dashboard/settings?tab=email");
}
