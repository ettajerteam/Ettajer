import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { USER_STATUS } from "@/lib/founder";

/**
 * After sign-in, send merchants straight to dashboard or onboarding.
 * Nobody waits — waiting accounts are activated automatically.
 */
export async function getPostAuthRedirect(fallback = "/dashboard") {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return "/login";

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      status: true,
      email: true,
      emailVerified: true,
    },
  });

  if (user && !user.emailVerified) {
    return `/activate?email=${encodeURIComponent(user.email)}`;
  }

  if (user && user.status !== USER_STATUS.ACTIVE) {
    await prisma.user
      .update({
        where: { id: user.id },
        data: { status: USER_STATUS.ACTIVE },
      })
      .catch(() => null);
  }

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
    select: { id: true },
  });

  return store ? fallback : "/onboarding";
}

export async function redirectAfterAuth(fallback = "/dashboard") {
  redirect(await getPostAuthRedirect(fallback));
}
