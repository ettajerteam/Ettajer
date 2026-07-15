import { redirect } from "next/navigation";

interface PageProps {
  params: { slug: string; productSlug: string };
}

export default function LegacyProductRedirect({ params }: PageProps) {
  redirect(`/store/${params.slug}/product/${params.productSlug}`);
}
