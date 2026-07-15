import { NextResponse } from "next/server";
import { z } from "zod";
import {
  AUTH_SECURITY,
  getLockoutRemainingMinutes,
  getSecurityUser,
  isAccountLocked,
} from "@/lib/auth-security";
import { normalizeEmail } from "@/lib/password-reset";

const schema = z.object({
  email: z.string().trim().email(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ locked: false }, { status: 400 });
    }

    const email = normalizeEmail(parsed.data.email);
    const user = await getSecurityUser(email);

    if (!user || !isAccountLocked(user)) {
      return NextResponse.json({ locked: false });
    }

    return NextResponse.json({
      locked: true,
      minutesRemaining: getLockoutRemainingMinutes(user),
      maxAttempts: AUTH_SECURITY.maxFailedLoginAttempts,
    });
  } catch (error) {
    console.error("Check lock error:", error);
    return NextResponse.json({ locked: false }, { status: 500 });
  }
}
