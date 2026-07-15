import { z } from "zod";
import { emailLocaleSchema } from "@/lib/validations/auth";

export const contactSupportSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Enter a valid email"),
  topic: z.enum(["general", "billing", "technical", "cod", "migration"]),
  message: z.string().trim().min(10, "Message must be at least 10 characters"),
  articleRef: z.string().trim().optional(),
  locale: emailLocaleSchema,
});

export type ContactSupportInput = z.infer<typeof contactSupportSchema>;

export const CONTACT_TOPICS: {
  value: ContactSupportInput["topic"];
  label: string;
}[] = [
  { value: "general", label: "General question" },
  { value: "billing", label: "Billing & plans" },
  { value: "technical", label: "Technical issue" },
  { value: "cod", label: "COD & checkout" },
  { value: "migration", label: "Store migration" },
];
