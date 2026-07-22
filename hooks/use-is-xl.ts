"use client";

import { useEffect, useState } from "react";

/** Tailwind `xl` — 1280px. */
const XL_QUERY = "(min-width: 1280px)";

/**
 * Whether the viewport is xl+.
 * `null` until mounted (avoids SSR/client mismatch).
 */
export function useIsXl(): boolean | null {
  const [isXl, setIsXl] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(XL_QUERY);
    const sync = () => setIsXl(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return isXl;
}
