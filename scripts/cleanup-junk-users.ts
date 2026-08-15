/**
 * Delete obvious junk / unreachable password accounts that never verified.
 *
 * Usage:
 *   npx tsx scripts/cleanup-junk-users.ts           # dry-run
 *   npx tsx scripts/cleanup-junk-users.ts --apply   # delete
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const doApply = process.argv.includes("--apply");

const SKIP_EXACT = new Set([
  "elhaouzinacerallah@gmail.comna",
  "wqs6cmlyi6@fpklm.com",
  "pentest_ettajer_001@yopmail.com",
]);

function isJunk(email: string): string | null {
  const lower = email.toLowerCase();
  if (SKIP_EXACT.has(lower)) return "listed junk";
  if (lower.endsWith(".comna") || lower.endsWith(".con")) return "typo domain";
  if (
    lower.endsWith("@yopmail.com") ||
    lower.endsWith("@mailinator.com") ||
    lower.endsWith("@fpklm.com") ||
    lower.endsWith("@tempmail.com") ||
    lower.endsWith("@guerrillamail.com")
  ) {
    return "disposable";
  }
  return null;
}

async function main() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: { in: [...SKIP_EXACT] } },
        { email: { endsWith: ".comna" } },
        { email: { endsWith: "@yopmail.com" } },
        { email: { endsWith: "@fpklm.com" } },
        { email: { endsWith: "@mailinator.com" } },
        { email: { endsWith: "@tempmail.com" } },
      ],
      role: { not: "admin" },
    },
    select: {
      id: true,
      email: true,
      name: true,
      emailVerified: true,
      founderNumber: true,
      _count: { select: { stores: true } },
    },
  });

  const targets = users.filter((u) => isJunk(u.email));
  console.log(doApply ? "Deleting:" : "Dry-run (pass --apply to delete):");
  for (const u of targets) {
    console.log(
      `  ${u.email} — stores=${u._count.stores} founder=${u.founderNumber ?? "—"} verified=${Boolean(u.emailVerified)}`,
    );
  }

  if (!doApply) {
    console.log(`\nWould delete ${targets.length} account(s).`);
    return;
  }

  let n = 0;
  for (const u of targets) {
    await prisma.user.delete({ where: { id: u.id } });
    n += 1;
    console.log("✓ deleted", u.email);
  }
  console.log(`\nDeleted ${n} account(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
