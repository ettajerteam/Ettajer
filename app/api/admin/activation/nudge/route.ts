import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin/auth";
import { logAdminAction } from "@/lib/admin/audit";
import { runMerchantActivationDrip } from "@/lib/admin/activation-drip";
import { isResendConfigured } from "@/lib/resend";

const bodySchema = z.object({
  kind: z.enum(["first_product", "share_store", "both"]).default("both"),
  dryRun: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  const { error, session } = await requireAdminApi();
  if (error) return error;

  const raw = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.errors[0]?.message ?? "Invalid body" },
      { status: 400 },
    );
  }

  const { dryRun, kind } = parsed.data;
  if (!dryRun && !isResendConfigured()) {
    return NextResponse.json(
      { message: "Resend is not configured." },
      { status: 503 },
    );
  }

  const summary = await runMerchantActivationDrip({
    dryRun,
    maxFirstProduct: kind === "share_store" ? 0 : 40,
    maxShareStore: kind === "first_product" ? 0 : 40,
  });

  await logAdminAction({
    actorId: session!.user.id,
    actorEmail: session!.user.email ?? "admin",
    action: "activation.nudge",
    targetType: "platform",
    metadata: { kind, dryRun, summary },
  });

  return NextResponse.json({ ok: true, kind, dryRun, summary });
}
