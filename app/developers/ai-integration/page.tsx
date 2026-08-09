import Link from "next/link";
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo/site-config";
import {
  THEME_AI_DEFAULT_SCOPES,
  scopeDescription,
} from "@/lib/developer/scopes";

export const metadata: Metadata = {
  title: "AI Integration — Ettajer Developers",
  description:
    "Connect Claude or Cursor to Ettajer via OAuth and MCP to design private storefront themes.",
};

const MCP_ENDPOINT = absoluteUrl("/api/v1/mcp");
const AUTHORIZE = absoluteUrl("/oauth/authorize");
const TOKEN = absoluteUrl("/api/oauth/token");

export default function AiIntegrationPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 prose prose-neutral">
      <p>
        <Link href="/developers">← Developers</Link>
      </p>
      <h1>AI Integration Guide</h1>
      <p>
        Connect an external AI agent (Claude / Cursor MCP) to a real merchant store.
        AI designs presentation; Ettajer remains the commerce engine.
      </p>
      <p>
        System prompt for agents:{" "}
        <Link href="/developers/ai-system-prompt">/developers/ai-system-prompt</Link>
      </p>

      <h2>1. Create Ettajer Developer App</h2>
      <ol>
        <li>
          Sign in as the merchant and open{" "}
          <Link href="/dashboard/developer">/dashboard/developer</Link>.
        </li>
        <li>
          Create an application (e.g. <code>Claude</code> or <code>Cursor</code>).
        </li>
        <li>
          Copy the <strong>client ID</strong> and the one-time <strong>client secret</strong>{" "}
          immediately (secret is never shown again).
        </li>
      </ol>

      <h2>2. Configure OAuth redirect URI</h2>
      <p>
        Register exact redirect URIs on the app (exact match required). Documented
        production-compatible URIs:
      </p>
      <ul>
        <li>
          Claude (hosted surfaces):{" "}
          <code>https://claude.ai/api/mcp/auth_callback</code>
        </li>
        <li>
          Cursor desktop: <code>http://localhost:8787/callback</code>
        </li>
        <li>
          Cursor web / Agents:{" "}
          <code>https://www.cursor.com/agents/mcp/oauth/callback</code>
        </li>
        <li>
          Cursor legacy fallback (some installs):{" "}
          <code>cursor://anysphere.cursor-mcp/oauth/callback</code>
        </li>
        <li>
          Local manual testing: <code>http://localhost:3000/callback</code>
        </li>
      </ul>
      <p>
        Sources:{" "}
        <a href="https://claude.com/docs/connectors/building/authentication">
          Claude MCP authentication
        </a>
        ,{" "}
        <a href="https://cursor.com/docs/mcp">Cursor MCP docs</a>. Do not invent
        alternate redirect URLs.
      </p>

      <h2>3. Configure scopes</h2>
      <p>Default theme-AI scopes (publish is opt-in):</p>
      <ul>
        {THEME_AI_DEFAULT_SCOPES.map((s) => (
          <li key={s}>
            <code>{s}</code> — {scopeDescription(s)}
          </li>
        ))}
      </ul>
      <p>
        Publishing requires explicit <code>themes:publish</code>. Recommended default: AI
        drafts + previews; merchant publishes.
      </p>

      <h2>4–5. Connect the merchant store &amp; authorize</h2>
      <pre>{`GET ${AUTHORIZE}?client_id=…&redirect_uri=…&response_type=code&scope=…&state=…&code_challenge=…&code_challenge_method=S256`}</pre>
      <ul>
        <li>
          <code>state</code> required (min 8 chars)
        </li>
        <li>
          PKCE <code>S256</code> only
        </li>
        <li>
          Merchant must be signed in and own a store
        </li>
      </ul>
      <p>
        Exchange the code at <code>POST {TOKEN}</code> for{" "}
        <code>access_token</code> + rotating <code>refresh_token</code>.
      </p>
      <p>
        Or create an API key on the same app (reveal once) and send{" "}
        <code>Authorization: Bearer etsk_live_…</code>.
      </p>

      <h2 id="mcp">6. Configure MCP</h2>
      <h3>Ettajer MCP Server</h3>
      <pre>{`Endpoint:
${MCP_ENDPOINT}

Transport: HTTP JSON-RPC (POST)
Auth: Authorization: Bearer <access_token|etsk_live_…>`}</pre>
      <p>
        <strong>Authentication:</strong> OAuth access token or API key for the connected
        store.
      </p>
      <p>
        <strong>Required scopes:</strong> at least default theme AI scopes above.{" "}
        <code>themes:publish</code> only if the agent may publish.
      </p>
      <p>
        <strong>Available tools:</strong>{" "}
        <code>
          get_store, get_context, get_products, get_product, get_collections,
          get_themes, get_theme, get_theme_schema, create_theme, update_theme,
          create_page, update_page, delete_page, create_section, update_section,
          delete_section, get_media, upload_media, get_navigation, update_navigation,
          preview_theme, publish_theme
        </code>
        .
      </p>
      <p>
        <strong>Preview flow:</strong> <code>preview_theme</code> → short-lived signed{" "}
        <code>previewUrl</code> (no merchant cookie required).
      </p>
      <p>
        <strong>Publish flow:</strong> <code>publish_theme</code> → validate →
        transactional live apply → audit. Never auto-publish without{" "}
        <code>themes:publish</code>.
      </p>
      <p>Never put client secrets, API keys, or tokens in documentation or chat logs.</p>

      <h2>7. Test connection</h2>
      <pre>{`POST ${MCP_ENDPOINT}
Authorization: Bearer <token>
Content-Type: application/json

{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}
{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}
{"jsonrpc":"2.0","id":3,"method":"resources/list","params":{}}`}</pre>

      <h2>8–13. Context → schema → batch → preview → publish</h2>
      <ol>
        <li>
          <code>get_context</code> / <code>GET /api/v1/context</code> — follow{" "}
          <code>workflow.next</code> (state-aware <code>action</code> +{" "}
          <code>reason</code>)
        </li>
        <li>
          <code>get_theme_schema</code> / <code>GET /api/v1/themes/schema</code>
        </li>
        <li>
          <code>create_theme</code> only if no draft — otherwise reuse the draft from
          context
        </li>
        <li>
          <code>apply_theme_batch</code> /{" "}
          <code>POST /api/v1/themes/:id/batch</code> — prefer one fail-closed batch over
          many <code>create_section</code> calls; use real product/collection IDs
        </li>
        <li>
          <code>preview_theme</code> → open homepage, product, collection, custom page URLs
          (append path; keep query params)
        </li>
        <li>
          Merchant reviews in Customize or preview; then{" "}
          <code>publish_theme</code> or dashboard Publish
        </li>
      </ol>

      <h2>Real store test sequence</h2>
      <pre>{`get_context  (read workflow.next)
  → get_theme_schema
  → get_products / get_collections (if needed for real IDs)
  → create_theme (skip if draft already exists)
  → apply_theme_batch:
       hero + featured collection + product grid + editorial + footer
  → preview_theme
       → homepage | product | collection | custom page
  → refine via another apply_theme_batch (or update_section)
  → publish_theme (only with themes:publish + merchant intent)`}</pre>

      <h2>Audit</h2>
      <p>
        Every theme mutation and preview is written to{" "}
        <code>DeveloperAuditLog</code> (visible in dashboard developer activity). No full
        VCS yet — mutations remain auditable per action.
      </p>

      <h2>Recommended AI workflow</h2>
      <pre>{`DISCOVER → DESIGN → PREVIEW → REFINE → PUBLISH

get_context → follow workflow.next
  → get_theme_schema
  → create_theme (if no draft) → apply_theme_batch → preview_theme
Prefer batch over N× create_section. Avoid duplicate get_context / schema calls.
publish_theme only with themes:publish + merchant intent.`}</pre>

      <h2>Design principles</h2>
      <ul>
        <li>Responsive, mobile-first, accessible, minimal, fast</li>
        <li>Compatible with Ettajer storefront renderer</li>
        <li>Reference products/collections/media — never copy prices or inventory</li>
        <li>Avoid unnecessary gradients, huge DOM, fake checkout, hardcoded prices</li>
      </ul>

      <h2>Merchant approval</h2>
      <p>
        Default: AI creates draft → AI previews → merchant reviews → merchant publishes.
        Do not grant <code>themes:publish</code> unless the merchant explicitly wants
        agent-led publish.
      </p>

      <h2>Claude checklist</h2>
      <pre>{`[ ] Claude connects to Ettajer
[ ] OAuth works
[ ] MCP initializes
[ ] tools/list works
[ ] resources/list works
[ ] get_context works
[ ] get_theme_schema works
[ ] get_products works
[ ] create_theme works
[ ] apply_theme_batch works (prefer over many create_section)
[ ] preview_theme works
[ ] preview URL opens (home)
[ ] product preview works
[ ] collection preview works
[ ] custom page preview works
[ ] publish_theme works (only if scoped)
[ ] live storefront works
[ ] cart works
[ ] checkout works`}</pre>

      <h2>Cursor checklist</h2>
      <pre>{`Cursor MCP HTTP → ${MCP_ENDPOINT}
Authorization: Bearer <token>

[ ] initialize / tools/list / resources/list
[ ] get_context → follow workflow.next → get_theme_schema
[ ] create_theme → apply_theme_batch → preview_theme → publish_theme
[ ] Store B token cannot access Store A theme`}</pre>

      <h2>Real store smoke script (API)</h2>
      <pre>{`# After auth:
curl -s -H "Authorization: Bearer $TOKEN" ${absoluteUrl("/api/v1/context")}
curl -s -H "Authorization: Bearer $TOKEN" ${absoluteUrl("/api/v1/themes/schema")}
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \\
  -d '{"name":"Atlas Editorial","provider":"claude"}' ${absoluteUrl("/api/v1/themes")}
# Prefer POST /api/v1/themes/:id/batch with real product IDs
# Then POST preview-token; publish only with themes:publish`}</pre>

      <h2>Errors</h2>
      <p>
        Validation errors are machine-readable, e.g.{" "}
        <code>INVALID_PRODUCT_REFERENCE</code> with a hint to call{" "}
        <code>get_products</code>.
      </p>

      <h2>Performance notes</h2>
      <p>
        Preferred path: <code>get_context → schema → create_theme → apply_theme_batch →
        preview</code>. Measure with{" "}
        <code>npx tsx scripts/developer-ai-benchmark.ts</code>. Avoid duplicate context /
        schema calls and per-section mutation loops when batch is available.
      </p>

      <h2>Test commands</h2>
      <pre>{`npx vitest run lib/developer/__tests__
npm run test:integration
npm run lint
npm run build`}</pre>
    </main>
  );
}
