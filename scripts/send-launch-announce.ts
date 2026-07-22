/**
 * Email waiting founders: platform opens 23 July 2026.
 *
 * Usage:
 *   npx tsx scripts/send-launch-announce.ts           # dry-run
 *   npx tsx scripts/send-launch-announce.ts --send    # send via Resend
 *   npx tsx scripts/send-launch-announce.ts --send --to you@email.com
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { sendFounderLaunchAnnounceEmail } from "@/lib/email/automations";

const prisma = new PrismaClient();
const doSend = process.argv.includes("--send");
const toIdx = process.argv.indexOf("--to");
const onlyTo = toIdx >= 0 ? process.argv[toIdx + 1]?.trim().toLowerCase() : null;
const founderIdx = process.argv.indexOf("--founder");
const founderOverride =
  founderIdx >= 0 ? Number(process.argv[founderIdx + 1]) : null;

async function main() {
  if (onlyTo && founderOverride) {
    console.log(doSend ? "Sending test:" : "Dry-run test:");
    console.log(`  ${onlyTo} as founder #${founderOverride}`);
    if (!doSend) return;
    const success = await sendFounderLaunchAnnounceEmail(
      onlyTo,
      "Founder",
      founderOverride,
      "fr",
    );
    console.log(success ? "✓ sent" : "✗ failed");
    return;
  }

  const founders = await prisma.user.findMany({
    where: {
      founderNumber: { not: null },
      role: { not: "admin" },
      NOT: { email: { endsWith: "@example.com" } },
      ...(onlyTo ? { email: onlyTo } : {}),
    },
    select: { email: true, name: true, founderNumber: true },
    orderBy: { founderNumber: "asc" },
  });

  if (founders.length === 0) {
    console.log("No founders matched.");
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
    if (f.founderNumber == null) continue;
    const success = await sendFounderLaunchAnnounceEmail(
      f.email,
      f.name,
      f.founderNumber,
      "fr",
    );
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
