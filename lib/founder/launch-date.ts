/** Edge-safe launch date helpers (no Prisma / Node-only deps). */

/** Default: July 23, 2026 00:00 Morocco (UTC+1). Override with ETTAJER_LAUNCH_TARGET. */
export function getLaunchTargetDate(): Date {
  const raw = process.env.ETTAJER_LAUNCH_TARGET?.trim();
  if (raw) {
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date("2026-07-23T00:00:00.000+01:00");
}

export function isPlatformLaunched(now = new Date()): boolean {
  return now.getTime() >= getLaunchTargetDate().getTime();
}

export function getMsUntilLaunch(now = new Date()): number {
  return Math.max(0, getLaunchTargetDate().getTime() - now.getTime());
}
