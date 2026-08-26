/**
 * Mirror Vercel project secrets into local `.env` / `.env.local`.
 *
 * Why: Vercel "sensitive" env vars cannot be decrypted via `vercel env pull`
 * or the API after creation. They ARE available at runtime on deployments.
 * This script:
 *   1. Adds a gated one-shot `/api/ops/env-bootstrap` route
 *   2. Deploys a preview
 *   3. Reads secrets via `vercel curl` (bypasses Deployment Protection)
 *   4. Writes local env with localhost URL overrides
 *   5. Deletes the preview deployment and removes the route
 *
 * Usage:
 *   npx vercel login
 *   npx vercel link   # production project (ettajer-nczz)
 *   npm run vercel:env:mirror
 *
 * Never commit the generated `.env` / `.env.local`.
 */
import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROUTE_DIR = path.join(ROOT, "app/api/ops/env-bootstrap");
const ROUTE_FILE = path.join(ROUTE_DIR, "route.ts");
const GATE = crypto.randomBytes(24).toString("hex");

const KEYS = [
  "DATABASE_URL",
  "DIRECT_URL",
  "POSTGRES_PASSWORD",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL_NON_POOLING",
  "POSTGRES_HOST",
  "POSTGRES_USER",
  "POSTGRES_DATABASE",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "EMAIL_SECRETS_KEY",
  "SUPPORT_EMAIL",
  "ADMIN_EMAILS",
  "BLOB_READ_WRITE_TOKEN",
  "CRON_SECRET",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_JWT_SECRET",
  "SUPABASE_SECRET_KEY",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "META_APP_ID",
  "META_APP_SECRET",
  "META_LOGIN_CONFIG_ID",
  "META_OAUTH_REDIRECT_URI",
  "PINTEREST_APP_ID",
  "PINTEREST_APP_SECRET",
  "PREVIEW_TOKEN_SECRET",
  "VERCEL_TOKEN",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
];

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
    ...opts,
  });
  if (res.status !== 0) {
    const err = (res.stderr || res.stdout || "").trim();
    throw new Error(`${cmd} ${args.join(" ")} failed: ${err.slice(-2000)}`);
  }
  return res.stdout || "";
}

function writeRoute() {
  fs.mkdirSync(ROUTE_DIR, { recursive: true });
  const keysLiteral = KEYS.map((k) => `  "${k}",`).join("\n");
  fs.writeFileSync(
    ROUTE_FILE,
    `import { NextRequest, NextResponse } from "next/server";

const GATE = ${JSON.stringify(GATE)};
const KEYS = [
${keysLiteral}
] as const;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const token =
    request.headers.get("x-bootstrap-token")?.trim() ||
    request.nextUrl.searchParams.get("token")?.trim() ||
    "";
  if (!token || token !== GATE) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const env: Record<string, string | null> = {};
  for (const key of KEYS) {
    const value = process.env[key];
    env[key] = value == null || value === "" ? null : value;
  }
  return NextResponse.json({
    ok: true,
    vercelEnv: process.env.VERCEL_ENV ?? null,
    env,
  });
}
`,
  );
}

function removeRoute() {
  try {
    fs.rmSync(ROUTE_DIR, { recursive: true, force: true });
    const ops = path.join(ROOT, "app/api/ops");
    if (fs.existsSync(ops) && fs.readdirSync(ops).length === 0) {
      fs.rmdirSync(ops);
    }
  } catch {
    /* ignore */
  }
}

function parseDeployUrl(output) {
  const match = output.match(/https:\/\/[a-z0-9-]+\.vercel\.app/);
  if (!match) throw new Error("Could not parse preview URL from deploy output");
  return match[0];
}

function parseDeploymentId(output) {
  const match = output.match(/dpl_[A-Za-z0-9]+/);
  return match?.[0] || null;
}

