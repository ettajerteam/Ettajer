import type { PageSeoCopy } from "@/lib/seo/types";
import type { LandingLocale } from "@/lib/landing/landing-i18n";
import { getCookiesSections } from "@/lib/legal/cookies-sections";
import { getPrivacySections } from "@/lib/legal/privacy-sections";
import { getTermsSections } from "@/lib/legal/terms-sections";

export type LegalDocKind = "privacy" | "terms" | "cookies";

export type LegalShellCopy = {
  getHelp: string;
  contact: string;
  startFree: string;
  openMenu: string;
  closeMenu: string;
  support: string;
  helpCenter: string;
  signIn: string;
  home: string;
  footerTagline: string;
  allRights: string;
  privacy: string;
  terms: string;
  cookies: string;
  language: string;
  languageAria: string;
};

export type LegalDocCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  versionLine: (version: string, date: string) => string;
  onThisPage: string;
  related: string;
  termsLink: string;
  privacyLink: string;
  cookiesLink: string;
  helpCenter: string;
  contactSupport: string;
  backToTop: string;
  emailSupport: string;
  intro: string;
  ctaTitle: string;
  ctaBody: string;
  ctaSecondary: string;
  tableName?: string;
  tablePurpose?: string;
  tableDuration?: string;
  tableType?: string;
};

export type LegalCopy = {
  shell: LegalShellCopy;
  privacy: LegalDocCopy;
  terms: LegalDocCopy;
  cookies: LegalDocCopy;
};

const EN: LegalCopy = {
  shell: {
    getHelp: "Get help",
    contact: "Contact",
    startFree: "Start free",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    support: "Support",
    helpCenter: "Help center",
    signIn: "Sign in",
    home: "Home",
    footerTagline: "Help, guides, and support for Ettajer merchants.",
    allRights: "All rights reserved.",
    privacy: "Privacy",
    terms: "Terms",
    cookies: "Cookies",
    language: "Language",
    languageAria: "Language",
  },
  privacy: {
    eyebrow: "Legal",
    title: "Privacy Policy",
    subtitle:
      "This policy explains what personal information Ettajer collects, how we use it, how we protect it, and what choices you have as a merchant or site visitor.",
    versionLine: (version, date) => `Version ${version} · Last updated ${date}`,
    onThisPage: "On this page",
    related: "Related:",
    termsLink: "Terms of Service",
    privacyLink: "Privacy Policy",
    cookiesLink: "Cookie Policy",
    helpCenter: "Help center",
    contactSupport: "Contact support",
    backToTop: "Back to top",
    emailSupport: "Email support",
    intro:
      "Ettajer processes personal data to operate our COD-first ecommerce platform for merchants in Morocco and beyond. This includes account registration, storefront hosting, order management, verification tools, billing, support, and security. We do not sell your personal information.",
    ctaTitle: "Privacy requests",
    ctaBody:
      "To access, correct, delete, or object to processing of your personal information, contact our support team. We will respond within a reasonable timeframe.",
    ctaSecondary: "Read Terms of Service",
  },
  terms: {
    eyebrow: "Legal",
    title: "Terms of Service",
    subtitle:
      "Please read these Terms carefully before creating an account or using Ettajer. They explain your rights, responsibilities, and the rules for merchants on our platform.",
    versionLine: (version, date) => `Version ${version} · Last updated ${date}`,
    onThisPage: "On this page",
    related: "Related:",
    termsLink: "Terms of Service",
    privacyLink: "Privacy Policy",
    cookiesLink: "Cookie Policy",
    helpCenter: "Help center",
    contactSupport: "Contact support",
    backToTop: "Back to top",
    emailSupport: "Email support",
    intro:
      "These Terms form a binding agreement between you and Ettajer. They apply to merchants using our COD-first ecommerce platform, including storefront publishing, order management, verification tools, subscriptions, and related services. If you are accepting on behalf of a business, you confirm you have authority to bind that business.",
    ctaTitle: "Questions about these Terms?",
    ctaBody:
      "Contact our team for clarifications about billing, COD workflows, account termination, or legal requests.",
    ctaSecondary: "Create an account",
  },
  cookies: {
    eyebrow: "Legal",
    title: "Cookie Policy",
    subtitle:
      "Learn how Ettajer uses cookies and similar technologies on our website, merchant dashboard, and storefront experiences.",
    versionLine: (version, date) => `Version ${version} · Last updated ${date}`,
    onThisPage: "On this page",
    related: "Related:",
    termsLink: "Terms of Service",
    privacyLink: "Privacy Policy",
    cookiesLink: "Cookie Policy",
    helpCenter: "Help center",
    contactSupport: "Contact support",
    backToTop: "Back to top",
    emailSupport: "Email support",
    intro:
      "Cookies help Ettajer keep your account secure, remember preferences, and understand how the platform is used. Essential cookies are required for login and core features. Merchants may also enable third-party marketing or analytics tools on their storefronts.",
    ctaTitle: "Questions about cookies?",
    ctaBody:
      "Contact us if you need help understanding cookie use on Ettajer or on a merchant storefront.",
    ctaSecondary: "Read Privacy Policy",
    tableName: "Name",
    tablePurpose: "Purpose",
    tableDuration: "Duration",
    tableType: "Type",
  },
};

