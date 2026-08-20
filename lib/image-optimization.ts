import type { ImageProps } from "next/image";
import Image from "next/image";

/** Remote merchant assets (Vercel Blob, UploadThing, supplier CDNs). */
export function isRemoteImageSrc(src: ImageProps["src"]): boolean {
  return typeof src === "string" && /^https?:\/\//i.test(src);
}

/**
 * Vercel Image Optimization (`/_next/image`) returns HTTP 402
 * OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED when the plan quota is exceeded.
 * Blob URLs are already compressed WebP on a CDN — skip the optimizer.
 */
export function shouldBypassImageOptimizer(src: ImageProps["src"]): boolean {
  return isRemoteImageSrc(src);
}