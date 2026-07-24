/**
 * Resend corrected founder cards (readable text/numbers) to all founders.
 *
 * Usage:
 *   npx tsx scripts/resend-founder-cards.ts              # dry-run
 *   npx tsx scripts/resend-founder-cards.ts --send       # send to everyone
 *   npx tsx scripts/resend-founder-cards.ts --send --to you@email.com
 *   npx tsx scripts/resend-founder-cards.ts --send --from 1 --to-number 10
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { sendFounderCardResendEmail } from "@/lib/email/automations";
import { parseEmailLocale } from "@/lib/email/email-locale";
import { isResendConfigured } from "@/lib/resend";

const prisma = new PrismaClient();
const doSend = process.argv.includes("--send");
const toIdx = process.argv.indexOf("--to");
const onlyTo = toIdx >= 0 ? process.argv[toIdx + 1]?.trim().toLowerCase() : null;
const fromIdx = process.argv.indexOf("--from");
const fromNumber = fromIdx >= 0 ? Number(process.argv[fromIdx + 1]) : null;
const toNumberIdx = process.argv.indexOf("--to-number");
const toNumber = toNumberIdx >= 0 ? Number(process.argv[toNumberIdx + 1]) : null;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  if (doSend && !isResendConfigured()) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const founders = await prisma.user.findMany({
    where: {
      founderNumber: { not: null },
      emailVerified: { not: null },
      NOT: { email: { endsWith: "@example.com" } },
      ...(onlyTo ? { email: onlyTo } : {}),
      ...(fromNumber != null || toNumber != null
        ? {
            founderNumber: {
              ...(fromNumber != null ? { gte: fromNumber } : {}),
              ...(toNumber != null ? { lte: toNumber } : {}),
            },
          }
        : {}),
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

  console.log(doSend ? "Sending corrected cards:" : "Dry-run (pass --send to deliver):");
  for (const f of founders) {
    console.log(`  #${String(f.founderNumber).padStart(4, "0")} ${f.email}`);
  }

  if (!doSend) {
    console.log(`\nWould email ${founders.length} founder(s).`);
    return;
  }

  let ok = 0;
  let fail = 0;

  for (const f of founders) {
    if (f.founderNumber == null) continue;
    const locale = parseEmailLocale(f.stores[0]?.language || "fr");
    const success = await sendFounderCardResendEmail(
      f.email,
      f.name ?? "Founder",
      f.founderNumber,
      locale,
    );
    if (success) {
      ok += 1;
      console.log("✓", `#${f.founderNumber}`, f.email);
    } else {
      fail += 1;
      console.error("✗", `#${f.founderNumber}`, f.email);
    }
    // Stay under Resend rate limits while generating PNG/PDF
    await sleep(700);
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
