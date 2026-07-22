/**
 * Email founders: platform development is done — beta testing the web now.
 *
 * Usage:
 *   npx tsx scripts/send-beta-testing-announce.ts           # dry-run
 *   npx tsx scripts/send-beta-testing-announce.ts --send    # send via Resend
 *   npx tsx scripts/send-beta-testing-announce.ts --send --to you@email.com
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { sendFounderBetaTestingEmail } from "@/lib/email/automations";
import { parseEmailLocale } from "@/lib/email/email-locale";

const prisma = new PrismaClient();
const doSend = process.argv.includes("--send");
const toIdx = process.argv.indexOf("--to");
const onlyTo = toIdx >= 0 ? process.argv[toIdx + 1]?.trim().toLowerCase() : null;
const founderIdx = process.argv.indexOf("--founder");
const founderOverride =
  founderIdx >= 0 ? Number(process.argv[founderIdx + 1]) : null;
const localeIdx = process.argv.indexOf("--locale");
const localeOverride =
  localeIdx >= 0 ? parseEmailLocale(process.argv[localeIdx + 1]) : null;

async function main() {
  if (onlyTo && founderOverride) {
    console.log(doSend ? "Sending test:" : "Dry-run test:");
    console.log(`  ${onlyTo} as founder #${founderOverride}`);
    if (!doSend) return;
    const success = await sendFounderBetaTestingEmail(
      onlyTo,
      "Founder",
      founderOverride,
      localeOverride ?? "fr",
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
    select: {
      email: true,
      name: true,
      founderNumber: true,
      stores: { select: { language: true }, take: 1 },
    },
    orderBy: { founderNumber: "asc" },
  });

  if (founders.length === 0) {
    console.log("No founders matched.");
    return;
  }

  console.log(doSend ? "Sending:" : "Dry-run (pass --send to deliver):");
  for (const f of founders) {
    const lang = f.stores[0]?.language || "fr";
    console.log(`  #${f.founderNumber} ${f.email} (${lang})`);
  }

  if (!doSend) {
    console.log(`\nWould email ${founders.length} founder(s).`);
    return;
  }

  let ok = 0;
  let fail = 0;

  for (const f of founders) {
    if (f.founderNumber == null) continue;
    const locale =
      localeOverride ?? parseEmailLocale(f.stores[0]?.language || "fr");
    const success = await sendFounderBetaTestingEmail(
      f.email,
      f.name,
      f.founderNumber,
      locale,
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
