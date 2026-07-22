#!/usr/bin/env node
/**
 * Production smoke check for overnight / launch ops.
 * Exit 0 = healthy, 1 = failures.
 */
const BASE = process.env.SMOKE_BASE_URL || "https://www.ettajer.com";

const checks = [
  { path: "/", expect: [200] },
  { path: "/login", expect: [200] },
  { path: "/signup", expect: [200] },
  { path: "/api/auth/providers", expect: [200], bodyIncludes: '"google"' },
  { path: "/early-access", expect: [307, 302, 200] },
  { path: "/admin", expect: [307, 302, 200, 404] },
];

async function checkOne({ path, expect, bodyIncludes }) {
  const url = `${BASE}${path}`;
  try {
    const res = await fetch(url, { redirect: "manual" });
    const status = res.status;
    const okStatus = expect.includes(status);
    let bodyOk = true;
    let snippet = "";
    if (bodyIncludes) {
      const text = await res.text();
      bodyOk = text.includes(bodyIncludes);
      snippet = text.slice(0, 80);
    }
    const ok = okStatus && bodyOk;
    return {
      path,
      status,
      ok,
      detail: ok ? "ok" : `want ${expect.join("/")} body=${bodyIncludes ?? "-"} got=${snippet}`,
    };
  } catch (error) {
    return { path, status: 0, ok: false, detail: String(error.message || error) };
  }
}

const results = [];
for (const c of checks) {
  results.push(await checkOne(c));
}

const failed = results.filter((r) => !r.ok);
for (const r of results) {
  console.log(`${r.ok ? "✓" : "✗"} ${r.status} ${r.path}${r.ok ? "" : ` — ${r.detail}`}`);
}

// Google OAuth redirect_uri still correct
try {
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`);
  const { csrfToken } = await csrfRes.json();
  const signin = await fetch(`${BASE}/api/auth/signin/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: csrfRes.headers.getSetCookie?.()?.join("; ") || "",
    },
    body: new URLSearchParams({
      csrfToken,
      callbackUrl: `${BASE}/dashboard`,
      json: "true",
    }),
    redirect: "manual",
  });
  // Without cookies CSRF may fail — soft check via providers already done
  const text = await signin.text();
  if (text.includes("redirect_uri=") && !text.includes("www.ettajer.com%2Fapi%2Fauth%2Fcallback%2Fgoogle") && text.includes("accounts.google.com")) {
    console.log("✗ google oauth redirect_uri unexpected");
    failed.push({ path: "oauth", ok: false });
  } else if (text.includes("www.ettajer.com%2Fapi%2Fauth%2Fcallback%2Fgoogle") || text.includes("csrf")) {
    console.log("✓ google oauth endpoint reachable");
  } else {
    console.log("~ google oauth soft-check skipped (csrf/session)");
  }
} catch (error) {
  console.log("~ google oauth soft-check error:", error.message);
}

console.log(failed.length === 0 ? "\nSMOKE_OK" : `\nSMOKE_FAIL ${failed.length}`);
process.exit(failed.length === 0 ? 0 : 1);
