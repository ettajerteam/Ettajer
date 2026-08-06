export type BrandSocialNetwork =
  | "instagram"
  | "facebook"
  | "tiktok"
  | "youtube"
  | "pinterest";

export type BrandSocialLink = {
  id: BrandSocialNetwork;
  label: string;
  href: string;
};

/** Official Ettajer brand profiles (marketing site / contact). */
export const BRAND_SOCIAL_LINKS: readonly BrandSocialLink[] = [
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/ettajer_official/",
  },
  {
    id: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/ettajerofficial/",
  },
  {
    id: "tiktok",
    label: "TikTok",
    href: "https://www.tiktok.com/@ettajerofficial",
  },
  {
    id: "youtube",
    label: "YouTube",
    href: "https://www.youtube.com/@Ettajer",
  },
  {
    id: "pinterest",
    label: "Pinterest",
    href: "https://fr.pinterest.com/ettajerofficial/",
  },
] as const;
