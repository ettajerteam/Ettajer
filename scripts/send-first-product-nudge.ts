/**
 * Nudge merchants with empty stores (hot cohort: login or store ≤7d).
 *
 * Usage:
 *   npx tsx scripts/send-first-product-nudge.ts           # dry-run
 *   npx tsx scripts/send-first-product-nudge.ts --send    # deliver
 */
import "dotenv/config";
import { listHotEmptyStoresForNudge } from "@/lib/admin/activation-stats";
import { sendFirstProductEmail } from "@/lib/email/automations";
import { isResendConfigured } from "@/lib/resend";

const doSend = process.argv.includes("--send");

async function main() {
  const rows = await listHotEmptyStoresForNudge();

  // One email per owner (first empty store if they somehow have several)
  const byEmail = new Map<string, (typeof rows)[number]>();
  for (const row of rows) {
    if (!byEmail.has(row.ownerEmail)) byEmail.set(row.ownerEmail, row);
  }
  const targets = [...byEmail.values()];

  console.log(
    doSend
      ? `Sending first-product nudge to ${targets.length} merchant(s)…`
      : `Dry-run: would nudge ${targets.length} merchant(s) (pass --send):`,
  );

  for (const t of targets) {
    console.log(`  ${t.ownerEmail} — ${t.storeName} (/${t.slug})`);
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
    const success = await sendFirstProductEmail({
      to: t.ownerEmail,
      merchantName: t.ownerName ?? "Merchant",
      storeName: t.storeName,
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
