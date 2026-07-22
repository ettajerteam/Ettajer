import { getThemeAssets } from "@/lib/storefront-assets";
import type { PublicProduct } from "@/types/storefront";

export const DEMO_PRODUCT_ID_PREFIX = "demo-";

export function isDemoProductId(id: string): boolean {
  return id.startsWith(DEMO_PRODUCT_ID_PREFIX);
}

/** In-memory sample catalog for editor/preview only — never persisted. */
export function getDemoProducts(theme: string): PublicProduct[] {
  const images = getThemeAssets(theme).productPlaceholders;

  return [
    {
      id: `${DEMO_PRODUCT_ID_PREFIX}1`,
      title: "Asymmetric Wool Coat",
      slug: "demo-asymmetric-wool-coat",
      description: "Sample product for preview — replace with your catalog.",
      price: 1290,
      comparePrice: 1490,
      inventory: 8,
      images: [images[0] ?? "/assets/placeholders/products/modern-1.webp"],
      variants: [],
      tags: ["demo"],
      details: [],
      reviews: [],
    },
    {
      id: `${DEMO_PRODUCT_ID_PREFIX}2`,
      title: "Sand Linen Shirt",
      slug: "demo-sand-linen-shirt",
      description: "Sample product for preview — replace with your catalog.",
      price: 420,
      comparePrice: null,
      inventory: 24,
      images: [images[1] ?? images[0] ?? "/assets/placeholders/products/modern-2.webp"],
      variants: [],
      tags: ["demo"],
      details: [],
      reviews: [],
    },
    {
      id: `${DEMO_PRODUCT_ID_PREFIX}3`,
      title: "Alabaster Trousers",
      slug: "demo-alabaster-trousers",
      description: "Sample product for preview — replace with your catalog.",
      price: 580,
      comparePrice: 640,
      inventory: 16,
      images: [images[2] ?? images[0] ?? "/assets/placeholders/products/modern-3.webp"],
      variants: [],
      tags: ["demo"],
      details: [],
      reviews: [],
    },
    {
      id: `${DEMO_PRODUCT_ID_PREFIX}4`,
      title: "Organic Sage Knit",
      slug: "demo-organic-sage-knit",
      description: "Sample product for preview — replace with your catalog.",
      price: 390,
      comparePrice: null,
      inventory: 20,
      images: [images[0] ?? "/assets/placeholders/products/modern-1.webp"],
      variants: [],
      tags: ["demo"],
      details: [],
      reviews: [],
    },
    {
      id: `${DEMO_PRODUCT_ID_PREFIX}5`,
      title: "Archive Leather Belt",
      slug: "demo-archive-leather-belt",
      description: "Sample product for preview — replace with your catalog.",
      price: 240,
      comparePrice: 280,
      inventory: 30,
      images: [images[1] ?? images[0] ?? "/assets/placeholders/products/modern-2.webp"],
      variants: [],
      tags: ["demo"],
      details: [],
      reviews: [],
    },
    {
      id: `${DEMO_PRODUCT_ID_PREFIX}6`,
      title: "Studio Cap",
      slug: "demo-studio-cap",
      description: "Sample product for preview — replace with your catalog.",
      price: 180,
      comparePrice: null,
      inventory: 40,
      images: [images[2] ?? images[0] ?? "/assets/placeholders/products/modern-3.webp"],
      variants: [],
      tags: ["demo"],
      details: [],
      reviews: [],
    },
  ];
}

/**
 * Live storefront: real products only.
 * Editor preview with an empty catalog: show sample products so templates look filled.
 */
export function resolveStorefrontCatalog(
  realProducts: PublicProduct[],
  options: { preview: boolean; theme: string }
): PublicProduct[] {
  const real = realProducts.filter((p) => !isDemoProductId(p.id));
  if (!options.preview) return real;
  if (real.length > 0) return real;
  return getDemoProducts(options.theme);
}
