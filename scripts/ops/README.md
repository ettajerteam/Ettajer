# Ettajer Google Ops

## Connected (CLI)

| Resource | Value |
|----------|--------|
| Account | `ettajerteam@gmail.com` |
| Project | `ettajer-501512` |
| Ops SA | `ettajer-ops@ettajer-501512.iam.gserviceaccount.com` |
| Key file | `secrets/ettajer-ops.json` (gitignored) |
| APIs enabled | Analytics Data, Analytics Admin, Search Console, IAM |

## Commands

```bash
npm run gcp:bootstrap   # re-run project setup
npm run gcp:env         # append GCP vars to .env
npm run gcp:verify      # test Analytics + Search Console API access
```

## One-time UI steps (CEO)

These cannot be fully automated from Terminal:

### 1. GA4 Property ID (already have Measurement ID `G-GL29JG3VQC`)

The **Stream ID** (`15263943351`) is NOT the Property ID. Find the Property ID like this:

**French UI (Admin / Paramètres de la propriété)**  
1. Open https://analytics.google.com  
2. Click **Admin** (engrenage, bottom left)  
3. Under the **Property / Propriété** column, open **Property settings** / **Paramètres de la propriété**  
4. Copy **Property ID** / **ID de la propriété** — digits only, e.g. `123456789`  
   - Or look at the browser URL: `.../p/**123456789**/...`  
5. Still in Admin → **Property access management** / **Gestion des accès à la propriété**  
   → Add `ettajer-ops@ettajer-501512.iam.gserviceaccount.com` as **Viewer** / **Lecteur**  
6. Paste the number in chat (or run):

```bash
node scripts/ops/set-ga4-property.mjs 123456789
npm run vercel:env
npm run gcp:verify
```

Already set: `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-GL29JG3VQC` (tag live on www).

### 2. Search Console
1. https://search.google.com/search-console → add `https://www.ettajer.com`
2. Users → add `ettajer-ops@ettajer-501512.iam.gserviceaccount.com` as **Full**
3. Verify ownership (DNS / HTML)

### 3. OAuth (Gmail signup)
1. https://console.cloud.google.com/apis/credentials?project=ettajer-501512
2. Open your OAuth 2.0 Client
3. Authorized redirect URIs:
   - `https://www.ettajer.com/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google`

Then tell Cursor: **"Google UI steps done"** → run `npm run gcp:verify` + wire measurement ID into the app.
