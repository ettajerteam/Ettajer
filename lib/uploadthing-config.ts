/**
 * Client + server: detect whether UploadThing client uploads should be used.
 * Secrets like UPLOADTHING_TOKEN are server-only; the client needs a public app id.
 */
export function isUploadthingConfigured(): boolean {
  if (typeof window === "undefined") {
    return Boolean(
      process.env.UPLOADTHING_TOKEN?.trim() ||
        process.env.UPLOADTHING_SECRET?.trim()
    );
  }
  return Boolean(
    process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID?.trim() ||
      process.env.NEXT_PUBLIC_UPLOADTHING_ENABLED === "true"
  );
}
