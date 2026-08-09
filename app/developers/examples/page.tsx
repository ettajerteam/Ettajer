import Link from "next/link";

export default function DevelopersExamplesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 prose prose-neutral">
      <p>
        <Link href="/developers">← Developers</Link>
      </p>
      <h1>Examples</h1>
      <h2>Create a draft theme</h2>
      <pre>{`POST /api/v1/themes
Authorization: Bearer etsk_live_…
{ "name": "Atlas Editorial", "provider": "claude" }`}</pre>
      <h2>Add a hero section</h2>
      <pre>{`POST /api/v1/themes/{id}/sections
{
  "templateKey": "home",
  "sectionType": "hero",
  "settings": { "headline": "New season", "ctaText": "Shop" }
}`}</pre>
      <h2>Preview then publish</h2>
      <pre>{`GET /store/{slug}?preview=true&previewThemeId={id}
POST /api/v1/themes/{id}/publish   # requires themes:publish`}</pre>
    </main>
  );
}
