import { createHash } from "crypto";

export function pkceChallengeS256(verifier: string): string {
  return createHash("sha256").update(verifier, "utf8").digest("base64url");
}

export function verifyPkce(
  verifier: string,
  challenge: string,
  method: string | null | undefined,
): boolean {
  if (!verifier || !challenge) return false;
  // Only S256 is accepted (plain PKCE is vulnerable to interception).
  if (method !== "S256") return false;
  return pkceChallengeS256(verifier) === challenge;
}
