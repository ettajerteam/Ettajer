# AGENTS.md

## Cursor Cloud specific instructions

Ettajer is a single Next.js 14 (App Router) + TypeScript app (merchant dashboard, storefronts, admin, developer API). The only hard backing dependency is a **PostgreSQL** database; every other integration (Google OAuth, Resend email, Stripe, Vercel Blob, Meta/Pinterest/Etsy/AliExpress, Upstash) is optional and env-gated — the app boots and degrades gracefully when those are unset.

### Environment already provisioned by the startup/update script
- Node deps are installed (`npm install`, which runs `prisma generate` via `postinstall`).
- A local **PostgreSQL 16** server is provided by the VM; the database `ettajer` is used for dev.
- A local `.env` (gitignored) is present pointing `DATABASE_URL`/`DIRECT_URL` at `postgresql://postgres:postgres@localhost:5432/ettajer` with a dev `NEXTAUTH_SECRET`. Standard run/build/test/lint commands live in `package.json` and `README.md`.

### Non-obvious caveats
- **Postgres is not managed by systemd here.** If `psql`/Prisma can't connect, start it with `sudo pg_ctlcluster 16 main start` (check with `pg_lsclusters`). It does not auto-start on a bare shell.
- **After changing `prisma/schema.prisma`**, run `npx prisma db push` then `npx prisma generate`. `db push` is used instead of migrations for local dev (there is only one migration file in the repo).
- **`npm run build` is production-oriented** (`scripts/vercel-build.mjs`) and injects a dummy `DATABASE_URL` fallback so `prisma generate` works without a live DB — for local development use `npm run dev`, not the build.
- **Auth without external providers:** With no `GOOGLE_CLIENT_ID`/Google config and no `RESEND_API_KEY`, only the email+password (Credentials) provider is active. Credentials login requires `emailVerified` to be set, but the activation email needs Resend. For local testing, create the account via `POST /api/auth/signup` then mark the user verified directly in the DB, e.g. `UPDATE "User" SET "emailVerified"=now(), status='ACTIVE' WHERE email='...';`. After that, log in normally at `/login`.
- **Signup password rules:** min 8 chars, at least one letter and one number (see `lib/validations/signup.ts`).
- **Integration tests need the DB.** `npm test` (Vitest) includes DB-backed integration tests under `lib/developer/__tests__/integration` that read `DATABASE_URL` from `.env`; they pass against the local Postgres.
- **Product "Save draft" pre-publish modal:** saving a product may surface an "Almost ready to publish" modal warning about missing Category/Photos; this is expected app behavior — you can dismiss it and save the draft.
