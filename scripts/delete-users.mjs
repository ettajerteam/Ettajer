import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const emails = process.argv.slice(2);

if (emails.length === 0) {
  console.error("Usage: node scripts/delete-users.mjs <email> [email...]");
  process.exit(1);
}

async function deleteUser(email) {
  const normalized = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalized },
    select: { id: true, email: true, name: true, founderNumber: true },
  });

  if (!user) {
    console.log("NOT FOUND:", normalized);
    return;
  }

  await prisma.loginAttempt.deleteMany({ where: { email: normalized } });
  await prisma.verificationToken.deleteMany({
    where: {
      OR: [
        { identifier: { contains: normalized } },
        { identifier: `account-activation:${normalized}` },
        { identifier: `activation-resend:${normalized}` },
        { identifier: `activation-attempts:${normalized}` },
        { identifier: `password-reset:${normalized}` },
      ],
    },
  });

  await prisma.user.delete({ where: { email: normalized } });
  console.log("DELETED:", user);
}

try {
  for (const email of emails) {
    await deleteUser(email);
  }
} catch (error) {
  console.error("Delete failed:", error);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
