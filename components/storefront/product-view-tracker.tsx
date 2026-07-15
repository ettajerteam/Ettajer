"use client";

import { useEffect, useRef } from "react";
import type { PublicMarketingIntegrations } from "@/lib/marketing-integrations";
import { trackViewContent } from "@/lib/marketing-events";

interface ProductViewTrackerProps {
  marketing: PublicMarketingIntegrations;
  product: {
    id: string;
    title: string;
    price: number;
  };
  currency: string;
}

export function ProductViewTracker({ marketing, product, currency }: ProductViewTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackViewContent(marketing, {
      productId: product.id,
      title: product.title,
      price: product.price,
      currency,
    });
  }, [marketing, product.id, product.title, product.price, currency]);

  return null;
}
