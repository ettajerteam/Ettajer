import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const EMAIL = process.env.DEMO_EMAIL || "demo@ettajer.test";
const PASSWORD = process.env.DEMO_PASSWORD || "Password123";

const prisma = new PrismaClient();

const hash = await bcrypt.hash(PASSWORD, 12);
const user = await prisma.user.update({
  where: { email: EMAIL },
  data: {
    passwordHash: hash,
    status: "active",
    emailVerified: new Date(),
    failedLoginAttempts: 0,
    lockedUntil: null,
  },
  select: { email: true, role: true },
});

console.log(JSON.stringify({ ok: true, ...user }));
await prisma.$disconnect();
