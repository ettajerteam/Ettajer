import type { OrderDetail } from "@/types/orders";

const SAMPLE_NOW = "2026-08-03T10:30:00.000Z";

/**
 * Realistic Moroccan COD sample order for print previews.
 * Not persisted — used by settings preview / sample PDF endpoints.
 */
export function buildSampleOrderDetail(storeName: string, storeId: string): OrderDetail {
  return {
    id: "sample-order-id",
    orderNumber: "ETJ-1042",
    status: "processing",
    total: 649,
    subtotal: 599,
    shipping: 50,
    tax: 0,
    discount: 0,
    couponCode: null,
    paymentMethod: "cod",
    paymentStatus: "unpaid",
    refundedAmount: 0,
    merchantNote: null,
    inventoryRestored: false,
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    utmTerm: null,
    utmContent: null,
    customerEmail: "amina.bennani@gmail.com",
    customerName: "Amina Bennani",
    customerPhone: "+212 6 12 34 56 78",
    customerId: null,
    shippingAddress: {
      street: "45 Boulevard Zerktouni",
      city: "Casablanca",
      state: "Grand Casablanca",
      postalCode: "20250",
      country: "MA",
    },
    items: [
      {
        id: "sample-item-1",
        productId: "prod_sample_001",
        title: "Djellaba Traditionnelle — Bleu Royal",
        image: null,
        quantity: 1,
        price: 399,
        variant: { Taille: "M", Couleur: "Bleu" },
        ticketPrinterId: null,
        barcode: "6123456789012",
        sku: "DJL-BLU-M",
      },
      {
        id: "sample-item-2",
        productId: "prod_sample_002",
        title: "Babouches Cuir Artisanal",
        image: null,
        quantity: 2,
        price: 100,
        variant: { Pointure: "40" },
        ticketPrinterId: null,
        barcode: "6123456789013",
        sku: "BAB-CUIR-40",
      },
    ],
    statusHistory: [
      {
        id: "sample-event-1",
        status: "pending",
        note: null,
        createdAt: "2026-08-03T10:00:00.000Z",
      },
      {
        id: "sample-event-2",
        status: "processing",
        note: "Confirmed by phone",
        createdAt: SAMPLE_NOW,
      },
    ],
    storeId,
    createdAt: SAMPLE_NOW,
    updatedAt: SAMPLE_NOW,
  };
}
