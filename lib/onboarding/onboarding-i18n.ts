import type { LandingLocale } from "@/lib/landing/landing-i18n";
import type { BusinessModel } from "@/lib/onboarding/business-models";
import type { WebsiteTemplateId } from "@/lib/website-templates/types";

export type OnboardingStepId =
  | "businessModel"
  | "website"
  | "storeName"
  | "category"
  | "currency";

export const ONBOARDING_TOTAL_STEPS = 5;

export type OnboardingBusinessModelCopy = {
  title: string;
  description: string;
  physical: { title: string; description: string };
  digital: { title: string; description: string };
  dropshipping: { title: string; description: string };
};

export type OnboardingWebsiteCopy = {
  title: string;
  description: string;
  recommended: string;
  selectTemplate: string;
};

export type OnboardingExtendedCopy = {
  pageSubtitle: string;
  steps: {
    businessModel: { title: string; description: string };
    website: { title: string; description: string };
    storeName: { title: string; description: string };
    category: { title: string; description: string };
    currency: { title: string; description: string };
  };
  businessModel: OnboardingBusinessModelCopy;
  website: OnboardingWebsiteCopy;
  step4: {
    heading: string;
    subheading: string;
    label: string;
    placeholder: string;
  };
  step5: {
    heading: string;
    subheading: string;
    label: string;
    placeholder: string;
    summaryTitle: string;
  };
  errors: {
    businessModelRequired: string;
    templateRequired: string;
    storeNameRequired: string;
    categoryRequired: string;
    createFailed: string;
    generic: string;
  };
  businessModels: Record<BusinessModel, string>;
  templates: Record<WebsiteTemplateId, { name: string; tagline: string }>;
};

const EN: OnboardingExtendedCopy = {
  pageSubtitle: "Set up your store in 5 steps — business model, website design, and basics",
  steps: {
    businessModel: { title: "Business model", description: "How will you sell?" },
    website: { title: "Website", description: "Pick your storefront design" },
    storeName: { title: "Store name", description: "Name your brand" },
    category: { title: "Category", description: "What do you sell?" },
    currency: { title: "Currency", description: "Primary currency" },
  },
  businessModel: {
    title: "How do you want to sell?",
    description: "Choose the model that fits your business. You can adjust settings later.",
    physical: {
      title: "Physical products",
      description: "Ship tangible goods — inventory, COD, and delivery zones.",
    },
    digital: {
      title: "Digital products",
      description: "Sell downloads, courses, templates, or licenses — instant delivery.",
    },
    dropshipping: {
      title: "Dropshipping",
      description: "Sell without holding stock — supplier ships directly to customers.",
    },
  },
  website: {
    title: "Choose your website",
    description: "Start with a complete design. Customize everything in the dashboard later.",
    recommended: "Recommended",
    selectTemplate: "Select this design",
  },
  step4: {
    heading: "Name your store",
    subheading: "Choose a memorable name for your online business",
    label: "Store name",
    placeholder: "e.g. Atlas Crafts, Casablanca Fashion",
  },
  step5: {
    heading: "Choose your currency",
    subheading: "You can change this later in settings",
    label: "Primary currency",
    placeholder: "Select currency",
    summaryTitle: "Your store summary",
  },
  errors: {
    businessModelRequired: "Please select how you want to sell",
    templateRequired: "Please choose a website design",
    storeNameRequired: "Please enter a store name",
    categoryRequired: "Please select a category",
    createFailed: "Failed to create store",
    generic: "Something went wrong",
  },
  businessModels: {
    physical: "Physical products",
    digital: "Digital products",
    dropshipping: "Dropshipping",
  },
  templates: {
    aura: { name: "Aura", tagline: "Refined simplicity" },
    tech: { name: "TechNova", tagline: "Hot gadgets. Curated fidelity." },
    paper: { name: "Paper", tagline: "Curated essentials for modern living" },
  },
};

