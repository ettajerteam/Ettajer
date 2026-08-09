import Link from "next/link";

export const metadata = {
  title: "Developer Quickstart — Ettajer",
  description: "Minimal AI workflow: auth → context → schema → theme → preview → publish",
};

export default function DevelopersQuickstartPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 prose prose-neutral">
      <p>
        <Link href="/developers">← Developers</Link>
      </p>
      <h1>AI Quickstart</h1>
      <p>
        Machine-friendly workflow for Claude / Cursor. Principle:{" "}
        <strong>AI controls presentation. Ettajer controls commerce.</strong>
      </p>
      <ol>
        <li>
          <strong>Authenticate</strong> — OAuth (
          <Link href="/developers/oauth">docs</Link>) or API key from{" "}
          <code>/dashboard/developer</code>. Send{" "}
          <code>Authorization: Bearer …</code>.
        </li>
        <li>
          <code>GET /api/v1/context</code> — understand the store (branding, products,
          collections, themes).
        </li>
        <li>
          <code>GET /api/v1/themes/schema</code> — learn allowed sections, settings, and
          reference shapes.
        </li>
        <li>
          <code>POST /api/v1/themes</code> — create a private draft (
          <code>{`{ "name": "Atlas Editorial", "provider": "claude" }`}</code>).
        </li>
        <li>
          <code>POST /api/v1/themes/:id/pages</code> — optional custom pages (not cart /
          checkout / products).
        </li>
        <li>
          <code>POST /api/v1/themes/:id/sections</code> — add hero, product-grid with real{" "}
          <code>productId</code>s, etc.
        </li>
        <li>
          <strong>Preview</strong> —{" "}
          <code>POST /api/v1/themes/:id/preview-token</code> returns a short-lived signed
          URL (
          <code>
            /store/{"{slug}"}?preview=true&amp;previewThemeId=…&amp;previewToken=…
          </code>
          ). Same storefront renderer on home, product, collection, and custom pages;
          real catalog/cart/checkout. Merchant session also works without a token.
        </li>
        <li>
          Merchant <strong>Customize</strong> opens{" "}
          <code>/dashboard/themes/editor?themeId=…</code> and hydrates the visual editor
          from the draft.
        </li>
        <li>
          <code>POST /api/v1/themes/:id/publish</code> — requires{" "}
          <code>themes:publish</code>. Transactional. Cart/checkout stay Ettajer.
        </li>
      </ol>
      <h2>MCP</h2>
      <p>
        Same auth on <code>POST /api/v1/mcp</code>. Prefer tools{" "}
        <code>get_context</code> → <code>get_theme_schema</code> →{" "}
        <code>create_theme</code> → <code>create_section</code> →{" "}
        <code>preview_theme</code> → <code>publish_theme</code>.
      </p>
      <p>
        Full docs: <Link href="/developers/llms-full.txt">llms-full.txt</Link>
      </p>
    </main>
  );
}
