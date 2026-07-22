import type { CollectionNewsletterSectionSettings } from "@/lib/sections/types";
import type { BlockRenderProps } from "@/lib/builder/types";
import { NewsletterSignupForm } from "@/components/storefront/newsletter-signup-form";
import { cn } from "@/lib/utils";

export function CollectionNewsletterSection({ store, settings }: BlockRenderProps) {
  const s = settings as CollectionNewsletterSectionSettings;
  const isBold = store.theme === "bold";
  const isModern = store.theme === "modern";
  const layout = s.layout ?? "strip";
  const bg = s.backgroundColor ?? (layout === "banner" || layout === "strip" ? "#0a0a0a" : undefined);
  const fg = s.textColor ?? (layout === "banner" || layout === "strip" ? "#e5e5e5" : undefined);
  const title = s.title ?? "Stay in the edit";
  const description =
    s.description ?? "New arrivals and restocks — quiet updates only.";
  const buttonText = s.buttonText ?? "Subscribe";

  if (layout === "strip") {
    return (
      <div
        className={cn(
          "border-y px-6 py-8 sm:py-10",
          !bg && (isBold ? "border-white/10" : "border-neutral-200")
        )}
        style={{
          backgroundColor: bg ?? (isBold ? undefined : "#0a0a0a"),
          color: fg ?? "#e5e5e5",
          borderColor: bg ? "transparent" : undefined,
        }}
      >
        <div
          className={cn(
            "mx-auto flex flex-col items-stretch gap-5 sm:flex-row sm:items-center sm:justify-between",
            isModern ? "max-w-7xl" : "max-w-6xl"
          )}
        >
          <div className="min-w-0 max-w-lg">
            <h2 className="text-base font-semibold tracking-tight text-white sm:text-lg">
              {title}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-white/50">{description}</p>
          </div>
          <div className="w-full sm:max-w-sm">
            <NewsletterSignupForm
              storeSlug={store.slug}
              source="collection"
              buttonText={buttonText}
              variant="dark"
            />
          </div>
        </div>
      </div>
    );
  }

  if (layout === "banner") {
    return (
      <section
        className="px-6 py-16 sm:py-20"
        style={{ backgroundColor: bg ?? "#0a0a0a", color: fg }}
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/45 sm:text-base">
            {description}
          </p>
          <div className="mt-8">
            <NewsletterSignupForm
              storeSlug={store.slug}
              source="collection"
              buttonText={buttonText}
              variant="dark"
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className={cn("mx-auto px-6 pb-12", isModern ? "max-w-7xl" : "max-w-6xl")}>
      <div
        className={cn(
          "border p-8 text-center sm:p-10",
          isModern ? "rounded-sm" : "rounded-2xl",
          isBold ? "border-white/10 bg-white/5" : "border-neutral-200 bg-neutral-50"
        )}
        style={{ backgroundColor: bg, color: fg }}
      >
        <h2 className={cn("mb-2 text-xl font-semibold tracking-tight", isBold && "text-white")}>
          {title}
        </h2>
        <p
          className={cn(
            "mx-auto mb-6 max-w-md text-sm leading-relaxed",
            isBold ? "text-white/55" : "text-neutral-500"
          )}
        >
          {description}
        </p>
        <NewsletterSignupForm
          storeSlug={store.slug}
          source="collection"
          buttonText={buttonText}
          variant={isBold ? "bold" : "light"}
        />
      </div>
    </div>
  );
}
