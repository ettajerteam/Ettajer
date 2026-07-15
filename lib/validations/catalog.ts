import { z } from "zod";

export const categoryStatuses = ["active", "inactive"] as const;

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  description: z.string().max(2000).optional().nullable(),
  image: z.string().optional().nullable().transform((v) => (v?.trim() ? v.trim() : null)),
  status: z.enum(categoryStatuses).default("active"),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

export const collectionSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  description: z.string().max(2000).optional().nullable(),
  image: z.string().optional().nullable().transform((v) => (v?.trim() ? v.trim() : null)),
  featured: z.boolean().default(false),
  productIds: z.array(z.string()).default([]),
});

export type CollectionFormValues = z.infer<typeof collectionSchema>;
