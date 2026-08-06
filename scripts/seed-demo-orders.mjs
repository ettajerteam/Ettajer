/**
 * Seed demo orders for ONE store only (preview UI).
 * Default target: hamzasenhaji993@gmail.com / Velora
 *
 * Usage:
 *   node scripts/seed-demo-orders.mjs
 *   node scripts/seed-demo-orders.mjs --email=you@example.com
 *   node scripts/seed-demo-orders.mjs --cleanup
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const args = process.argv.slice(2);
const emailArg = args.find((a) => a.startsWith("--email="))?.slice("--email=".length);
const cleanup = args.includes("--cleanup");
const DEMO_NOTE = "[DEMO] Sample order for UI preview — safe to delete";

const TARGET_EMAIL = (emailArg ?? "ettajerteam@gmail.com").toLowerCase();

function orderNumber(suffix) {
  const t = Date.now().toString(36).toUpperCase();
  return `ORD-DEMO-${t}-${suffix}`;
}

const samples = [
  {
    suffix: "A1",
    status: "pending",
    paymentMethod: "cod",
    paymentStatus: "unpaid",
    customerName: "Sara Benali",
    customerEmail: "sara.benali.demo@example.com",
    customerPhone: "+212 661-234567",
    city: "Casablanca",
    street: "12 Rue Mohammed V",
    daysAgo: 0,
    shipping: 35,
    tax: 0,
    discount: 0,
    history: [{ status: "pending", note: "Order placed via storefront" }],
  },
  {
    suffix: "B2",
    status: "processing",
    paymentMethod: "cod",
    paymentStatus: "unpaid",
    customerName: "Youssef Amrani",
    customerEmail: "youssef.amrani.demo@example.com",
    customerPhone: "+212 662-111222",
    city: "Rabat",
    street: "45 Avenue Hassan II",
    daysAgo: 1,
    shipping: 40,
    tax: 0,
    discount: 50,
    history: [
      { status: "pending", note: "Order placed", hoursOffset: -30 },
      { status: "processing", note: "Confirmed by phone", hoursOffset: -6 },
    ],
  },
  {
    suffix: "C3",
    status: "shipped",
    paymentMethod: "stripe",
    paymentStatus: "paid",
    customerName: "Fatima Zahra",
    customerEmail: "fatima.zahra.demo@example.com",
    customerPhone: "+212 670-555888",
    city: "Marrakech",
    street: "8 Derb El Kebir",
    daysAgo: 3,
    shipping: 45,
    tax: 20,
    discount: 0,
    history: [
      { status: "pending", note: "Order placed", hoursOffset: -72 },
      { status: "processing", note: "Packed", hoursOffset: -48 },
      { status: "shipped", note: "Shipped via Amana Express", hoursOffset: -24 },
    ],
  },
  {
    suffix: "D4",
    status: "delivered",
    paymentMethod: "cod",
    paymentStatus: "paid",
    customerName: "Karim El Idrissi",
    customerEmail: "karim.idrissi.demo@example.com",
    customerPhone: "+212 655-909090",
    city: "Fès",
    street: "3 Boulevard Mohammed VI",
    daysAgo: 7,
    shipping: 50,
    tax: 0,
    discount: 0,
    history: [
      { status: "pending", note: "Order placed", hoursOffset: -168 },
      { status: "processing", note: "Confirmed", hoursOffset: -150 },
      { status: "shipped", note: "In transit", hoursOffset: -120 },
      { status: "delivered", note: "Delivered — COD collected", hoursOffset: -24 },
    ],
  },
  {
    suffix: "E5",
    status: "cancelled",
    paymentMethod: "cod",
    paymentStatus: "unpaid",
    customerName: "Nadia Chraibi",
    customerEmail: "nadia.chraibi.demo@example.com",
    customerPhone: "+212 648-333444",
    city: "Tanger",
    street: "22 Rue de la Liberté",
    daysAgo: 2,
    shipping: 30,
    tax: 0,
    discount: 0,
    history: [
      { status: "pending", note: "Order placed", hoursOffset: -48 },
      { status: "cancelled", note: "Customer cancelled — wrong size", hoursOffset: -12 },
    ],
  },
  {
    suffix: "F6",
    status: "returned",
    paymentMethod: "stripe",
    paymentStatus: "refunded",
    customerName: "Omar Tazi",
    customerEmail: "omar.tazi.demo@example.com",
    customerPhone: "+212 677-121212",
    city: "Agadir",
    street: "15 Avenue des FAR",
    daysAgo: 10,
    shipping: 40,
    tax: 15,
    discount: 0,
    refundedAmount: true,
    history: [
      { status: "pending", note: "Order placed", hoursOffset: -240 },
      { status: "processing", note: "Packed", hoursOffset: -220 },
      { status: "shipped", note: "Shipped", hoursOffset: -200 },
      { status: "delivered", note: "Delivered", hoursOffset: -160 },
      { status: "returned", note: "Return accepted — defective item", hoursOffset: -24 },
    ],
  },
];

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: { equals: TARGET_EMAIL, mode: "insensitive" } },
    include: { stores: true },
  });

  if (!user?.stores[0]) {
    console.error(`No store found for ${TARGET_EMAIL}`);
    process.exit(1);
  }

  const store = user.stores[0];
  console.log(`Target: ${user.email} · ${store.name} (${store.slug}) · ${store.currency}`);

  if (cleanup) {
    const deleted = await prisma.order.deleteMany({
      where: {
        storeId: store.id,
        OR: [
          { orderNumber: { startsWith: "ORD-DEMO-" } },
          { merchantNote: { contains: "[DEMO]" } },
        ],
      },
    });
    console.log(`Cleaned up ${deleted.count} demo orders`);
    return;
  }

  const products = await prisma.product.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: "asc" },
    take: 10,
  });

  if (products.length === 0) {
    console.error("Store has no products — add at least one product first.");
    process.exit(1);
  }

  // Remove previous demo set for this store so re-runs stay clean
  await prisma.order.deleteMany({
    where: {
      storeId: store.id,
      OR: [
        { orderNumber: { startsWith: "ORD-DEMO-" } },
        { merchantNote: { contains: "[DEMO]" } },
      ],
    },
  });

  let created = 0;

  for (const sample of samples) {
    const picked = products.slice(0, Math.min(products.length, 1 + (created % products.length)));
    const lineItems = picked.map((p, idx) => ({
      productId: p.id,
      quantity: idx === 0 ? 1 + (created % 2) : 1,
      price: p.price,
    }));

    const subtotal = lineItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const total = Math.max(0, subtotal + sample.shipping + sample.tax - sample.discount);
    const createdAt = new Date(Date.now() - sample.daysAgo * 24 * 60 * 60 * 1000);

    const order = await prisma.order.create({
      data: {
        orderNumber: orderNumber(sample.suffix),
        status: sample.status,
        subtotal,
        shipping: sample.shipping,
        tax: sample.tax,
        discount: sample.discount,
        total,
        paymentMethod: sample.paymentMethod,
        paymentStatus: sample.paymentStatus,
        refundedAmount: sample.refundedAmount ? total : 0,
        merchantNote: DEMO_NOTE,
        customerName: sample.customerName,
        customerEmail: sample.customerEmail,
        customerPhone: sample.customerPhone,
        shippingAddress: {
          street: sample.street,
          city: sample.city,
          state: "",
          postalCode: "20000",
          country: "Morocco",
        },
        storeId: store.id,
        createdAt,
        updatedAt: createdAt,
        items: { create: lineItems },
        statusHistory: {
          create: (sample.history ?? [{ status: sample.status }]).map((h, i) => {
            const hoursOffset = h.hoursOffset ?? -i;
            return {
              status: h.status,
              note: h.note ?? null,
              createdAt: new Date(createdAt.getTime() + hoursOffset * 60 * 60 * 1000),
            };
          }),
        },
      },
    });

    console.log(`+ ${order.orderNumber} · ${order.status} · ${sample.customerName}`);
    created += 1;
  }

  console.log(`\nDone. Created ${created} demo orders for ${user.email} only.`);
  console.log("Open /dashboard/orders to preview. Cleanup with:");
  console.log(`  node scripts/seed-demo-orders.mjs --email=${TARGET_EMAIL} --cleanup`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
