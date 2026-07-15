export interface MarketingEventLogEntry {
  id: string;
  event: string;
  platform: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

const LOG_KEY = "ettajer_marketing_events";
const MAX_EVENTS = 30;

export function logMarketingEvent(
  platform: string,
  event: string,
  payload: Record<string, unknown> = {}
): void {
  if (typeof window === "undefined") return;

  try {
    const raw = sessionStorage.getItem(LOG_KEY);
    const existing: MarketingEventLogEntry[] = raw ? JSON.parse(raw) : [];

    const entry: MarketingEventLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      event,
      platform,
      payload,
      timestamp: new Date().toISOString(),
    };

    const next = [entry, ...existing].slice(0, MAX_EVENTS);
    sessionStorage.setItem(LOG_KEY, JSON.stringify(next));

    window.dispatchEvent(new CustomEvent("ettajer:marketing-event", { detail: entry }));
  } catch {
    // ignore storage errors
  }
}

export function getMarketingEventLog(): MarketingEventLogEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = sessionStorage.getItem(LOG_KEY);
    return raw ? (JSON.parse(raw) as MarketingEventLogEntry[]) : [];
  } catch {
    return [];
  }
}

export function clearMarketingEventLog(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(LOG_KEY);
}
