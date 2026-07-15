import { isResendConfigured } from "@/lib/resend";

export function getAuthProviders() {
  return {
    google:
      !!process.env.GOOGLE_CLIENT_ID?.trim() &&
      !!process.env.GOOGLE_CLIENT_SECRET?.trim(),
    email: isResendConfigured(),
  };
}
