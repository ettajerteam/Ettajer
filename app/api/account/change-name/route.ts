import { NextResponse } from "next/server";
import {
  changeNamePreviewSchema,
  changeNameSubmitSchema,
} from "@/lib/validations/account-name";
import {
  consumeNameChangeToken,
  getUserNameByEmail,
  isValidDisplayName,
  normalizeDisplayName,
  normalizeEmail,
  updateUserDisplayName,
  validateNameChangeToken,
} from "@/lib/account-name-change";
import { sendNameChangeConfirmedEmail } from "@/lib/email/automations";
import { resolveRequestEmailLocale } from "@/lib/email/email-locale";
import { isResendConfigured } from "@/lib/resend";
import { prisma } from "@/lib/db";
import { logPlatformError } from "@/lib/admin/platform-errors";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = changeNamePreviewSchema.safeParse({
      email: searchParams.get("email"),
      token: searchParams.get("token"),
    });

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid link." }, { status: 400 });
    }

    const email = normalizeEmail(parsed.data.email);
    const valid = await validateNameChangeToken(email, parsed.data.token);
    if (!valid) {
      return NextResponse.json(
        { message: "This link is invalid or has expired." },
        { status: 400 }
      );
    }

    const user = await getUserNameByEmail(email);
    if (!user) {
      return NextResponse.json({ message: "Account not found." }, { status: 404 });
    }

    return NextResponse.json({
      email: user.email,
      currentName: user.name,
      founderNumber: user.founderNumber,
    });
  } catch (error) {
    await logPlatformError({
      source: "api/account/change-name",
      message: error instanceof Error ? error.message : "Preview failed",
      stack: error instanceof Error ? error.stack : undefined,
      path: "/api/account/change-name",
    });
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = changeNameSubmitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message ?? "Invalid request." },
        { status: 400 }
      );
    }

    const email = normalizeEmail(parsed.data.email);
    const newName = normalizeDisplayName(parsed.data.newName);

    if (!isValidDisplayName(newName)) {
      return NextResponse.json(
        {
          message:
            "Use your real name — letters and spaces only (2–80 characters).",
        },
        { status: 400 }
      );
    }

    const valid = await validateNameChangeToken(email, parsed.data.token);
    if (!valid) {
      return NextResponse.json(
        { message: "This link is invalid or has expired." },
        { status: 400 }
      );
    }

    const updated = await updateUserDisplayName(email, newName);
    if (!updated) {
      return NextResponse.json({ message: "Could not update name." }, { status: 400 });
    }

    await consumeNameChangeToken(email, parsed.data.token);

    // Close matching open support tickets about this account
    await prisma.supportMessage.updateMany({
      where: {
        email,
        status: { in: ["new", "reviewing"] },
      },
      data: { status: "resolved" },
    });

    const locale = resolveRequestEmailLocale(request, body?.locale);
    if (isResendConfigured()) {
      await sendNameChangeConfirmedEmail({
        email,
        name: updated.name,
        previousName: updated.previousName,
        locale,
      });
    }

    return NextResponse.json({
      message: "Your name was updated successfully.",
      name: updated.name,
      previousName: updated.previousName,
    });
  } catch (error) {
    await logPlatformError({
      source: "api/account/change-name",
      message: error instanceof Error ? error.message : "Update failed",
      stack: error instanceof Error ? error.stack : undefined,
      path: "/api/account/change-name",
    });
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}
