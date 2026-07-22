/**
 * Activate all waiting founder seats once the platform launch date has passed.
 *
 * Usage:
 *   node scripts/activate-founders-at-launch.mjs              # dry-run
 *   node scripts/activate-founders-at-launch.mjs --force      # ignore date check
 *   node scripts/activate-founders-at-launch.mjs --activate   # execute (requires launched or --force)
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const doActivate = process.argv.includes("--activate");
const force = process.argv.includes("--force");

function getLaunchTarget() {
  const raw = process.env.ETTAJER_LAUNCH_TARGET?.trim();
  if (raw) {
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date("2026-07-23T00:00:00.000+01:00");
}

try {
  const target = getLaunchTarget();
  const now = new Date();
  const isLaunched = now.getTime() >= target.getTime();

  console.log("Launch target:", target.toISOString());
  console.log("Now:", now.toISOString());
  console.log("Is launched:", isLaunched, force ? "(--force)" : "");

  if (!isLaunched && !force) {
    console.log("\nPlatform not open yet. Re-run on/after launch day, or add --force.");
    process.exit(0);
  }

  const waiting = await prisma.user.findMany({
    where: {
      status: "waiting",
      founderNumber: { not: null },
      emailVerified: { not: null },
      role: { not: "admin" },
      NOT: { email: { endsWith: "@example.com" } },
    },
    select: {
      id: true,
      email: true,
      name: true,
      founderNumber: true,
    },
    orderBy: { founderNumber: "asc" },
  });

  const unverifiedWaiting = await prisma.user.count({
    where: {
      status: "waiting",
      founderNumber: { not: null },
      emailVerified: null,
      role: { not: "admin" },
      NOT: { email: { endsWith: "@example.com" } },
    },
  });

  if (unverifiedWaiting > 0) {
    console.log(`Skipping ${unverifiedWaiting} unverified waiting founder(s) — they must verify email first.`);
  }

  if (waiting.length === 0) {
    console.log("No verified waiting founders to activate.");
    process.exit(0);
  }

  console.log(doActivate ? "\nActivating:" : "\nDry-run (pass --activate to apply):");
  for (const u of waiting) {
    console.log(`  #${u.founderNumber} ${u.email}`);
  }

  if (!doActivate) {
    console.log(`\n${waiting.length} founder(s) would become active.`);
    process.exit(0);
  }

  const result = await prisma.user.updateMany({
    where: { id: { in: waiting.map((u) => u.id) } },
    data: { status: "active" },
  });

  console.log(`\nActivated ${result.count} founder(s).`);
} catch (error) {
  console.error(error);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
