import fs from "fs";

function dbHost(url) {
  if (!url) return "missing";
  const m = url.match(/@([^:/]+)/);
  return m?.[1] ?? "unknown";
}

function dbPort(url) {
  if (!url) return "missing";
  const m = url.match(/:(\d+)\//);
  return m?.[1] ?? "unknown";
}

const local = fs.readFileSync(".env", "utf8").match(/DATABASE_URL="([^"]+)"/)?.[1];
const vercel = fs.readFileSync(".env.vercel.tmp", "utf8").match(/DATABASE_URL="([^"]+)"/)?.[1];

console.log("local host:", dbHost(local));
console.log("vercel host:", dbHost(vercel));
console.log("same url:", local === vercel);
console.log("local port:", dbPort(local));
console.log("vercel port:", dbPort(vercel));
console.log("vercel pooled:", vercel?.includes("pgbouncer") || vercel?.includes("6543"));
