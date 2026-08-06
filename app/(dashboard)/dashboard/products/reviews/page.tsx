import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { serializeProduct, productInclude } from "@/lib/products";
import { parseProductReviews, averageReviewRating } from "@/lib/product-reviews";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { ProductReviewsClient } from "@/components/products/product-reviews-client";
import { getProductsSectionCounts } from "@/lib/products-stats";

export const metadata = { title: "Reviews" };

export default async function ProductReviewsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
  });
  if (!store) redirect("/onboarding");

  const [products, counts] = await Promise.all([
    prisma.product.findMany({
      where: { storeId: store.id },
      orderBy: { updatedAt: "desc" },
      include: productInclude,
    }),
    getProductsSectionCounts(store.id),
  ]);

  const withReviews = products
    .map(serializeProduct)
    .map((p) => {
      const reviews = parseProductReviews(p.reviews);
      return { product: p, reviews, average: averageReviewRating(reviews) };
    })
    .filter((row) => row.reviews.length > 0);

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Reviews"
        description="Customer feedback from completed orders"
      />
      <DashboardPageContent>
        <ProductReviewsClient rows={withReviews} counts={counts} />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
