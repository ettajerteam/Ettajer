/**
 * Promote a user to platform admin (localhost / ops).
 * Usage: node scripts/promote-admin.mjs [email]
 */
import { PrismaClient } from "@prisma/client";

const DEFAULT_EMAIL = "ettajerteam@gmail.com";
const email = (process.argv[2] ?? DEFAULT_EMAIL).trim().toLowerCase();

const prisma = new PrismaClient();

try {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`No user found for ${email}. Sign up first, then run this script.`);
    process.exit(1);
  }

  const updated = await prisma.user.update({
    where: { email },
    data: {
      role: "admin",
      status: "active",
      emailVerified: user.emailVerified ?? new Date(),
    },
    select: { email: true, role: true, status: true, founderNumber: true },
  });

  console.log("Admin promoted:", updated);
} catch (err) {
  console.error(err);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
