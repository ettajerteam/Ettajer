import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

/** True when HMR/globalThis kept a PrismaClient generated before newer models. */
function isStalePrismaClient(client: PrismaClient): boolean {
  return (
    typeof (client as unknown as { academyProgress?: { findMany?: unknown } })
      .academyProgress?.findMany !== "function"
  );
}

function getPrismaClient(): PrismaClient {
  const existing = globalForPrisma.prisma;
  if (existing && !isStalePrismaClient(existing)) return existing;

  if (existing) {
    void existing.$disconnect().catch(() => {});
  }

  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}

export const prisma = getPrismaClient();
