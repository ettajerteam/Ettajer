import type { HelpArticle, HelpCategory } from "@/lib/help/help-data";
import {
  getCategoryById,
  HELP_ARTICLES,
  HELP_CATEGORIES,
} from "@/lib/help/help-data";
import {
  getLocalizedArticle,
  type HelpLocale,
} from "@/lib/help/help-i18n";

export type { HelpLocale };

export type HelpChecklistItemCopy = {
  title: string;
  description: string;
};

export type HelpShellCopy = {
  getHelp: string;
  contact: string;
  contactSupport: string;
  startFree: string;
  signIn: string;
  home: string;
  openMenu: string;
  closeMenu: string;
  support: string;
  helpCenter: string;
  footerTagline: string;
  allRights: string;
  privacy: string;
  terms: string;
  cookies: string;
  language: string;
  languageAria: string;
};

export type HelpPageCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  resultsFor: (count: number, query: string) => string;
  noArticlesTitle: string;
  noArticlesSubtitle: string;
  contactSupport: string;
  browseTitle: string;
  browseSubtitle: string;
  articleCount: (count: number) => string;
  categoriesAria: string;
  popularTitle: string;
  popularSubtitle: string;
  troubleshooting: string;
  popularAria: string;
  stillNeedHelpTitle: string;
  stillNeedHelpSubtitle: string;
  contactCardTitle: string;
  contactCardSubtitle: string;
  getInTouch: string;
  emailCardTitle: string;
  openMailApp: string;
};

export type HelpSearchCopy = {
  placeholder: string;
  ariaLabel: string;
  clearAria: string;
};

export type HelpChecklistCopy = {
  title: string;
  subtitle: string;
  stepLabel: (step: number) => string;
  goToDashboard: string;
  readGuide: string;
  footnote: string;
  checklistAria: string;
  items: HelpChecklistItemCopy[];
};

export type HelpArticleUiCopy = {
  getHelp: string;
  helpCenter: string;
  allTopics: string;
  backToHelp: string;
  helpfulQuestion: string;
  thanksYes: string;
  thanksNo: string;
  yes: string;
  no: string;
  contactSupport: string;
  relatedArticles: string;
};

export type HelpCategoryTranslations = Record<
  string,
  { title: string; description: string }
>;

export type HelpCopy = {
  shell: HelpShellCopy;
  page: HelpPageCopy;
  search: HelpSearchCopy;
  checklist: HelpChecklistCopy;
  article: HelpArticleUiCopy;
  categories: HelpCategoryTranslations;
};

const CATEGORY_EN: HelpCategoryTranslations = Object.fromEntries(
  HELP_CATEGORIES.map((c) => [c.id, { title: c.title, description: c.description }]),
);

const EN: HelpCopy = {
  shell: {
    getHelp: "Get help",
    contact: "Contact",
    contactSupport: "Contact support",
    startFree: "Start free",
    signIn: "Sign in",
    home: "Home",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    support: "Support",
    helpCenter: "Help center",
    footerTagline: "Help, guides, and support for Ettajer merchants.",
    allRights: "All rights reserved.",
    privacy: "Privacy",
    terms: "Terms",
    cookies: "Cookies",
    language: "Language",
    languageAria: "Language",
  },
  page: {
    eyebrow: "Ettajer Support",
    title: "How can we help?",
    subtitle: "Search guides, browse topics, or contact our team.",
    resultsFor: (count, query) =>
      `${count} result${count === 1 ? "" : "s"} for “${query}”`,
    noArticlesTitle: "No articles found",
    noArticlesSubtitle: "Try different keywords or contact support directly.",
    contactSupport: "Contact support",
    browseTitle: "Browse by topic",
    browseSubtitle: "Pick a category to find step-by-step guides.",
    articleCount: (count) => `${count} article${count === 1 ? "" : "s"}`,
    categoriesAria: "Help categories",
    popularTitle: "Popular articles",
    popularSubtitle: "Quick answers to what merchants ask most.",
    troubleshooting: "Troubleshooting →",
    popularAria: "Popular articles",
    stillNeedHelpTitle: "Still need help?",
    stillNeedHelpSubtitle: "Our support team is available Monday through Friday.",
    contactCardTitle: "Contact support",
    contactCardSubtitle: "Send a message and we'll reply within one business day.",
    getInTouch: "Get in touch",
    emailCardTitle: "Email us",
    openMailApp: "Open mail app",
  },
  search: {
    placeholder: "Search help articles...",
    ariaLabel: "Search help articles",
    clearAria: "Clear search",
  },
  checklist: {
    title: "Launch in 5 steps",
    subtitle: "A quick checklist to go from signup to your first sale.",
    stepLabel: (step) => `Step ${step}`,
    goToDashboard: "Go to dashboard",
    readGuide: "Read guide",
    footnote: "Most merchants complete these steps in under one hour.",
    checklistAria: "Getting started steps",
    items: [
      {
        title: "Create your account",
        description: "Sign up and complete onboarding.",
      },
      {
        title: "Add your first product",
        description: "Upload photos, set price, and publish.",
      },
      {
        title: "Customize your storefront",
        description: "Edit your theme in the visual builder.",
      },
      {
        title: "Enable COD checkout",
        description: "Turn on cash on delivery and verification.",
      },
      {
        title: "Connect your domain",
        description: "Use your own domain with free SSL.",
      },
    ],
  },
  article: {
    getHelp: "Get help",
    helpCenter: "Help center",
    allTopics: "All topics",
    backToHelp: "Back to help center",
    helpfulQuestion: "Was this article helpful?",
    thanksYes: "Thanks for your feedback.",
    thanksNo: "Sorry this didn't help. Contact support below.",
    yes: "Yes",
    no: "No",
    contactSupport: "Contact support",
    relatedArticles: "Related articles",
  },
  categories: CATEGORY_EN,
};