const FR: LegalCopy = {
  shell: {
    getHelp: "Aide",
    contact: "Contact",
    startFree: "Commencer gratuitement",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    support: "Assistance",
    helpCenter: "Centre d'aide",
    signIn: "Se connecter",
    home: "Accueil",
    footerTagline: "Aide, guides et support pour les marchands Ettajer.",
    allRights: "Tous droits réservés.",
    privacy: "Confidentialité",
    terms: "Conditions",
    cookies: "Cookies",
    language: "Langue",
    languageAria: "Langue",
  },
  privacy: {
    eyebrow: "Juridique",
    title: "Politique de confidentialité",
    subtitle:
      "Cette politique explique quelles informations personnelles Ettajer collecte, comment nous les utilisons, comment nous les protégeons et quels choix vous avez en tant que marchand ou visiteur.",
    versionLine: (version, date) => `Version ${version} · Dernière mise à jour : ${date}`,
    onThisPage: "Sur cette page",
    related: "Voir aussi :",
    termsLink: "Conditions d'utilisation",
    privacyLink: "Politique de confidentialité",
    cookiesLink: "Politique des cookies",
    helpCenter: "Centre d'aide",
    contactSupport: "Contacter le support",
    backToTop: "Retour en haut",
    emailSupport: "Écrire au support",
    intro:
      "Ettajer traite des données personnelles pour exploiter sa plateforme e-commerce axée sur le paiement à la livraison (COD) pour les marchands au Maroc et ailleurs. Cela inclut l'inscription, l'hébergement de boutique, la gestion des commandes, les outils de vérification, la facturation, le support et la sécurité. Nous ne vendons pas vos informations personnelles.",
    ctaTitle: "Demandes relatives à la confidentialité",
    ctaBody:
      "Pour accéder, corriger, supprimer ou vous opposer au traitement de vos informations personnelles, contactez notre équipe support. Nous répondrons dans un délai raisonnable.",
    ctaSecondary: "Lire les Conditions d'utilisation",
  },
  terms: {
    eyebrow: "Juridique",
    title: "Conditions d'utilisation",
    subtitle:
      "Veuillez lire attentivement ces Conditions avant de créer un compte ou d'utiliser Ettajer. Elles expliquent vos droits, vos responsabilités et les règles applicables aux marchands sur notre plateforme.",
    versionLine: (version, date) => `Version ${version} · Dernière mise à jour : ${date}`,
    onThisPage: "Sur cette page",
    related: "Voir aussi :",
    termsLink: "Conditions d'utilisation",
    privacyLink: "Politique de confidentialité",
    cookiesLink: "Politique des cookies",
    helpCenter: "Centre d'aide",
    contactSupport: "Contacter le support",
    backToTop: "Retour en haut",
    emailSupport: "Écrire au support",
    intro:
      "Ces Conditions constituent un accord contraignant entre vous et Ettajer. Elles s'appliquent aux marchands utilisant notre plateforme e-commerce COD, y compris la publication de boutique, la gestion des commandes, les outils de vérification, les abonnements et les services associés. Si vous acceptez au nom d'une entreprise, vous confirmez avoir l'autorité de l'engager.",
    ctaTitle: "Des questions sur ces Conditions ?",
    ctaBody:
      "Contactez notre équipe pour toute clarification sur la facturation, les flux COD, la résiliation de compte ou les demandes juridiques.",
    ctaSecondary: "Créer un compte",
  },
  cookies: {
    eyebrow: "Juridique",
    title: "Politique des cookies",
    subtitle:
      "Découvrez comment Ettajer utilise les cookies et technologies similaires sur notre site, le tableau de bord marchand et les expériences boutique.",
    versionLine: (version, date) => `Version ${version} · Dernière mise à jour : ${date}`,
    onThisPage: "Sur cette page",
    related: "Voir aussi :",
    termsLink: "Conditions d'utilisation",
    privacyLink: "Politique de confidentialité",
    cookiesLink: "Politique des cookies",
    helpCenter: "Centre d'aide",
    contactSupport: "Contacter le support",
    backToTop: "Retour en haut",
    emailSupport: "Écrire au support",
    intro:
      "Les cookies aident Ettajer à sécuriser votre compte, mémoriser vos préférences et comprendre l'utilisation de la plateforme. Les cookies essentiels sont requis pour la connexion et les fonctionnalités de base. Les marchands peuvent aussi activer des outils marketing ou analytiques tiers sur leurs boutiques.",
    ctaTitle: "Des questions sur les cookies ?",
    ctaBody:
      "Contactez-nous si vous avez besoin d'aide pour comprendre l'utilisation des cookies sur Ettajer ou sur une boutique marchande.",
    ctaSecondary: "Lire la Politique de confidentialité",
    tableName: "Nom",
    tablePurpose: "Finalité",
    tableDuration: "Durée",
    tableType: "Type",
  },
};