function quoteEnv(value) {
  return `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function buildLocalEnv(runtimeEnv) {
  const out = {};
  for (const [k, v] of Object.entries(runtimeEnv)) {
    if (v != null && v !== "") out[k] = v;
  }

  // Prefer pooler DATABASE_URL; synthesize DIRECT_URL if missing/localhost.
  const databaseUrl = out.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL missing from runtime env");
  }

  let direct = out.DIRECT_URL || "";
  if (!direct || direct.includes("localhost")) {
    try {
      const u = new URL(databaseUrl);
      const password = decodeURIComponent(u.password || "");
      const user = decodeURIComponent(u.username || "");
      // Session-mode pooler on :5432 works when direct DB host is unreachable.
      const host = u.hostname.includes("pooler.supabase.com")
        ? u.hostname
        : u.hostname;
      const sessionUser = user.includes(".")
        ? user
        : `postgres.${user.replace(/^postgres\.?/, "") || "project"}`;
      // If username already is postgres.ref, keep it; else derive from DATABASE_URL user.
      const finalUser = user.includes(".") ? user : sessionUser;
      out.DIRECT_URL = `postgresql://${finalUser}:${encodeURIComponent(password)}@${host}:5432/postgres`;
      out.POSTGRES_PASSWORD = out.POSTGRES_PASSWORD || password;
    } catch {
      out.DIRECT_URL = databaseUrl;
    }
  }

  out.NEXTAUTH_URL = "http://localhost:3000";
  out.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  out.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
  out.RATE_LIMIT_BACKEND = out.RATE_LIMIT_BACKEND || "memory";

  const lines = [
    "# Generated by npm run vercel:env:mirror — do not commit",
    `# Mirrored at ${new Date().toISOString()}`,
    "",
  ];
  for (const [k, v] of Object.entries(out)) {
    lines.push(`${k}=${quoteEnv(v)}`);
  }
  return lines.join("\n") + "\n";
}

function main() {
  if (!fs.existsSync(path.join(ROOT, ".vercel/project.json"))) {
    throw new Error("Missing .vercel/project.json — run `npx vercel link` first");
  }

  let deployUrl = null;
  let deploymentId = null;
  let wroteRoute = false;

  try {
    console.log("Writing temporary bootstrap route…");
    writeRoute();
    wroteRoute = true;

    console.log("Deploying preview (this can take a few minutes)…");
    const deployOut = run("npx", ["vercel", "deploy", "--yes"], {
      env: process.env,
    });
    fs.writeFileSync("/tmp/vercel-env-mirror-deploy.log", deployOut);
    deployUrl = parseDeployUrl(deployOut);
    deploymentId = parseDeploymentId(deployOut);
    console.log("Preview:", deployUrl);

    console.log("Fetching runtime secrets…");
    const curlOut = run(
      "npx",
      [
        "vercel",
        "curl",
        "/api/ops/env-bootstrap",
        "--deployment",
        deployUrl,
        "--yes",
        "--",
        "-H",
        `x-bootstrap-token: ${GATE}`,
        "-sS",
      ],
      { env: process.env },
    );
    const jsonStart = curlOut.indexOf("{");
    if (jsonStart < 0) throw new Error("No JSON in vercel curl response");
    const payload = JSON.parse(curlOut.slice(jsonStart));
    if (!payload?.ok || !payload.env) {
      throw new Error(`Bootstrap failed: ${curlOut.slice(0, 500)}`);
    }

    const present = Object.entries(payload.env).filter(([, v]) => v != null).length;
    console.log(`Got ${present} secrets (vercelEnv=${payload.vercelEnv})`);

    const body = buildLocalEnv(payload.env);
    fs.writeFileSync(path.join(ROOT, ".env"), body, { mode: 0o600 });
    fs.writeFileSync(path.join(ROOT, ".env.local"), body, { mode: 0o600 });
    console.log("Wrote .env and .env.local (localhost URL overrides applied)");
  } finally {
    if (deploymentId) {
      try {
        console.log("Deleting preview deployment", deploymentId);
        run("npx", ["vercel", "rm", deploymentId, "--yes"], { env: process.env });
      } catch (e) {
        console.warn("Could not delete deployment:", e.message);
      }
    }
    if (wroteRoute) {
      removeRoute();
      console.log("Removed temporary bootstrap route");
    }
  }

  console.log("Done. Restart `npm run dev` to load the mirrored env.");
}

try {
  main();
} catch (e) {
  console.error(e.message || e);
  removeRoute();
  process.exit(1);
}
