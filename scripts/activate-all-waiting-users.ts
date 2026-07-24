/**
 * One-shot: activate every waiting account so nobody stays in the waiting room.
 * Usage: npx tsx scripts/activate-all-waiting-users.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.user.updateMany({
    where: { status: "waiting" },
    data: { status: "active" },
  });
  console.log(`Activated ${result.count} waiting account(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
