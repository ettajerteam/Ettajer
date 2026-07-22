import { Inter, Outfit, Space_Grotesk, Playfair_Display, Poppins } from "next/font/google";
import type { Metadata } from "next";
import { getStoreBySlug } from "@/lib/storefront";
import { parseStoreSeo } from "@/lib/seo/storefront-metadata";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

interface LayoutProps {
  children: React.ReactNode;
  params: { slug: string };
}

/** Merchant title template — avoids "| Ettajer" on storefront pages. */
export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const store = await getStoreBySlug(params.slug);
  if (!store) {
    return { title: "Store" };
  }

  const seo = parseStoreSeo(
    (store.settings as { seo?: unknown } | null | undefined)?.seo
  );

  return {
    title: {
      default: seo.title || store.name,
      template: `%s | ${store.name}`,
    },
    description: seo.description || store.description || `Shop at ${store.name}`,
    robots: seo.noIndex ? { index: false, follow: false } : undefined,
  };
}

export default function StoreLayout({ children }: LayoutProps) {
  return (
    <div
      className={`${inter.variable} ${poppins.variable} ${outfit.variable} ${spaceGrotesk.variable} ${playfair.variable}`}
    >
      {children}
    </div>
  );
}
