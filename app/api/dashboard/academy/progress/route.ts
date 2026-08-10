import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth-session";
import { USER_ROLE } from "@/lib/admin/constants";
import {
  getSubjectProgressForUser,
  listUserSubjectProgress,
  markLessonComplete,
  touchLessonProgress,
} from "@/lib/academy/progress";
import type { Session } from "next-auth";

const bodySchema = z.object({
  action: z.enum(["complete", "touch"]),
  subjectSlug: z.string().min(1),
  lessonSlug: z.string().min(1),
});

async function requireAcademyAccess(): Promise<
  { session: Session } | { error: NextResponse }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  }
  if (session.user.role !== USER_ROLE.ADMIN) {
    return {
      error: NextResponse.json(
        { message: "Academy is coming soon" },
        { status: 403 },
      ),
    };
  }
  return { session };
}

export async function GET(request: Request) {
  const access = await requireAcademyAccess();
  if ("error" in access) return access.error;

  const { searchParams } = new URL(request.url);
  const subjectSlug = searchParams.get("subjectSlug");

  if (subjectSlug) {
    const progress = await getSubjectProgressForUser(
      access.session.user!.id!,
      subjectSlug,
    );
    if (!progress) {
      return NextResponse.json({ message: "Subject not found" }, { status: 404 });
    }
    return NextResponse.json({ progress });
  }

  const progress = await listUserSubjectProgress(access.session.user!.id!);
  return NextResponse.json({ progress });
}

export async function POST(request: Request) {
  const access = await requireAcademyAccess();
  if ("error" in access) return access.error;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid body" }, { status: 400 });
  }

  const { action, subjectSlug, lessonSlug } = parsed.data;
  const userId = access.session.user!.id!;
  const progress =
    action === "complete"
      ? await markLessonComplete({ userId, subjectSlug, lessonSlug })
      : await touchLessonProgress({ userId, subjectSlug, lessonSlug });

  if (!progress) {
    return NextResponse.json(
      { message: "Subject or lesson not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ progress });
}