const FR: HelpCopy = {
  shell: {
    getHelp: "Aide",
    contact: "Contact",
    contactSupport: "Contacter le support",
    startFree: "Commencer gratuitement",
    signIn: "Se connecter",
    home: "Accueil",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    support: "Assistance",
    helpCenter: "Centre d'aide",
    footerTagline: "Aide, guides et support pour les marchands Ettajer.",
    allRights: "Tous droits réservés.",
    privacy: "Confidentialité",
    terms: "Conditions",
    cookies: "Cookies",
    language: "Langue",
    languageAria: "Langue",
  },
  page: {
    eyebrow: "Support Ettajer",
    title: "Comment pouvons-nous vous aider ?",
    subtitle: "Recherchez des guides, parcourez les sujets ou contactez notre équipe.",
    resultsFor: (count, query) =>
      `${count} résultat${count === 1 ? "" : "s"} pour « ${query} »`,
    noArticlesTitle: "Aucun article trouvé",
    noArticlesSubtitle: "Essayez d'autres mots-clés ou contactez le support.",
    contactSupport: "Contacter le support",
    browseTitle: "Parcourir par sujet",
    browseSubtitle: "Choisissez une catégorie pour des guides pas à pas.",
    articleCount: (count) => `${count} article${count === 1 ? "" : "s"}`,
    categoriesAria: "Catégories d'aide",
    popularTitle: "Articles populaires",
    popularSubtitle: "Réponses rapides aux questions les plus fréquentes.",
    troubleshooting: "Dépannage →",
    popularAria: "Articles populaires",
    stillNeedHelpTitle: "Besoin d'aide supplémentaire ?",
    stillNeedHelpSubtitle: "Notre équipe est disponible du lundi au vendredi.",
    contactCardTitle: "Contacter le support",
    contactCardSubtitle: "Envoyez un message — réponse sous un jour ouvrable.",
    getInTouch: "Nous contacter",
    emailCardTitle: "Nous écrire",
    openMailApp: "Ouvrir l'application mail",
  },
  search: {
    placeholder: "Rechercher dans l'aide...",
    ariaLabel: "Rechercher dans l'aide",
    clearAria: "Effacer la recherche",
  },
  checklist: {
    title: "Lancement en 5 étapes",
    subtitle: "Une checklist rapide de l'inscription à la première vente.",
    stepLabel: (step) => `Étape ${step}`,
    goToDashboard: "Aller au tableau de bord",
    readGuide: "Lire le guide",
    footnote: "La plupart des marchands terminent ces étapes en moins d'une heure.",
    checklistAria: "Étapes de démarrage",
    items: [
      {
        title: "Créer votre compte",
        description: "Inscrivez-vous et terminez l'onboarding.",
      },
      {
        title: "Ajouter votre premier produit",
        description: "Téléversez des photos, fixez le prix et publiez.",
      },
      {
        title: "Personnaliser votre boutique",
        description: "Modifiez votre thème dans l'éditeur visuel.",
      },
      {
        title: "Activer le paiement COD",
        description: "Activez le paiement à la livraison et la vérification.",
      },
      {
        title: "Connecter votre domaine",
        description: "Utilisez votre domaine avec SSL gratuit.",
      },
    ],
  },
  article: {
    getHelp: "Aide",
    helpCenter: "Centre d'aide",
    allTopics: "Tous les sujets",
    backToHelp: "Retour au centre d'aide",
    helpfulQuestion: "Cet article vous a-t-il été utile ?",
    thanksYes: "Merci pour votre retour.",
    thanksNo: "Désolé que cela n'ait pas aidé. Contactez le support ci-dessous.",
    yes: "Oui",
    no: "Non",
    contactSupport: "Contacter le support",
    relatedArticles: "Articles connexes",
  },
  categories: {
    "getting-started": {
      title: "Premiers pas",
      description: "Lancez votre boutique et publiez vos premiers produits.",
    },
    catalog: {
      title: "Catalogue",
      description: "Produits, collections, catégories et inventaire.",
    },
    "store-builder": {
      title: "Éditeur de boutique",
      description: "Pages, sections et identité visuelle.",
    },
    "orders-cod": {
      title: "Commandes & COD",
      description: "Paiement, vérification et expédition.",
    },
    "domains-hosting": {
      title: "Domaines & hébergement",
      description: "Domaines personnalisés, SSL et performance.",
    },
    billing: {
      title: "Facturation & forfaits",
      description: "Abonnements, essais et factures.",
    },
    marketing: {
      title: "Marketing",
      description: "Pixels, campagnes et plateformes publicitaires.",
    },
    analytics: {
      title: "Analytique",
      description: "Trafic, conversion et rapports.",
    },
    account: {
      title: "Compte",
      description: "Connexion, accès équipe et sécurité.",
    },
    migration: {
      title: "Migration",
      description: "Depuis Shopify, WooCommerce et plus.",
    },
    troubleshooting: {
      title: "Dépannage",
      description: "Résoudre les problèmes courants rapidement.",
    },
  },
};

