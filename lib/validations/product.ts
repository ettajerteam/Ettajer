import { z } from "zod";
import { PRODUCT_STATUSES, PRODUCT_TYPES } from "@/lib/product-types";

export const productVariantSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Option name is required").max(60),
  options: z.array(z.string().min(1)).min(1, "Add at least one option"),
  optionImages: z.record(z.string()).optional(),
});

export const productReviewSchema = z.object({
  id: z.string(),
  author: z.string().max(120),
  location: z.string().max(120).optional().or(z.literal("")),
  rating: z.number().int().min(1).max(5),
  text: z.string().max(2000),
  createdAt: z.string().optional(),
});

export const productDetailSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Label is required").max(80),
  value: z.string().min(1, "Value is required").max(500),
});

export const productImageAssetSchema = z.object({
  url: z.string().min(1),
  width: z.number().int().positive().optional().nullable(),
  height: z.number().int().positive().optional().nullable(),
  sizeBytes: z.number().int().nonnegative().optional().nullable(),
  originalSizeBytes: z.number().int().nonnegative().optional().nullable(),
  compressed: z.boolean().optional(),
  alt: z.string().max(200).optional().nullable(),
});

export const productDigitalFileSchema = z.object({
  url: z.string().min(1),
  filename: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(120),
  sizeBytes: z.number().int().nonnegative(),
});

const imageInputSchema = z.union([
  z.string().min(1),
  productImageAssetSchema,
]);

export const productCommerceSchema = z.object({
  vendor: z.string().max(120).optional().or(z.literal("")),
  supplier: z.string().max(120).optional().or(z.literal("")),
  brand: z.string().max(120).optional().or(z.literal("")),
  trackQuantity: z.boolean().optional(),
  continueSellingWhenOutOfStock: z.boolean().optional(),
  lowStockAlert: z.number().int().min(0).optional().nullable(),
  inventoryLocation: z.enum(["warehouse", "supplier"]).optional(),
  requiresShipping: z.boolean().optional(),
  freeShipping: z.boolean().optional(),
  packageWeight: z.number().min(0).optional().nullable(),
  chargeTax: z.boolean().optional(),
  taxIncluded: z.boolean().optional(),
  shippingProfile: z.enum(["standard", "express"]).optional(),
  hsCode: z.string().max(40).optional().or(z.literal("")),
  countryOfOrigin: z.string().max(80).optional().or(z.literal("")),
  highlights: z.array(z.string().max(80)).max(12).optional(),
  videos: z.array(z.string().max(500)).max(5).optional(),
  models3d: z.array(z.string().max(500)).max(3).optional(),
  dropshippingProvider: z
    .enum(["aliexpress", "cj", "bigbuy", ""])
    .optional()
    .or(z.literal("")),
  dropshippingUrl: z.string().max(2048).optional().or(z.literal("")),
  customFields: z
    .array(
      z.object({
        id: z.string(),
        key: z.string().max(80),
        value: z.string().max(500),
      })
    )
    .optional(),
  metafields: z
    .array(
      z.object({
        id: z.string(),
        namespace: z.string().max(80),
        key: z.string().max(80),
        value: z.string().max(500),
      })
    )
    .optional(),
  visibility: z
    .object({
      onlineStore: z.boolean(),
      facebook: z.boolean(),
      instagram: z.boolean(),
      tiktok: z.boolean(),
      google: z.boolean(),
    })
    .optional(),
  publishMode: z.enum(["now", "schedule"]).optional(),
  publishAt: z.string().optional().nullable(),
  relatedProductIds: z.array(z.string()).optional(),
  upsellProductIds: z.array(z.string()).optional(),
  frequentlyBoughtIds: z.array(z.string()).optional(),
});

export const productSchema = z.object({
  title: z.string().min(1, "Product name is required").max(200),
  slug: z
    .string()
    .max(200)
    .optional()
    .nullable()
    .transform((v) => {
      const s = (v ?? "").trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
      return s || null;
    }),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  comparePrice: z.number().min(0).optional().nullable(),
  costPrice: z.number().min(0).optional().nullable(),
  inventory: z.number().int().min(0).default(0),
  sku: z.string().max(100).optional().nullable().transform((v) => v || null),
  barcode: z.string().max(100).optional().nullable().transform((v) => v || null),
  status: z.enum(PRODUCT_STATUSES).default("draft"),
  productType: z.enum(PRODUCT_TYPES).default("physical"),
  copyrightOwner: z
    .string()
    .max(160)
    .optional()
    .nullable()
    .transform((v) => v?.trim() || null),
  copyrightNotice: z
    .string()
    .max(2000)
    .optional()
    .nullable()
    .transform((v) => v?.trim() || null),
  images: z
    .array(imageInputSchema)
    .default([])
    .transform((items) =>
      items.map((item) =>
        typeof item === "string"
          ? { url: item }
          : {
              url: item.url,
              width: item.width ?? null,
              height: item.height ?? null,
              sizeBytes: item.sizeBytes ?? null,
              alt: item.alt ?? null,
            }
      )
    ),
  digitalFiles: z.array(productDigitalFileSchema).default([]),
  variants: z.array(productVariantSchema).default([]),
  details: z.array(productDetailSchema).default([]),
  reviews: z.array(productReviewSchema).default([]),
  tags: z.array(z.string()).default([]),
  ticketPrinterId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  collectionIds: z.array(z.string()).default([]),
  seo: z
    .object({
      title: z.string().max(70).optional().or(z.literal("")),
      description: z.string().max(160).optional().or(z.literal("")),
      keywords: z.array(z.string().max(40)).max(20).optional(),
    })
    .optional()
    .default({}),
  commerce: productCommerceSchema.optional().default({}),
}).superRefine((data, ctx) => {
  if (
    (data.productType === "digital" ||
      data.productType === "physical" ||
      data.productType === "dropshipping") &&
    !data.categoryId
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        data.productType === "digital"
          ? "Select a digital category before saving"
          : "Select a product category before saving",
      path: ["categoryId"],
    });
  }
});

export type ProductFormValues = z.infer<typeof productSchema>;
