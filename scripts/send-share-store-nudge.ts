/**
 * Nudge merchants with live products but zero real orders (Tier B).
 *
 * Usage:
 *   npx tsx scripts/send-share-store-nudge.ts           # dry-run
 *   npx tsx scripts/send-share-store-nudge.ts --send    # deliver
 */
import "dotenv/config";
import { listShareStoreNudgeTargets } from "@/lib/admin/activation-stats";
import { sendShareStoreEmail } from "@/lib/email/automations";
import { isResendConfigured } from "@/lib/resend";

const doSend = process.argv.includes("--send");

async function main() {
  const targets = await listShareStoreNudgeTargets();

  console.log(
    doSend
      ? `Sending share-store nudge to ${targets.length} merchant(s)…`
      : `Dry-run: would nudge ${targets.length} merchant(s) (pass --send):`,
  );

  for (const t of targets) {
    console.log(
      `  ${t.ownerEmail} — ${t.storeName} (/${t.slug}, ${t.activeProducts} products)`,
    );
  }

  if (!doSend) {
    console.log("\nNo emails sent.");
    return;
  }

  if (!isResendConfigured()) {
    console.error("Resend is not configured. Aborting.");
    process.exit(1);
  }

  let ok = 0;
  let fail = 0;
  for (const t of targets) {
    const success = await sendShareStoreEmail({
      to: t.ownerEmail,
      merchantName: t.ownerName ?? "Merchant",
      storeName: t.storeName,
      storeSlug: t.slug,
      locale: "fr",
    });
    if (success) {
      ok += 1;
      console.log("✓", t.ownerEmail);
    } else {
      fail += 1;
      console.error("✗", t.ownerEmail);
    }
  }

  console.log(`\nDone: ${ok} sent, ${fail} failed.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
