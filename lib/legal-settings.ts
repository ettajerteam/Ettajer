import { PAGE_TEMPLATES } from "@/lib/page-templates";
import type { StorePageRow } from "@/lib/pages";

export type LegalPolicySlug = "privacy" | "terms" | "shipping";

export type LegalPolicyDef = {
  slug: LegalPolicySlug;
  label: string;
  description: string;
  pathHint: string;
};

export const LEGAL_POLICY_DEFS: LegalPolicyDef[] = [
  {
    slug: "privacy",
    label: "Privacy policy",
    description: "How you collect and use shopper data.",
    pathHint: "/pages/privacy",
  },
  {
    slug: "terms",
    label: "Terms of service",
    description: "Rules for ordering, COD, and store use.",
    pathHint: "/pages/terms",
  },
  {
    slug: "shipping",
    label: "Shipping & returns",
    description: "Delivery windows, fees, and return rules.",
    pathHint: "/pages/shipping",
  },
];

export type LegalPolicyStatus = {
  def: LegalPolicyDef;
  page: StorePageRow | null;
  published: boolean;
};

export function resolveLegalPolicyStatuses(
  pages: StorePageRow[]
): LegalPolicyStatus[] {
  return LEGAL_POLICY_DEFS.map((def) => {
    const page = pages.find((p) => p.slug === def.slug) ?? null;
    return {
      def,
      page,
      published: page?.status === "published",
    };
  });
}

export function getLegalTemplateBody(slug: LegalPolicySlug): {
  title: string;
  content: string;
} {
  const template = PAGE_TEMPLATES.find((t) => t.slug === slug);
  return {
    title: template?.title ?? LEGAL_POLICY_DEFS.find((d) => d.slug === slug)?.label ?? slug,
    content: template?.body ?? "<p>Update this policy for your store.</p>",
  };
}

export function legalReadinessScore(input: {
  policies: LegalPolicyStatus[];
  requireTerms: boolean;
}): { done: number; total: number; items: { id: string; label: string; done: boolean }[] } {
  const items = [
    {
      id: "privacy",
      label: "Privacy policy published",
      done: input.policies.find((p) => p.def.slug === "privacy")?.published ?? false,
    },
    {
      id: "terms",
      label: "Terms of service published",
      done: input.policies.find((p) => p.def.slug === "terms")?.published ?? false,
    },
    {
      id: "shipping",
      label: "Shipping & returns published",
      done: input.policies.find((p) => p.def.slug === "shipping")?.published ?? false,
    },
    {
      id: "requireTerms",
      label: "Checkout requires accept terms",
      done: input.requireTerms,
    },
  ];
  return {
    done: items.filter((i) => i.done).length,
    total: items.length,
    items,
  };
}