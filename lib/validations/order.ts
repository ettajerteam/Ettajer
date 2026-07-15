import { z } from "zod";
import type { OrderStatus } from "@/types";

const orderStatuses = ["draft", "pending", "processing", "shipped", "delivered", "returned", "cancelled"] as const;

export const createOrderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
  variant: z.record(z.string()).optional().nullable(),
});

export const createOrderSchema = z.object({
  storeSlug: z.string().min(1),
  customerName: z.string().min(1).max(200),
  customerEmail: z.string().email(),
  customerPhone: z.string().max(30).optional().nullable(),
  shippingAddress: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().optional(),
    postalCode: z.string().min(1),
    country: z.string().min(1),
  }),
  items: z.array(createOrderItemSchema).min(1, "At least one item is required"),
  shipping: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
  couponCode: z.string().max(50).optional().nullable(),
  utmSource: z.string().max(200).optional().nullable(),
  utmMedium: z.string().max(200).optional().nullable(),
  utmCampaign: z.string().max(200).optional().nullable(),
  utmTerm: z.string().max(200).optional().nullable(),
  utmContent: z.string().max(200).optional().nullable(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum(orderStatuses),
  note: z.string().max(500).optional(),
  notifyCustomer: z.boolean().default(true),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

export function isValidOrderStatus(status: string): status is OrderStatus {
  return orderStatuses.includes(status as OrderStatus);
}