/**
 * List waiting founders who still need email verification (launch blockers).
 * Usage: node scripts/list-unverified-founders.mjs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  const rows = await prisma.user.findMany({
    where: {
      founderNumber: { not: null },
      role: { not: "admin" },
      OR: [{ emailVerified: null }, { status: "waiting" }],
    },
    select: {
      email: true,
      name: true,
      founderNumber: true,
      status: true,
      emailVerified: true,
      lastLoginAt: true,
    },
    orderBy: { founderNumber: "asc" },
  });

  const unverified = rows.filter((r) => !r.emailVerified);
  const verifiedWaiting = rows.filter((r) => r.emailVerified && r.status === "waiting");

  console.log("Unverified founders (must activate email before launch unlock):");
  if (unverified.length === 0) console.log("  (none)");
  for (const u of unverified) {
    console.log(
      `  #${u.founderNumber} ${u.email} | ${u.name ?? "-"} | status=${u.status}`,
    );
  }

  console.log(`\nVerified but still waiting: ${verifiedWaiting.length}`);
  console.log(`Unverified: ${unverified.length}`);
} catch (error) {
  console.error(error);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
