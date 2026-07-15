import type { LandingLocale } from "@/lib/landing/landing-i18n";
import type { PageSeoCopy } from "@/lib/seo/types";

export type AuthSeoCopy = {
  login: PageSeoCopy;
  signup: PageSeoCopy;
  activate: PageSeoCopy;
  forgotPassword: PageSeoCopy;
  resetPassword: PageSeoCopy;
  onboarding: PageSeoCopy;
};

const EN: AuthSeoCopy = {
  login: {
    title: "Sign In",
    description:
      "Sign in to your Ettajer dashboard — manage COD orders, verify buyers, and grow your store.",
    keywords: ["ettajer login", "merchant dashboard", "cod ecommerce"],
  },
  signup: {
    title: "Create Account",
    description:
      "Create your free Ettajer account — COD-first ecommerce for Moroccan merchants with a visual store builder.",
    keywords: ["ettajer signup", "create online store morocco", "free ecommerce"],
  },
  activate: {
    title: "Activate Account",
    description: "Enter your activation code to verify your Ettajer merchant account.",
  },
  forgotPassword: {
    title: "Forgot Password",
    description: "Reset your Ettajer account password. We'll email you a secure reset link.",
  },
  resetPassword: {
    title: "Reset Password",
    description: "Create a new password for your Ettajer merchant account.",
  },
  onboarding: {
    title: "Set Up Your Store",
    description:
      "Complete onboarding and launch your Ettajer storefront with COD checkout.",
  },
};

const FR: AuthSeoCopy = {
  login: {
    title: "Connexion",
    description:
      "Connectez-vous à votre tableau de bord Ettajer — gérez les commandes COD, vérifiez les acheteurs et développez votre boutique.",
    keywords: ["connexion ettajer", "tableau de bord marchand", "ecommerce cod"],
  },
  signup: {
    title: "Créer un compte",
    description:
      "Créez votre compte Ettajer gratuit — e-commerce COD pour les marchands marocains avec éditeur visuel.",
    keywords: ["inscription ettajer", "créer boutique en ligne maroc"],
  },
  activate: {
    title: "Activer le compte",
    description: "Entrez votre code d'activation pour vérifier votre compte marchand Ettajer.",
  },
  forgotPassword: {
    title: "Mot de passe oublié",
    description:
      "Réinitialisez le mot de passe de votre compte Ettajer. Nous vous enverrons un lien sécurisé.",
  },
  resetPassword: {
    title: "Réinitialiser le mot de passe",
    description: "Créez un nouveau mot de passe pour votre compte marchand Ettajer.",
  },
  onboarding: {
    title: "Configurer votre boutique",
    description:
      "Terminez l'onboarding et lancez votre vitrine Ettajer avec le paiement à la livraison.",
  },
};

const AR: AuthSeoCopy = {
  login: {
    title: "تسجيل الدخول",
    description:
      "سجّل الدخول إلى لوحة تحكم Ettajer — أدر طلبات الدفع عند الاستلام، تحقق من المشترين، ونمِّ متجرك.",
    keywords: ["تسجيل دخول ettajer", "لوحة التاجر", "تجارة إلكترونية cod"],
  },
  signup: {
    title: "إنشاء حساب",
    description:
      "أنشئ حساب Ettajer المجاني — تجارة إلكترونية للدفع عند الاستلام للتجار المغاربة مع محرّر مرئي.",
    keywords: ["تسجيل ettajer", "إنشاء متجر إلكتروني المغرب"],
  },
  activate: {
    title: "تفعيل الحساب",
    description: "أدخل رمز التفعيل للتحقق من حسابك التجاري على Ettajer.",
  },
  forgotPassword: {
    title: "نسيت كلمة المرور",
    description: "أعد تعيين كلمة مرور حساب Ettajer. سنرسل لك رابطاً آمناً عبر البريد.",
  },
  resetPassword: {
    title: "إعادة تعيين كلمة المرور",
    description: "أنشئ كلمة مرور جديدة لحسابك التجاري على Ettajer.",
  },
  onboarding: {
    title: "إعداد متجرك",
    description: "أكمل الإعداد وأطلق واجهة متجرك على Ettajer مع الدفع عند الاستلام.",
  },
};

const COPIES: Record<LandingLocale, AuthSeoCopy> = { en: EN, fr: FR, ar: AR };

export function getAuthSeo(locale: LandingLocale): AuthSeoCopy {
  return COPIES[locale] ?? EN;
}
