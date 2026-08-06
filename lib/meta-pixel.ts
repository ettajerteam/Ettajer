/**
 * Meta Pixel helpers — queue events until fbq is ready so ViewContent /
 * AddToCart / Purchase don't silently drop when the script is still loading.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
  }
}

const MAX_WAIT_MS = 8000;
const POLL_MS = 50;

type FbqCall = unknown[];

const queue: FbqCall[] = [];
let flushing = false;
let waiter: Promise<boolean> | null = null;

function flushQueue() {
  if (flushing || typeof window === "undefined" || typeof window.fbq !== "function") return;
  flushing = true;
  while (queue.length > 0) {
    const args = queue.shift();
    if (args) window.fbq!(...args);
  }
  flushing = false;
}

export function waitForFbq(timeoutMs = MAX_WAIT_MS): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (typeof window.fbq === "function") {
    flushQueue();
    return Promise.resolve(true);
  }
  if (waiter) return waiter;

  waiter = new Promise((resolve) => {
    const started = Date.now();
    const timer = window.setInterval(() => {
      if (typeof window.fbq === "function") {
        window.clearInterval(timer);
        waiter = null;
        flushQueue();
        resolve(true);
        return;
      }
      if (Date.now() - started >= timeoutMs) {
        window.clearInterval(timer);
        waiter = null;
        resolve(false);
      }
    }, POLL_MS);
  });

  return waiter;
}

/** Call fbq immediately if ready, otherwise queue until the pixel script loads. */
export function callFbq(...args: unknown[]): void {
  if (typeof window === "undefined") return;
  if (typeof window.fbq === "function") {
    flushQueue();
    window.fbq(...args);
    return;
  }
  queue.push(args);
  void waitForFbq();
}

export function trackMetaPageView(options?: { eventID?: string }): void {
  if (options?.eventID) {
    callFbq("track", "PageView", {}, { eventID: options.eventID });
  } else {
    callFbq("track", "PageView");
  }
}

export function trackMetaEvent(
  event: string,
  payload?: Record<string, unknown>,
  options?: { eventID?: string }
): void {
  if (options?.eventID) {
    callFbq("track", event, payload ?? {}, { eventID: options.eventID });
  } else {
    callFbq("track", event, payload ?? {});
  }
}
