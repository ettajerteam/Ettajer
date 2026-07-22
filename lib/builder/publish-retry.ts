export type RetryFetchOptions = {
  retries?: number;
  baseDelayMs?: number;
  signal?: AbortSignal;
};

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const timer = window.setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true }
    );
  });
}

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

/** Fetch with exponential backoff for flaky networks (5xx / offline). Never retries 409. */
export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  options: RetryFetchOptions = {}
): Promise<Response> {
  const retries = options.retries ?? 2;
  const baseDelayMs = options.baseDelayMs ?? 400;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new Error("You appear to be offline. Reconnect, then retry Go live.");
    }
    try {
      const res = await fetch(input, { ...init, signal: options.signal ?? init?.signal });
      if (res.ok || res.status === 409 || !isRetryableStatus(res.status) || attempt === retries) {
        return res;
      }
      lastError = new Error(`HTTP ${res.status}`);
    } catch (error) {
      lastError = error;
      if (attempt === retries) throw error;
    }
    const delay = baseDelayMs * Math.pow(2, attempt) + Math.floor(Math.random() * 120);
    await sleep(delay, options.signal);
  }

  throw lastError instanceof Error ? lastError : new Error("Publish request failed");
}
