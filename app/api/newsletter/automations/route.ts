import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Legacy route — use /api/email/automations */
export async function GET() {
  return NextResponse.redirect(
    new URL("/api/email/automations", process.env.NEXTAUTH_URL || "http://localhost:3000")
  );
}

export async function PUT() {
  return NextResponse.json(
    {
      message:
        "Newsletter automations moved to Email Marketing. Use /api/email/automations.",
    },
    { status: 410 }
  );
}
