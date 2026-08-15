/**
 * Resend activation codes to password-only unverified users.
 * Skips disposable/typo/test addresses.
 *
 * Usage:
 *   npx tsx scripts/send-activation-queue.ts           # dry-run
 *   npx tsx scripts/send-activation-queue.ts --send    # deliver via Resend
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import {
  clearActivationAttempts,
  issueActivationCode,
} from "@/lib/account-activation";
import { sendActivationCodeEmail } from "@/lib/email/automations";
import { isResendConfigured } from "@/lib/resend";

const prisma = new PrismaClient();
const doSend = process.argv.includes("--send");

/** Obvious junk / unreachable — do not email. */
const SKIP_EMAILS = new Set([
  "elhaouzinacerallah@gmail.comna", // typo TLD
  "wqs6cmlyi6@fpklm.com", // disposable
  "pentest_ettajer_001@yopmail.com", // pentest
]);

function shouldSkip(email: string): string | null {
  const lower = email.toLowerCase();
  if (SKIP_EMAILS.has(lower)) return "junk/test";
  if (lower.endsWith(".comna") || lower.endsWith(".con")) return "typo domain";
  if (
    lower.endsWith("@yopmail.com") ||
    lower.endsWith("@mailinator.com") ||
    lower.endsWith("@fpklm.com") ||
    lower.endsWith("@tempmail.com")
  ) {
    return "disposable";
  }
  return null;
}

async function main() {
  const users = await prisma.user.findMany({
    where: {
      emailVerified: null,
      passwordHash: { not: null },
      accounts: { none: {} },
      NOT: { email: { endsWith: "@example.com" } },
    },
    select: {
      email: true,
      name: true,
      founderNumber: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const sendList: typeof users = [];
  const skipped: { email: string; reason: string }[] = [];

  for (const u of users) {
    const reason = shouldSkip(u.email);
    if (reason) skipped.push({ email: u.email, reason });
    else sendList.push(u);
  }

  console.log(doSend ? "Sending activation codes:" : "Dry-run (pass --send to deliver):");
  for (const u of sendList) {
    const founder = u.founderNumber != null ? ` #${u.founderNumber}` : "";
    console.log(`  ${u.email}${founder}${u.name ? ` — ${u.name}` : ""}`);
  }
  if (skipped.length) {
    console.log("\nSkipped:");
    for (const s of skipped) console.log(`  ${s.email} (${s.reason})`);
  }

  if (!doSend) {
    console.log(`\nWould email ${sendList.length} user(s); skipped ${skipped.length}.`);
    return;
  }

  if (!isResendConfigured()) {
    console.error("Resend is not configured (RESEND_API_KEY). Aborting.");
    process.exit(1);
  }

  let ok = 0;
  let fail = 0;
  for (const u of sendList) {
    await clearActivationAttempts(u.email);
    const code = await issueActivationCode(u.email);
    if (!code) {
      fail += 1;
      console.error("✗ issue failed", u.email);
      continue;
    }
    // Moroccan merchants — FR copy matches existing founder reminder script
    const success = await sendActivationCodeEmail(
      u.email,
      u.name ?? "Merchant",
      code,
      "fr",
    );
    if (success) {
      ok += 1;
      console.log("✓", u.email);
    } else {
      fail += 1;
      console.error("✗ send failed", u.email);
    }
  }

  console.log(`\nDone: ${ok} sent, ${fail} failed, ${skipped.length} skipped.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
