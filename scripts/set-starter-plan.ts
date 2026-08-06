import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const KEEP_EMAILS = [
  "ettajerteam@gmail.com",
  "salahaddinefarhi@gmail.com",
];

async function main() {
  const revert = await prisma.user.updateMany({
    where: {
      role: { not: "admin" },
      email: { notIn: KEEP_EMAILS },
    },
    data: { plan: "free" },
  });
  console.log("reverted to free", revert.count);

  const keep = await prisma.user.updateMany({
    where: { email: { in: KEEP_EMAILS } },
    data: { plan: "starter" },
  });
  console.log("kept starter", keep.count);

  const starter = await prisma.user.findMany({
    where: { plan: "starter" },
    select: { email: true, plan: true, founderNumber: true },
  });
  console.log("starter users", JSON.stringify(starter, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
