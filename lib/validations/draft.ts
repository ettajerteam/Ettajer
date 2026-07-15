import { z } from "zod";

export const draftItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
});

export const createDraftSchema = z.object({
  customerName: z.string().max(200).optional().default(""),
  customerEmail: z.string().email().optional().or(z.literal("")).default(""),
  customerPhone: z.string().max(30).optional().nullable(),
  shippingAddress: z
    .object({
      street: z.string().optional().default(""),
      city: z.string().optional().default(""),
      state: z.string().optional(),
      postalCode: z.string().optional().default(""),
      country: z.string().optional().default(""),
    })
    .optional()
    .default({}),
  items: z.array(draftItemSchema).min(1, "Add at least one product"),
  shipping: z.number().min(0).optional().default(0),
  tax: z.number().min(0).optional().default(0),
});

export const updateDraftSchema = createDraftSchema.partial();

export type CreateDraftInput = z.infer<typeof createDraftSchema>;
export type UpdateDraftInput = z.infer<typeof updateDraftSchema>;
