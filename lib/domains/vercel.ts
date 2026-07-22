/**
 * Vercel Domains API — add/remove merchant hostnames on the Ettajer project.
 * Requires VERCEL_TOKEN + VERCEL_PROJECT_ID (and VERCEL_TEAM_ID for team projects).
 */

type VercelDomainResult = {
  ok: boolean;
  configured: boolean;
  status?: number;
  error?: string;
  verified?: boolean;
  name?: string;
};

function getConfig() {
  const token =
    process.env.VERCEL_TOKEN?.trim() ||
    process.env.VERCEL_API_TOKEN?.trim() ||
    "";
  const projectId =
    process.env.VERCEL_PROJECT_ID?.trim() ||
    process.env.VERCEL_PROJECT_NAME?.trim() ||
    "";
  const teamId = process.env.VERCEL_TEAM_ID?.trim() || "";
  return { token, projectId, teamId };
}

export function isVercelDomainsConfigured(): boolean {
  const { token, projectId } = getConfig();
  return Boolean(token && projectId);
}

function teamQuery(teamId: string): string {
  return teamId ? `?teamId=${encodeURIComponent(teamId)}` : "";
}

async function vercelFetch(
  path: string,
  init?: RequestInit
): Promise<{ status: number; json: Record<string, unknown> }> {
  const { token, teamId } = getConfig();
  const url = `https://api.vercel.com${path}${
    path.includes("?")
      ? teamId
        ? `&teamId=${encodeURIComponent(teamId)}`
        : ""
      : teamQuery(teamId)
  }`;

  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  let json: Record<string, unknown> = {};
  try {
    json = (await res.json()) as Record<string, unknown>;
  } catch {
    json = {};
  }
  return { status: res.status, json };
}

function errorMessage(json: Record<string, unknown>, fallback: string): string {
  const err = json.error;
  if (err && typeof err === "object" && err !== null && "message" in err) {
    return String((err as { message?: string }).message ?? fallback);
  }
  if (typeof json.message === "string") return json.message;
  return fallback;
}

/** Add a hostname to the Vercel project (idempotent if already present). */
export async function addVercelDomain(domain: string): Promise<VercelDomainResult> {
  if (!isVercelDomainsConfigured()) {
    return { ok: true, configured: false };
  }
  const { projectId } = getConfig();
  const { status, json } = await vercelFetch(
    `/v10/projects/${encodeURIComponent(projectId)}/domains`,
    {
      method: "POST",
      body: JSON.stringify({ name: domain }),
    }
  );

  // 409 = already exists on project — treat as success
  if (status === 200 || status === 201 || status === 409) {
    return {
      ok: true,
      configured: true,
      status,
      verified: Boolean(json.verified),
      name: typeof json.name === "string" ? json.name : domain,
    };
  }

  return {
    ok: false,
    configured: true,
    status,
    error: errorMessage(json, "Could not add domain on Vercel"),
  };
}

/** Optional: point www → apex with a 308 redirect on Vercel. */
export async function addVercelWwwRedirect(
  apex: string
): Promise<VercelDomainResult> {
  if (!isVercelDomainsConfigured()) {
    return { ok: true, configured: false };
  }
  const { projectId } = getConfig();
  const www = `www.${apex}`;
  const { status, json } = await vercelFetch(
    `/v10/projects/${encodeURIComponent(projectId)}/domains`,
    {
      method: "POST",
      body: JSON.stringify({
        name: www,
        redirect: apex,
        redirectStatusCode: 308,
      }),
    }
  );

  if (status === 200 || status === 201 || status === 409) {
    return { ok: true, configured: true, status, name: www };
  }

  return {
    ok: false,
    configured: true,
    status,
    error: errorMessage(json, "Could not add www redirect"),
  };
}

export async function removeVercelDomain(
  domain: string
): Promise<VercelDomainResult> {
  if (!isVercelDomainsConfigured()) {
    return { ok: true, configured: false };
  }
  const { projectId } = getConfig();
  const { status, json } = await vercelFetch(
    `/v9/projects/${encodeURIComponent(projectId)}/domains/${encodeURIComponent(domain)}`,
    { method: "DELETE" }
  );

  // 404 = already gone
  if (status === 200 || status === 204 || status === 404) {
    return { ok: true, configured: true, status };
  }

  return {
    ok: false,
    configured: true,
    status,
    error: errorMessage(json, "Could not remove domain on Vercel"),
  };
}

export async function getVercelDomainConfig(domain: string): Promise<{
  configured: boolean;
  found: boolean;
  verified: boolean;
  verification?: unknown[];
  mistmatched?: boolean;
  error?: string;
}> {
  if (!isVercelDomainsConfigured()) {
    return { configured: false, found: false, verified: false };
  }
  const { projectId } = getConfig();
  const { status, json } = await vercelFetch(
    `/v9/projects/${encodeURIComponent(projectId)}/domains/${encodeURIComponent(domain)}`
  );

  if (status === 404) {
    return { configured: true, found: false, verified: false };
  }
  if (status !== 200) {
    return {
      configured: true,
      found: false,
      verified: false,
      error: errorMessage(json, "Could not read domain status"),
    };
  }

  return {
    configured: true,
    found: true,
    verified: Boolean(json.verified),
    verification: Array.isArray(json.verification) ? json.verification : undefined,
  };
}

/** Recommended DNS records from Vercel for a hostname. */
export async function getVercelDnsRecommendations(domain: string): Promise<{
  configured: boolean;
  cnames?: string[];
  aValues?: string[];
  recommendedCNAME?: string | null;
  recommendedIPv4?: string[];
  misconfigured?: boolean;
  error?: string;
}> {
  if (!isVercelDomainsConfigured()) {
    return { configured: false };
  }
  const { status, json } = await vercelFetch(
    `/v6/domains/${encodeURIComponent(domain)}/config`
  );
  if (status !== 200) {
    return {
      configured: true,
      error: errorMessage(json, "Could not load DNS recommendations"),
    };
  }
  const cnames = Array.isArray(json.cnames) ? (json.cnames as string[]) : [];
  const aValues = Array.isArray(json.aValues) ? (json.aValues as string[]) : [];

  let recommendedCNAME: string | null = null;
  const rc = json.recommendedCNAME;
  if (typeof rc === "string") recommendedCNAME = rc.replace(/\.$/, "");
  else if (Array.isArray(rc) && rc.length > 0) {
    const first = rc[0] as { value?: string } | string;
    recommendedCNAME =
      typeof first === "string"
        ? first.replace(/\.$/, "")
        : String(first?.value ?? "").replace(/\.$/, "") || null;
  }

  let recommendedIPv4: string[] = [];
  const ri = json.recommendedIPv4;
  if (Array.isArray(ri)) {
    for (const item of ri) {
      if (typeof item === "string") recommendedIPv4.push(item);
      else if (item && typeof item === "object" && "value" in item) {
        const v = (item as { value?: string | string[] }).value;
        if (typeof v === "string") recommendedIPv4.push(v);
        else if (Array.isArray(v)) recommendedIPv4.push(...v.map(String));
      }
    }
  }

  return {
    configured: true,
    cnames,
    aValues,
    recommendedCNAME,
    recommendedIPv4,
    misconfigured: Boolean(json.misconfigured),
  };
}