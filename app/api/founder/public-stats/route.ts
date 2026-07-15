import { NextResponse } from "next/server";
import { getFounderCount, MAX_FOUNDERS } from "@/lib/founder";

export async function GET() {
  const founderCount = await getFounderCount();
  const spotsLeft = Math.max(0, MAX_FOUNDERS - founderCount);

  return NextResponse.json({
    founderCount,
    maxFounders: MAX_FOUNDERS,
    spotsLeft,
    isFull: founderCount >= MAX_FOUNDERS,
  });
}