const AR: HelpCopy = {
  shell: {
    getHelp: "المساعدة",
    contact: "اتصل بنا",
    contactSupport: "التواصل مع الدعم",
    startFree: "ابدأ مجاناً",
    signIn: "تسجيل الدخول",
    home: "الرئيسية",
    openMenu: "فتح القائمة",
    closeMenu: "إغلاق القائمة",
    support: "الدعم",
    helpCenter: "مركز المساعدة",
    footerTagline: "مساعدة وأدلة ودعم لتجار Ettajer.",
    allRights: "جميع الحقوق محفوظة.",
    privacy: "الخصوصية",
    terms: "الشروط",
    cookies: "ملفات تعريف الارتباط",
    language: "اللغة",
    languageAria: "اللغة",
  },
  page: {
    eyebrow: "دعم Ettajer",
    title: "كيف يمكننا مساعدتك؟",
    subtitle: "ابحث في الأدلة، تصفح المواضيع، أو تواصل مع فريقنا.",
    resultsFor: (count, query) =>
      `${count} نتيجة لـ «${query}»`,
    noArticlesTitle: "لم يُعثر على مقالات",
    noArticlesSubtitle: "جرّب كلمات مختلفة أو تواصل مع الدعم مباشرة.",
    contactSupport: "التواصل مع الدعم",
    browseTitle: "تصفح حسب الموضوع",
    browseSubtitle: "اختر فئة للحصول على أدلة خطوة بخطوة.",
    articleCount: (count) =>
      count === 1 ? "مقال واحد" : count === 2 ? "مقالان" : `${count} مقالات`,
    categoriesAria: "فئات المساعدة",
    popularTitle: "مقالات شائعة",
    popularSubtitle: "إجابات سريعة لما يسأله التجار غالباً.",
    troubleshooting: "استكشاف الأخطاء →",
    popularAria: "مقالات شائعة",
    stillNeedHelpTitle: "ما زلت تحتاج مساعدة؟",
    stillNeedHelpSubtitle: "فريق الدعم متاح من الاثنين إلى الجمعة.",
    contactCardTitle: "التواصل مع الدعم",
    contactCardSubtitle: "أرسل رسالة وسنرد خلال يوم عمل واحد.",
    getInTouch: "تواصل معنا",
    emailCardTitle: "راسلنا",
    openMailApp: "فتح تطبيق البريد",
  },
  search: {
    placeholder: "البحث في مقالات المساعدة...",
    ariaLabel: "البحث في مقالات المساعدة",
    clearAria: "مسح البحث",
  },
  checklist: {
    title: "الإطلاق في 5 خطوات",
    subtitle: "قائمة سريعة من التسجيل إلى أول عملية بيع.",
    stepLabel: (step) => `الخطوة ${step}`,
    goToDashboard: "الذهاب إلى لوحة التحكم",
    readGuide: "قراءة الدليل",
    footnote: "يُكمل أغلب التجار هذه الخطوات في أقل من ساعة.",
    checklistAria: "خطوات البدء",
    items: [
      {
        title: "إنشاء حسابك",
        description: "سجّل وأكمل الإعداد الأولي.",
      },
      {
        title: "إضافة أول منتج",
        description: "ارفع الصور، حدّد السعر، وانشر.",
      },
      {
        title: "تخصيص واجهة المتجر",
        description: "عدّل القالب في المحرر المرئي.",
      },
      {
        title: "تفعيل الدفع عند الاستلام",
        description: "فعّل COD والتحقق من الطلبات.",
      },
      {
        title: "ربط نطاقك",
        description: "استخدم نطاقك مع SSL مجاني.",
      },
    ],
  },
  article: {
    getHelp: "المساعدة",
    helpCenter: "مركز المساعدة",
    allTopics: "كل المواضيع",
    backToHelp: "العودة إلى مركز المساعدة",
    helpfulQuestion: "هل كان هذا المقال مفيداً؟",
    thanksYes: "شكراً على ملاحظاتك.",
    thanksNo: "نأسف لأن ذلك لم يُفد. تواصل مع الدعم أدناه.",
    yes: "نعم",
    no: "لا",
    contactSupport: "التواصل مع الدعم",
    relatedArticles: "مقالات ذات صلة",
  },
  categories: {
    "getting-started": {
      title: "البدء",
      description: "أطلق متجرك وانشر منتجاتك الأولى.",
    },
    catalog: {
      title: "الكتالوج",
      description: "المنتجات والمجموعات والفئات والمخزون.",
    },
    "store-builder": {
      title: "منشئ المتجر",
      description: "تصميم الصفحات والأقسام وهوية العلامة.",
    },
    "orders-cod": {
      title: "الطلبات والدفع عند الاستلام",
      description: "الدفع والتحقق والشحن.",
    },
    "domains-hosting": {
      title: "النطاقات والاستضافة",
      description: "نطاقات مخصصة وSSL والأداء.",
    },
    billing: {
      title: "الفوترة والخطط",
      description: "الاشتراكات والتجارب والفواتير.",
    },
    marketing: {
      title: "التسويق",
      description: "البكسل والحملات ومنصات الإعلان.",
    },
    analytics: {
      title: "التحليلات",
      description: "الزيارات والتحويل والتقارير.",
    },
    account: {
      title: "الحساب",
      description: "تسجيل الدخول وصلاحيات الفريق والأمان.",
    },
    migration: {
      title: "الانتقال",
      description: "من Shopify وWooCommerce وغيرها.",
    },
    troubleshooting: {
      title: "استكشاف الأخطاء",
      description: "حل المشكلات الشائعة بسرعة.",
    },
  },
};

