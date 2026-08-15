/** Login failure reasons that are UX friction, not credential attacks. */
export const NON_SECURITY_LOGIN_FAILURE_REASONS = [
  "email_not_verified",
  "no_password",
] as const;

export type NonSecurityLoginFailureReason =
  (typeof NON_SECURITY_LOGIN_FAILURE_REASONS)[number];

/** Prisma `where` for failed logins that matter for security dashboards / IP limits. */
export function securityFailedLoginWhere(
  extra: Record<string, unknown> = {},
) {
  return {
    success: false as const,
    NOT: {
      reason: { in: [...NON_SECURITY_LOGIN_FAILURE_REASONS] },
    },
    ...extra,
  };
}
