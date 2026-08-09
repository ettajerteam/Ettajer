import Link from "next/link";

export default function DevelopersOAuthPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 prose prose-neutral">
      <p>
        <Link href="/developers">← Developers</Link>
      </p>
      <h1>OAuth</h1>
      <ol>
        <li>
          Merchant creates an app in <code>/dashboard/developer</code> and copies Client
          ID / Secret.
        </li>
        <li>
          Redirect the merchant to <code>/oauth/authorize</code> with{" "}
          <code>client_id</code>, <code>redirect_uri</code>, <code>response_type=code</code>
          , <code>scope</code>, and PKCE (<code>code_challenge</code> S256).
        </li>
        <li>Merchant signs in and authorizes scopes for their store.</li>
        <li>
          Exchange the code at <code>POST /api/oauth/token</code> (
          <code>grant_type=authorization_code</code>).
        </li>
        <li>
          Refresh with <code>grant_type=refresh_token</code> (rotation enabled). Revoke via{" "}
          <code>POST /api/oauth/revoke</code>.
        </li>
      </ol>
    </main>
  );
}
