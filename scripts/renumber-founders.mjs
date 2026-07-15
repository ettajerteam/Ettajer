import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const founders = await prisma.user.findMany({
    where: { founderNumber: { not: null } },
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, name: true, founderNumber: true, createdAt: true },
  });

  if (founders.length === 0) {
    console.log("No founders to renumber.");
    return;
  }

  console.log("Before:", founders.map((u) => ({ email: u.email, n: u.founderNumber })));

  // Two-phase update avoids unique constraint collisions on founderNumber.
  for (let i = 0; i < founders.length; i++) {
    await prisma.user.update({
      where: { id: founders[i].id },
      data: { founderNumber: -(i + 1) },
    });
  }

  for (let i = 0; i < founders.length; i++) {
    await prisma.user.update({
      where: { id: founders[i].id },
      data: { founderNumber: i + 1 },
    });
  }

  const after = await prisma.user.findMany({
    where: { founderNumber: { not: null } },
    orderBy: { founderNumber: "asc" },
    select: { email: true, name: true, founderNumber: true },
  });

  console.log("After:", after);
}

main()
  .catch((error) => {
    console.error("Renumber failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
