import type { EmailAutomationTrigger } from "@/lib/email-marketing/triggers";

export interface EmailAutomationRow {
  id: string;
  name: string;
  trigger: EmailAutomationTrigger;
  enabled: boolean;
  templateId: string;
  templateName: string;
  delayMinutes: number;
  updatedAt: string;
}

export interface EmailTemplateRow {
  id: string;
  name: string;
  galleryId: string | null;
  themeId: string;
  subject: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  blocks: import("@/lib/email-marketing/email-blocks").EmailBlock[];
  createdAt: string;
  updatedAt: string;
}
