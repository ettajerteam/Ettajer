import { prisma } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidContactEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim().toLowerCase());
}

export async function createContactSubmission(options: {
  storeId: string;
  name: string;
  email: string;
  message: string;
  phone?: string | null;
}) {
  const name = options.name.trim();
  const email = options.email.trim().toLowerCase();
  const message = options.message.trim();
  const phone = options.phone?.trim() || null;

  if (!name || name.length > 120) throw new Error("Invalid name");
  if (!isValidContactEmail(email)) throw new Error("Invalid email");
  if (!message || message.length > 5000) throw new Error("Invalid message");
  if (phone && phone.length > 40) throw new Error("Invalid phone");

  return prisma.contactSubmission.create({
    data: {
      storeId: options.storeId,
      name,
      email,
      phone,
      message,
      status: "new",
    },
  });
}

export async function listContactSubmissions(storeId: string) {
  return prisma.contactSubmission.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
  });
}

export function serializeContactSubmission(row: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  createdAt: Date;
}) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    message: row.message,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}
