import Link from "next/link";

export default function DevelopersMcpPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 prose prose-neutral">
      <p>
        <Link href="/developers">← Developers</Link>
      </p>
      <h1>MCP</h1>
      <p>
        HTTP JSON-RPC at <code>POST /api/v1/mcp</code> with the same Bearer auth and scopes
        as the REST API.
      </p>
      <pre>{`{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list",
  "params": {}
}`}</pre>
      <p>
        Cursor example: point an MCP HTTP transport at your Ettajer origin{" "}
        <code>/api/v1/mcp</code> and set the Authorization header to a merchant API key or
        OAuth access token.
      </p>
      <h2>Preview &amp; publish</h2>
      <ul>
        <li>
          <code>preview_theme</code> — issues a short-lived signed preview URL (read-only,
          ~10 minutes). Works on homepage, product, collection, and custom pages.
        </li>
        <li>
          <code>publish_theme</code> — requires <code>themes:publish</code>; transactional;
          removes orphan custom pages from the live storefront.
        </li>
      </ul>
      <h2>Rate limiting</h2>
      <p>
        Default <code>RATE_LIMIT_BACKEND=memory</code> is suitable for local or
        single-instance development. Production multi-instance deployments should set{" "}
        <code>RATE_LIMIT_BACKEND=redis</code> with Upstash REST credentials. In-memory
        limits are <strong>not</strong> distributed across instances.
      </p>
    </main>
  );
}
