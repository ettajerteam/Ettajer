import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { readAuthConfigFile } from "file:///C:/Users/HP/AppData/Roaming/npm/node_modules/vercel/dist/chunks/chunk-HR6VI6UV.js";

const ROOT = path.resolve(import.meta.dirname, "..");
const ENV_PATH = path.join(ROOT, ".env");

const auth = readAuthConfigFile();
const sessionToken = auth?.token;
if (!sessionToken) {
  console.error("No Vercel CLI session token found. Run: vercel login");
  process.exit(1);
}

const res = await fetch("https://api.vercel.com/v3/user/tokens", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${sessionToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ name: "ettajer-ops" }),
});

const data = await res.json();
if (!res.ok) {
  console.error("Create token failed:", res.status, data?.error || data);
  process.exit(1);
}

const newTok =
  (typeof data.token === "string" && data.token) ||
  (typeof data.secret === "string" && data.secret) ||
  (typeof data.bearerToken === "string" && data.bearerToken) ||
  (typeof data?.token?.id === "string" && data.token.id) ||
  null;

// Vercel API returns { token: { id, name, ... }, bearerToken?: string } or similar
const bearer =
  (typeof data.bearerToken === "string" && data.bearerToken) ||
  (typeof data.token === "string" && data.token) ||
  null;

console.log("status", res.status);
console.log("response_keys", Object.keys(data));
if (data.token && typeof data.token === "object") {
  console.log("token_object_keys", Object.keys(data.token));
}

const value = bearer;
if (!value) {
  console.error(
    "Token created but secret not returned in API response. Create one at https://vercel.com/account/tokens",
  );
  console.error(JSON.stringify(data, null, 2).slice(0, 600));
  process.exit(1);
}

console.log("created", value.slice(0, 8) + "…", "len=" + value.length);

let env = fs.readFileSync(ENV_PATH, "utf8");
if (/^VERCEL_TOKEN=/m.test(env)) {
  env = env.replace(/^VERCEL_TOKEN=.*$/m, `VERCEL_TOKEN="${value}"`);
} else {
  env += `\nVERCEL_TOKEN="${value}"\n`;
}
fs.writeFileSync(ENV_PATH, env);
console.log("Updated .env VERCEL_TOKEN");

const childEnv = { ...process.env };
delete childEnv.VERCEL_TOKEN;
for (const target of ["production", "preview", "development"]) {
  const r = spawnSync(
    "vercel",
    ["env", "add", "VERCEL_TOKEN", target, "--force", "--yes"],
    {
      input: value,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
      shell: true,
      env: childEnv,
    },
  );
  console.log(
    `vercel ${target}:`,
    r.status === 0 ? "ok" : "fail",
    (r.stderr || r.stdout || "").split("\n").filter(Boolean).slice(-2).join(" | "),
  );
}

// Verify token works
const who = await fetch("https://api.vercel.com/v2/user", {
  headers: { Authorization: `Bearer ${value}` },
});
const whoData = await who.json();
console.log(
  "verify",
  who.status,
  whoData?.user?.username || whoData?.username || whoData?.error?.message,
);
