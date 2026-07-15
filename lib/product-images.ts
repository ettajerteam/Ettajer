export function parseProductImages(images: unknown): string[] {
  if (Array.isArray(images)) {
    return images.filter((img): img is string => typeof img === "string");
  }
  return [];
}
