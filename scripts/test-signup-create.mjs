import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  const email = `test-debug-${Date.now()}@example.com`;
  const user = await prisma.user.create({
    data: {
      name: "Test User",
      email,
      passwordHash: "hash",
      status: "waiting",
      marketingEmails: false,
      termsAcceptedAt: new Date(),
    },
    select: { id: true, email: true },
  });
  console.log("OK", user);
  await prisma.user.delete({ where: { id: user.id } });
} catch (e) {
  console.error("ERR", e.message);
  if (e.meta) console.error("META", JSON.stringify(e.meta));
} finally {
  await prisma.$disconnect();
}
