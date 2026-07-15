export type MerchantTestimonial = {
  name: string;
  role: string;
  store: string;
  city: string;
  quote: string;
  avatar: string;
};

export const merchantTestimonials: MerchantTestimonial[] = [
  {
    name: "Yasmine El Amrani",
    role: "Founder",
    store: "Maison Yasmine",
    city: "Casablanca",
    quote:
      "We launched in one afternoon. WhatsApp COD verification alone cut our fake orders by nearly half.",
    avatar: "/landing/profiles/yasmine-el-amrani.jpg",
  },
  {
    name: "Karim Benali",
    role: "Owner",
    store: "Benali Gear",
    city: "Rabat",
    quote:
      "The builder is fast and clean. I redesigned our homepage without touching a single line of code.",
    avatar: "/landing/profiles/karim-benali.jpg",
  },
  {
    name: "Salma Idrissi",
    role: "Founder",
    store: "Idrissi Ceramics",
    city: "Fès",
    quote:
      "Our storefront finally feels premium. Customers trust the shop more and COD checkout is smoother.",
    avatar: "/landing/profiles/salma-idrissi.jpg",
  },
  {
    name: "Mehdi Alaoui",
    role: "Operations Lead",
    store: "Alaoui Essentials",
    city: "Marrakech",
    quote:
      "Orders, courier handoffs, and COD confirmations all live in one place. That saved us hours every week.",
    avatar: "/landing/profiles/mehdi-alaoui.jpg",
  },
  {
    name: "Nadia Cherkaoui",
    role: "Founder",
    store: "Cherkaoui Beauty",
    city: "Tanger",
    quote:
      "The first month at 0 DH let us test COD workflows properly before scaling our ad spend.",
    avatar: "/landing/profiles/nadia-cherkaoui.jpg",
  },
  {
    name: "Omar Tazi",
    role: "Co-founder",
    store: "Tazi Streetwear",
    city: "Agadir",
    quote:
      "Page speed is noticeably better than our old setup. Mobile COD sales picked up within the first week.",
    avatar: "/landing/profiles/omar-tazi.jpg",
  },
];

export const MERCHANT_SUCCESS_METRICS = [
  { value: 47, suffix: "%", label: "Fewer fake COD orders", detail: "avg. after verification" },
  { value: 5, suffix: " min", label: "Median launch time", detail: "signup to live store" },
  { value: 2.4, suffix: "×", label: "Mobile conversion lift", detail: "vs. previous platforms" },
] as const;

export const STORE_COUNTER = {
  base: 35,
  label: "Moroccan stores powered by Ettajer",
} as const;
