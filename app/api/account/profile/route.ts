import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import {
  isValidDisplayName,
  normalizeDisplayName,
} from "@/lib/account-name-change";
import { loadUserPlan, serializeAccountProfile } from "@/lib/account-profile";
import { isSignupPasswordValid } from "@/lib/validations/signup";
import { logPlatformError } from "@/lib/admin/platform-errors";

export const dynamic = "force-dynamic";

const profileUpdateSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  marketingEmails: z.boolean().optional(),
  image: z
    .union([z.string().url(), z.string().startsWith("/"), z.literal("")])
    .nullable()
    .optional(),
  currentPassword: z.string().max(128).optional(),
  newPassword: z.string().max(128).optional(),
  confirmPassword: z.string().max(128).optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        marketingEmails: true,
        founderNumber: true,
        passwordHash: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Account not found" }, { status: 404 });
    }

    const plan = await loadUserPlan(user.id);
    return NextResponse.json({ profile: serializeAccountProfile({ ...user, plan }) });
  } catch (error) {
    await logPlatformError({
      source: "api/account/profile",
      message: error instanceof Error ? error.message : "Profile fetch failed",
      stack: error instanceof Error ? error.stack : undefined,
      path: "/api/account/profile",
    });
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message ?? "Invalid request" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        marketingEmails: true,
        founderNumber: true,
        passwordHash: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Account not found" }, { status: 404 });
    }

    const data: {
      name?: string;
      marketingEmails?: boolean;
      image?: string | null;
      passwordHash?: string;
      passwordUpdatedAt?: Date;
    } = {};

    if (parsed.data.name !== undefined) {
      const name = normalizeDisplayName(parsed.data.name);
      if (!isValidDisplayName(name)) {
        return NextResponse.json(
          {
            message:
              "Use your real name — letters and spaces only (2–80 characters).",
          },
          { status: 400 }
        );
      }
      data.name = name;
    }

    if (parsed.data.marketingEmails !== undefined) {
      data.marketingEmails = parsed.data.marketingEmails;
    }

    if (parsed.data.image !== undefined) {
      data.image = parsed.data.image ? parsed.data.image : null;
    }

    const wantsPasswordChange = Boolean(parsed.data.newPassword?.trim());
    if (wantsPasswordChange) {
      const newPassword = parsed.data.newPassword!.trim();
      const confirmPassword = parsed.data.confirmPassword?.trim() ?? "";

      if (!isSignupPasswordValid(newPassword)) {
        return NextResponse.json(
          {
            message:
              "Password must be 8–128 characters and include a letter and a number.",
          },
          { status: 400 }
        );
      }
      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          { message: "New passwords do not match." },
          { status: 400 }
        );
      }

      if (user.passwordHash) {
        const current = parsed.data.currentPassword ?? "";
        if (!current) {
          return NextResponse.json(
            { message: "Enter your current password to set a new one." },
            { status: 400 }
          );
        }
        const ok = await bcrypt.compare(current, user.passwordHash);
        if (!ok) {
          return NextResponse.json(
            { message: "Current password is incorrect." },
            { status: 400 }
          );
        }
      }

      data.passwordHash = await bcrypt.hash(newPassword, 12);
      data.passwordUpdatedAt = new Date();
    }

    if (Object.keys(data).length === 0) {
      const plan = await loadUserPlan(user.id);
      return NextResponse.json({ profile: serializeAccountProfile({ ...user, plan }) });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        marketingEmails: true,
        founderNumber: true,
        passwordHash: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    return NextResponse.json({
      profile: serializeAccountProfile({ ...updated, plan: await loadUserPlan(updated.id) }),
      message: wantsPasswordChange
        ? "Profile and password updated"
        : "Profile updated",
    });
  } catch (error) {
    await logPlatformError({
      source: "api/account/profile",
      message: error instanceof Error ? error.message : "Profile update failed",
      stack: error instanceof Error ? error.stack : undefined,
      path: "/api/account/profile",
    });
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}
