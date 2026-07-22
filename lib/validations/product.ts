import { z } from "zod";
import { PRODUCT_STATUSES, PRODUCT_TYPES } from "@/lib/product-types";

export const productVariantSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Option name is required").max(60),
  options: z.array(z.string().min(1)).min(1, "Add at least one option"),
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
  alt: z.string().max(200).optional().nullable(),
});

const imageInputSchema = z.union([
  z.string().min(1),
  productImageAssetSchema,
]);

export const productSchema = z.object({
  title: z.string().min(1, "Product name is required").max(200),
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
  variants: z.array(productVariantSchema).default([]),
  details: z.array(productDetailSchema).default([]),
  reviews: z.array(productReviewSchema).default([]),
  tags: z.array(z.string()).default([]),
  ticketPrinterId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  collectionIds: z.array(z.string()).default([]),
});

export type ProductFormValues = z.infer<typeof productSchema>;
