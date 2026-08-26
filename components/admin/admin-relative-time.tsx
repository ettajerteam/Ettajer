"use client";

import { useEffect, useState } from "react";
import {
  formatAdminDateTime,
  formatAdminRelative,
} from "@/lib/admin/format";

/**
 * Hydration-safe relative time.
 * First paint uses a timezone-stable absolute timestamp (matches SSR).
 * After mount, switches to relative ("8 min ago").
 */
export function AdminRelativeTime({
  value,
  className,
}: {
  value: Date | string;
  className?: string;
}) {
  const [label, setLabel] = useState(() => formatAdminDateTime(value));

  useEffect(() => {
    setLabel(formatAdminRelative(value));
  }, [value]);

  return <span className={className}>{label}</span>;
}
