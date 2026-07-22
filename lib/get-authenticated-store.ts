import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";

/** Server-only: never import this from client components. */
export async function getAuthenticatedStore() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
  });

  return store;
}
