import { NextResponse } from "next/server";
import { normalizeEmail } from "@/lib/password-reset";
import { getResendStatus } from "@/lib/account-activation";

export async function GET(request: Request) {
  const email = new URL(request.url).searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const status = await getResendStatus(normalizeEmail(email));

  return NextResponse.json(status);
}
