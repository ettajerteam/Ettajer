/**
 * Mark Google-linked accounts as email-verified.
 * Prisma adapter / OAuth sign-in historically left emailVerified null;
 * One Tap already set it. Safe to re-run (only updates null rows).
 *
 * Usage:
 *   npx tsx scripts/backfill-google-email-verified.ts           # dry-run
 *   npx tsx scripts/backfill-google-email-verified.ts --apply   # write
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const doApply = process.argv.includes("--apply");

async function main() {
  const candidates = await prisma.user.findMany({
    where: {
      emailVerified: null,
      accounts: { some: { provider: "google" } },
      NOT: { email: { endsWith: "@example.com" } },
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  console.log(
    doApply
      ? `Applying emailVerified backfill to ${candidates.length} Google user(s)…`
      : `Dry-run: would verify ${candidates.length} Google user(s) (pass --apply to write):`,
  );

  for (const u of candidates.slice(0, 20)) {
    console.log(`  ${u.email}${u.name ? ` (${u.name})` : ""}`);
  }
  if (candidates.length > 20) {
    console.log(`  … and ${candidates.length - 20} more`);
  }

  if (!doApply) {
    console.log("\nNo changes written.");
    return;
  }

  const result = await prisma.user.updateMany({
    where: {
      emailVerified: null,
      accounts: { some: { provider: "google" } },
      NOT: { email: { endsWith: "@example.com" } },
    },
    data: { emailVerified: new Date() },
  });

  console.log(`\nUpdated ${result.count} user(s).`);

  const remaining = await prisma.user.count({
    where: {
      emailVerified: null,
      accounts: { some: { provider: "google" } },
      NOT: { email: { endsWith: "@example.com" } },
    },
  });
  console.log(`Remaining Google unverified: ${remaining}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
