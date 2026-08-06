import { z } from "zod";

export const draftItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
  /** Optional unit-price override for manual / negotiated orders */
  price: z.number().min(0).optional(),
});

export const draftShippingAddressSchema = z.object({
  street: z.string().max(300).optional().default(""),
  city: z.string().max(120).optional().default(""),
  state: z.string().max(120).optional().default(""),
  postalCode: z.string().max(40).optional().default(""),
  country: z.string().max(120).optional().default(""),
});

export const createDraftSchema = z.object({
  customerName: z.string().max(200).optional().default(""),
  customerEmail: z.string().email().optional().or(z.literal("")).default(""),
  customerPhone: z.string().max(30).optional().nullable(),
  shippingAddress: draftShippingAddressSchema.optional().default({}),
  items: z.array(draftItemSchema).min(1, "Add at least one product"),
  shipping: z.number().min(0).optional().default(0),
  tax: z.number().min(0).optional().default(0),
  discount: z.number().min(0).optional().default(0),
  paymentMethod: z.enum(["cod", "stripe", "paypal", "other"]).optional().default("cod"),
  merchantNote: z.string().max(2000).optional().nullable(),
});

export const updateDraftSchema = createDraftSchema.partial();

export type CreateDraftInput = z.infer<typeof createDraftSchema>;
export type UpdateDraftInput = z.infer<typeof updateDraftSchema>;
