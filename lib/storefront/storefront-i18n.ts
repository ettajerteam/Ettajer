import type { StoreLanguage } from "@/lib/morocco-cities";

export type StorefrontLocale = StoreLanguage;

export type StorefrontCopy = {
  previewBanner: string;
  cart: {
    title: string;
    close: string;
    closeAria: string;
    piece: string;
    pieces: string;
    emptyEyebrow: string;
    emptyTitle: string;
    emptyDescription: string;
    shopCatalog: string;
    keepBrowsing: string;
    freeShippingUnlocked: string;
    addForFreeShipping: (amount: string) => string;
    subtotal: string;
    shipping: string;
    free: string;
    fromAmount: (amount: string) => string;
    estimatedTotal: string;
    checkout: string;
    cashOnDelivery: string;
    secureCheckout: string;
    trackedDelivery: string;
  };
  buy: {
    addToCart: string;
    orderNowCod: string;
    outOfStock: string;
    adding: string;
    added: string;
  };
  common: {
    viewAll: string;
    viewAllProducts: string;
    viewAllCollections: string;
    shopNow: string;
    search: string;
    products: string;
    collections: string;
  };
  checkout: {
    eyebrow: string;
    emptyCart: string;
    failed: string;
    stepsAria: string;
    stepDetails: string;
    stepDelivery: string;
    stepPay: string;
    continue: string;
  placeOrder: string;
  placingOrder: string;
  back: string;
    contact: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    shippingMethod: string;
    paymentMethod: string;
    cashOnDelivery: string;
    card: string;
    orderSummary: string;
    shipping: string;
    total: string;
    secureNote: string;
  };
  search: {
    placeholder: string;
    noResults: string;
    resultsFor: (q: string) => string;
  };
  notFound: {
    title: string;
    description: string;
    backHome: string;
  };
  nav: {
    home: string;
    shop: string;
    allProducts: string;
    collections: string;
    search: string;
    blog: string;
  };
};

const EN: StorefrontCopy = {
  previewBanner: "Preview Mode — This is how your store looks to customers",
  cart: {
    title: "Your bag",
    close: "Close",
    closeAria: "Close cart",
    piece: "piece",
    pieces: "pieces",
    emptyEyebrow: "Bag",
    emptyTitle: "Your bag is empty",
    emptyDescription: "Browse the catalog and add a piece when something feels right.",
    shopCatalog: "Shop the catalog",
    keepBrowsing: "Keep browsing",
    freeShippingUnlocked: "Free shipping unlocked on this order",
    addForFreeShipping: (amount) => `Add ${amount} for free shipping`,
    subtotal: "Subtotal",
    shipping: "Shipping",
    free: "Free",
    fromAmount: (amount) => `From ${amount}`,
    estimatedTotal: "Estimated total",
    checkout: "Checkout",
    cashOnDelivery: "Cash on delivery",
    secureCheckout: "Secure checkout",
    trackedDelivery: "Tracked delivery",
  },
  buy: {
    addToCart: "Add to cart",
    orderNowCod: "Order now — COD",
    outOfStock: "Out of stock",
    adding: "Adding…",
    added: "Added",
  },
  common: {
    viewAll: "View all",
    viewAllProducts: "View all products",
    viewAllCollections: "View all collections",
    shopNow: "Shop now",
    search: "Search",
    products: "Products",
    collections: "Collections",
  },
  checkout: {
    eyebrow: "Checkout",
    emptyCart: "Your cart is empty",
    failed: "Checkout failed",
    stepsAria: "Checkout steps",
    stepDetails: "Details",
    stepDelivery: "Delivery",
    stepPay: "Pay",
    continue: "Continue",
    placeOrder: "Place order",
    placingOrder: "Placing order…",
    back: "Back",
    contact: "Contact",
    name: "Full name",
    email: "Email",
    phone: "Phone",
    address: "Shipping address",
    street: "Street address",
    city: "City",
    postalCode: "Postal code",
    country: "Country",
    shippingMethod: "Shipping",
    paymentMethod: "Payment",
    cashOnDelivery: "Cash on delivery",
    card: "Card",
    orderSummary: "Order summary",
    shipping: "Shipping",
    total: "Total",
    secureNote: "Your details are encrypted and never shared.",
  },
  search: {
    placeholder: "Search products…",
    noResults: "No products matched your search",
    resultsFor: (q) => `Results for “${q}”`,
  },
  notFound: {
    title: "Page not found",
    description: "This page doesn’t exist in this store.",
    backHome: "Back to store",
  },
  nav: {
    home: "Home",
    shop: "Shop",
    allProducts: "All products",
    collections: "Collections",
    search: "Search",
    blog: "Blog",
  },
};

