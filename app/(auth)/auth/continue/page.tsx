import { redirectAfterAuth } from "@/lib/auth-redirect";

export const dynamic = "force-dynamic";

/**
 * Universal post-sign-in landing (OAuth, magic link, newUser page).
 * Sends merchants to dashboard or onboarding based on store existence;
 * platform admins without a store go to /admin.
 */
export default async function AuthContinuePage() {
  await redirectAfterAuth("/dashboard");
}
