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
  hint: string;
  selectAll: string;
  clear: string;
  selectedCount: (count: number) => string;
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
  brand: {
    heading: string;
    subheading: string;
    nameLabel: string;
    namePlaceholder: string;
    taglineLabel: string;
    taglinePlaceholder: string;
    taglineHint: string;
    phoneLabel: string;
    phonePlaceholder: string;
    phoneHint: string;
  };
  category: {
    heading: string;
    subheading: string;
  };
  launch: {
    heading: string;
    subheading: string;
    currencyLabel: string;
    currencyPlaceholder: string;
    languageLabel: string;
    languagePlaceholder: string;
    languages: { en: string; fr: string; ar: string };
    summaryTitle: string;
    summaryModels: string;
    summaryTemplate: string;
    summaryCategory: string;
    summaryCurrency: string;
    summaryLanguage: string;
    summaryPhone: string;
    summaryEmpty: string;
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
  pageSubtitle:
    "Five guided steps — how you sell, your website look, brand basics, and launch settings",
  steps: {
    businessModel: { title: "Sell modes", description: "What you offer" },
    website: { title: "Website", description: "Storefront design" },
    storeName: { title: "Brand", description: "Name & contact" },
    category: { title: "Category", description: "Catalog focus" },
    currency: { title: "Launch", description: "Currency & language" },
  },
  businessModel: {
    title: "How do you sell?",
    description: "Select every model that fits — many stores mix physical, digital, and dropshipping.",
    hint: "You can change product types anytime when adding items.",
    selectAll: "Select all",
    clear: "Clear",
    selectedCount: (count) =>
      count === 1 ? "1 mode selected" : `${count} modes selected`,
    physical: {
      title: "Physical products",
      description: "Ship tangible goods — inventory, COD, and delivery zones.",
    },
    digital: {
      title: "Digital products",
      description: "Downloads, courses, templates, or licenses — delivered instantly.",
    },
    dropshipping: {
      title: "Dropshipping",
      description: "Sell without holding stock — your supplier ships to the customer.",
    },
  },
  website: {
    title: "Choose your website",
    description: "Start with a complete design. Customize pages, colors, and fonts later.",
    recommended: "Recommended",
    selectTemplate: "Select this design",
  },
  brand: {
    heading: "Your store identity",
    subheading: "A clear name and contact details help customers trust your checkout.",
    nameLabel: "Store name",
    namePlaceholder: "e.g. Atlas Crafts, Casablanca Fashion",
    taglineLabel: "Short tagline",
    taglinePlaceholder: "e.g. Everyday essentials, delivered across Morocco",
    taglineHint: "Optional — shown on your storefront and in search snippets.",
    phoneLabel: "Store phone",
    phonePlaceholder: "e.g. +212 6 12 34 56 78",
    phoneHint: "Optional — useful for COD confirmations and customer trust.",
  },
  category: {
    heading: "What do you sell?",
    subheading: "Pick the category that best matches your catalog. You can refine it later.",
  },
  launch: {
    heading: "Ready to launch",
    subheading: "Set your primary currency and storefront language — both editable anytime.",
    currencyLabel: "Primary currency",
    currencyPlaceholder: "Select currency",
    languageLabel: "Storefront language",
    languagePlaceholder: "Select language",
    languages: { en: "English", fr: "Français", ar: "العربية" },
    summaryTitle: "Launch summary",
    summaryModels: "Sell modes",
    summaryTemplate: "Website",
    summaryCategory: "Category",
    summaryCurrency: "Currency",
    summaryLanguage: "Language",
    summaryPhone: "Phone",
    summaryEmpty: "—",
  },
  errors: {
    businessModelRequired: "Select at least one way you sell",
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
    "Cinq étapes guidées — modes de vente, design du site, identité de marque et lancement",
  steps: {
    businessModel: { title: "Vente", description: "Ce que vous proposez" },
    website: { title: "Site", description: "Design de la boutique" },
    storeName: { title: "Marque", description: "Nom & contact" },
    category: { title: "Catégorie", description: "Focus catalogue" },
    currency: { title: "Lancement", description: "Devise & langue" },
  },
  businessModel: {
    title: "Comment vendez-vous ?",
    description:
      "Sélectionnez tous les modèles qui vous concernent — beaucoup de boutiques combinent physique, digital et dropshipping.",
    hint: "Vous pourrez choisir le type de chaque produit à l’ajout.",
    selectAll: "Tout sélectionner",
    clear: "Effacer",
    selectedCount: (count) =>
      count === 1 ? "1 mode sélectionné" : `${count} modes sélectionnés`,
    physical: {
      title: "Produits physiques",
      description: "Expédiez des biens tangibles — stock, COD et zones de livraison.",
    },
    digital: {
      title: "Produits numériques",
      description: "Téléchargements, formations ou licences — livraison instantanée.",
    },
    dropshipping: {
      title: "Dropshipping",
      description: "Vendez sans stock — le fournisseur expédie directement au client.",
    },
  },
  website: {
    title: "Choisissez votre site",
    description: "Partez d’un design complet. Personnalisez pages, couleurs et polices ensuite.",
    recommended: "Recommandé",
    selectTemplate: "Choisir ce design",
  },
  brand: {
    heading: "Identité de votre boutique",
    subheading: "Un nom clair et un contact renforcent la confiance au paiement.",
    nameLabel: "Nom de la boutique",
    namePlaceholder: "ex. Atlas Crafts, Mode Casablanca",
    taglineLabel: "Courte accroche",
    taglinePlaceholder: "ex. Essentiels du quotidien, livrés partout au Maroc",
    taglineHint: "Facultatif — visible sur la boutique et dans les aperçus de recherche.",
    phoneLabel: "Téléphone boutique",
    phonePlaceholder: "ex. +212 6 12 34 56 78",
    phoneHint: "Facultatif — utile pour les confirmations COD et la confiance client.",
  },
  category: {
    heading: "Que vendez-vous ?",
    subheading: "Choisissez la catégorie la plus proche de votre catalogue. Modifiable plus tard.",
  },
  launch: {
    heading: "Prêt à lancer",
    subheading: "Devise principale et langue de la boutique — modifiables à tout moment.",
    currencyLabel: "Devise principale",
    currencyPlaceholder: "Sélectionner une devise",
    languageLabel: "Langue de la boutique",
    languagePlaceholder: "Sélectionner une langue",
    languages: { en: "English", fr: "Français", ar: "العربية" },
    summaryTitle: "Récapitulatif",
    summaryModels: "Modes de vente",
    summaryTemplate: "Site",
    summaryCategory: "Catégorie",
    summaryCurrency: "Devise",
    summaryLanguage: "Langue",
    summaryPhone: "Téléphone",
    summaryEmpty: "—",
  },
  errors: {
    businessModelRequired: "Sélectionnez au moins un mode de vente",
    templateRequired: "Veuillez choisir un design de site",
    storeNameRequired: "Veuillez saisir un nom de boutique",
    categoryRequired: "Veuillez sélectionner une catégorie",
    createFailed: "Échec de la création de la boutique",
    generic: "Une erreur s’est produite",
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
  pageSubtitle: "خمس خطوات موجّهة — طرق البيع، تصميم الموقع، هوية العلامة، وإعدادات الإطلاق",
  steps: {
    businessModel: { title: "طرق البيع", description: "ماذا تقدّم" },
    website: { title: "الموقع", description: "تصميم المتجر" },
    storeName: { title: "العلامة", description: "الاسم والتواصل" },
    category: { title: "الفئة", description: "تركيز الكتالوج" },
    currency: { title: "الإطلاق", description: "العملة واللغة" },
  },
  businessModel: {
    title: "كيف تبيع؟",
    description: "اختر كل النماذج المناسبة — كثير من المتاجر تجمع بين المادي والرقمي والدروبشيبينغ.",
    hint: "يمكنك تحديد نوع كل منتج عند إضافته لاحقاً.",
    selectAll: "تحديد الكل",
    clear: "مسح",
    selectedCount: (count) =>
      count === 1 ? "نموذج واحد محدد" : `${count} نماذج محددة`,
    physical: {
      title: "منتجات مادية",
      description: "شحن بضائع ملموسة — مخزون، الدفع عند الاستلام ومناطق التوصيل.",
    },
    digital: {
      title: "منتجات رقمية",
      description: "تحميلات، دورات أو تراخيص — تسليم فوري.",
    },
    dropshipping: {
      title: "دروبشيبينغ",
      description: "بيع بدون مخزون — المورد يشحن مباشرة للعميل.",
    },
  },
  website: {
    title: "اختر موقعك",
    description: "ابدأ بتصميم كامل. خصّص الصفحات والألوان والخطوط لاحقاً.",
    recommended: "موصى به",
    selectTemplate: "اختر هذا التصميم",
  },
  brand: {
    heading: "هوية متجرك",
    subheading: "اسم واضح وبيانات تواصل تعزّز ثقة العميل عند الدفع.",
    nameLabel: "اسم المتجر",
    namePlaceholder: "مثال: حرف الأطلس، أزياء الدار البيضاء",
    taglineLabel: "شعار قصير",
    taglinePlaceholder: "مثال: أساسيات يومية، توصيل في كل المغرب",
    taglineHint: "اختياري — يظهر في المتجر ومقتطفات البحث.",
    phoneLabel: "هاتف المتجر",
    phonePlaceholder: "مثال: ‎+212 6 12 34 56 78",
    phoneHint: "اختياري — مفيد لتأكيد طلبات الدفع عند الاستلام وثقة العملاء.",
  },
  category: {
    heading: "ماذا تبيع؟",
    subheading: "اختر الفئة الأقرب لكتالوجك. يمكنك تعديلها لاحقاً.",
  },
  launch: {
    heading: "جاهز للإطلاق",
    subheading: "العملة الأساسية ولغة واجهة المتجر — يمكن تغييرهما في أي وقت.",
    currencyLabel: "العملة الأساسية",
    currencyPlaceholder: "اختر العملة",
    languageLabel: "لغة المتجر",
    languagePlaceholder: "اختر اللغة",
    languages: { en: "English", fr: "Français", ar: "العربية" },
    summaryTitle: "ملخص الإطلاق",
    summaryModels: "طرق البيع",
    summaryTemplate: "الموقع",
    summaryCategory: "الفئة",
    summaryCurrency: "العملة",
    summaryLanguage: "اللغة",
    summaryPhone: "الهاتف",
    summaryEmpty: "—",
  },
  errors: {
    businessModelRequired: "اختر طريقة بيع واحدة على الأقل",
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
