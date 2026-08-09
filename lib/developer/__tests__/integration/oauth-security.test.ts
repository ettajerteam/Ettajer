/**
 * D4 OAuth DB integration: single-use codes + PKCE failure.
 * Skips when DATABASE_URL is unset.
 */
import { createHash, randomBytes } from "crypto";
import { describe, expect, it } from "vitest";
import {
  createTwoStoreFixture,
  hasTestDatabase,
} from "@/lib/developer/__tests__/helpers/test-fixtures";
import {
  createAuthorizationCode,
  exchangeAuthorizationCode,
} from "@/lib/developer/oauth";
import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/developer/crypto";
import { THEME_AI_DEFAULT_SCOPES } from "@/lib/developer/scopes";
import { DeveloperApiError } from "@/lib/developer/errors";

const describeDb = hasTestDatabase ? describe : describe.skip;

function s256(verifier: string) {
  return createHash("sha256").update(verifier).digest("base64url");
}

describeDb("D4 OAuth grant exchange (db)", () => {
  it("rejects reused authorization codes and bad PKCE", async () => {
    const fx = await createTwoStoreFixture({
      scopesA: [...THEME_AI_DEFAULT_SCOPES],
      scopesB: [...THEME_AI_DEFAULT_SCOPES],
    });

    try {
      const clientSecret = `secret-a-${randomBytes(4).toString("hex")}`;
      await prisma.developerApplication.update({
        where: { id: fx.appA.id },
        data: { clientSecretHash: hashToken(clientSecret) },
      });

      const verifier = randomBytes(32).toString("base64url");
      const challenge = s256(verifier);
      const redirectUri = "http://localhost:3000/callback";

      const { code } = await createAuthorizationCode({
        applicationId: fx.appA.id,
        userId: fx.userA.id,
        storeId: fx.storeA.id,
        scopes: [...THEME_AI_DEFAULT_SCOPES],
        redirectUri,
        codeChallenge: challenge,
        codeChallengeMethod: "S256",
      });

      await expect(
        exchangeAuthorizationCode({
          clientId: fx.appA.clientId,
          clientSecret,
          code,
          redirectUri,
          codeVerifier: "totally-wrong-verifier-xxxxxxxxxxxx",
        }),
      ).rejects.toMatchObject({ code: "INVALID_GRANT" });

      const first = await exchangeAuthorizationCode({
        clientId: fx.appA.clientId,
        clientSecret,
        code,
        redirectUri,
        codeVerifier: verifier,
      });
      expect(first.access_token).toBeTruthy();

      await expect(
        exchangeAuthorizationCode({
          clientId: fx.appA.clientId,
          clientSecret,
          code,
          redirectUri,
          codeVerifier: verifier,
        }),
      ).rejects.toBeInstanceOf(DeveloperApiError);
    } finally {
      await fx.cleanup();
    }
  });
});
