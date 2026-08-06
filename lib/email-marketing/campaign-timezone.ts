/**
 * Convert a local wall-clock datetime in an IANA timezone to a UTC Date.
 * `local` format: "YYYY-MM-DDTHH:mm" or "YYYY-MM-DDTHH:mm:ss"
 */
export function zonedLocalToUtc(local: string, timeZone: string): Date {
  const trimmed = local.trim();
  const match = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/
  );
  if (!match) {
    throw new Error("Invalid local datetime");
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6] ?? "0");

  // Initial guess: treat components as UTC, then correct by zone offset.
  let utc = Date.UTC(year, month - 1, day, hour, minute, second);
  for (let i = 0; i < 3; i++) {
    const offset = getTimeZoneOffsetMs(timeZone, new Date(utc));
    const next = Date.UTC(year, month - 1, day, hour, minute, second) - offset;
    if (next === utc) break;
    utc = next;
  }
  return new Date(utc);
}

/** Offset of `timeZone` at `date`: (zone wall clock as UTC) - (true UTC). */
export function getTimeZoneOffsetMs(timeZone: string, date: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(date);
  const map: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") map[part.type] = part.value;
  }
  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour) % 24,
    Number(map.minute),
    Number(map.second)
  );
  return asUtc - date.getTime();
}

export function formatUtcInTimeZone(
  date: Date | string,
  timeZone: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    timeZone,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  }).format(d);
}

/** Common merchant timezones (Morocco-first SaaS). */
export const CAMPAIGN_TIMEZONES = [
  { id: "Africa/Casablanca", label: "Morocco (Casablanca)" },
  { id: "Africa/Algiers", label: "Algeria (Algiers)" },
  { id: "Africa/Tunis", label: "Tunisia (Tunis)" },
  { id: "Europe/Paris", label: "France (Paris)" },
  { id: "Europe/London", label: "United Kingdom (London)" },
  { id: "Europe/Madrid", label: "Spain (Madrid)" },
  { id: "Asia/Dubai", label: "UAE (Dubai)" },
  { id: "America/New_York", label: "US Eastern" },
  { id: "America/Los_Angeles", label: "US Pacific" },
  { id: "UTC", label: "UTC" },
] as const;

export function defaultCampaignTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Africa/Casablanca";
  } catch {
    return "Africa/Casablanca";
  }
}

export function isValidIanaTimeZone(timeZone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch {
    return false;
  }
}

/** datetime-local value for an input, in the given timezone. */
export function utcToDatetimeLocalValue(
  date: Date | string | null | undefined,
  timeZone: string
): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = dtf.formatToParts(d);
  const map: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") map[part.type] = part.value;
  }
  const hour = (map.hour === "24" ? "00" : map.hour).padStart(2, "0");
  return `${map.year}-${map.month}-${map.day}T${hour}:${map.minute}`;
}
