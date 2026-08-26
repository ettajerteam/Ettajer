/**
 * Stable number formatting for admin UI.
 * Always use en-US so SSR (Node locale) and client (browser locale)
 * never diverge — e.g. "15,457" vs "15 457".
 */

const intFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const decimalFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

export function formatAdminInt(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return intFormatter.format(Math.round(value));
}

export function formatAdminNumber(
  value: number,
  opts?: { decimals?: number }
): string {
  if (!Number.isFinite(value)) return "0";
  if (opts?.decimals != null && opts.decimals > 0) {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: opts.decimals,
      minimumFractionDigits: 0,
    }).format(value);
  }
  return decimalFormatter.format(value);
}
