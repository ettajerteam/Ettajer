import type { LandingLocale } from "@/lib/landing/landing-i18n";

export type CookieConsentCopy = {
  title: string;
  body: string;
  acceptAll: string;
  essentialOnly: string;
  cookiePolicy: string;
  manageHint: string;
};

export type CookiePreferencesCopy = {
  title: string;
  description: string;
  currentLabel: string;
  currentAll: string;
  currentEssential: string;
  currentNone: string;
  saved: string;
};

const EN: CookieConsentCopy = {
  title: "We use cookies",
  body: "Ettajer uses essential cookies to keep you signed in and secure. With your permission, we also use analytics cookies to improve the platform.",
  acceptAll: "Accept all",
  essentialOnly: "Essential only",
  cookiePolicy: "Cookie policy",
  manageHint: "You can change this anytime in our cookie policy.",
};

const FR: CookieConsentCopy = {
  title: "Nous utilisons des cookies",
  body: "Ettajer utilise des cookies essentiels pour vous garder connecté en toute sécurité. Avec votre accord, nous utilisons aussi des cookies analytiques pour améliorer la plateforme.",
  acceptAll: "Tout accepter",
  essentialOnly: "Essentiels uniquement",
  cookiePolicy: "Politique des cookies",
  manageHint: "Vous pouvez modifier ce choix à tout moment dans notre politique des cookies.",
};

const AR: CookieConsentCopy = {
  title: "نستخدم ملفات تعريف الارتباط",
  body: "يستخدم Ettajer ملفات أساسية لإبقائك مسجّل الدخول بأمان. بموافقتك، نستخدم أيضاً ملفات تحليلية لتحسين المنصة.",
  acceptAll: "قبول الكل",
  essentialOnly: "الأساسية فقط",
  cookiePolicy: "سياسة ملفات الارتباط",
  manageHint: "يمكنك تغيير هذا الخيار في أي وقت من سياسة ملفات الارتباط.",
};

const COPIES: Record<LandingLocale, CookieConsentCopy> = { en: EN, fr: FR, ar: AR };

const PREFERENCES_EN: CookiePreferencesCopy = {
  title: "Your cookie preferences",
  description:
    "Choose whether Ettajer may use analytics cookies to understand how the platform is used. Essential cookies are always active so you can sign in securely.",
  currentLabel: "Current choice",
  currentAll: "All cookies accepted",
  currentEssential: "Essential cookies only",
  currentNone: "No preference saved yet",
  saved: "Your preference was saved.",
};

const PREFERENCES_FR: CookiePreferencesCopy = {
  title: "Vos préférences cookies",
  description:
    "Choisissez si Ettajer peut utiliser des cookies analytiques pour comprendre l'utilisation de la plateforme. Les cookies essentiels restent toujours actifs pour vous garder connecté en sécurité.",
  currentLabel: "Choix actuel",
  currentAll: "Tous les cookies acceptés",
  currentEssential: "Cookies essentiels uniquement",
  currentNone: "Aucune préférence enregistrée",
  saved: "Votre préférence a été enregistrée.",
};

const PREFERENCES_AR: CookiePreferencesCopy = {
  title: "تفضيلات ملفات الارتباط",
  description:
    "اختر ما إذا كان Ettajer يمكنه استخدام ملفات التحليلات لفهم كيفية استخدام المنصة. تبقى الملفات الأساسية نشطة دائماً لتسجيل دخولك بأمان.",
  currentLabel: "الخيار الحالي",
  currentAll: "تم قبول جميع الملفات",
  currentEssential: "الملفات الأساسية فقط",
  currentNone: "لم يتم حفظ أي تفضيل بعد",
  saved: "تم حفظ تفضيلك.",
};

const PREFERENCE_COPIES: Record<LandingLocale, CookiePreferencesCopy> = {
  en: PREFERENCES_EN,
  fr: PREFERENCES_FR,
  ar: PREFERENCES_AR,
};

export function getCookieConsentCopy(locale: LandingLocale): CookieConsentCopy {
  return COPIES[locale] ?? EN;
}

export function getCookiePreferencesCopy(
  locale: LandingLocale,
): CookiePreferencesCopy {
  return PREFERENCE_COPIES[locale] ?? PREFERENCES_EN;
}

export function readLocaleFromDocument(): LandingLocale {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(
    /(?:^|;\s*)ettajer-email-locale=([^;]*)/,
  );
  const raw = match?.[1]?.toLowerCase();
  if (raw === "fr" || raw === "ar") return raw;
  return "en";
}
