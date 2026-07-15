import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { getStoreProductUrl } from "@/lib/storefront-urls";
import { getProductImage, getThemeAssets } from "@/lib/storefront-assets";
import { FadeInSection, StaggerGrid, StaggerItem } from "@/components/storefront/motion-wrapper";
import { StorefrontHeader } from "@/components/storefront/storefront-header";
import { AddToCartButton } from "@/components/storefront/cart/add-to-cart-button";
import { FeaturedCollections } from "@/components/storefront/featured-collections";
import type { PublicCategory, PublicCollection, PublicProduct, PublicStore } from "@/types/storefront";
export function ModernTemplate({
  store,
  products,
  categories = [],
  featuredCollections = [],
}: {
  store: PublicStore;
  products: PublicProduct[];
  categories?: PublicCategory[];
  featuredCollections?: PublicCollection[];
}) {
  const featured = products[0];
  const assets = getThemeAssets(store.theme);
  const heroImage = featured?.images[0] ?? assets.hero;

  return (
    <div className="min-h-screen" style={{ backgroundColor: store.secondaryColor }}>
      <StorefrontHeader store={store} variant="modern" categories={categories} />

      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <Image src={heroImage} alt={featured?.title ?? store.name} fill className="object-cover" priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-16">
            <p className="text-white/70 text-xs font-bold uppercase tracking-[0.3em] mb-3">
              {featured ? "Featured" : store.name}
            </p>
            <h1 className="text-5xl sm:text-7xl font-black text-white uppercase tracking-tighter leading-none mb-4">
              {featured?.title ?? store.name}
            </h1>
            {featured ? (
              <Link
                href={getStoreProductUrl(store.slug, featured.slug)}
                className="inline-block bg-white text-black px-8 py-3 text-sm font-bold uppercase tracking-wider hover:bg-white/90 transition-colors"
              >
                Shop now — {formatCurrency(featured.price, store.currency)}
              </Link>
            ) : store.description ? (
              <p className="text-white/80 text-lg max-w-xl">{store.description}</p>
            ) : null}
          </div>
        </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <FadeInSection>
          <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter mb-12">
            {store.name}
          </h2>
          {store.description && (
            <p className="text-lg text-neutral-600 max-w-2xl mb-16 -mt-6">{store.description}</p>
          )}
        </FadeInSection>

        <FeaturedCollections
          store={store}
          collections={featuredCollections}
          variant="modern"
        />

        {products.length === 0 ? (
          <p className="text-neutral-400 text-center py-16">No products yet.</p>
        ) : (
          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
            {products.map((product) => {
              const imageSrc = getProductImage(store.theme, product.images, product.id);
              return (
              <StaggerItem key={product.id}>
                <Link
                  href={getStoreProductUrl(store.slug, product.slug)}
                  className="group relative aspect-[3/4] overflow-hidden bg-neutral-200"
                >
                <Image
                  src={imageSrc}
                  alt={product.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform">
                  <h3 className="text-white font-bold uppercase tracking-wide text-lg">{product.title}</h3>
                  <p className="text-white/80 text-sm mt-1">{formatCurrency(product.price, store.currency)}</p>
                </div>
              </Link>
              </StaggerItem>
            );
            })}
          </StaggerGrid>
        )}
      </section>
      <footer className="border-t border-black/10 py-10">
        <div className="max-w-7xl mx-auto px-6 text-xs font-bold uppercase tracking-widest text-neutral-400">
          © {new Date().getFullYear()} {store.name}
        </div>
      </footer>
    </div>
  );
}

export function ModernProductPage({
  store,
  product,
}: {
  store: PublicStore;
  product: PublicProduct;
}) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: store.secondaryColor }}>
      <StorefrontHeader
        store={store}
        variant="modern"
        backHref={`/store/${store.slug}`}
        backLabel="← Back"
      />

      <div className="grid lg:grid-cols-2">
        <div className="relative aspect-square lg:aspect-auto lg:min-h-screen">
          <Image
            src={getProductImage(store.theme, product.images, product.id)}
            alt={product.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
        <div className="flex flex-col justify-center p-8 sm:p-16 lg:p-24">
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter leading-none mb-6">
            {product.title}
          </h1>
          <p className="text-3xl font-bold mb-8" style={{ color: "var(--store-primary)" }}>
            {formatCurrency(product.price, store.currency)}
          </p>
          {product.description && (
            <div
              className="prose prose-lg text-neutral-600 mb-10"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          )}
          <AddToCartButton
            store={store}
            product={product}
            className="w-full sm:w-auto px-12 py-4 text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "var(--store-primary)" }}
          />
        </div>
      </div>
    </div>
  );
}
