/**
 * Seed 7-day cooldowns for today's manual first-product + share-store blasts
 * so the daily cron does not re-email the same merchants.
 */
import "dotenv/config";
import {
  listHotEmptyStoresForNudge,
  listShareStoreNudgeTargets,
} from "@/lib/admin/activation-stats";
import { seedNudgeCooldowns } from "@/lib/admin/activation-drip";

async function main() {
  const empty = await listHotEmptyStoresForNudge();
  const share = await listShareStoreNudgeTargets();
  const firstProductEmails = [...new Set(empty.map((e) => e.ownerEmail))];
  const shareStoreEmails = share.map((s) => s.ownerEmail);
  await seedNudgeCooldowns({ firstProductEmails, shareStoreEmails });
  console.log(
    `Seeded cooldowns: ${firstProductEmails.length} first-product, ${shareStoreEmails.length} share-store.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