const FR: StorefrontCopy = {
  previewBanner: "Mode aperçu — Voici comment vos clients voient la boutique",
  cart: {
    title: "Votre panier",
    close: "Fermer",
    closeAria: "Fermer le panier",
    piece: "article",
    pieces: "articles",
    emptyEyebrow: "Panier",
    emptyTitle: "Votre panier est vide",
    emptyDescription: "Parcourez le catalogue et ajoutez un article quand vous êtes prêt.",
    shopCatalog: "Voir le catalogue",
    keepBrowsing: "Continuer",
    freeShippingUnlocked: "Livraison gratuite débloquée pour cette commande",
    addForFreeShipping: (amount) => `Ajoutez ${amount} pour la livraison gratuite`,
    subtotal: "Sous-total",
    shipping: "Livraison",
    free: "Gratuit",
    fromAmount: (amount) => `À partir de ${amount}`,
    estimatedTotal: "Total estimé",
    checkout: "Commander",
    cashOnDelivery: "Paiement à la livraison",
    secureCheckout: "Paiement sécurisé",
    trackedDelivery: "Livraison suivie",
  },
  buy: {
    addToCart: "Ajouter au panier",
    orderNowCod: "Commander — COD",
    outOfStock: "Rupture de stock",
    adding: "Ajout…",
    added: "Ajouté",
  },
  common: {
    viewAll: "Tout voir",
    viewAllProducts: "Tous les produits",
    viewAllCollections: "Toutes les collections",
    shopNow: "Acheter",
    search: "Rechercher",
    products: "Produits",
    collections: "Collections",
  },
  checkout: {
    eyebrow: "Commande",
    emptyCart: "Votre panier est vide",
    failed: "Échec de la commande",
    stepsAria: "Étapes de commande",
    stepDetails: "Coordonnées",
    stepDelivery: "Livraison",
    stepPay: "Paiement",
    continue: "Continuer",
    placeOrder: "Confirmer la commande",
    placingOrder: "Commande en cours…",
    back: "Retour",
    contact: "Contact",
    name: "Nom complet",
    email: "E-mail",
    phone: "Téléphone",
    address: "Adresse de livraison",
    street: "Adresse",
    city: "Ville",
    postalCode: "Code postal",
    country: "Pays",
    shippingMethod: "Livraison",
    paymentMethod: "Paiement",
    cashOnDelivery: "Paiement à la livraison",
    card: "Carte",
    orderSummary: "Récapitulatif",
    shipping: "Livraison",
    total: "Total",
    secureNote: "Vos informations sont chiffrées et jamais partagées.",
  },
  search: {
    placeholder: "Rechercher des produits…",
    noResults: "Aucun produit ne correspond à votre recherche",
    resultsFor: (q) => `Résultats pour « ${q} »`,
  },
  notFound: {
    title: "Page introuvable",
    description: "Cette page n’existe pas dans cette boutique.",
    backHome: "Retour à la boutique",
  },
  nav: {
    home: "Accueil",
    shop: "Boutique",
    allProducts: "Tous les produits",
    collections: "Collections",
    search: "Recherche",
    blog: "Blog",
  },
};

