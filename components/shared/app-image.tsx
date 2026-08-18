"use client";

import Image, { type ImageProps } from "next/image";
import { shouldBypassImageOptimizer } from "@/lib/image-optimization";

/**
 * next/image wrapper that does not send remote URLs through `/_next/image`.
 * Production Vercel Hobby/quota exhaustion otherwise yields broken storefront images
 * (402 OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED) while alt text still renders.
 */
export function AppImage({ unoptimized, src, ...props }: ImageProps) {
  return (
    <Image
      src={src}
      unoptimized={unoptimized ?? shouldBypassImageOptimizer(src)}
      {...props}
    />
  );
}