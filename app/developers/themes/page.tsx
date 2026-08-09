import Link from "next/link";

export default function DevelopersThemesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 prose prose-neutral">
      <p>
        <Link href="/developers">← Developers</Link>
      </p>
      <h1>Themes</h1>
      <p>
        AI themes are private <code>StoreTheme</code> drafts. Create with{" "}
        <code>POST /api/v1/themes</code>, mutate sections/pages incrementally, preview with{" "}
        <code>?preview=true&amp;previewThemeId=…</code>, then publish with{" "}
        <code>themes:publish</code>.
      </p>
      <p>
        Themes reference real product IDs — they never duplicate price or inventory.
        System templates Aura, TechNova, and Paper remain available in the merchant Themes
        gallery.
      </p>
      <p>
        Schema: <Link href="/api/v1/themes/schema">/api/v1/themes/schema</Link> (authenticated).
      </p>
    </main>
  );
}
