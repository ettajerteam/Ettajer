/**
 * Repair store slugs that look like pasted URLs or fail the public slug rules.
 *
 * Usage:
 *   npx tsx scripts/repair-bad-store-slugs.ts           # dry-run
 *   npx tsx scripts/repair-bad-store-slugs.ts --apply
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { isValidStoreSlug, makeStoreSlug } from "@/lib/store-slug";

const prisma = new PrismaClient();
const doApply = process.argv.includes("--apply");

async function uniqueSlug(base: string, excludeId: string): Promise<string> {
  let slug = base;
  let n = 0;
  while (true) {
    const existing = await prisma.store.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    n += 1;
    slug = `${base.slice(0, 50)}-${n}`;
  }
}

async function main() {
  const stores = await prisma.store.findMany({
    select: { id: true, name: true, slug: true },
  });

  const bad = stores.filter((s) => !isValidStoreSlug(s.slug));
  console.log(doApply ? "Repairing:" : "Dry-run (pass --apply):");

  const plan: { id: string; name: string; from: string; to: string }[] = [];
  for (const s of bad) {
    const base = makeStoreSlug(s.name) || `store-${s.id.slice(-6)}`;
    const to = await uniqueSlug(base, s.id);
    plan.push({ id: s.id, name: s.name, from: s.slug, to });
    console.log(`  ${s.name}: ${s.slug.slice(0, 60)}${s.slug.length > 60 ? "…" : ""} → ${to}`);
  }

  if (!doApply) {
    console.log(`\nWould repair ${plan.length} slug(s).`);
    return;
  }

  for (const row of plan) {
    await prisma.store.update({
      where: { id: row.id },
      data: { slug: row.to },
    });
    console.log("✓", row.to);
  }
  console.log(`\nRepaired ${plan.length} slug(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
