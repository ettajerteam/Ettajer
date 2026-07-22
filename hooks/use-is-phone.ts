"use client";

import { useEffect, useState } from "react";

/** True when viewport matches phone widths (below Tailwind `md`). */
const PHONE_QUERY = "(max-width: 767px)";

/**
 * Returns whether the current viewport is phone-sized.
 * `null` until mounted (avoids SSR/client mismatch).
 */
export function useIsPhone(): boolean | null {
  const [isPhone, setIsPhone] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(PHONE_QUERY);
    const sync = () => setIsPhone(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return isPhone;
}
