/**
 * Delete leftover test accounts (@example.com, test-*@...).
 * Keeps admins and real founder emails.
 *
 * Usage:
 *   node scripts/cleanup-test-users.mjs           # dry-run
 *   node scripts/cleanup-test-users.mjs --delete  # execute
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const doDelete = process.argv.includes("--delete");

function isTestEmail(email) {
  const e = email.toLowerCase();
  if (e.endsWith("@example.com")) return true;
  if (e.startsWith("test+") || e.startsWith("test-") || e.startsWith("test.")) return true;
  if (e.includes("+test@")) return true;
  return false;
}

try {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, founderNumber: true },
    orderBy: { createdAt: "asc" },
  });

  const targets = users.filter(
    (u) => u.role !== "admin" && isTestEmail(u.email),
  );

  if (targets.length === 0) {
    console.log("No test users found.");
    process.exit(0);
  }

  console.log(doDelete ? "Deleting:" : "Dry-run (pass --delete to remove):");
  for (const u of targets) {
    console.log(`  ${u.email} | ${u.name ?? "-"} | #${u.founderNumber ?? "-"}`);
  }

  if (!doDelete) {
    console.log(`\n${targets.length} test user(s) would be removed.`);
    process.exit(0);
  }

  for (const u of targets) {
    const email = u.email.toLowerCase();
    await prisma.loginAttempt.deleteMany({ where: { email } });
    await prisma.verificationToken.deleteMany({
      where: {
        OR: [
          { identifier: { contains: email } },
          { identifier: `account-activation:${email}` },
          { identifier: `activation-resend:${email}` },
          { identifier: `activation-attempts:${email}` },
          { identifier: `password-reset:${email}` },
        ],
      },
    });
    await prisma.user.delete({ where: { id: u.id } });
    console.log("DELETED", email);
  }

  console.log(`\nRemoved ${targets.length} test user(s).`);
  console.log("Renumber founders: node scripts/renumber-founders.mjs");
} catch (error) {
  console.error(error);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
