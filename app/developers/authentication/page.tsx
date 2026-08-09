import Link from "next/link";

export default function DevelopersAuthPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 prose prose-neutral">
      <p>
        <Link href="/developers">← Developers</Link>
      </p>
      <h1>Authentication</h1>
      <p>
        External apps authenticate with an OAuth 2.0 access token or a store-scoped API
        key. Send <code>Authorization: Bearer …</code> on every <code>/api/v1</code>{" "}
        request.
      </p>
      <ul>
        <li>
          OAuth access tokens start with <code>eta_</code>
        </li>
        <li>
          API keys start with <code>etsk_live_</code>
        </li>
      </ul>
      <p>
        The token is bound to one store at authorize time. Never send <code>storeId</code>{" "}
        as a client parameter — the API ignores it and uses the grant.
      </p>
      <h2>Errors</h2>
      <pre>{`{ "error": { "code": "INSUFFICIENT_SCOPE", "message": "…" } }`}</pre>
    </main>
  );
}
