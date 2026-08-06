/**
 * Email Salwa a secure official name-change link (support follow-up).
 *
 *   npx tsx --env-file=.env scripts/send-salwa-name-change-invite.ts
 */
import { PrismaClient } from "@prisma/client";
import {
  buildNameChangeUrl,
  getUserNameByEmail,
  issueNameChangeToken,
} from "../lib/account-name-change";
import { sendNameChangeInviteEmail } from "../lib/email/automations";
import { getAppUrl } from "../lib/email/base-template";
import { isResendConfigured } from "../lib/resend";

const EMAIL = "sssalwa384@gmail.com";

async function main() {
  const prisma = new PrismaClient();

  try {
    if (!isResendConfigured()) {
      throw new Error("RESEND_API_KEY is not configured — cannot send email.");
    }

    const user = await getUserNameByEmail(EMAIL);
    if (!user) {
      throw new Error(`No user found for ${EMAIL}`);
    }

    const token = await issueNameChangeToken(EMAIL);
    if (!token) {
      throw new Error("Could not issue name-change token");
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      getAppUrl() ||
      "https://www.ettajer.com";
    const url = buildNameChangeUrl(baseUrl, EMAIL, token);
    const currentName = user.name?.trim() || "Salwa Ss";
    const greetingName = currentName.split(/\s+/)[0] || "Salwa";

    const sent = await sendNameChangeInviteEmail({
      email: EMAIL,
      name: greetingName,
      currentName,
      url,
      locale: "ar",
    });

    if (!sent) {
      throw new Error("Email send failed — check Resend logs");
    }

    await prisma.supportMessage.updateMany({
      where: {
        email: EMAIL,
        status: { in: ["new", "reviewing"] },
      },
      data: { status: "reviewing" },
    });

    console.log(
      JSON.stringify(
        {
          ok: true,
          email: EMAIL,
          currentName,
          url,
          message: "Name-change invite sent (Arabic).",
        },
        null,
        2
      )
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