const AR: LegalCopy = {
  shell: {
    getHelp: "المساعدة",
    contact: "اتصل بنا",
    startFree: "ابدأ مجاناً",
    openMenu: "فتح القائمة",
    closeMenu: "إغلاق القائمة",
    support: "الدعم",
    helpCenter: "مركز المساعدة",
    signIn: "تسجيل الدخول",
    home: "الرئيسية",
    footerTagline: "مساعدة وأدلة ودعم لتجار Ettajer.",
    allRights: "جميع الحقوق محفوظة.",
    privacy: "الخصوصية",
    terms: "الشروط",
    cookies: "ملفات تعريف الارتباط",
    language: "اللغة",
    languageAria: "اللغة",
  },
  privacy: {
    eyebrow: "قانوني",
    title: "سياسة الخصوصية",
    subtitle:
      "توضح هذه السياسة ما المعلومات الشخصية التي يجمعها Ettajer، وكيف نستخدمها، وكيف نحميها، وما خياراتك كتاجر أو زائر.",
    versionLine: (version, date) => `الإصدار ${version} · آخر تحديث: ${date}`,
    onThisPage: "في هذه الصفحة",
    related: "روابط ذات صلة:",
    termsLink: "شروط الخدمة",
    privacyLink: "سياسة الخصوصية",
    cookiesLink: "سياسة ملفات تعريف الارتباط",
    helpCenter: "مركز المساعدة",
    contactSupport: "اتصل بالدعم",
    backToTop: "العودة للأعلى",
    emailSupport: "مراسلة الدعم",
    intro:
      "يعالج Ettajer البيانات الشخصية لتشغيل منصة التجارة الإلكترونية المعتمدة على الدفع عند الاستلام (COD) للتجار في المغرب وخارجه. يشمل ذلك التسجيل، استضافة المتجر، إدارة الطلبات، أدوات التحقق، الفوترة، الدعم والأمان. لا نبيع معلوماتك الشخصية.",
    ctaTitle: "طلبات الخصوصية",
    ctaBody:
      "للوصول إلى معلوماتك الشخصية أو تصحيحها أو حذفها أو الاعتراض على معالجتها، تواصل مع فريق الدعم. سنرد في إطار زمني معقول.",
    ctaSecondary: "قراءة شروط الخدمة",
  },
  terms: {
    eyebrow: "قانوني",
    title: "شروط الخدمة",
    subtitle:
      "يرجى قراءة هذه الشروط بعناية قبل إنشاء حساب أو استخدام Ettajer. توضح حقوقك ومسؤولياتك وقواعد التجار على منصتنا.",
    versionLine: (version, date) => `الإصدار ${version} · آخر تحديث: ${date}`,
    onThisPage: "في هذه الصفحة",
    related: "روابط ذات صلة:",
    termsLink: "شروط الخدمة",
    privacyLink: "سياسة الخصوصية",
    cookiesLink: "سياسة ملفات تعريف الارتباط",
    helpCenter: "مركز المساعدة",
    contactSupport: "اتصل بالدعم",
    backToTop: "العودة للأعلى",
    emailSupport: "مراسلة الدعم",
    intro:
      "تشكل هذه الشروط اتفاقاً ملزماً بينك وبين Ettajer. تنطبق على التجار الذين يستخدمون منصتنا COD، بما في ذلك نشر المتجر، إدارة الطلبات، أدوات التحقق، الاشتراكات والخدمات ذات الصلة. إن قبلت نيابة عن شركة، فأنت تؤكد أن لديك صلاحية إلزامها.",
    ctaTitle: "أسئلة حول هذه الشروط؟",
    ctaBody:
      "تواصل مع فريقنا للتوضيحات حول الفوترة، مسارات COD، إنهاء الحساب أو الطلبات القانونية.",
    ctaSecondary: "إنشاء حساب",
  },
  cookies: {
    eyebrow: "قانوني",
    title: "سياسة ملفات تعريف الارتباط",
    subtitle:
      "تعرّف على كيفية استخدام Ettajer لملفات تعريف الارتباط والتقنيات المماثلة على موقعنا ولوحة التحكم وتجارب المتجر.",
    versionLine: (version, date) => `الإصدار ${version} · آخر تحديث: ${date}`,
    onThisPage: "في هذه الصفحة",
    related: "روابط ذات صلة:",
    termsLink: "شروط الخدمة",
    privacyLink: "سياسة الخصوصية",
    cookiesLink: "سياسة ملفات تعريف الارتباط",
    helpCenter: "مركز المساعدة",
    contactSupport: "اتصل بالدعم",
    backToTop: "العودة للأعلى",
    emailSupport: "مراسلة الدعم",
    intro:
      "تساعد ملفات تعريف الارتباط Ettajer على تأمين حسابك وتذكر التفضيلات وفهم استخدام المنصة. الملفات الأساسية مطلوبة لتسجيل الدخول والميزات الأساسية. قد يفعّل التجار أيضاً أدوات تسويق أو تحليلات تابعة لجهات خارجية على متاجرهم.",
    ctaTitle: "أسئلة حول ملفات تعريف الارتباط؟",
    ctaBody:
      "تواصل معنا إذا احتجت مساعدة لفهم استخدام ملفات تعريف الارتباط على Ettajer أو على متجر تاجر.",
    ctaSecondary: "قراءة سياسة الخصوصية",
    tableName: "الاسم",
    tablePurpose: "الغرض",
    tableDuration: "المدة",
    tableType: "النوع",
  },
};

