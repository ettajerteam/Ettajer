import Link from "next/link";

export default function DevelopersApiPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 prose prose-neutral">
      <p>
        <Link href="/developers">← Developers</Link>
      </p>
      <h1>API</h1>
      <p>
        Versioned REST under <code>/api/v1</code>. See{" "}
        <Link href="/developers/openapi.json">OpenAPI 1.1.0</Link>.
      </p>

      <h2>Compatibility policy</h2>
      <ul>
        <li>
          <strong>v1</strong> is the stable Developer API contract.
        </li>
        <li>Backward-compatible additions may be introduced without a new version.</li>
        <li>
          Breaking changes require a new API version (<code>/api/v2</code>). We will not
          silently break v1 clients.
        </li>
      </ul>

      <h2>Response contract</h2>
      <pre>{`Success: { "data": … }
List:    { "data": { "products": […] }, "pagination": { "nextCursor", "hasMore", "limit" } }
Error:   { "error": { "code", "message", "details?", "requestId" } }`}</pre>
      <p>
        Headers: <code>X-Request-Id</code>, <code>X-RateLimit-Limit</code>,{" "}
        <code>X-RateLimit-Remaining</code>, <code>X-RateLimit-Reset</code>. Mutations
        accept <code>Idempotency-Key</code>. On 429: <code>Retry-After</code>.
      </p>
      <p>
        In-memory rate limiting (<code>RATE_LIMIT_BACKEND=memory</code>) is{" "}
        <strong>not</strong> multi-instance safe. Use Redis in production.
      </p>

      <h2>Core endpoints</h2>
      <ul>
        <li>GET /api/v1/context</li>
        <li>GET /api/v1/store</li>
        <li>GET /api/v1/products?limit=&amp;cursor=</li>
        <li>GET /api/v1/collections</li>
        <li>GET /api/v1/orders (read-only)</li>
        <li>GET/POST /api/v1/themes</li>
        <li>GET /api/v1/themes/schema</li>
        <li>POST /api/v1/themes/:id/batch</li>
        <li>POST /api/v1/themes/:id/sections</li>
        <li>POST /api/v1/themes/:id/preview-token</li>
        <li>POST /api/v1/themes/:id/publish</li>
        <li>GET/POST /api/v1/media</li>
        <li>GET/PATCH /api/v1/navigation</li>
        <li>POST /api/v1/mcp</li>
      </ul>
      <p>Commerce write APIs are intentionally absent.</p>
      <p>
        AI guide: <Link href="/developers/ai-integration">AI Integration</Link>
      </p>
    </main>
  );
}
