import { z } from "zod";
import { createOrderSchema } from "@/lib/validations/order";

export const checkoutSchema = createOrderSchema
  .extend({
    shippingMethod: z.enum(["standard", "express"]),
    paymentMethod: z.enum(["cod", "stripe"]),
  })
  .extend({
    customerPhone: z.string().min(1, "Phone is required").max(30),
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const addToCartSchema = z.object({
  storeSlug: z.string().min(1),
  currency: z.string().default("MAD"),
  productId: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  image: z.string().nullable().optional(),
  price: z.number().min(0),
  quantity: z.number().int().min(1).default(1),
  inventory: z.number().int().min(0),
  variant: z.record(z.string()).optional().nullable(),
});

export const updateCartSchema = z.object({
  storeSlug: z.string().min(1),
  quantity: z.number().int().min(0),
});
