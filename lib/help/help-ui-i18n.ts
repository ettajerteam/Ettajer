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

export type HelpMarketingGuidesCopy = {
  title: string;
  subtitle: string;
  openInDashboard: string;
  readGuide: string;
  guidesAria: string;
  browseAll: string;
  items: HelpChecklistItemCopy[];
};

export type HelpDomainGuidesCopy = {
  title: string;
  subtitle: string;
  readGuide: string;
  openDomains: string;
  guidesAria: string;
  browseAll: string;
  items: HelpChecklistItemCopy[];
};

export type HelpPaymentGuidesCopy = {
  title: string;
  subtitle: string;
  readGuide: string;
  openPayments: string;
  guidesAria: string;
  browseAll: string;
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
  paymentGuides: HelpPaymentGuidesCopy;
  marketingGuides: HelpMarketingGuidesCopy;
  domainGuides: HelpDomainGuidesCopy;
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
        title: "Share your store link",
        description: "Send your live store on WhatsApp to get buyers.",
      },
      {
        title: "Customize your storefront",
        description: "Edit your theme in the visual builder (optional).",
      },
      {
        title: "Connect your domain",
        description: "Use your own domain with free SSL (later).",
      },
    ],
  },
  marketingGuides: {
    title: "Marketing platforms",
    subtitle: "One guide per ads and email platform — open the setup page from here.",
    openInDashboard: "Open in dashboard",
    readGuide: "Read guide",
    guidesAria: "Marketing platform guides",
    browseAll: "All marketing articles →",
    items: [
      {
        title: "Meta (Facebook & Instagram)",
        description: "Pixel, Conversions API, catalog, and ads checklist.",
      },
      {
        title: "TikTok",
        description: "TikTok Pixel for ViewContent, AddToCart, and Purchase.",
      },
      {
        title: "Google Tag Manager",
        description: "Load GTM once — fire tags from your container.",
      },
      {
        title: "Pinterest",
        description: "Pinterest Tag for browse and checkout events.",
      },
      {
        title: "Snapchat",
        description: "Snap Pixel for ads measurement and retargeting.",
      },
      {
        title: "Email Marketing",
        description: "Launch checklist from empty list to first campaign.",
      },
    ],
  },
  paymentGuides: {
    title: "Payment platforms",
    subtitle: "COD and PayPal now — Stripe cards in about 2 months.",
    readGuide: "Read guide",
    openPayments: "Open Payments",
    guidesAria: "Payment platform guides",
    browseAll: "All payment articles →",
    items: [
      {
        title: "Cash on delivery",
        description: "Native COD checkout — confirm buyers before you ship.",
      },
      {
        title: "Stripe",
        description: "Coming in ~2 months — visible but cannot activate yet.",
      },
      {
        title: "PayPal",
        description: "Client ID + Secret, verify, then get paid at checkout.",
      },
      {
        title: "Online payments overview",
        description: "PayPal with COD now; Stripe cards later.",
      },
    ],
  },
  domainGuides: {
    title: "Connect your domain",
    subtitle: "Tutorials for Namecheap, GoDaddy, Cloudflare, and more.",
    readGuide: "Read tutorial",
    openDomains: "Open Domains",
    guidesAria: "Domain registrar tutorials",
    browseAll: "All domain articles →",
    items: [
      {
        title: "Namecheap",
        description: "Add A + CNAME records in Advanced DNS.",
      },
      {
        title: "GoDaddy",
        description: "Edit DNS in My Products → DNS.",
      },
      {
        title: "Cloudflare",
        description: "DNS-only records (grey cloud) for SSL.",
      },
      {
        title: "Hostinger",
        description: "Point DNS from hPanel → Domains.",
      },
      {
        title: "OVHcloud",
        description: "Zone DNS records for .ma and EU domains.",
      },
      {
        title: "Google Domains",
        description: "Squarespace Domains DNS (ex-Google Domains).",
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
        title: "Partagez le lien de votre boutique",
        description: "Envoyez votre boutique live sur WhatsApp pour attirer des acheteurs.",
      },
      {
        title: "Personnaliser votre boutique",
        description: "Modifiez votre thème dans l'éditeur visuel (optionnel).",
      },
      {
        title: "Connecter votre domaine",
        description: "Utilisez votre domaine avec SSL gratuit (plus tard).",
      },
    ],
  },
  marketingGuides: {
    title: "Plateformes marketing",
    subtitle: "Un guide par plateforme pubs et e-mail — ouvrez la page de config ici.",
    openInDashboard: "Ouvrir dans le tableau de bord",
    readGuide: "Lire le guide",
    guidesAria: "Guides plateformes marketing",
    browseAll: "Tous les articles marketing →",
    items: [
      {
        title: "Meta (Facebook & Instagram)",
        description: "Pixel, Conversions API, catalogue et checklist pubs.",
      },
      {
        title: "TikTok",
        description: "Pixel TikTok pour ViewContent, AddToCart et Purchase.",
      },
      {
        title: "Google Tag Manager",
        description: "Chargez GTM une fois — déclenchez vos tags dans le conteneur.",
      },
      {
        title: "Pinterest",
        description: "Tag Pinterest pour navigation et checkout.",
      },
      {
        title: "Snapchat",
        description: "Snap Pixel pour mesure et remarketing.",
      },
      {
        title: "Email Marketing",
        description: "Checklist du lancement — liste vide à première campagne.",
      },
    ],
  },
  paymentGuides: {
    title: "Plateformes de paiement",
    subtitle: "COD et PayPal maintenant — cartes Stripe dans ~2 mois.",
    readGuide: "Lire le guide",
    openPayments: "Ouvrir Paiements",
    guidesAria: "Guides plateformes de paiement",
    browseAll: "Tous les articles paiement →",
    items: [
      {
        title: "Paiement à la livraison",
        description: "COD natif — confirmez les acheteurs avant d’expédier.",
      },
      {
        title: "Stripe",
        description: "Dans ~2 mois — visible mais pas encore activable.",
      },
      {
        title: "PayPal",
        description: "Client ID + Secret, vérifier, puis encaisser au checkout.",
      },
      {
        title: "Vue d’ensemble paiements en ligne",
        description: "PayPal avec COD maintenant ; Stripe plus tard.",
      },
    ],
  },
  domainGuides: {
    title: "Connecter votre domaine",
    subtitle: "Tutoriels Namecheap, GoDaddy, Cloudflare et plus.",
    readGuide: "Lire le tutoriel",
    openDomains: "Ouvrir Domaines",
    guidesAria: "Tutoriels registrars",
    browseAll: "Tous les articles domaines →",
    items: [
      {
        title: "Namecheap",
        description: "Ajouter A + CNAME dans Advanced DNS.",
      },
      {
        title: "GoDaddy",
        description: "Modifier le DNS dans My Products → DNS.",
      },
      {
        title: "Cloudflare",
        description: "Enregistrements DNS only (nuage gris) pour le SSL.",
      },
      {
        title: "Hostinger",
        description: "Pointer le DNS depuis hPanel → Domains.",
      },
      {
        title: "OVHcloud",
        description: "Zone DNS pour domaines .ma et UE.",
      },
      {
        title: "Google Domains",
        description: "DNS Squarespace Domains (ex-Google Domains).",
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
      title: "Commandes & paiements",
      description: "COD, Stripe, PayPal, checkout et expédition.",
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
      description:
        "E-mail, pixels pubs et réductions.",
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
    developers: {
      title: "Développeurs & IA",
      description:
        "OAuth, MCP, API et design de thèmes IA pour Claude et Cursor.",
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
        title: "شارك رابط متجرك",
        description: "أرسل متجرك المباشر عبر واتساب لجذب المشترين.",
      },
      {
        title: "تخصيص واجهة المتجر",
        description: "عدّل القالب في المحرر المرئي (اختياري).",
      },
      {
        title: "ربط نطاقك",
        description: "استخدم نطاقك مع SSL مجاني (لاحقاً).",
      },
    ],
  },
  marketingGuides: {
    title: "منصات التسويق",
    subtitle: "دليل لكل منصة إعلانات وبريد — افتح صفحة الإعداد من هنا.",
    openInDashboard: "فتح في لوحة التحكم",
    readGuide: "قراءة الدليل",
    guidesAria: "أدلة منصات التسويق",
    browseAll: "كل مقالات التسويق →",
    items: [
      {
        title: "Meta (فيسبوك وإنستغرام)",
        description: "البكسل وConversions API والكتالوج وقائمة الإعلانات.",
      },
      {
        title: "TikTok",
        description: "بكسل TikTok لـ ViewContent وAddToCart وPurchase.",
      },
      {
        title: "Google Tag Manager",
        description: "حمّل GTM مرة واحدة — شغّل الوسوم من الحاوية.",
      },
      {
        title: "Pinterest",
        description: "وسم Pinterest للتصفح وإتمام الشراء.",
      },
      {
        title: "Snapchat",
        description: "Snap Pixel للقياس وإعادة الاستهداف.",
      },
      {
        title: "التسويق بالبريد",
        description: "قائمة الإطلاق من قائمة فارغة إلى أول حملة.",
      },
    ],
  },
  paymentGuides: {
    title: "منصات الدفع",
    subtitle: "COD وPayPal الآن — بطاقات Stripe خلال نحو شهرين.",
    readGuide: "قراءة الدليل",
    openPayments: "فتح المدفوعات",
    guidesAria: "أدلة منصات الدفع",
    browseAll: "كل مقالات الدفع →",
    items: [
      {
        title: "الدفع عند الاستلام",
        description: "COD مدمج — أكّد المشترين قبل الشحن.",
      },
      {
        title: "Stripe",
        description: "خلال ~شهرين — يظهر لكن لا يمكن تفعيله بعد.",
      },
      {
        title: "PayPal",
        description: "Client ID والسر، تحقق، ثم استلم عند الدفع.",
      },
      {
        title: "نظرة عامة على الدفع أونلاين",
        description: "PayPal مع COD الآن؛ Stripe لاحقاً.",
      },
    ],
  },
  domainGuides: {
    title: "ربط نطاقك",
    subtitle: "دروس Namecheap وGoDaddy وCloudflare والمزيد.",
    readGuide: "قراءة الدليل",
    openDomains: "فتح النطاقات",
    guidesAria: "دروس مسجّلي النطاقات",
    browseAll: "كل مقالات النطاقات →",
    items: [
      {
        title: "Namecheap",
        description: "أضف سجلات A وCNAME في Advanced DNS.",
      },
      {
        title: "GoDaddy",
        description: "عدّل DNS من My Products → DNS.",
      },
      {
        title: "Cloudflare",
        description: "سجلات DNS only (سحابة رمادية) لـ SSL.",
      },
      {
        title: "Hostinger",
        description: "وجّه DNS من hPanel → Domains.",
      },
      {
        title: "OVHcloud",
        description: "سجلات المنطقة لنطاقات .ma وأوروبا.",
      },
      {
        title: "Google Domains",
        description: "DNS في Squarespace Domains (سابقاً Google).",
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
      title: "الطلبات والمدفوعات",
      description: "COD وStripe وPayPal والدفع والشحن.",
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
      description: "البريد وبكسل الإعلانات والخصومات.",
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
    developers: {
      title: "المطورون والذكاء الاصطناعي",
      description:
        "OAuth وMCP وAPI وتصميم السمات بالذكاء الاصطناعي لـ Claude وCursor.",
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
