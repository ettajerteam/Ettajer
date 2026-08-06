import fs from "node:fs";
import path from "node:path";
import { readAuthConfigFile } from "file:///C:/Users/HP/AppData/Roaming/npm/node_modules/vercel/dist/chunks/chunk-HR6VI6UV.js";

const ENV_PATH = path.resolve(import.meta.dirname, "..", ".env");
const auth = readAuthConfigFile();
const value = auth?.token;
if (!value) {
  console.error("No CLI session token");
  process.exit(1);
}

let env = fs.readFileSync(ENV_PATH, "utf8");
const line = `VERCEL_TOKEN="${value}"`;
if (/^VERCEL_TOKEN=/m.test(env)) {
  env = env.replace(/^VERCEL_TOKEN=.*$/m, line);
} else {
  env += `\n${line}\n`;
}
fs.writeFileSync(ENV_PATH, env);

const exp = auth.expiresAt
  ? new Date(auth.expiresAt * 1000).toISOString()
  : "unknown";

const who = await fetch("https://api.vercel.com/v2/user", {
  headers: { Authorization: `Bearer ${value}` },
});
const data = await who.json();

console.log("updated .env VERCEL_TOKEN");
console.log("prefix", value.slice(0, 8));
console.log("expires", exp);
console.log(
  "verify",
  who.status,
  data?.user?.username || data?.username || data?.error?.message,
);
