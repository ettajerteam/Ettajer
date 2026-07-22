import { revalidatePath } from "next/cache";

/** Bust storefront caches after theme / layout / navigation go-live. */
export function revalidateStorefront(slug: string | null | undefined): void {
  if (!slug || typeof slug !== "string") return;
  try {
    revalidatePath(`/store/${slug}`);
    revalidatePath(`/store/${slug}`, "layout");
  } catch {
    // revalidatePath can throw outside a request context — ignore
  }
}
