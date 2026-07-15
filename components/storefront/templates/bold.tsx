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
export function BoldTemplate({
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
  const assets = getThemeAssets(store.theme);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <StorefrontHeader store={store} variant="bold" categories={categories} />

      <section className="relative h-[50vh] min-h-[360px] overflow-hidden">
        <Image
          src={assets.hero}
          alt=""
          fill
          className="object-cover opacity-60"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent" />
      </section>

      <FadeInSection className="max-w-6xl mx-auto px-6 -mt-32 relative z-10 pb-8">
        <div className="relative">
          <h1
            className="text-6xl sm:text-8xl font-black uppercase leading-[0.9] tracking-tighter"
            style={{ textShadow: `0 0 60px ${store.primaryColor}40` }}
          >
            {store.name}
          </h1>
          <div
            className="absolute -bottom-2 left-0 h-1 w-24"
            style={{ backgroundColor: "var(--store-primary)", boxShadow: `0 0 20px ${store.primaryColor}` }}
          />
        </div>
        {store.description && (
          <p className="mt-8 text-white/50 max-w-lg text-sm leading-relaxed">{store.description}</p>
        )}
      </FadeInSection>

      <div className="max-w-6xl mx-auto px-6">
        <FeaturedCollections
          store={store}
          collections={featuredCollections}
          variant="bold"
        />
      </div>

      <section className="max-w-6xl mx-auto px-6 pb-24">        <h2
          className="text-xs font-bold uppercase tracking-[0.4em] mb-10"
          style={{ color: "var(--store-primary)" }}
        >
          {"// Drop"}
        </h2>

        {products.length === 0 ? (
          <p className="text-white/30 text-center py-16">No drops yet. Stay tuned.</p>
        ) : (
          <StaggerGrid className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((product) => {
              const imageSrc = getProductImage(store.theme, product.images, product.id);
              return (
              <StaggerItem key={product.id}>
                <Link
                  href={getStoreProductUrl(store.slug, product.slug)}
                  className="group relative rounded-xl overflow-hidden border border-white/10 bg-white/5 transition-all duration-300 hover:border-[var(--store-primary)] hover:shadow-[0_0_30px_var(--store-primary)]"
                >
                <div className="aspect-square relative">
                  <Image
                    src={imageSrc}
                    alt={product.title}
                    fill
                    className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider truncate">{product.title}</h3>
                  <p className="text-sm mt-1 font-mono" style={{ color: "var(--store-primary)" }}>
                    {formatCurrency(product.price, store.currency)}
                  </p>
                </div>
              </Link>
              </StaggerItem>
            );
            })}
          </StaggerGrid>
        )}
      </section>
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-6xl mx-auto px-6 flex justify-between text-[10px] uppercase tracking-widest text-white/30">
          <span>© {store.name}</span>
          <span>Powered by Ettajer</span>
        </div>
      </footer>
    </div>
  );
}

export function BoldProductPage({
  store,
  product,
}: {
  store: PublicStore;
  product: PublicProduct;
}) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <StorefrontHeader
        store={store}
        variant="bold"
        backHref={`/store/${store.slug}`}
        backLabel="← Back"
      />

      <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-10">
        <div
          className="aspect-square rounded-xl overflow-hidden relative border"
          style={{ borderColor: `${store.primaryColor}30` }}
        >
          <Image
            src={getProductImage(store.theme, product.images, product.id)}
            alt={product.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight mb-4">{product.title}</h1>
          <p
            className="text-2xl font-mono mb-6"
            style={{ color: "var(--store-primary)", textShadow: `0 0 20px ${store.primaryColor}60` }}
          >
            {formatCurrency(product.price, store.currency)}
          </p>
          {product.description && (
            <div
              className="prose prose-invert prose-sm text-white/60 mb-8"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          )}
          <AddToCartButton
            store={store}
            product={product}
            label="Cop it"
            className="w-full sm:w-auto px-8 py-3.5 rounded-lg font-bold uppercase tracking-widest text-sm text-black transition-all hover:shadow-[0_0_30px_var(--store-primary)] disabled:opacity-50"
            style={{ backgroundColor: "var(--store-primary)" }}
          />
        </div>
      </div>
    </div>
  );
}
