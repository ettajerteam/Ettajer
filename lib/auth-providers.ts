import { isResendConfigured } from "@/lib/resend";

export function getAuthProviders() {
  return {
    google:
      !!process.env.GOOGLE_CLIENT_ID?.trim() &&
      !!process.env.GOOGLE_CLIENT_SECRET?.trim(),
    email: isResendConfigured(),
    /** Email/password Credentials provider is always registered in lib/auth.ts */
    credentials: true,
  };
}
