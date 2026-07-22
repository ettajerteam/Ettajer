import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  const errs = await prisma.platformError.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  for (const e of errs) {
    console.log("---");
    console.log(e.createdAt.toISOString(), e.path ?? "-", `count=${e.count ?? 1}`);
    console.log((e.message || "").slice(0, 200));
    if (e.stack) console.log((e.stack || "").slice(0, 300));
  }
  if (errs.length === 0) console.log("No platform errors in DB.");
} catch (error) {
  console.error("Query failed:", error.message);
} finally {
  await prisma.$disconnect();
}
