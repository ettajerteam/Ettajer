/**
 * Remind unverified founders to verify email before launch.
 *
 * Usage:
 *   npx tsx scripts/send-verify-reminder.ts           # dry-run
 *   npx tsx scripts/send-verify-reminder.ts --send    # send via Resend
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { sendVerifyEmailReminderEmail } from "@/lib/email/automations";

const prisma = new PrismaClient();
const doSend = process.argv.includes("--send");

async function main() {
  const founders = await prisma.user.findMany({
    where: {
      founderNumber: { not: null },
      role: { not: "admin" },
      emailVerified: null,
      NOT: { email: { endsWith: "@example.com" } },
    },
    select: { email: true, name: true, founderNumber: true },
    orderBy: { founderNumber: "asc" },
  });

  if (founders.length === 0) {
    console.log("No unverified founders.");
    return;
  }

  console.log(doSend ? "Sending:" : "Dry-run (pass --send to deliver):");
  for (const f of founders) {
    console.log(`  #${f.founderNumber} ${f.email}`);
  }

  if (!doSend) {
    console.log(`\nWould email ${founders.length} founder(s).`);
    return;
  }

  let ok = 0;
  let fail = 0;
  for (const f of founders) {
    const success = await sendVerifyEmailReminderEmail(f.email, f.name, "fr");
    if (success) {
      ok += 1;
      console.log("✓", f.email);
    } else {
      fail += 1;
      console.error("✗", f.email);
    }
  }
  console.log(`\nDone: ${ok} sent, ${fail} failed.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
