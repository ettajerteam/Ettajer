"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { captureUtmFromUrl } from "@/lib/marketing-attribution";

export function UtmCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    if (query) captureUtmFromUrl(`?${query}`);
  }, [searchParams]);

  return null;
}
