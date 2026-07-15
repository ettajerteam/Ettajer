import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-session";
import { getFounderCount, getUserFounderProfile, USER_STATUS } from "@/lib/founder";
import { getRecentFounderCount, buildWaitingIntelligence } from "@/lib/founder/waiting-intelligence";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserFounderProfile(session.user.id);
  if (!user?.founderNumber || user.status !== USER_STATUS.WAITING) {
    return NextResponse.json({ message: "Not a waiting founder" }, { status: 403 });
  }

  const [founderCount, foundersJoinedRecently] = await Promise.all([
    getFounderCount(),
    getRecentFounderCount(7),
  ]);

  const intelligence = buildWaitingIntelligence({
    name: user.name ?? "Founder",
    email: user.email,
    founderNumber: user.founderNumber,
    founderCount,
    foundersJoinedRecently,
    joinedAt: user.createdAt,
    isReturning: true,
  });

  return NextResponse.json({
    founderCount,
    foundersJoinedRecently,
    launchProgress: intelligence.launchProgress,
    spotsLeft: intelligence.spotsLeft,
    momentumMessage: intelligence.momentumMessage,
    estimatedLaunch: intelligence.estimatedLaunch,
  });
}