const FR: OnboardingExtendedCopy = {
  pageSubtitle:
    "Configurez votre boutique en 5 étapes — modèle commercial, design du site et bases",
  steps: {
    businessModel: { title: "Modèle", description: "Comment vendez-vous ?" },
    website: { title: "Site web", description: "Choisissez le design de votre boutique" },
    storeName: { title: "Nom", description: "Nommez votre marque" },
    category: { title: "Catégorie", description: "Que vendez-vous ?" },
    currency: { title: "Devise", description: "Devise principale" },
  },
  businessModel: {
    title: "Comment voulez-vous vendre ?",
    description: "Choisissez le modèle adapté à votre activité. Vous pourrez l'ajuster plus tard.",
    physical: {
      title: "Produits physiques",
      description: "Expédiez des biens tangibles — stock, COD et zones de livraison.",
    },
    digital: {
      title: "Produits numériques",
      description: "Vendez téléchargements, formations ou licences — livraison instantanée.",
    },
    dropshipping: {
      title: "Dropshipping",
      description: "Vendez sans stock — le fournisseur expédie directement au client.",
    },
  },
  website: {
    title: "Choisissez votre site",
    description: "Partez d'un design complet. Personnalisez tout depuis le tableau de bord.",
    recommended: "Recommandé",
    selectTemplate: "Choisir ce design",
  },
  step4: {
    heading: "Nommez votre boutique",
    subheading: "Choisissez un nom mémorable pour votre activité en ligne",
    label: "Nom de la boutique",
    placeholder: "ex. Atlas Crafts, Mode Casablanca",
  },
  step5: {
    heading: "Choisissez votre devise",
    subheading: "Vous pourrez la modifier plus tard dans les paramètres",
    label: "Devise principale",
    placeholder: "Sélectionner une devise",
    summaryTitle: "Récapitulatif de votre boutique",
  },
  errors: {
    businessModelRequired: "Veuillez sélectionner votre mode de vente",
    templateRequired: "Veuillez choisir un design de site",
    storeNameRequired: "Veuillez saisir un nom de boutique",
    categoryRequired: "Veuillez sélectionner une catégorie",
    createFailed: "Échec de la création de la boutique",
    generic: "Une erreur s'est produite",
  },
  businessModels: {
    physical: "Produits physiques",
    digital: "Produits numériques",
    dropshipping: "Dropshipping",
  },
  templates: {
    aura: { name: "Aura", tagline: "Simplicité raffinée" },
    tech: { name: "TechNova", tagline: "Gadgets premium. Fidélité curatée." },
    paper: { name: "Paper", tagline: "Essentiels soignés pour le quotidien" },
  },
};

const AR: OnboardingExtendedCopy = {
  pageSubtitle: "أعد متجرك في 5 خطوات — نموذج العمل، تصميم الموقع، والأساسيات",
  steps: {
    businessModel: { title: "نموذج العمل", description: "كيف ستبيع؟" },
    website: { title: "الموقع", description: "اختر تصميم واجهة متجرك" },
    storeName: { title: "اسم المتجر", description: "سمِّ علامتك" },
    category: { title: "الفئة", description: "ماذا تبيع؟" },
    currency: { title: "العملة", description: "العملة الأساسية" },
  },
  businessModel: {
    title: "كيف تريد البيع؟",
    description: "اختر النموذج المناسب لنشاطك. يمكنك تعديل الإعدادات لاحقاً.",
    physical: {
      title: "منتجات مادية",
      description: "شحن بضائع ملموسة — مخزون، الدفع عند الاستلام ومناطق التوصيل.",
    },
    digital: {
      title: "منتجات رقمية",
      description: "بيع التحميلات، الدورات أو التراخيص — تسليم فوري.",
    },
    dropshipping: {
      title: "دروبشيبينغ",
      description: "بيع بدون مخزون — المورد يشحن مباشرة للعميل.",
    },
  },
  website: {
    title: "اختر موقعك",
    description: "ابدأ بتصميم كامل. خصّص كل شيء من لوحة التحكم لاحقاً.",
    recommended: "موصى به",
    selectTemplate: "اختر هذا التصميم",
  },
  step4: {
    heading: "سمِّ متجرك",
    subheading: "اختر اسماً مميزاً لنشاطك الإلكتروني",
    label: "اسم المتجر",
    placeholder: "مثال: حرف الأطلس، أزياء الدار البيضاء",
  },
  step5: {
    heading: "اختر عملتك",
    subheading: "يمكنك تغييرها لاحقاً من الإعدادات",
    label: "العملة الأساسية",
    placeholder: "اختر العملة",
    summaryTitle: "ملخص متجرك",
  },
  errors: {
    businessModelRequired: "يرجى اختيار طريقة البيع",
    templateRequired: "يرجى اختيار تصميم الموقع",
    storeNameRequired: "يرجى إدخال اسم المتجر",
    categoryRequired: "يرجى اختيار فئة",
    createFailed: "فشل إنشاء المتجر",
    generic: "حدث خطأ ما",
  },
  businessModels: {
    physical: "منتجات مادية",
    digital: "منتجات رقمية",
    dropshipping: "دروبشيبينغ",
  },
  templates: {
    aura: { name: "Aura", tagline: "بساطة راقية" },
    tech: { name: "TechNova", tagline: "أجهزة مميزة. دقة منتقاة." },
    paper: { name: "Paper", tagline: "أساسيات مختارة للحياة العصرية" },
  },
};

const COPIES: Record<LandingLocale, OnboardingExtendedCopy> = {
  en: EN,
  fr: FR,
  ar: AR,
};

export function getOnboardingExtendedCopy(locale: LandingLocale): OnboardingExtendedCopy {
  return COPIES[locale] ?? EN;
}
