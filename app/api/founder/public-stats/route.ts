import { NextResponse } from "next/server";
import { getFounderCount, MAX_FOUNDERS } from "@/lib/founder";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const founderCount = await getFounderCount();
    const spotsLeft = Math.max(0, MAX_FOUNDERS - founderCount);

    return NextResponse.json({
      founderCount,
      maxFounders: MAX_FOUNDERS,
      spotsLeft,
      isFull: founderCount >= MAX_FOUNDERS,
    });
  } catch (error) {
    console.error("[founder/public-stats]", error);

    return NextResponse.json(
      {
        founderCount: 0,
        maxFounders: MAX_FOUNDERS,
        spotsLeft: MAX_FOUNDERS,
        isFull: false,
        dbError: process.env.NODE_ENV === "development",
      },
      { status: 503 },
    );
  }
}
