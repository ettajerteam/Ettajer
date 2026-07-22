import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const users = await prisma.user.findMany({
  orderBy: { createdAt: "asc" },
  select: {
    email: true,
    name: true,
    status: true,
    role: true,
    founderNumber: true,
    createdAt: true,
    lastLoginAt: true,
    _count: { select: { stores: true } },
  },
});

for (const u of users) {
  console.log(
    [
      u.email,
      u.name ?? "-",
      u.status,
      u.role,
      u.founderNumber != null ? `#${u.founderNumber}` : "no#",
      `stores:${u._count.stores}`,
      u.createdAt.toISOString().slice(0, 10),
      u.lastLoginAt?.toISOString().slice(0, 10) ?? "never",
    ].join(" | "),
  );
}
console.log("TOTAL", users.length);
await prisma.$disconnect();
