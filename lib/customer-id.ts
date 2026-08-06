/** Isomorphic customer id helpers (safe for client + server). */

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  const base64 =
    typeof btoa === "function"
      ? btoa(binary)
      : Buffer.from(bytes).toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(id: string): Uint8Array {
  const padded = id.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (padded.length % 4)) % 4;
  const base64 = padded + "=".repeat(padLen);
  if (typeof atob === "function") {
    const binary = atob(base64);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
    return out;
  }
  return new Uint8Array(Buffer.from(base64, "base64"));
}

export function encodeCustomerId(email: string): string {
  const normalized = email.toLowerCase();
  if (typeof TextEncoder !== "undefined") {
    return toBase64Url(new TextEncoder().encode(normalized));
  }
  return toBase64Url(new Uint8Array(Buffer.from(normalized, "utf-8")));
}

export function decodeCustomerId(id: string): string {
  try {
    const bytes = fromBase64Url(id);
    if (typeof TextDecoder !== "undefined") {
      return new TextDecoder().decode(bytes);
    }
    return Buffer.from(bytes).toString("utf-8");
  } catch {
    return "";
  }
}
