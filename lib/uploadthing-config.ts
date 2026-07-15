export function isUploadthingConfigured(): boolean {
  return !!process.env.UPLOADTHING_TOKEN?.trim();
}
