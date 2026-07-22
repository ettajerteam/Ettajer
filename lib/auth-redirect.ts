import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { USER_STATUS } from "@/lib/founder";
import { isPlatformAdmin } from "@/lib/admin/roles";

/**
 * After sign-in, route merchants based on account status and store setup.
 */
export async function getPostAuthRedirect(fallback = "/dashboard") {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return "/login";

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      status: true,
      founderNumber: true,
      email: true,
      emailVerified: true,
      role: true,
    },
  });

  if (user && !user.emailVerified) {
    return `/activate?email=${encodeURIComponent(user.email)}`;
  }

  const isAdmin = isPlatformAdmin({ role: user?.role, email: user?.email });

  if (!isAdmin && user?.status === USER_STATUS.WAITING && user.founderNumber) {
    return "/early-access";
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
