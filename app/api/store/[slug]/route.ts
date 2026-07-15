import { NextResponse } from "next/server";
import { getStoreBySlug, serializePublicStore, serializePublicProduct } from "@/lib/storefront";

interface RouteParams {
  params: { slug: string };
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const storeData = await getStoreBySlug(params.slug);

    if (!storeData) {
      return NextResponse.json({ message: "Store not found" }, { status: 404 });
    }

    return NextResponse.json({
      store: serializePublicStore(storeData, storeData.settings),
      products: storeData.products.map(serializePublicProduct),
    });
  } catch (error) {
    console.error("Public store fetch error:", error);
    return NextResponse.json({ message: "Failed to fetch store" }, { status: 500 });
  }
}
