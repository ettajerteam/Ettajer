import type { LandingLocale } from "@/lib/landing/landing-i18n";
import type { PageSeoCopy } from "@/lib/seo/types";

export type FounderSeoCopy = {
  founderCard: PageSeoCopy;
  welcome: PageSeoCopy;
  earlyAccess: PageSeoCopy;
};

const EN: FounderSeoCopy = {
  founderCard: {
    title: "Founder Card",
    description:
      "Learn about the Ettajer Founder Card — exclusive membership for the first 100 merchants, how to claim yours, benefits, tiers, and FAQ.",
    keywords: ["ettajer founder card", "early access", "founding merchants"],
  },
  welcome: {
    title: "Welcome Founder",
    description: "Your Ettajer founder account is ready. View your founder card and early access.",
  },
  earlyAccess: {
    title: "Early Access",
    description:
      "Your personalized Ettajer early access hub while we prepare the platform for launch.",
  },
};

const FR: FounderSeoCopy = {
  founderCard: {
    title: "Carte fondateur",
    description:
      "Découvrez la carte fondateur Ettajer — adhésion exclusive pour les 100 premiers marchands, comment l'obtenir, avantages, niveaux et FAQ.",
    keywords: ["carte fondateur ettajer", "accès anticipé", "marchands fondateurs"],
  },
  welcome: {
    title: "Bienvenue fondateur",
    description:
      "Votre compte fondateur Ettajer est prêt. Consultez votre carte fondateur et l'accès anticipé.",
  },
  earlyAccess: {
    title: "Accès anticipé",
    description:
      "Votre espace d'accès anticipé Ettajer personnalisé pendant la préparation du lancement.",
  },
};

const AR: FounderSeoCopy = {
  founderCard: {
    title: "بطاقة المؤسس",
    description:
      "تعرّف على بطاقة مؤسس Ettajer — عضوية حصرية لأول 100 تاجر، كيفية الحصول عليها، المزايا، المستويات والأسئلة الشائعة.",
    keywords: ["بطاقة مؤسس ettajer", "وصول مبكر", "تجار مؤسسون"],
  },
  welcome: {
    title: "مرحباً أيها المؤسس",
    description: "حسابك كمؤسس على Ettajer جاهز. اعرض بطاقتك ووصولك المبكر.",
  },
  earlyAccess: {
    title: "الوصول المبكر",
    description: "مركز الوصول المبكر المخصص لك على Ettajer أثناء تحضير المنصة للإطلاق.",
  },
};

const COPIES: Record<LandingLocale, FounderSeoCopy> = { en: EN, fr: FR, ar: AR };

export function getFounderSeo(locale: LandingLocale): FounderSeoCopy {
  return COPIES[locale] ?? EN;
}

