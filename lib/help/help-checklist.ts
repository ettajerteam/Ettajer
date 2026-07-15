export type HelpChecklistItem = {
  step: number;
  title: string;
  description: string;
  href: string;
  articleSlug: string;
};

export const GETTING_STARTED_CHECKLIST: HelpChecklistItem[] = [
  {
    step: 1,
    title: "Create your account",
    description: "Sign up and complete onboarding.",
    href: "/signup",
    articleSlug: "how-long-does-setup-take",
  },
  {
    step: 2,
    title: "Add your first product",
    description: "Upload photos, set price, and publish.",
    href: "/dashboard/products",
    articleSlug: "create-your-first-product",
  },
  {
    step: 3,
    title: "Customize your storefront",
    description: "Edit your theme in the visual builder.",
    href: "/dashboard/themes",
    articleSlug: "use-the-visual-builder",
  },
  {
    step: 4,
    title: "Enable COD checkout",
    description: "Turn on cash on delivery and verification.",
    href: "/dashboard/settings",
    articleSlug: "set-up-whatsapp-cod-verification",
  },
  {
    step: 5,
    title: "Connect your domain",
    description: "Use your own domain with free SSL.",
    href: "/dashboard/settings",
    articleSlug: "connect-a-custom-domain",
  },
];
