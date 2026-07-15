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
interface ProductCardProps {
  store: PublicStore;
  product: PublicProduct;
}

export function MinimalProductCard({ store, product }: ProductCardProps) {
  const imageSrc = getProductImage(store.theme, product.images, product.id);

  return (
    <Link
      href={getStoreProductUrl(store.slug, product.slug)}
      className="group block"
    >
      <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-4 relative">
        <Image
          src={imageSrc}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 33vw"
        />
      </div>
      <h3 className="font-medium text-sm tracking-tight group-hover:opacity-70 transition-opacity">
        {product.title}
      </h3>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-sm" style={{ color: "var(--store-primary)" }}>
          {formatCurrency(product.price, store.currency)}
        </span>
        {product.comparePrice && product.comparePrice > product.price && (
          <span className="text-xs text-gray-400 line-through">
            {formatCurrency(product.comparePrice, store.currency)}
          </span>
        )}
      </div>
    </Link>
  );
}

export function MinimalTemplate({
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
    <div className="bg-white min-h-screen">
      <StorefrontHeader store={store} variant="minimal" categories={categories} />

      <FadeInSection className="relative max-w-6xl mx-auto px-6 pt-8 pb-16">
        <div className="relative h-48 sm:h-64 rounded-3xl overflow-hidden mb-10">
          <Image
            src={assets.hero}
            alt=""
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 1152px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
        </div>
        <div className="text-center -mt-24 relative z-10">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-gray-900 mb-4">
            {store.name}
          </h1>
          {store.description && (
            <p className="text-lg text-gray-500 font-light max-w-xl mx-auto leading-relaxed">
              {store.description}
            </p>
          )}
        </div>
      </FadeInSection>

      <div className="max-w-6xl mx-auto px-6">
        <FeaturedCollections
          store={store}
          collections={featuredCollections}
          variant="minimal"
        />
      </div>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-8">Products</h2>
        {products.length === 0 ? (
          <p className="text-center text-gray-400 py-16">No products available yet.</p>
        ) : (
          <StaggerGrid className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
            {products.map((product) => (
              <StaggerItem key={product.id}>
                <MinimalProductCard store={store} product={product} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        )}
      </section>
      <footer className="border-t border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} {store.name} · Powered by Ettajer
        </div>
      </footer>
    </div>
  );
}

export function MinimalProductPage({
  store,
  product,
}: {
  store: PublicStore;
  product: PublicProduct;
}) {
  return (
    <div className="bg-white min-h-screen">
      <StorefrontHeader
        store={store}
        variant="minimal"
        backHref={`/store/${store.slug}`}
        backLabel="← Back to shop"
      />

      <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-12">
        <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 relative">
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
          <h1 className="text-3xl font-bold tracking-tight mb-4">{product.title}</h1>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl font-semibold" style={{ color: "var(--store-primary)" }}>
              {formatCurrency(product.price, store.currency)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-lg text-gray-400 line-through">
                {formatCurrency(product.comparePrice, store.currency)}
              </span>
            )}
          </div>
          {product.description && (
            <div
              className="prose prose-sm text-gray-600 mb-8"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          )}
          <AddToCartButton
            store={store}
            product={product}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-white font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "var(--store-primary)" }}
          />
        </div>
      </div>
    </div>
  );
}
