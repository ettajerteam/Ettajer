import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedStore } from "@/lib/products";
import {
  cancelEmailJobs,
  getEmailQueueStats,
  listEmailJobs,
  serializeEmailJob,
  EMAIL_JOB_STATUSES,
} from "@/lib/email-marketing/email-queue";
import type { EmailJobStatus } from "@/lib/email-marketing/email-queue-types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const statusParam =
      new URL(request.url).searchParams.get("status")?.trim() || "all";
    const status =
      statusParam === "all" ||
      (EMAIL_JOB_STATUSES as readonly string[]).includes(statusParam)
        ? (statusParam as EmailJobStatus | "all")
        : "all";

    const [stats, jobs] = await Promise.all([
      getEmailQueueStats(store.id),
      listEmailJobs(store.id, { status, take: 75 }),
    ]);

    return NextResponse.json({
      stats,
      jobs: jobs.map(serializeEmailJob),
    });
  } catch (error) {
    console.error("[email/queue GET]", error);
    return NextResponse.json(
      { message: "Failed to load email queue" },
      { status: 500 }
    );
  }
}

const cancelSchema = z.object({
  jobIds: z.array(z.string().min(1)).max(200).optional(),
  newsletterSendId: z.string().min(1).optional(),
});

export async function POST(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const parsed = cancelSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }
    if (!parsed.data.jobIds?.length && !parsed.data.newsletterSendId) {
      return NextResponse.json(
        { message: "Provide jobIds or newsletterSendId" },
        { status: 400 }
      );
    }

    const cancelled = await cancelEmailJobs({
      storeId: store.id,
      jobIds: parsed.data.jobIds,
      newsletterSendId: parsed.data.newsletterSendId,
    });

    return NextResponse.json({ ok: true, cancelled });
  } catch (error) {
    console.error("[email/queue POST]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to cancel jobs",
      },
      { status: 500 }
    );
  }
}
