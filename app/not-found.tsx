import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] text-white">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-20 text-center sm:py-28">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">
          404
        </p>
        <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          Page not found
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-sm font-light leading-relaxed text-white/55">
          This address doesn’t lead anywhere — it may have been moved or removed.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-11 items-center rounded-full bg-white px-6 text-[13px] font-semibold text-neutral-900 transition hover:bg-white/90"
          >
            Back to home
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 items-center rounded-full border border-white/25 px-6 text-[13px] font-medium text-white/80 transition hover:border-white/50"
          >
            Merchant login
          </Link>
        </div>
      </div>
    </div>
  );
}