export const LEGAL_DATES = {
  en: { privacy: "July 14, 2026", terms: "July 14, 2026", cookies: "July 14, 2026" },
  fr: { privacy: "14 juillet 2026", terms: "14 juillet 2026", cookies: "14 juillet 2026" },
  ar: { privacy: "14 يوليو 2026", terms: "14 يوليو 2026", cookies: "14 يوليو 2026" },
} as const;

export function getLegalCopy(locale: LandingLocale): LegalCopy {
  if (locale === "fr") return FR;
  if (locale === "ar") return AR;
  return EN;
}

export function getLegalDocCopy(locale: LandingLocale, kind: LegalDocKind): LegalDocCopy {
  const copy = getLegalCopy(locale);
  return copy[kind];
}

export function getLegalDocSeo(
  locale: LandingLocale,
  kind: LegalDocKind,
): PageSeoCopy {
  const doc = getLegalDocCopy(locale, kind);
  return { title: doc.title, description: doc.subtitle };
}

export function getLegalSections(locale: LandingLocale, kind: LegalDocKind) {
  if (kind === "privacy") return getPrivacySections(locale);
  if (kind === "terms") return getTermsSections(locale);
  return getCookiesSections(locale);
}

export function getLegalVersion(kind: LegalDocKind): string {
  if (kind === "privacy") return "1.0";
  if (kind === "terms") return "1.0";
  return "1.0";
}

export function getLegalLastUpdated(locale: LandingLocale, kind: LegalDocKind): string {
  return LEGAL_DATES[locale][kind];
}
