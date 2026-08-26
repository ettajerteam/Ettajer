import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { searchPlatformAdmin } from "@/lib/admin/platform-stats";

export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const results = await searchPlatformAdmin(q);
  return NextResponse.json(results);
}
