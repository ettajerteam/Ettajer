/**
 * Test Namecheap API access (credentials + IP whitelist).
 *
 * Usage:
 *   npx tsx scripts/namecheap-ping.ts
 *   npx tsx scripts/namecheap-ping.ts --check example.com
 */
import "dotenv/config";
import {
  checkDomains,
  getAccountBalance,
  getNamecheapEnv,
  isNamecheapConfigured,
} from "@/lib/namecheap/client";

async function main() {
  if (!isNamecheapConfigured()) {
    console.error("Missing Namecheap env. Set in .env:");
    console.error("  NAMECHEAP_API_USER=your_namecheap_username");
    console.error("  NAMECHEAP_API_KEY=your_api_key");
    console.error("  NAMECHEAP_USERNAME=your_namecheap_username");
    console.error("  NAMECHEAP_CLIENT_IP=81.65.163.60   # must match whitelist");
    console.error("  NAMECHEAP_SANDBOX=1                 # optional for sandbox");
    process.exit(1);
  }

  const env = getNamecheapEnv()!;
  console.log("Config:");
  console.log("  ApiUser:", env.apiUser);
  console.log("  ClientIp:", env.clientIp);
  console.log("  Sandbox:", env.sandbox);

  console.log("\nChecking balance...");
  const bal = await getAccountBalance();
  if (!bal.ok) {
    console.error("FAILED:", bal.errors.join("; ") || bal.status);
    console.error(
      "\nIf you see IP / permission errors: whitelist this exact IPv4 in Namecheap → Profile → Tools → API Access,\nand set NAMECHEAP_CLIENT_IP to the same value."
    );
    console.error(bal.raw.slice(0, 500));
    process.exit(1);
  }
  console.log("OK — AvailableBalance:", bal.availableBalance ?? "(see raw)");

  const checkIdx = process.argv.indexOf("--check");
  const domain = checkIdx >= 0 ? process.argv[checkIdx + 1]?.trim() : null;
  if (domain) {
    console.log(`\nChecking domain: ${domain}`);
    const results = await checkDomains([domain]);
    console.log(results);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
