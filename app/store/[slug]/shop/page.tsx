import { redirect } from "next/navigation";
import { getStoreProductsUrl } from "@/lib/storefront-urls";

interface PageProps {
  params: { slug: string };
}

/** Common mistaken path — send shoppers to the real catalog. */
export default function ShopAliasRedirect({ params }: PageProps) {
  redirect(getStoreProductsUrl(params.slug));
}
