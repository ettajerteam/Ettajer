import { prisma } from "@/lib/db";
import { generateOrderNumber } from "@/lib/utils";

/**
 * Dev utility — creates sample orders for the first store.
 * Run: npx tsx prisma/seed-orders.ts
 */
async function seedOrders() {
  const store = await prisma.store.findFirst({
    include: { products: { take: 3 } },
  });

  if (!store) {
    console.log("No store found. Complete onboarding first.");
    return;
  }

  if (store.products.length === 0) {
    console.log("No products found. Add products first.");
    return;
  }

  const existing = await prisma.order.count({ where: { storeId: store.id } });
  if (existing > 0) {
    console.log(`${existing} orders already exist. Skipping seed.`);
    return;
  }

  const samples = [
    {
      customerName: "Youssef Benali",
      customerEmail: "youssef@example.com",
      customerPhone: "+212 6 12 34 56 78",
      status: "pending",
      address: { street: "12 Rue Mohammed V", city: "Casablanca", postalCode: "20000", country: "Morocco" },
    },
    {
      customerName: "Fatima Zahra",
      customerEmail: "fatima@example.com",
      customerPhone: "+212 6 98 76 54 32",
      status: "processing",
      address: { street: "45 Avenue Hassan II", city: "Rabat", postalCode: "10000", country: "Morocco" },
    },
    {
      customerName: "Omar Idrissi",
      customerEmail: "omar@example.com",
      status: "shipped",
      address: { street: "8 Derb Sidi Bouloukat", city: "Marrakech", postalCode: "40000", country: "Morocco" },
    },
  ];

  for (const sample of samples) {
    const product = store.products[Math.floor(Math.random() * store.products.length)];
    const qty = Math.floor(Math.random() * 2) + 1;
    const subtotal = product.price * qty;
    const shipping = subtotal > 500 ? 0 : 30;
    const tax = 0;

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        status: sample.status,
        total: subtotal + shipping + tax,
        subtotal,
        shipping,
        tax,
        customerEmail: sample.customerEmail,
        customerName: sample.customerName,
        customerPhone: sample.customerPhone ?? null,
        shippingAddress: sample.address,
        storeId: store.id,
        items: {
          create: {
            productId: product.id,
            quantity: qty,
            price: product.price,
          },
        },
        statusHistory: {
          create: { status: sample.status, note: "Order placed" },
        },
      },
    });

    console.log(`Created order ${order.orderNumber} (${sample.status})`);
  }

  console.log("Done seeding orders.");
}

seedOrders()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
