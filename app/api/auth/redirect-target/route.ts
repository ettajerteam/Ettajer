import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPostAuthRedirect } from "@/lib/auth-redirect";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ redirect: "/login" });
  }

  const redirect = await getPostAuthRedirect("/dashboard");
  return NextResponse.json({ redirect });
}
