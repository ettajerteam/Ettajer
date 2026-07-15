export type IntegrationLogo = {
  name: string;
  logo: string;
};

export type IntegrationGroup = {
  title: string;
  description: string;
  items: IntegrationLogo[];
};

export const integrationGroups: IntegrationGroup[] = [
  {
    title: "Marketing & analytics",
    description: "Track campaigns and attribute sales across ad platforms.",
    items: [
      { name: "Meta", logo: "/marketing/logos/meta.svg" },
      { name: "Google", logo: "/marketing/logos/google.svg" },
      { name: "TikTok", logo: "/marketing/logos/tiktok.svg" },
      { name: "Pinterest", logo: "/marketing/logos/pinterest.svg" },
      { name: "Snapchat", logo: "/marketing/logos/snapchat.svg" },
      { name: "Google Tag Manager", logo: "/marketing/logos/gtm.svg" },
    ],
  },
];
