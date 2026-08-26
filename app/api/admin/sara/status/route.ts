import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { getDrSaraCriticalCount } from "@/lib/intelligence";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const criticalCount = await getDrSaraCriticalCount();
    return NextResponse.json({ criticalCount });
  } catch {
    return NextResponse.json({ criticalCount: 0 });
  }
}