const COPIES: Record<HelpLocale, HelpCopy> = {
  en: EN,
  fr: FR,
  ar: AR,
};

export function getHelpCopy(locale: HelpLocale): HelpCopy {
  return COPIES[locale] ?? EN;
}

export { getHelpSeo } from "@/lib/help/help-seo";
export type { HelpSeoCopy } from "@/lib/help/help-seo";

export function getLocalizedCategory(
  category: HelpCategory,
  locale: HelpLocale,
): Pick<HelpCategory, "title" | "description"> {
  if (locale === "en") {
    return { title: category.title, description: category.description };
  }
  const translated = getHelpCopy(locale).categories[category.id];
  return translated ?? { title: category.title, description: category.description };
}

export function searchLocalizedArticles(
  query: string,
  locale: HelpLocale,
  limit = 50,
): HelpArticle[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const terms = normalized.split(/\s+/).filter(Boolean);

  const scored = HELP_ARTICLES.map((article) => {
    const localized = getLocalizedArticle(article, locale);
    const category = getCategoryById(article.categoryId);
    const categoryLocalized = category
      ? getLocalizedCategory(category, locale)
      : { title: "", description: "" };

    const title = localized.title.toLowerCase();
    const excerpt = localized.excerpt.toLowerCase();
    const keywords = (article.keywords ?? []).join(" ").toLowerCase();
    const body = localized.body.join(" ").toLowerCase();
    const categoryTitle = categoryLocalized.title.toLowerCase();
    const haystack = `${title} ${excerpt} ${keywords} ${body} ${categoryTitle}`;

    let score = 0;
    for (const term of terms) {
      if (title.includes(term)) score += 10;
      if (keywords.includes(term)) score += 6;
      if (excerpt.includes(term)) score += 4;
      if (categoryTitle.includes(term)) score += 3;
      if (body.includes(term)) score += 1;
    }

    return { article, score };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.article);

  return scored;
}

export function getLocalizedArticleDisplay(
  article: HelpArticle,
  locale: HelpLocale,
): Pick<HelpArticle, "title" | "excerpt"> {
  return getLocalizedArticle(article, locale);
}
