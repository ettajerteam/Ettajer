import { slugify } from "@/lib/utils";

/** Default catalog categories for digital downloads / ebooks / courses. */
export const DIGITAL_PRODUCT_CATEGORIES = [
  {
    name: "Ebooks",
    description: "PDF books, guides, and digital reading products",
  },
  {
    name: "Courses",
    description: "Online courses, lessons, and training materials",
  },
  {
    name: "Templates",
    description: "Printable or editable templates and worksheets",
  },
  {
    name: "Software",
    description: "Apps, plugins, scripts, and digital tools",
  },
  {
    name: "Music & Audio",
    description: "Tracks, podcasts, sound packs, and audio downloads",
  },
  {
    name: "Graphics & Design",
    description: "Graphics packs, fonts, mockups, and design assets",
  },
  {
    name: "Documents",
    description: "Contracts, checklists, planners, and business docs",
  },
] as const;

/** Default catalog categories for physical / COD products. */
export const PHYSICAL_PRODUCT_CATEGORIES = [
  {
    name: "Fashion & Apparel",
    description: "Clothing, shoes, and wearable fashion",
  },
  {
    name: "Beauty & Cosmetics",
    description: "Skincare, makeup, fragrance, and personal care",
  },
  {
    name: "Home & Living",
    description: "Decor, kitchen, furniture, and household goods",
  },
  {
    name: "Electronics",
    description: "Phones, accessories, gadgets, and devices",
  },
  {
    name: "Health & Wellness",
    description: "Supplements, fitness, and wellness products",
  },
  {
    name: "Kids & Baby",
    description: "Toys, baby care, and children’s products",
  },
  {
    name: "Sports & Outdoors",
    description: "Sport gear, outdoor equipment, and activewear",
  },
  {
    name: "Accessories",
    description: "Bags, jewelry, watches, and everyday accessories",
  },
  {
    name: "Food & Grocery",
    description: "Packaged food, drinks, and grocery items",
  },
  {
    name: "Handmade & Crafts",
    description: "Artisan, handmade, and custom-made products",
  },
] as const;

export function digitalCategorySlug(name: string): string {
  return slugify(name) || "digital";
}

export function physicalCategorySlug(name: string): string {
  return slugify(name) || "physical";
}

/** Spec presets shown when product type is Digital. */
export const DIGITAL_DETAIL_PRESETS = [
  "Format",
  "Pages",
  "Language",
  "License",
  "Access",
  "File size",
  "Compatibility",
  "Includes",
  "Updates",
  "Delivery",
] as const;

/** Spec presets shown when product type is Physical / Dropshipping. */
export const PHYSICAL_DETAIL_PRESETS = [
  "Brand",
  "Material",
  "Color",
  "Size",
  "Weight",
  "Dimensions",
  "Care",
  "Origin",
  "Warranty",
  "Shipping",
  "Condition",
  "Package contents",
  "Size guide",
  "Ingredients",
  "Model",
] as const;

export const DIGITAL_LICENSE_OPTIONS = [
  "Personal use",
  "Commercial use",
  "Resale rights",
  "Private license",
] as const;

export const DIGITAL_ACCESS_OPTIONS = [
  "Instant download",
  "Email delivery",
  "Member area",
] as const;

export const DIGITAL_FORMAT_OPTIONS = [
  "PDF",
  "EPUB",
  "ZIP",
  "MP3",
  "MP4",
  "Other",
] as const;

export const PHYSICAL_CONDITION_OPTIONS = [
  "New",
  "Like new",
  "Refurbished",
  "Open box",
] as const;

export const PHYSICAL_SHIPPING_OPTIONS = [
  "Cash on delivery",
  "Standard shipping",
  "Express shipping",
  "Free shipping",
  "Pickup available",
] as const;

/** Labels filled by the Digital product info form (not shown again as free rows). */
export const DIGITAL_MANAGED_DETAIL_LABELS = [
  "Format",
  "Pages",
  "Language",
  "License",
  "Access",
  "Includes",
  "Compatibility",
  "Updates",
] as const;

/** Labels filled by the Physical product info form. */
export const PHYSICAL_MANAGED_DETAIL_LABELS = [
  "Brand",
  "Material",
  "Color",
  "Size",
  "Weight",
  "Dimensions",
  "Care",
  "Origin",
  "Warranty",
  "Shipping",
  "Condition",
  "Package contents",
] as const;
