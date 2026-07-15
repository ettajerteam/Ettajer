import { z } from "zod";

export const productVariantSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Variant name is required"),
  options: z.array(z.string().min(1)).min(1, "Add at least one option"),
});

export const productSchema = z.object({
  title: z.string().min(1, "Product name is required").max(200),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  comparePrice: z.number().min(0).optional().nullable(),
  inventory: z.number().int().min(0).default(0),
  sku: z.string().max(100).optional().nullable().transform((v) => v || null),
  images: z.array(z.string()).default([]),
  variants: z.array(productVariantSchema).default([]),
  tags: z.array(z.string()).default([]),
  ticketPrinterId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  collectionIds: z.array(z.string()).default([]),
});

export type ProductFormValues = z.infer<typeof productSchema>;
