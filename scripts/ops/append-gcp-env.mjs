#!/usr/bin/env node
/** Append GCP snippet keys into .env if missing */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const snippetPath = path.join(ROOT, "secrets", "gcp.env.snippet");
const envPath = path.join(ROOT, ".env");

if (!fs.existsSync(snippetPath)) {
  console.error("Run gcp-bootstrap.mjs first");
  process.exit(1);
}

const snippet = fs.readFileSync(snippetPath, "utf8");
const lines = snippet
  .split(/\r?\n/)
  .filter((l) => l && !l.startsWith("#") && l.includes("="));

let env = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
let added = 0;
for (const line of lines) {
  const key = line.split("=")[0];
  if (new RegExp(`^${key}=`, "m").test(env)) {
    console.log(`skip ${key} (already in .env)`);
    continue;
  }
  env = `${env.trimEnd()}\n${line}\n`;
  added += 1;
  console.log(`+ ${key}`);
}
fs.writeFileSync(envPath, env.endsWith("\n") ? env : `${env}\n`, "utf8");
console.log(`Done. Added ${added} vars.`);
