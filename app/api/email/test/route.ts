import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/resend";

/**
 * Test Resend integration.
 * POST /api/email/test  (development only)
 * Body: { "to": "your@email.com" }
 */
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ message: "Not available in production" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const to = body.to ?? "ettajerteam@gmail.com";

    const result = await sendEmail({
      to,
      subject: "Ettajer domain email test",
      html: "<p>Your <strong>ettajer.com</strong> domain is configured correctly with Resend.</p>",
    });

    if (!result.success) {
      return NextResponse.json({ message: result.error ?? "Failed to send" }, { status: 500 });
    }

    return NextResponse.json({ message: `Email sent to ${to}` });
  } catch (error) {
    console.error("Test email error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to send" },
      { status: 500 }
    );
  }
}
