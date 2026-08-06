import { OAuth2Client } from "google-auth-library";

export type GoogleIdTokenPayload = {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
};

export async function verifyGoogleIdToken(
  idToken: string,
): Promise<GoogleIdTokenPayload | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  if (!clientId || !idToken.trim()) return null;

  try {
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email) return null;

    return {
      sub: payload.sub,
      email: payload.email.toLowerCase(),
      email_verified: payload.email_verified === true,
      name: payload.name,
      picture: payload.picture,
      given_name: payload.given_name,
      family_name: payload.family_name,
    };
  } catch (err) {
    console.error("Google ID token verification failed:", err);
    return null;
  }
}
