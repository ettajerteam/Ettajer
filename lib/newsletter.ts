import { prisma } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeSubscriberEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidSubscriberEmail(email: string): boolean {
  return EMAIL_RE.test(normalizeSubscriberEmail(email));
}

export async function subscribeToNewsletter(options: {
  storeId: string;
  email: string;
  source?: string;
}): Promise<{ created: boolean; reactivated: boolean }> {
  const email = normalizeSubscriberEmail(options.email);
  if (!isValidSubscriberEmail(email)) {
    throw new Error("Invalid email address");
  }

  const existing = await prisma.newsletterSubscriber.findUnique({
    where: {
      storeId_email: {
        storeId: options.storeId,
        email,
      },
    },
  });

  if (existing) {
    if (existing.status === "unsubscribed") {
      await prisma.newsletterSubscriber.update({
        where: { id: existing.id },
        data: {
          status: "active",
          source: options.source ?? existing.source,
        },
      });
      return { created: false, reactivated: true };
    }
    return { created: false, reactivated: false };
  }

  await prisma.newsletterSubscriber.create({
    data: {
      storeId: options.storeId,
      email,
      source: options.source ?? "newsletter",
      status: "active",
    },
  });

  return { created: true, reactivated: false };
}

export async function listNewsletterSubscribers(storeId: string) {
  return prisma.newsletterSubscriber.findMany({
    where: { storeId, status: "active" },
    orderBy: { createdAt: "desc" },
  });
}

export function serializeNewsletterSubscriber(row: {
  id: string;
  email: string;
  source: string | null;
  status: string;
  createdAt: Date;
}) {
  return {
    id: row.id,
    email: row.email,
    source: row.source,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}
