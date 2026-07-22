import Image from "next/image";
import Link from "next/link";
import { getStoreBlogPostUrl, getStoreProductsUrl } from "@/lib/storefront-urls";
import { cn } from "@/lib/utils";

export interface JournalPostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  image: string | null;
  publishedAt: Date | string | null;
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return null;
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface JournalPostsListProps {
  storeSlug: string;
  posts: JournalPostSummary[];
  isBold?: boolean;
  isModern?: boolean;
}

export function JournalPostsList({
  storeSlug,
  posts,
  isBold = false,
  isModern = false,
}: JournalPostsListProps) {
  if (posts.length === 0) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center sm:py-24">
        <p
          className={cn(
            "text-lg font-medium tracking-tight",
            isBold ? "text-white" : "text-neutral-900"
          )}
        >
          No stories yet
        </p>
        <p
          className={cn(
            "mt-2 text-sm leading-relaxed",
            isBold ? "text-white/45" : "text-neutral-500"
          )}
        >
          Publish a journal note in your dashboard — it will appear here as an editorial story.
        </p>
        <Link
          href={getStoreProductsUrl(storeSlug)}
          className={cn(
            "mt-8 inline-flex h-11 items-center border px-6 text-[13px] font-medium transition",
            isModern ? "rounded-sm uppercase tracking-[0.1em]" : "rounded-full",
            isBold
              ? "border-white/25 text-white/80 hover:border-white/50"
              : "border-neutral-300 text-neutral-700 hover:border-neutral-500"
          )}
        >
          Browse the shop
        </Link>
      </div>
    );
  }

  const [featured, ...rest] = posts;
  const featuredDate = formatDate(featured.publishedAt);

  return (
    <div
      className={cn(
        "mx-auto px-6 py-10 sm:py-14",
        isModern ? "max-w-6xl" : "max-w-5xl"
      )}
    >
      {/* Featured story */}
      <article className="group">
        <Link href={getStoreBlogPostUrl(storeSlug, featured.slug)} className="block">
          {featured.image ? (
            <div
              className={cn(
                "relative mb-6 overflow-hidden bg-neutral-100",
                isModern ? "rounded-sm aspect-[16/10]" : "rounded-2xl aspect-[16/10]"
              )}
            >
              <Image
                src={featured.image}
                alt={featured.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                sizes="(max-width: 768px) 100vw, 1100px"
                priority
              />
            </div>
          ) : null}
          <p
            className={cn(
              "mb-2 text-[11px] font-semibold uppercase tracking-[0.18em]",
              isBold ? "text-white/40" : "text-neutral-400"
            )}
          >
            Featured note
            {featuredDate ? ` · ${featuredDate}` : ""}
          </p>
          <h2
            className={cn(
              "max-w-3xl text-3xl font-semibold tracking-[-0.03em] transition group-hover:opacity-70 sm:text-4xl lg:text-5xl",
              isBold && "text-white"
            )}
          >
            {featured.title}
          </h2>
          {featured.excerpt ? (
            <p
              className={cn(
                "mt-4 max-w-2xl text-[15px] leading-relaxed sm:text-base",
                isBold ? "text-white/55" : "text-neutral-500"
              )}
            >
              {featured.excerpt}
            </p>
          ) : null}
          <span
            className={cn(
              "mt-5 inline-block text-[12px] font-semibold uppercase tracking-[0.14em]",
              isBold ? "text-white/50" : "text-neutral-400"
            )}
          >
            Read story →
          </span>
        </Link>
      </article>

      {rest.length > 0 ? (
        <div
          className={cn(
            "mt-16 grid gap-10 border-t pt-12 sm:mt-20 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-14 lg:grid-cols-3",
            isBold ? "border-white/10" : "border-neutral-200"
          )}
        >
          {rest.map((post) => {
            const date = formatDate(post.publishedAt);
            return (
              <article key={post.id} className="group">
                <Link href={getStoreBlogPostUrl(storeSlug, post.slug)} className="block">
                  {post.image ? (
                    <div
                      className={cn(
                        "relative mb-4 aspect-[4/5] overflow-hidden bg-neutral-100",
                        isModern ? "rounded-sm" : "rounded-xl"
                      )}
                    >
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "mb-4 flex aspect-[4/5] items-end bg-neutral-100 p-5",
                        isModern ? "rounded-sm" : "rounded-xl",
                        isBold && "bg-white/5"
                      )}
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                        Journal
                      </span>
                    </div>
                  )}
                  {date ? (
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                      {date}
                    </p>
                  ) : null}
                  <h3
                    className={cn(
                      "text-lg font-medium tracking-tight transition group-hover:opacity-70 sm:text-xl",
                      isBold && "text-white"
                    )}
                  >
                    {post.title}
                  </h3>
                  {post.excerpt ? (
                    <p
                      className={cn(
                        "mt-2 line-clamp-3 text-sm leading-relaxed",
                        isBold ? "text-white/50" : "text-neutral-500"
                      )}
                    >
                      {post.excerpt}
                    </p>
                  ) : null}
                </Link>
              </article>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
