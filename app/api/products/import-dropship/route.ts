import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedStore } from "@/lib/products";
import { importSupplierProduct } from "@/lib/dropshipping/import-supplier-product";
import { rehostSupplierImages } from "@/lib/dropshipping/rehost-images";
import type { ImportedVariantOption } from "@/lib/dropshipping/providers";

const bodySchema = z.object({
  url: z.string().url().max(2048),
  provider: z.enum(["aliexpress", "cj", "bigbuy"]),
  /** Default false for fast import — remote CDN URLs work in the editor. */
  rehostImages: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 }
      );
    }

    const imported = await importSupplierProduct({
      url: parsed.data.url,
      provider: parsed.data.provider,
    });

    let images = imported.images.slice(0, 10).map((url, i) => ({
      url,
      width: null as number | null,
      height: null as number | null,
      sizeBytes: null as number | null,
      alt: `${imported.title.slice(0, 100)} ${i + 1}` || null,
    }));

    let variants: ImportedVariantOption[] = imported.variants ?? [];

    // Optional rehost — keep light (few images, parallel, skip variant photos)
    if (parsed.data.rehostImages && imported.images.length > 0) {
      images = await rehostSupplierImages(store.id, imported.images, {
        limit: 4,
        altPrefix: imported.title.slice(0, 80) || "Product",
      });
    }

    return NextResponse.json({
      product: {
        title: imported.title,
        description: imported.descriptionHtml,
        price: imported.price,
        comparePrice: imported.comparePrice,
        currency: imported.currency,
        sku: imported.sku || null,
        barcode: imported.barcode ?? null,
        brand: imported.brand ?? null,
        tags: imported.tags ?? [],
        highlights: imported.highlights ?? [],
        details: imported.details ?? [],
        variants,
        packageWeightKg: imported.packageWeightKg ?? null,
        sourceUrl: imported.sourceUrl,
        provider: imported.provider,
        images,
        warnings: imported.warnings,
      },
    });
  } catch (error) {
    console.error("Dropship import error:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to import product from this link",
      },
      { status: 400 }
    );
  }
}
