/** Developer API OAuth / API key scopes. */

export const DEVELOPER_SCOPES = [
  "store:read",
  "products:read",
  "collections:read",
  "orders:read",
  "customers:read",
  "checkout:read",
  "settings:read",
  "themes:read",
  "themes:create",
  "themes:write",
  "themes:publish",
  "themes:preview",
  "pages:read",
  "pages:write",
  "media:read",
  "media:write",
  "navigation:read",
  "navigation:write",
] as const;

export type DeveloperScope = (typeof DEVELOPER_SCOPES)[number];

/** Default scopes for theme-focused AI integrations (publish is opt-in). */
export const THEME_AI_DEFAULT_SCOPES: DeveloperScope[] = [
  "store:read",
  "products:read",
  "collections:read",
  "settings:read",
  "themes:read",
  "themes:create",
  "themes:write",
  "themes:preview",
  "pages:read",
  "pages:write",
  "media:read",
  "media:write",
  "navigation:read",
  "navigation:write",
];

const SCOPE_SET = new Set<string>(DEVELOPER_SCOPES);

export function isDeveloperScope(value: string): value is DeveloperScope {
  return SCOPE_SET.has(value);
}

export function parseScopes(input: string | string[] | undefined | null): DeveloperScope[] {
  const raw = Array.isArray(input)
    ? input
    : typeof input === "string"
      ? input.split(/[\s,]+/)
      : [];
  const out: DeveloperScope[] = [];
  for (const item of raw) {
    const s = item.trim();
    if (isDeveloperScope(s) && !out.includes(s)) out.push(s);
  }
  return out;
}

export function hasScope(granted: string[], required: DeveloperScope | DeveloperScope[]): boolean {
  const need = Array.isArray(required) ? required : [required];
  return need.every((s) => granted.includes(s));
}

export function hasAnyScope(granted: string[], required: DeveloperScope[]): boolean {
  return required.some((s) => granted.includes(s));
}

export function scopeDescription(scope: DeveloperScope): string {
  const map: Record<DeveloperScope, string> = {
    "store:read": "Read store profile and branding",
    "products:read": "Read products and inventory summaries",
    "collections:read": "Read collections",
    "orders:read": "Read orders (no mutations)",
    "customers:read": "Read customers (no mutations)",
    "checkout:read": "Read checkout configuration summaries",
    "settings:read": "Read non-secret store settings",
    "themes:read": "Read private and active themes",
    "themes:create": "Create private draft themes",
    "themes:write": "Update draft theme layouts, sections, and pages",
    "themes:publish": "Publish a draft theme to the live storefront",
    "themes:preview": "Issue short-lived signed preview URLs for private themes",
    "pages:read": "Read custom pages",
    "pages:write": "Create and update theme pages",
    "media:read": "List media assets",
    "media:write": "Upload and register media assets",
    "navigation:read": "Read navigation menus",
    "navigation:write": "Update theme navigation",
  };
  return map[scope];
}
