/** Detect which AI client an OAuth app is for, from name + redirect URIs. */

export type AiClientKind =
  | "claude"
  | "cursor"
  | "codex"
  | "chatgpt"
  | "openai"
  | "other";

export type DetectedAiClient = {
  kind: AiClientKind;
  label: string;
};

export function detectAiClient(input: {
  name: string;
  redirectUris?: string[];
}): DetectedAiClient {
  const hay = `${input.name} ${(input.redirectUris ?? []).join(" ")}`.toLowerCase();

  if (
    hay.includes("claude") ||
    hay.includes("anthropic") ||
    hay.includes("claude.ai")
  ) {
    return { kind: "claude", label: "Claude" };
  }
  if (
    hay.includes("cursor") ||
    hay.includes("anysphere") ||
    hay.includes("localhost:8787") ||
    hay.includes("cursor.com/agents/mcp")
  ) {
    return { kind: "cursor", label: "Cursor" };
  }
  if (hay.includes("codex")) {
    return { kind: "codex", label: "Codex" };
  }
  if (hay.includes("chatgpt") || hay.includes("chat.openai")) {
    return { kind: "chatgpt", label: "ChatGPT" };
  }
  if (hay.includes("openai") || hay.includes("platform.openai")) {
    return { kind: "openai", label: "OpenAI" };
  }

  const trimmed = input.name.trim();
  return {
    kind: "other",
    label: trimmed || "AI client",
  };
}

export type ConnectedAiClient = {
  kind: AiClientKind;
  label: string;
  appId: string;
  appName: string;
  storeNames: string[];
  grantCount: number;
};

/** Unique connected AI clients from apps that have active OAuth grants. */
export function collectConnectedAiClients(
  apps: {
    id: string;
    name: string;
    redirectUris?: string[];
    grants: { storeName: string }[];
  }[],
): ConnectedAiClient[] {
  const byKind = new Map<string, ConnectedAiClient>();

  for (const app of apps) {
    if (!app.grants.length) continue;
    const detected = detectAiClient(app);
    const key = `${detected.kind}:${app.id}`;
    const storeNames = Array.from(
      new Set(app.grants.map((g) => g.storeName).filter(Boolean)),
    );
    byKind.set(key, {
      kind: detected.kind,
      label: detected.label,
      appId: app.id,
      appName: app.name,
      storeNames,
      grantCount: app.grants.length,
    });
  }

  const order: AiClientKind[] = [
    "claude",
    "cursor",
    "codex",
    "chatgpt",
    "openai",
    "other",
  ];

  return Array.from(byKind.values()).sort(
    (a, b) => order.indexOf(a.kind) - order.indexOf(b.kind),
  );
}
