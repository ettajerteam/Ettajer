import { notFound, redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-session";
import { isPlatformAdmin } from "@/lib/admin/roles";

export {
  normalizeAdminEmail,
  getBootstrapAdminEmails,
  isBootstrapAdminEmail,
  resolveUserRole,
  isPlatformAdmin,
  ensureBootstrapAdminRole,
} from "@/lib/admin/roles";

export async function requireAdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!isPlatformAdmin(session.user)) notFound();
  return session;
}

export async function requireAdminApi() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
      session: null,
    };
  }
  if (!isPlatformAdmin(session.user)) {
    return {
      error: NextResponse.json({ message: "Forbidden" }, { status: 403 }),
      session: null,
    };
  }
  return { error: null, session };
}
