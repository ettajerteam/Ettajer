/**
 * Debug full signup flow steps against production DB.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const email = `test-flow-${Date.now()}@example.com`;
const name = "Test Flow";

async function step(label, fn) {
  try {
    const result = await fn();
    console.log(`OK  ${label}`, result ?? "");
    return result;
  } catch (e) {
    console.error(`ERR ${label}`, e.message);
    if (e.code) console.error("  code:", e.code);
    if (e.meta) console.error("  meta:", JSON.stringify(e.meta));
    throw e;
  }
}

try {
  const passwordHash = await bcrypt.hash("TestPass1", 12);

  const user = await step("user.create", () =>
    prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        status: "waiting",
      },
      select: { id: true },
    }),
  );

  await step("persist preferences", () =>
    prisma.$executeRaw`
      UPDATE "User"
      SET
        "marketingEmails" = ${false},
        "termsAcceptedAt" = ${new Date()},
        "updatedAt" = ${new Date()}
      WHERE "id" = ${user.id}
    `,
  );

  const founderNumber = await step("assign founder", async () => {
    return prisma.$transaction(async (tx) => {
      const count = await tx.user.count({
        where: { founderNumber: { not: null } },
      });
      if (count >= 100) return null;
      const next = count + 1;
      await tx.user.update({
        where: { id: user.id },
        data: { founderNumber: next, status: "waiting" },
      });
      return next;
    });
  });

  await step("issue activation code", async () => {
    const identifier = `account-activation:${email}`;
    await prisma.verificationToken.deleteMany({ where: { identifier } });
    await prisma.verificationToken.create({
      data: {
        identifier,
        token: "abc123hash",
        expires: new Date(Date.now() + 15 * 60 * 1000),
      },
    });
    return true;
  });

  console.log("SUCCESS", { email, founderNumber });

  await prisma.verificationToken.deleteMany({
    where: { identifier: { startsWith: `account-activation:${email}` } },
  });
  await prisma.user.delete({ where: { id: user.id } });
} catch {
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