const AR: StorefrontCopy = {
  previewBanner: "وضع المعاينة — هكذا تظهر متجرك للزبائن",
  cart: {
    title: "سلتك",
    close: "إغلاق",
    closeAria: "إغلاق السلة",
    piece: "قطعة",
    pieces: "قطع",
    emptyEyebrow: "السلة",
    emptyTitle: "سلتك فارغة",
    emptyDescription: "تصفح الكتالوج وأضف منتجاً عندما تجد ما يناسبك.",
    shopCatalog: "تصفح المنتجات",
    keepBrowsing: "متابعة التصفح",
    freeShippingUnlocked: "تم تفعيل الشحن المجاني لهذه الطلبية",
    addForFreeShipping: (amount) => `أضف ${amount} للحصول على شحن مجاني`,
    subtotal: "المجموع الفرعي",
    shipping: "الشحن",
    free: "مجاني",
    fromAmount: (amount) => `ابتداءً من ${amount}`,
    estimatedTotal: "المجموع التقديري",
    checkout: "إتمام الطلب",
    cashOnDelivery: "الدفع عند الاستلام",
    secureCheckout: "طلب آمن",
    trackedDelivery: "توصيل متتبع",
  },
  buy: {
    addToCart: "أضف إلى السلة",
    orderNowCod: "اطلب الآن — دفع عند الاستلام",
    outOfStock: "غير متوفر",
    adding: "جاري الإضافة…",
    added: "تمت الإضافة",
  },
  common: {
    viewAll: "عرض الكل",
    viewAllProducts: "كل المنتجات",
    viewAllCollections: "كل المجموعات",
    shopNow: "تسوّق الآن",
    search: "بحث",
    products: "المنتجات",
    collections: "المجموعات",
  },
  checkout: {
    eyebrow: "إتمام الطلب",
    emptyCart: "سلتك فارغة",
    failed: "فشل إتمام الطلب",
    stepsAria: "خطوات الطلب",
    stepDetails: "البيانات",
    stepDelivery: "التوصيل",
    stepPay: "الدفع",
    continue: "متابعة",
    placeOrder: "تأكيد الطلب",
    placingOrder: "جاري تأكيد الطلب…",
    back: "رجوع",
    contact: "التواصل",
    name: "الاسم الكامل",
    email: "البريد الإلكتروني",
    phone: "الهاتف",
    address: "عنوان التوصيل",
    street: "العنوان",
    city: "المدينة",
    postalCode: "الرمز البريدي",
    country: "البلد",
    shippingMethod: "الشحن",
    paymentMethod: "الدفع",
    cashOnDelivery: "الدفع عند الاستلام",
    card: "بطاقة",
    orderSummary: "ملخص الطلب",
    shipping: "الشحن",
    total: "المجموع",
    secureNote: "بياناتك مشفرة ولن تتم مشاركتها.",
  },
  search: {
    placeholder: "ابحث عن منتجات…",
    noResults: "لا توجد منتجات مطابقة لبحثك",
    resultsFor: (q) => `نتائج البحث عن «${q}»`,
  },
  notFound: {
    title: "الصفحة غير موجودة",
    description: "هذه الصفحة غير موجودة في هذا المتجر.",
    backHome: "العودة إلى المتجر",
  },
  nav: {
    home: "الرئيسية",
    shop: "المتجر",
    allProducts: "كل المنتجات",
    collections: "المجموعات",
    search: "بحث",
    blog: "المدونة",
  },
};

export function toStorefrontLocale(value: string | null | undefined): StorefrontLocale {
  const normalized = (value ?? "en").trim().toLowerCase();
  if (normalized === "fr" || normalized.startsWith("fr")) return "fr";
  if (normalized === "ar" || normalized.startsWith("ar")) return "ar";
  return "en";
}

export function getStorefrontCopy(locale: string | null | undefined): StorefrontCopy {
  const lang = toStorefrontLocale(locale);
  if (lang === "fr") return FR;
  if (lang === "ar") return AR;
  return EN;
}

export function isStorefrontRtl(locale: string | null | undefined): boolean {
  return toStorefrontLocale(locale) === "ar";
}

export function getStorefrontDir(locale: string | null | undefined): "rtl" | "ltr" {
  return isStorefrontRtl(locale) ? "rtl" : "ltr";
}

export function getStorefrontLang(locale: string | null | undefined): string {
  return toStorefrontLocale(locale);
}
