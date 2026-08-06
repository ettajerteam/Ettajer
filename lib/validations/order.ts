import { z } from "zod";
import type { OrderPaymentMethod, OrderPaymentStatus, OrderStatus } from "@/types";

const orderStatuses = [
  "draft",
  "pending",
  "processing",
  "shipped",
  "delivered",
  "returned",
  "cancelled",
  "refunded",
] as const;

const paymentMethods = ["cod", "stripe", "paypal", "other"] as const;
const paymentStatuses = ["unpaid", "paid", "refunded", "partially_refunded"] as const;

export const createOrderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
  variant: z.record(z.string()).optional().nullable(),
});

export const createOrderSchema = z.object({
  storeSlug: z.string().min(1),
  customerName: z.string().min(1).max(200),
  customerEmail: z
    .string()
    .max(200)
    .refine(
      (v) => !v.trim() || z.string().email().safeParse(v.trim()).success,
      "Invalid email"
    ),
  customerPhone: z.string().max(30).optional().nullable(),
  shippingAddress: z.object({
    street: z.string().max(500),
    city: z.string().max(200),
    state: z.string().optional(),
    postalCode: z.string().max(40),
    country: z.string().min(1),
  }),
  items: z.array(createOrderItemSchema).min(1, "At least one item is required"),
  shipping: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
  couponCode: z.string().max(50).optional().nullable(),
  customerNote: z.string().max(500).optional().nullable(),
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

export const updateOrderSchema = z
  .object({
    status: z.enum(orderStatuses).optional(),
    note: z.string().max(500).optional(),
    notifyCustomer: z.boolean().default(true),
    paymentStatus: z.enum(paymentStatuses).optional(),
    refundedAmount: z.number().min(0).optional(),
    merchantNote: z.string().max(2000).optional().nullable(),
  })
  .refine(
    (data) =>
      data.status !== undefined ||
      data.paymentStatus !== undefined ||
      data.merchantNote !== undefined ||
      data.refundedAmount !== undefined,
    { message: "No changes provided" }
  );

export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;

export function isValidOrderStatus(status: string): status is OrderStatus {
  return orderStatuses.includes(status as OrderStatus);
}

export function isValidPaymentMethod(method: string): method is OrderPaymentMethod {
  return paymentMethods.includes(method as OrderPaymentMethod);
}

export function isValidPaymentStatus(status: string): status is OrderPaymentStatus {
  return paymentStatuses.includes(status as OrderPaymentStatus);
}
