/**
 * Stable formatting for admin UI.
 * Always use en-US + Africa/Casablanca so SSR (Node) and the browser
 * never diverge on numbers or wall-clock times.
 */

export const ADMIN_TIME_ZONE = "Africa/Casablanca";

const intFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const decimalFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
  timeZone: ADMIN_TIME_ZONE,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: ADMIN_TIME_ZONE,
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

export function formatAdminDateTime(
  value: Date | string | null | undefined
): string {
  if (!value) return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return dateTimeFormatter.format(d);
}

export function formatAdminDate(
  value: Date | string | null | undefined
): string {
  if (!value) return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return dateFormatter.format(d);
}

/** Relative label; falls back to timezone-stable absolute time after 48h. */
export function formatAdminRelative(
  value: Date | string,
  nowMs = Date.now()
): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  const diffMs = nowMs - d.getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  return formatAdminDateTime(d);
}
