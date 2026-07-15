#!/usr/bin/env node
/**
 * Ettajer engineering body check — run before demos or after pulling changes.
 * Usage: npm run health
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const root = process.cwd();
let failed = 0;

function pass(msg) {
  console.log(`  ✓ ${msg}`);
}

function fail(msg) {
  console.log(`  ✗ ${msg}`);
  failed++;
}

function section(title) {
  console.log(`\n${title}`);
}

function run(cmd, label) {
  try {
    execSync(cmd, { cwd: root, stdio: "pipe" });
    pass(label);
  } catch (e) {
    fail(label);
    const out = e.stdout?.toString() || e.stderr?.toString() || "";
    if (out.trim()) console.log(out.slice(0, 800));
  }
}

function fileExists(rel) {
  const ok = fs.existsSync(path.join(root, rel));
  (ok ? pass : fail)(`file: ${rel}`);
}

section("1. Environment");
fileExists(".env");
fileExists("node_modules/next/package.json");

section("2. TypeScript");
run("npx tsc --noEmit", "tsc --noEmit");

section("3. ESLint");
run("npm run lint", "next lint");

section("4. Production build");
run("npm run build", "next build");

section("5. Prisma client");
run("npx prisma generate", "prisma generate");

section("6. Theme assets");
for (const name of [
  "minimal-preview.webp",
  "modern-preview.webp",
  "bold-preview.webp",
]) {
  fileExists(`public/assets/themes/${name}`);
}

section("7. Critical routes (build output)");
const themesPage = path.join(root, "app/(dashboard)/dashboard/themes/page.tsx");
const editorPage = path.join(root, "app/(dashboard)/dashboard/themes/editor/page.tsx");
if (fs.existsSync(themesPage) && fs.existsSync(editorPage)) {
  pass("themes + editor pages exist");
} else {
  fail("themes or editor page missing");
}

console.log("\n" + (failed === 0 ? "BODY CHECK PASSED" : `BODY CHECK FAILED (${failed} issues)`));
process.exit(failed > 0 ? 1 : 0);
