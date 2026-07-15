import type { LandingLocale } from "@/lib/landing/landing-i18n";
import {
  MAX_FOUNDERS,
  formatFounderNumber,
  formatFounderNumberShort,
} from "@/lib/founder/constants";

export type FounderTierId = "pioneer" | "early" | "founding" | "member";
export type CommunityMomentum = "high" | "steady" | "quiet";
export type WaitingActionId = "email" | "card" | "help" | "contact";

export type StoreCategoryValue =
  | "fashion"
  | "electronics"
  | "food"
  | "beauty"
  | "home"
  | "handmade"
  | "other";

export type FounderFlowCopy = {
  shell: {
    logoAlt: string;
    help: string;
    logOut: string;
    language: string;
    languageAria: string;
    footer: (year: number) => string;
    mobileNav: {
      home: string;
      card: string;
      contact: string;
      menu: string;
      navAria: string;
      closeMenu: string;
      account: string;
      founderFallback: string;
      earlyAccess: string;
      helpCenter: string;
      contactSupport: string;
      ettajerWebsite: string;
      logOut: string;
    };
    contact: {
      title: string;
      subtitle: (founderNumber: number) => string;
      sendMessage: string;
      sendMessageHint: string;
      helpCenter: string;
      helpCenterHint: string;
      yourEmail: string;
    };
    cardView: {
      title: string;
      tapToFlip: string;
    };
  };
  welcome: {
    mobileTitle: (firstName: string) => string;
    mobileSubtitle: string;
    desktopTitle: (firstName: string) => string;
    desktopLine1: string;
    desktopLine2: string;
    nextStep: string;
    viewFounderCard: string;
    tapToFlip: string;
    continueEarlyAccess: string;
    yourWaitingPage: string;
    viewFounderCardButton: string;
  };
  waiting: {
    forYou: string;
    personalizedTitle: string;
    personalizedSubtitle: string;
    recommendedForYou: string;
    recommended: string;
    yourFounderCard: string;
    founderCardHint: string;
    swipeToView: string;
    phaseDone: string;
    phaseInProgress: string;
    progress: string;
    merchantDashboard: string;
    launchDay: string;
    dashboardStats: {
      orders: string;
      revenue: string;
      conversion: string;
    };
    dashboardNav: {
      overview: string;
      products: string;
      orders: string;
      apps: string;
    };
    unlocksAtLaunch: string;
    unlocksDescription: string;
    platformReady: string;
    estimatedLaunch: string;
    dayAsFounder: (days: number) => string;
    community: string;
    yourRank: string;
    spotsLeftEmail: (spotsLeft: number, maskedEmail: string) => string;
    foundersOf: (count: number, max: number) => string;
    launchRoadmap: string;
    launchRoadmapSubtitle: (phaseLabel: string, progress: number) => string;
    launchTargetNotice: (estimatedLaunch: string, maskedEmail: string) => string;
    whatsWaiting: string;
    whatsWaitingSubtitle: string;
    founderBenefits: string;
    founderBenefitsSubtitle: (tierLabel: string) => string;
    benefits: { title: string; description: string }[];
    helpCenter: string;
    contactSupport: string;
    viewFounderCard: string;
    faqTitle: string;
    faqSubtitle: (founderNumber: number) => string;
    launchCta: (estimatedLaunch: string) => string;
    memberSince: (date: string) => string;
    journeyStartsHereLine1: string;
    journeyStartsHereLine2: string;
    gradientHeadlineMarker: string;
  };
  onboarding: {
    pageTitle: string;
    pageSubtitle: string;
    stepOf: (step: number, total: number) => string;
    steps: {
      storeName: { title: string; description: string };
      category: { title: string; description: string };
      currency: { title: string; description: string };
    };
    step1: {
      heading: string;
      subheading: string;
      label: string;
      placeholder: string;
    };
    step2: {
      heading: string;
      subheading: string;
    };
    step3: {
      heading: string;
      subheading: string;
      label: string;
      placeholder: string;
      summaryTitle: string;
    };
    back: string;
    continue: string;
    launchStore: string;
    errors: {
      storeNameRequired: string;
      categoryRequired: string;
      createFailed: string;
      generic: string;
    };
    success: string;
  };
  categories: Record<StoreCategoryValue, string>;
  currencies?: Record<string, string>;
};

export type WaitingIntelligenceCopy = {
  launchImminent: string;
  getFounderTier: (founderNumber: number) => {
    id: FounderTierId;
    label: string;
    description: string;
  };
  formatEstimatedLaunch: (target: Date, now?: Date) => string;
  buildMomentumMessage: (
    momentum: CommunityMomentum,
    recentJoins: number,
    spotsLeft: number,
  ) => string;
  buildLaunchPhases: (progress: number) => {
    label: string;
    description: string;
    status: "complete" | "active" | "upcoming";
    progress?: number;
  }[];
  pickPrimaryAction: (params: {
    daysAsFounder: number;
    isReturning: boolean;
    founderNumber: number;
  }) => {
    id: WaitingActionId;
    title: string;
    description: string;
    hint: string;
    href?: string;
    scrollTarget?: "card";
  };
  buildInsights: (params: {
    firstName: string;
    founderNumber: number;
    founderTier: { id: FounderTierId; label: string; description: string };
    daysAsFounder: number;
    launchProgress: number;
    estimatedLaunch: string;
    momentumMessage: string;
    founderCount: number;
  }) => { id: string; title: string; body: string }[];
  buildPersonalizedFaq: (
    founderNumber: number,
    estimatedLaunch: string,
    email: string,
  ) => { q: string; a: string }[];
  buildHeadline: (params: {
    firstName: string;
    founderNumber: number;
    isReturning: boolean;
  }) => string;
  buildSubheadline: (params: {
    firstName: string;
    founderNumber: number;
    isReturning: boolean;
    daysAsFounder: number;
    launchProgress: number;
    estimatedLaunch: string;
  }) => string;
  buildStatusPill: (params: {
    isReturning: boolean;
    founderNumber: number;
  }) => string;
  buildNotification: (params: {
    founderNumber: number;
    spotsLeft: number;
    estimatedLaunch: string;
  }) => { tone: "info" | "success" | "highlight"; message: string };
  buildRankLabel: (founderNumber: number) => string;
  launchPhaseLabel: (launchProgress: number) => string;
};

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  return `${local.slice(0, 2)}•••@${domain}`;
}

function maskEmailFaq(email: string): string {
  return email.replace(/(^.).+(@.+$)/, "$1•••$2");
}

function getDateLocale(locale: LandingLocale): string {
  if (locale === "fr") return "fr-FR";
  if (locale === "ar") return "ar-MA";
  return "en-GB";
}

function formatLaunchDate(target: Date, locale: LandingLocale): string {
  return target.toLocaleDateString(getDateLocale(locale), {
    month: "long",
    year: "numeric",
  });
}

function formatEstimatedLaunchImpl(
  target: Date,
  now: Date,
  locale: LandingLocale,
  launchImminent: string,
  daysTemplate: (days: number) => string,
): string {
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return launchImminent;

  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 14) return daysTemplate(diffDays);

  return formatLaunchDate(target, locale);
}

function buildLaunchPhasesImpl(
  progress: number,
  labels: {
    onboarding: { label: string; description: string };
    development: { label: string; description: string };
    beta: { label: string; description: string };
    launch: { label: string; description: string };
  },
): WaitingIntelligenceCopy["buildLaunchPhases"] extends (p: number) => infer R
  ? R
  : never {
  const betaThreshold = 88;

  return [
    {
      label: labels.onboarding.label,
      description: labels.onboarding.description,
      status: "complete" as const,
    },
    {
      label: labels.development.label,
      description: labels.development.description,
      status: progress < betaThreshold ? ("active" as const) : ("complete" as const),
      progress: progress < betaThreshold ? progress : undefined,
    },
    {
      label: labels.beta.label,
      description: labels.beta.description,
      status:
        progress >= betaThreshold
          ? progress >= 94
            ? ("complete" as const)
            : ("active" as const)
          : ("upcoming" as const),
      progress:
        progress >= betaThreshold && progress < 94
          ? Math.min(94, progress + 4)
          : undefined,
    },
    {
      label: labels.launch.label,
      description: labels.launch.description,
      status: progress >= 94 ? ("active" as const) : ("upcoming" as const),
    },
  ];
}

const EN_COPY: FounderFlowCopy = {
  shell: {
    logoAlt: "Ettajer",
    help: "Help",
    logOut: "Log out",
    language: "Language",
    languageAria: "Language",
    footer: (year) => `© ${year} Ettajer · Built for Moroccan merchants`,
    mobileNav: {
      home: "Home",
      card: "Card",
      contact: "Contact",
      menu: "Menu",
      navAria: "Founder app navigation",
      closeMenu: "Close menu",
      account: "Account",
      founderFallback: "Founder",
      earlyAccess: "Early access",
      helpCenter: "Help Center",
      contactSupport: "Contact support",
      ettajerWebsite: "Ettajer website",
      logOut: "Log Out",
    },
    contact: {
      title: "Contact",
      subtitle: (n) => `Priority support for ${formatFounderNumber(n)}`,
      sendMessage: "Send a message",
      sendMessageHint: "Reply within 24h on business days",
      helpCenter: "Help Center",
      helpCenterHint: "COD, orders & store guides",
      yourEmail: "Your email",
    },
    cardView: {
      title: "Founder Card",
      tapToFlip: "Tap to flip",
    },
  },
  welcome: {
    mobileTitle: (firstName) => `Welcome, ${firstName}`,
    mobileSubtitle: "Your account is ready. You're part of our early merchant community.",
    desktopTitle: (firstName) => `Welcome to Ettajer, ${firstName} 👋`,
    desktopLine1: "Your account has been created successfully.",
    desktopLine2: "You are now part of our early merchant community.",
    nextStep: "Next step",
    viewFounderCard: "View your founder card",
    tapToFlip: "Tap to flip",
    continueEarlyAccess: "Continue to early access",
    yourWaitingPage: "Your waiting page",
    viewFounderCardButton: "View Founder Card",
  },
  waiting: {
    forYou: "For you",
    personalizedTitle: "Personalized for you",
    personalizedSubtitle: "Live insights based on your founder profile",
    recommendedForYou: "Recommended for you",
    recommended: "Recommended",
    yourFounderCard: "Your Founder Card",
    founderCardHint: "Tap to flip · Premium member card",
    swipeToView: "Swipe to view full card →",
    phaseDone: "Done",
    phaseInProgress: "In progress",
    progress: "Progress",
    merchantDashboard: "Merchant Dashboard",
    launchDay: "Launch day",
    dashboardStats: {
      orders: "Orders",
      revenue: "Revenue",
      conversion: "Conversion",
    },
    dashboardNav: {
      overview: "Overview",
      products: "Products",
      orders: "Orders",
      apps: "Apps",
    },
    unlocksAtLaunch: "Unlocks at launch",
    unlocksDescription:
      "COD orders, products, analytics & more — ready when we go live.",
    platformReady: "Platform ready",
    estimatedLaunch: "Estimated launch",
    dayAsFounder: (days) => `Day ${days} as founder`,
    community: "Community",
    yourRank: "Your rank",
    spotsLeftEmail: (spotsLeft, maskedEmail) =>
      `${spotsLeft} spots left · ${maskedEmail}`,
    foundersOf: (count, max) => `${count} of ${max}`,
    launchRoadmap: "Launch roadmap",
    launchRoadmapSubtitle: (phaseLabel, progress) =>
      `${phaseLabel} · ${progress}% complete`,
    launchTargetNotice: (estimatedLaunch, maskedEmail) =>
      `Launch target: ${estimatedLaunch}. We'll email you at ${maskedEmail} — no action needed.`,
    whatsWaiting: "What's waiting for you",
    whatsWaitingSubtitle: "Unlocks automatically when we hit launch",
    founderBenefits: "Your founder benefits",
    founderBenefitsSubtitle: (tierLabel) =>
      `As ${tierLabel}, you get exclusive perks`,
    benefits: [
      {
        title: "Founder Badge",
        description: "Your exclusive Ettajer founder identity.",
      },
      {
        title: "Early Access",
        description: "Test new features before everyone else.",
      },
      {
        title: "Priority Support",
        description: "Get direct access to the Ettajer team.",
      },
      {
        title: "Future Rewards",
        description: "Receive exclusive benefits from Ettajer partners.",
      },
    ],
    helpCenter: "Help Center",
    contactSupport: "Contact support",
    viewFounderCard: "View founder card",
    faqTitle: "Frequently asked questions",
    faqSubtitle: (n) => `Answers tailored to ${formatFounderNumber(n)}`,
    launchCta: (estimatedLaunch) => `Launch: ${estimatedLaunch}`,
    memberSince: (date) => `Member since ${date}`,
    journeyStartsHereLine1: "Your Ettajer journey",
    journeyStartsHereLine2: "starts here.",
    gradientHeadlineMarker: "starts here",
  },
  onboarding: {
    pageTitle: "Welcome to Ettajer",
    pageSubtitle: "Let's set up your store in 3 easy steps",
    stepOf: (step, total) => `Step ${step} of ${total}`,
    steps: {
      storeName: { title: "Store Name", description: "What should we call your store?" },
      category: { title: "Category", description: "What do you sell?" },
      currency: { title: "Currency", description: "Choose your primary currency" },
    },
    step1: {
      heading: "Name your store",
      subheading: "Choose a memorable name for your online business",
      label: "Store name",
      placeholder: "e.g. Atlas Crafts, Casablanca Fashion",
    },
    step2: {
      heading: "What do you sell?",
      subheading: "Select the category that best describes your products",
    },
    step3: {
      heading: "Choose your currency",
      subheading: "You can change this later in settings",
      label: "Primary currency",
      placeholder: "Select currency",
      summaryTitle: "Your store summary",
    },
    back: "Back",
    continue: "Continue",
    launchStore: "Launch my store",
    errors: {
      storeNameRequired: "Please enter a store name",
      categoryRequired: "Please select a category",
      createFailed: "Failed to create store",
      generic: "Something went wrong",
    },
    success: "Your store is ready! Welcome to Ettajer.",
  },
  categories: {
    fashion: "Fashion & Apparel",
    electronics: "Electronics",
    food: "Food & Beverages",
    beauty: "Beauty & Cosmetics",
    home: "Home & Garden",
    handmade: "Handmade & Crafts",
    other: "Other",
  },
};

const FR_COPY: FounderFlowCopy = {
  shell: {
    logoAlt: "Ettajer",
    help: "Aide",
    logOut: "Déconnexion",
    language: "Langue",
    languageAria: "Langue",
    footer: (year) => `© ${year} Ettajer · Conçu pour les commerçants marocains`,
    mobileNav: {
      home: "Accueil",
      card: "Carte",
      contact: "Contact",
      menu: "Menu",
      navAria: "Navigation fondateur",
      closeMenu: "Fermer le menu",
      account: "Compte",
      founderFallback: "Fondateur",
      earlyAccess: "Accès anticipé",
      helpCenter: "Centre d'aide",
      contactSupport: "Contacter le support",
      ettajerWebsite: "Site Ettajer",
      logOut: "Déconnexion",
    },
    contact: {
      title: "Contact",
      subtitle: (n) => `Support prioritaire pour ${formatFounderNumber(n)}`,
      sendMessage: "Envoyer un message",
      sendMessageHint: "Réponse sous 24 h les jours ouvrables",
      helpCenter: "Centre d'aide",
      helpCenterHint: "COD, commandes et guides boutique",
      yourEmail: "Votre e-mail",
    },
    cardView: {
      title: "Carte Fondateur",
      tapToFlip: "Appuyez pour retourner",
    },
  },
  welcome: {
    mobileTitle: (firstName) => `Bienvenue, ${firstName}`,
    mobileSubtitle:
      "Votre compte est prêt. Vous faites partie de notre communauté de commerçants pionniers.",
    desktopTitle: (firstName) => `Bienvenue sur Ettajer, ${firstName} 👋`,
    desktopLine1: "Votre compte a été créé avec succès.",
    desktopLine2: "Vous faites désormais partie de notre communauté de commerçants pionniers.",
    nextStep: "Prochaine étape",
    viewFounderCard: "Voir votre carte fondateur",
    tapToFlip: "Appuyez pour retourner",
    continueEarlyAccess: "Continuer vers l'accès anticipé",
    yourWaitingPage: "Votre page d'attente",
    viewFounderCardButton: "Voir la carte fondateur",
  },
  waiting: {
    forYou: "Pour vous",
    personalizedTitle: "Personnalisé pour vous",
    personalizedSubtitle: "Informations en direct selon votre profil fondateur",
    recommendedForYou: "Recommandé pour vous",
    recommended: "Recommandé",
    yourFounderCard: "Votre carte fondateur",
    founderCardHint: "Appuyez pour retourner · Carte membre premium",
    swipeToView: "Glissez pour voir la carte complète →",
    phaseDone: "Terminé",
    phaseInProgress: "En cours",
    progress: "Progression",
    merchantDashboard: "Tableau de bord commerçant",
    launchDay: "Jour du lancement",
    dashboardStats: {
      orders: "Commandes",
      revenue: "Chiffre d'affaires",
      conversion: "Conversion",
    },
    dashboardNav: {
      overview: "Aperçu",
      products: "Produits",
      orders: "Commandes",
      apps: "Applications",
    },
    unlocksAtLaunch: "Débloqué au lancement",
    unlocksDescription:
      "Commandes COD, produits, statistiques et plus — prêts dès la mise en ligne.",
    platformReady: "Plateforme prête",
    estimatedLaunch: "Lancement estimé",
    dayAsFounder: (days) => `Jour ${days} en tant que fondateur`,
    community: "Communauté",
    yourRank: "Votre rang",
    spotsLeftEmail: (spotsLeft, maskedEmail) =>
      `${spotsLeft} places restantes · ${maskedEmail}`,
    foundersOf: (count, max) => `${count} sur ${max}`,
    launchRoadmap: "Feuille de route du lancement",
    launchRoadmapSubtitle: (phaseLabel, progress) =>
      `${phaseLabel} · ${progress} % terminé`,
    launchTargetNotice: (estimatedLaunch, maskedEmail) =>
      `Objectif de lancement : ${estimatedLaunch}. Nous vous écrirons à ${maskedEmail} — aucune action requise.`,
    whatsWaiting: "Ce qui vous attend",
    whatsWaitingSubtitle: "Débloqué automatiquement au lancement",
    founderBenefits: "Vos avantages fondateur",
    founderBenefitsSubtitle: (tierLabel) =>
      `En tant que ${tierLabel}, vous bénéficiez d'avantages exclusifs`,
    benefits: [
      {
        title: "Badge Fondateur",
        description: "Votre identité exclusive de fondateur Ettajer.",
      },
      {
        title: "Accès Anticipé",
        description: "Testez les nouvelles fonctionnalités avant tout le monde.",
      },
      {
        title: "Support Prioritaire",
        description: "Accès direct à l'équipe Ettajer.",
      },
      {
        title: "Récompenses Futures",
        description: "Avantages exclusifs offerts par les partenaires Ettajer.",
      },
    ],
    helpCenter: "Centre d'aide",
    contactSupport: "Contacter le support",
    viewFounderCard: "Voir la carte fondateur",
    faqTitle: "Questions fréquentes",
    faqSubtitle: (n) => `Réponses adaptées à ${formatFounderNumber(n)}`,
    launchCta: (estimatedLaunch) => `Lancement : ${estimatedLaunch}`,
    memberSince: (date) => `Membre depuis le ${date}`,
    journeyStartsHereLine1: "Votre parcours Ettajer",
    journeyStartsHereLine2: "commence ici.",
    gradientHeadlineMarker: "commence ici",
  },
  onboarding: {
    pageTitle: "Bienvenue sur Ettajer",
    pageSubtitle: "Configurons votre boutique en 3 étapes simples",
    stepOf: (step, total) => `Étape ${step} sur ${total}`,
    steps: {
      storeName: { title: "Nom de la boutique", description: "Comment appeler votre boutique ?" },
      category: { title: "Catégorie", description: "Que vendez-vous ?" },
      currency: { title: "Devise", description: "Choisissez votre devise principale" },
    },
    step1: {
      heading: "Nommez votre boutique",
      subheading: "Choisissez un nom mémorable pour votre activité en ligne",
      label: "Nom de la boutique",
      placeholder: "ex. Atlas Crafts, Mode Casablanca",
    },
    step2: {
      heading: "Que vendez-vous ?",
      subheading: "Sélectionnez la catégorie qui décrit le mieux vos produits",
    },
    step3: {
      heading: "Choisissez votre devise",
      subheading: "Vous pourrez la modifier plus tard dans les paramètres",
      label: "Devise principale",
      placeholder: "Sélectionner une devise",
      summaryTitle: "Récapitulatif de votre boutique",
    },
    back: "Retour",
    continue: "Continuer",
    launchStore: "Lancer ma boutique",
    errors: {
      storeNameRequired: "Veuillez saisir un nom de boutique",
      categoryRequired: "Veuillez sélectionner une catégorie",
      createFailed: "Échec de la création de la boutique",
      generic: "Une erreur s'est produite",
    },
    success: "Votre boutique est prête ! Bienvenue sur Ettajer.",
  },
  categories: {
    fashion: "Mode & Habillement",
    electronics: "Électronique",
    food: "Alimentation & Boissons",
    beauty: "Beauté & Cosmétiques",
    home: "Maison & Jardin",
    handmade: "Artisanat & Créations",
    other: "Autre",
  },
};

const AR_COPY: FounderFlowCopy = {
  shell: {
    logoAlt: "إيتاجر",
    help: "مساعدة",
    logOut: "تسجيل الخروج",
    language: "اللغة",
    languageAria: "اللغة",
    footer: (year) => `© ${year} إيتاجر · مُصمَّم للتجار المغاربة`,
    mobileNav: {
      home: "الرئيسية",
      card: "البطاقة",
      contact: "تواصل",
      menu: "القائمة",
      navAria: "تنقل تطبيق المؤسس",
      closeMenu: "إغلاق القائمة",
      account: "الحساب",
      founderFallback: "مؤسس",
      earlyAccess: "الوصول المبكر",
      helpCenter: "مركز المساعدة",
      contactSupport: "التواصل مع الدعم",
      ettajerWebsite: "موقع إيتاجر",
      logOut: "تسجيل الخروج",
    },
    contact: {
      title: "تواصل",
      subtitle: (n) => `دعم أولوي لـ ${formatFounderNumber(n)}`,
      sendMessage: "إرسال رسالة",
      sendMessageHint: "الرد خلال 24 ساعة في أيام العمل",
      helpCenter: "مركز المساعدة",
      helpCenterHint: "الدفع عند الاستلام، الطلبات وأدلة المتجر",
      yourEmail: "بريدك الإلكتروني",
    },
    cardView: {
      title: "بطاقة المؤسس",
      tapToFlip: "اضغط للقلب",
    },
  },
  welcome: {
    mobileTitle: (firstName) => `مرحباً، ${firstName}`,
    mobileSubtitle: "حسابك جاهز. أنت جزء من مجتمع التجار الأوائل لدينا.",
    desktopTitle: (firstName) => `مرحباً بك في إيتاجر، ${firstName} 👋`,
    desktopLine1: "تم إنشاء حسابك بنجاح.",
    desktopLine2: "أنت الآن جزء من مجتمع التجار الأوائل لدينا.",
    nextStep: "الخطوة التالية",
    viewFounderCard: "عرض بطاقة المؤسس",
    tapToFlip: "اضغط للقلب",
    continueEarlyAccess: "المتابعة إلى الوصول المبكر",
    yourWaitingPage: "صفحة الانتظار",
    viewFounderCardButton: "عرض بطاقة المؤسس",
  },
  waiting: {
    forYou: "لك",
    personalizedTitle: "مخصص لك",
    personalizedSubtitle: "رؤى مباشرة بناءً على ملفك كمؤسس",
    recommendedForYou: "موصى به لك",
    recommended: "موصى به",
    yourFounderCard: "بطاقة المؤسس",
    founderCardHint: "اضغط للقلب · بطاقة عضوية مميزة",
    swipeToView: "اسحب لعرض البطاقة كاملة ←",
    phaseDone: "مكتمل",
    phaseInProgress: "قيد التنفيذ",
    progress: "التقدم",
    merchantDashboard: "لوحة تحكم التاجر",
    launchDay: "يوم الإطلاق",
    dashboardStats: {
      orders: "الطلبات",
      revenue: "الإيرادات",
      conversion: "التحويل",
    },
    dashboardNav: {
      overview: "نظرة عامة",
      products: "المنتجات",
      orders: "الطلبات",
      apps: "التطبيقات",
    },
    unlocksAtLaunch: "يُفتح عند الإطلاق",
    unlocksDescription:
      "طلبات الدفع عند الاستلام، المنتجات، التحليلات والمزيد — جاهزة عند الإطلاق.",
    platformReady: "المنصة جاهزة",
    estimatedLaunch: "الإطلاق المتوقع",
    dayAsFounder: (days) => `اليوم ${days} كمؤسس`,
    community: "المجتمع",
    yourRank: "ترتيبك",
    spotsLeftEmail: (spotsLeft, maskedEmail) =>
      `${spotsLeft} مقعداً متبقياً · ${maskedEmail}`,
    foundersOf: (count, max) => `${count} من ${max}`,
    launchRoadmap: "خارطة طريق الإطلاق",
    launchRoadmapSubtitle: (phaseLabel, progress) =>
      `${phaseLabel} · ${progress}% مكتمل`,
    launchTargetNotice: (estimatedLaunch, maskedEmail) =>
      `موعد الإطلاق المستهدف: ${estimatedLaunch}. سنراسلك على ${maskedEmail} — لا يلزم أي إجراء.`,
    whatsWaiting: "ما ينتظرك",
    whatsWaitingSubtitle: "يُفتح تلقائياً عند الإطلاق",
    founderBenefits: "مزايا المؤسس",
    founderBenefitsSubtitle: (tierLabel) =>
      `بصفتك ${tierLabel}، تحصل على امتيازات حصرية`,
    benefits: [
      {
        title: "شارة المؤسس",
        description: "هويتك الحصرية كمؤسس إيتاجر.",
      },
      {
        title: "الوصول المبكر",
        description: "جرّب الميزات الجديدة قبل الجميع.",
      },
      {
        title: "دعم أولوي",
        description: "تواصل مباشر مع فريق إيتاجر.",
      },
      {
        title: "مكافآت مستقبلية",
        description: "امتيازات حصرية من شركاء إيتاجر.",
      },
    ],
    helpCenter: "مركز المساعدة",
    contactSupport: "التواصل مع الدعم",
    viewFounderCard: "عرض بطاقة المؤسس",
    faqTitle: "الأسئلة الشائعة",
    faqSubtitle: (n) => `إجابات مخصصة لـ ${formatFounderNumber(n)}`,
    launchCta: (estimatedLaunch) => `الإطلاق: ${estimatedLaunch}`,
    memberSince: (date) => `عضو منذ ${date}`,
    journeyStartsHereLine1: "رحلتك مع إيتاجر",
    journeyStartsHereLine2: "تبدأ هنا.",
    gradientHeadlineMarker: "تبدأ هنا",
  },
  onboarding: {
    pageTitle: "مرحباً بك في إيتاجر",
    pageSubtitle: "لنُعدّ متجرك في 3 خطوات بسيطة",
    stepOf: (step, total) => `الخطوة ${step} من ${total}`,
    steps: {
      storeName: { title: "اسم المتجر", description: "ما اسم متجرك؟" },
      category: { title: "الفئة", description: "ماذا تبيع؟" },
      currency: { title: "العملة", description: "اختر عملتك الرئيسية" },
    },
    step1: {
      heading: "سمِّ متجرك",
      subheading: "اختر اسماً مميزاً لنشاطك التجاري عبر الإنترنت",
      label: "اسم المتجر",
      placeholder: "مثال: حرف الأطلس، أزياء الدار البيضاء",
    },
    step2: {
      heading: "ماذا تبيع؟",
      subheading: "اختر الفئة التي تصف منتجاتك بشكل أفضل",
    },
    step3: {
      heading: "اختر عملتك",
      subheading: "يمكنك تغييرها لاحقاً من الإعدادات",
      label: "العملة الرئيسية",
      placeholder: "اختر العملة",
      summaryTitle: "ملخص متجرك",
    },
    back: "رجوع",
    continue: "متابعة",
    launchStore: "إطلاق متجري",
    errors: {
      storeNameRequired: "يرجى إدخال اسم المتجر",
      categoryRequired: "يرجى اختيار فئة",
      createFailed: "فشل إنشاء المتجر",
      generic: "حدث خطأ ما",
    },
    success: "متجرك جاهز! مرحباً بك في إيتاجر.",
  },
  categories: {
    fashion: "الأزياء والملابس",
    electronics: "الإلكترونيات",
    food: "الأغذية والمشروبات",
    beauty: "الجمال ومستحضرات التجميل",
    home: "المنزل والحديقة",
    handmade: "الحرف اليدوية والإبداع",
    other: "أخرى",
  },
};

function buildWaitingIntelligenceCopy(locale: LandingLocale): WaitingIntelligenceCopy {
  if (locale === "fr") {
    return {
      launchImminent: "Lancement imminent",
      getFounderTier: (founderNumber) => {
        if (founderNumber <= 10) {
          return {
            id: "pioneer",
            label: "Fondateur Pionnier",
            description:
              "Vous êtes parmi les 10 premiers — le cercle restreint des commerçants Ettajer.",
          };
        }
        if (founderNumber <= 25) {
          return {
            id: "early",
            label: "Fondateur Précoce",
            description:
              "Vous avez rejoint la première vague — parmi les premiers convaincus.",
          };
        }
        if (founderNumber <= 50) {
          return {
            id: "founding",
            label: "Membre Fondateur",
            description:
              "Vous faites partie de la première moitié de notre communauté de commerçants fondateurs.",
          };
        }
        return {
          id: "member",
          label: "Commerçant Fondateur",
          description: "Vous faites officiellement partie des 100 premiers.",
        };
      },
      formatEstimatedLaunch: (target, now = new Date()) =>
        formatEstimatedLaunchImpl(
          target,
          now,
          locale,
          "Lancement imminent",
          (days) => `~${days} jour${days === 1 ? "" : "s"} avant le lancement`,
        ),
      buildMomentumMessage: (momentum, recentJoins, spotsLeft) => {
        if (momentum === "high") {
          return `${recentJoins} fondateurs ont rejoint ces 7 derniers jours — l'élan s'accélère.`;
        }
        if (momentum === "steady") {
          return `${recentJoins} nouveaux fondateurs cette semaine. Plus que ${spotsLeft} places disponibles.`;
        }
        if (spotsLeft <= 10) {
          return `Plus que ${spotsLeft} places fondateur — la communauté est presque complète.`;
        }
        return `${spotsLeft} places fondateur encore disponibles avant la fermeture des 100 premiers.`;
      },
      buildLaunchPhases: (progress) =>
        buildLaunchPhasesImpl(progress, {
          onboarding: {
            label: "Inscription fondateur",
            description: "Compte créé et e-mail vérifié",
          },
          development: {
            label: "Développement de la plateforme",
            description: "Créateur de boutique, paiement COD, tableau de bord commerçant",
          },
          beta: {
            label: "Tests bêta",
            description: "Tests avec commerçants pionniers et finitions",
          },
          launch: {
            label: "Lancement public",
            description: "Votre tableau de bord se débloque automatiquement",
          },
        }),
      pickPrimaryAction: ({ daysAsFounder, isReturning, founderNumber }) => {
        if (daysAsFounder < 2) {
          return {
            id: "email",
            title: "Consultez votre e-mail de bienvenue",
            description:
              "Votre carte fondateur PNG et certificat PDF ont été envoyés après l'activation.",
            hint: "Recherchez Ettajer dans votre boîte",
          };
        }
        if (founderNumber <= 10) {
          return {
            id: "card",
            title: "Voir votre carte pionnier",
            description:
              "En tant que pionnier du top 10, votre carte fondateur atteste définitivement votre confiance précoce.",
            hint: "Appuyez pour retourner",
            scrollTarget: "card",
          };
        }
        if (isReturning) {
          return {
            id: "help",
            title: "Préparez le lancement",
            description:
              "Consultez les guides sur le COD, les produits et la configuration avant le déblocage de votre tableau de bord.",
            hint: "Parcourir le Centre d'aide",
            href: "/help",
          };
        }
        return {
          id: "card",
          title: "Sauvegardez votre carte fondateur",
          description:
            "Téléchargez-la depuis votre e-mail de bienvenue ou consultez-la ci-dessous — elle est à vous pour toujours.",
          hint: "Voir la carte ci-dessous",
          scrollTarget: "card",
        };
      },
      buildInsights: ({
        firstName,
        founderNumber,
        founderTier,
        daysAsFounder,
        launchProgress,
        estimatedLaunch,
        momentumMessage,
      }) => {
        const insights = [
          {
            id: "tier",
            title: founderTier.label,
            body: founderTier.description,
          },
          {
            id: "launch",
            title: `${launchProgress} % de la plateforme prête`,
            body: `Lancement visé ${estimatedLaunch}. Vous recevrez un e-mail dès que votre tableau de bord sera débloqué.`,
          },
          {
            id: "community",
            title: "Pouls de la communauté",
            body: momentumMessage,
          },
        ];

        if (founderNumber <= 5) {
          insights.unshift({
            id: "pioneer",
            title: `Top 5 pionnier — ${formatFounderNumberShort(founderNumber)}`,
            body: `${firstName}, vous êtes parmi les tout premiers commerçants à croire en Ettajer. Cela ne changera pas.`,
          });
        } else if (daysAsFounder >= 7) {
          insights.push({
            id: "patience",
            title: `${daysAsFounder} jours en tant que fondateur`,
            body: "Votre place reste garantie. Aucune action requise — nous construisons pour vous.",
          });
        }

        return insights.slice(0, 4);
      },
      buildPersonalizedFaq: (founderNumber, estimatedLaunch, email) => {
        const masked = maskEmailFaq(email);
        return [
          {
            q: "Quand mon tableau de bord sera-t-il débloqué ?",
            a: `Votre tableau de bord se débloque automatiquement au lancement (${estimatedLaunch}). Nous écrirons à ${masked} dès qu'il sera prêt — aucune action requise.`,
          },
          {
            q: "Que puis-je faire en attendant ?",
            a: `Sauvegardez votre carte ${formatFounderNumber(founderNumber)} depuis votre e-mail de bienvenue, explorez le Centre d'aide et contactez-nous si vous avez des questions. Votre place fondateur est déjà sécurisée.`,
          },
          {
            q: "Ma place fondateur est-elle garantie ?",
            a: `Oui. Vous êtes ${formatFounderNumber(founderNumber)} — l'un des ${MAX_FOUNDERS} commerçants fondateurs. Votre numéro est permanent et non transférable.`,
          },
          {
            q: "Comment obtenir le support prioritaire ?",
            a: `Mentionnez ${formatFounderNumberShort(founderNumber)} en contactant le support — les fondateurs reçoivent des réponses plus rapides de l'équipe Ettajer.`,
          },
        ];
      },
      buildHeadline: ({ firstName, founderNumber, isReturning }) => {
        if (isReturning) return `Bon retour, ${firstName}`;
        if (founderNumber <= 10) return `${firstName}, vous êtes un pionnier`;
        return "Votre parcours Ettajer commence ici.";
      },
      buildSubheadline: ({
        firstName,
        founderNumber,
        isReturning,
        daysAsFounder,
        launchProgress,
        estimatedLaunch,
      }) => {
        if (isReturning) {
          if (daysAsFounder >= 7) {
            return `Jour ${daysAsFounder} en tant que ${formatFounderNumberShort(founderNumber)}. Plateforme prête à ${launchProgress} % — votre tableau de bord se débloque au lancement.`;
          }
          return `Votre place fondateur est sécurisée. Plateforme prête à ${launchProgress} % — patientez, nous vous écrirons au lancement.`;
        }
        if (founderNumber <= 10) {
          return `${formatFounderNumber(founderNumber)} vous place dans le top 10. Votre parcours Ettajer commence ici — lancement ${estimatedLaunch}.`;
        }
        return `Vous êtes ${formatFounderNumber(founderNumber)} sur ${MAX_FOUNDERS}. Plateforme prête à ${launchProgress} % — nous vous préviendrons quand votre tableau de bord sera débloqué.`;
      },
      buildStatusPill: ({ isReturning, founderNumber }) => {
        if (isReturning) return "Fondateur actif";
        if (founderNumber <= 10) return "Fondateur pionnier";
        return "Accès anticipé";
      },
      buildNotification: ({ founderNumber, spotsLeft, estimatedLaunch }) => {
        if (founderNumber <= 10) {
          return {
            tone: "highlight" as const,
            message: `Avantage pionnier : en tant que ${formatFounderNumberShort(founderNumber)}, vous êtes en tête de file au déblocage du tableau de bord.`,
          };
        }
        if (spotsLeft <= 15) {
          return {
            tone: "info" as const,
            message: `Plus que ${spotsLeft} places fondateur — vous êtes déjà inscrit.`,
          };
        }
        return {
          tone: "success" as const,
          message: `Aucune action requise. Nous vous écrirons au lancement (${estimatedLaunch}).`,
        };
      },
      buildRankLabel: (founderNumber) => {
        if (founderNumber <= 10) return "Top 10 pionnier";
        if (founderNumber <= 25) return "Top 25 fondateur précoce";
        return `Top ${Math.round((founderNumber / MAX_FOUNDERS) * 100)} %`;
      },
      launchPhaseLabel: (launchProgress) =>
        launchProgress >= 88 ? "Tests bêta" : "Développement de la plateforme",
    };
  }

  if (locale === "ar") {
    return {
      launchImminent: "الإطلاق وشيك",
      getFounderTier: (founderNumber) => {
        if (founderNumber <= 10) {
          return {
            id: "pioneer",
            label: "مؤسس رائد",
            description: "أنت من بين أول 10 — الدائرة الداخلية لتجار إيتاجر.",
          };
        }
        if (founderNumber <= 25) {
          return {
            id: "early",
            label: "مؤسس مبكر",
            description: "انضممت في الموجة الأولى — من أوائل المؤمنين بالمنصة.",
          };
        }
        if (founderNumber <= 50) {
          return {
            id: "founding",
            label: "عضو مؤسس",
            description: "أنت في النصف الأول من مجتمع التجار المؤسسين.",
          };
        }
        return {
          id: "member",
          label: "تاجر مؤسس",
          description: "أنت رسمياً ضمن أول 100 مؤسس.",
        };
      },
      formatEstimatedLaunch: (target, now = new Date()) =>
        formatEstimatedLaunchImpl(
          target,
          now,
          locale,
          "الإطلاق وشيك",
          (days) =>
            days === 1
              ? `~${days} يوم على الإطلاق`
              : `~${days} أيام على الإطلاق`,
        ),
      buildMomentumMessage: (momentum, recentJoins, spotsLeft) => {
        if (momentum === "high") {
          return `انضم ${recentJoins} مؤسساً خلال آخر 7 أيام — الزخم يتسارع بسرعة.`;
        }
        if (momentum === "steady") {
          return `${recentJoins} مؤسساً جديداً هذا الأسبوع. تبقى ${spotsLeft} مقعداً فقط.`;
        }
        if (spotsLeft <= 10) {
          return `تبقى ${spotsLeft} مقعداً مؤسساً فقط — المجتمع على وشك الاكتمال.`;
        }
        return `${spotsLeft} مقعداً مؤسساً متاحاً قبل إغلاق أول 100.`;
      },
      buildLaunchPhases: (progress) =>
        buildLaunchPhasesImpl(progress, {
          onboarding: {
            label: "تسجيل المؤسس",
            description: "تم إنشاء الحساب والتحقق من البريد",
          },
          development: {
            label: "تطوير المنصة",
            description: "منشئ المتجر، الدفع عند الاستلام، لوحة تحكم التاجر",
          },
          beta: {
            label: "اختبار تجريبي",
            description: "اختبار مع التجار الأوائل واللمسات الأخيرة",
          },
          launch: {
            label: "الإطلاق العام",
            description: "تُفتح لوحة التحكم تلقائياً",
          },
        }),
      pickPrimaryAction: ({ daysAsFounder, isReturning, founderNumber }) => {
        if (daysAsFounder < 2) {
          return {
            id: "email",
            title: "تحقق من بريد الترحيب",
            description: "أُرسلت بطاقة المؤسس PNG وشهادة PDF بعد التفعيل.",
            hint: "ابحث عن إيتاجر في بريدك",
          };
        }
        if (founderNumber <= 10) {
          return {
            id: "card",
            title: "اعرض بطاقة الرائد",
            description:
              "بصفتك من أول 10 رواد، بطاقتك دليل دائم على ثقتك المبكرة.",
            hint: "اضغط للقلب",
            scrollTarget: "card",
          };
        }
        if (isReturning) {
          return {
            id: "help",
            title: "استعد للإطلاق",
            description:
              "اقرأ أدلة الدفع عند الاستلام والمنتجات وإعداد المتجر قبل فتح لوحة التحكم.",
            hint: "تصفح مركز المساعدة",
            href: "/help",
          };
        }
        return {
          id: "card",
          title: "احفظ بطاقة المؤسس",
          description:
            "حمّلها من بريد الترحيب أو اعرضها أدناه — لك إلى الأبد.",
          hint: "اعرض البطاقة أدناه",
          scrollTarget: "card",
        };
      },
      buildInsights: ({
        firstName,
        founderNumber,
        founderTier,
        daysAsFounder,
        launchProgress,
        estimatedLaunch,
        momentumMessage,
      }) => {
        const insights = [
          {
            id: "tier",
            title: founderTier.label,
            body: founderTier.description,
          },
          {
            id: "launch",
            title: `${launchProgress}% من المنصة جاهزة`,
            body: `نستهدف الإطلاق ${estimatedLaunch}. ستصلك رسالة فور فتح لوحة التحكم.`,
          },
          {
            id: "community",
            title: "نبض المجتمع",
            body: momentumMessage,
          },
        ];

        if (founderNumber <= 5) {
          insights.unshift({
            id: "pioneer",
            title: `رائد من أول 5 — ${formatFounderNumberShort(founderNumber)}`,
            body: `${firstName}، أنت من أوائل التجار الذين آمنوا بإيتاجر. هذا لن يتغير.`,
          });
        } else if (daysAsFounder >= 7) {
          insights.push({
            id: "patience",
            title: `${daysAsFounder} أيام كمؤسس`,
            body: "مقعدك محجوز. لا يلزم أي إجراء — نبني من أجلك.",
          });
        }

        return insights.slice(0, 4);
      },
      buildPersonalizedFaq: (founderNumber, estimatedLaunch, email) => {
        const masked = maskEmailFaq(email);
        return [
          {
            q: "متى تُفتح لوحة التحكم؟",
            a: `تُفتح لوحة التحكم تلقائياً عند الإطلاق (${estimatedLaunch}). سنراسل ${masked} فور الجاهزية — لا يلزم أي إجراء.`,
          },
          {
            q: "ماذا أفعل أثناء الانتظار؟",
            a: `احفظ بطاقتك ${formatFounderNumber(founderNumber)} من بريد الترحيب، واستكشف مركز المساعدة، وتواصل معنا عند الحاجة. مقعدك المؤسس مضمون.`,
          },
          {
            q: "هل مقعدي المؤسس مضمون؟",
            a: `نعم. أنت ${formatFounderNumber(founderNumber)} — من ${MAX_FOUNDERS} تاجر مؤسس فقط. رقمك دائم وغير قابل للنقل.`,
          },
          {
            q: "كيف أحصل على الدعم الأولوي؟",
            a: `اذكر ${formatFounderNumberShort(founderNumber)} عند التواصل مع الدعم — المؤسسون يحصلون على ردود أسرع من فريق إيتاجر.`,
          },
        ];
      },
      buildHeadline: ({ firstName, founderNumber, isReturning }) => {
        if (isReturning) return `مرحباً بعودتك، ${firstName}`;
        if (founderNumber <= 10) return `${firstName}، أنت رائد`;
        return "رحلتك مع إيتاجر تبدأ هنا.";
      },
      buildSubheadline: ({
        founderNumber,
        isReturning,
        daysAsFounder,
        launchProgress,
        estimatedLaunch,
      }) => {
        if (isReturning) {
          if (daysAsFounder >= 7) {
            return `اليوم ${daysAsFounder} كـ ${formatFounderNumberShort(founderNumber)}. المنصة جاهزة بنسبة ${launchProgress}% — تُفتح لوحة التحكم عند الإطلاق.`;
          }
          return `مقعدك المؤسس مضمون. جاهزية المنصة ${launchProgress}% — انتظر، سنراسلك عند الإطلاق.`;
        }
        if (founderNumber <= 10) {
          return `${formatFounderNumber(founderNumber)} يضعك في أول 10. رحلتك مع إيتاجر تبدأ هنا — الإطلاق ${estimatedLaunch}.`;
        }
        return `أنت ${formatFounderNumber(founderNumber)} من ${MAX_FOUNDERS}. المنصة جاهزة ${launchProgress}% — سنُبلغك عند فتح لوحة متجرك.`;
      },
      buildStatusPill: ({ isReturning, founderNumber }) => {
        if (isReturning) return "مؤسس نشط";
        if (founderNumber <= 10) return "مؤسس رائد";
        return "وصول مبكر";
      },
      buildNotification: ({ founderNumber, spotsLeft, estimatedLaunch }) => {
        if (founderNumber <= 10) {
          return {
            tone: "highlight" as const,
            message: `ميزة الرائد: بصفتك ${formatFounderNumberShort(founderNumber)}، أنت الأول عند فتح لوحة التحكم.`,
          };
        }
        if (spotsLeft <= 15) {
          return {
            tone: "info" as const,
            message: `تبقى ${spotsLeft} مقعداً مؤسساً — أنت مسجّل بالفعل.`,
          };
        }
        return {
          tone: "success" as const,
          message: `لا يلزم أي إجراء. سنراسلك عند الإطلاق (${estimatedLaunch}).`,
        };
      },
      buildRankLabel: (founderNumber) => {
        if (founderNumber <= 10) return "رائد من أول 10";
        if (founderNumber <= 25) return "مؤسس مبكر من أول 25";
        return `أفضل ${Math.round((founderNumber / MAX_FOUNDERS) * 100)}%`;
      },
      launchPhaseLabel: (launchProgress) =>
        launchProgress >= 88 ? "اختبار تجريبي" : "تطوير المنصة",
    };
  }

  return {
    launchImminent: "Launch imminent",
    getFounderTier: (founderNumber) => {
      if (founderNumber <= 10) {
        return {
          id: "pioneer",
          label: "Pioneer Founder",
          description: "You're in the first 10 — Ettajer's inner circle of merchants.",
        };
      }
      if (founderNumber <= 25) {
        return {
          id: "early",
          label: "Early Founder",
          description: "You joined in the first wave — among the earliest believers.",
        };
      }
      if (founderNumber <= 50) {
        return {
          id: "founding",
          label: "Founding Member",
          description: "You're in the first half of our founding merchant community.",
        };
      }
      return {
        id: "member",
        label: "Founder Merchant",
        description: "You're officially part of the exclusive first 100.",
      };
    },
    formatEstimatedLaunch: (target, now = new Date()) =>
      formatEstimatedLaunchImpl(
        target,
        now,
        locale,
        "Launch imminent",
        (days) => `~${days} day${days === 1 ? "" : "s"} to launch`,
      ),
    buildMomentumMessage: (momentum, recentJoins, spotsLeft) => {
      if (momentum === "high") {
        return `${recentJoins} founders joined in the last 7 days — momentum is building fast.`;
      }
      if (momentum === "steady") {
        return `${recentJoins} new founders this week. Only ${spotsLeft} spots remain.`;
      }
      if (spotsLeft <= 10) {
        return `Only ${spotsLeft} founder spots left — the community is nearly full.`;
      }
      return `${spotsLeft} founder spots still available before we close the first 100.`;
    },
    buildLaunchPhases: (progress) =>
      buildLaunchPhasesImpl(progress, {
        onboarding: {
          label: "Founder onboarding",
          description: "Account created & email verified",
        },
        development: {
          label: "Platform development",
          description: "Store builder, COD checkout, merchant dashboard",
        },
        beta: {
          label: "Beta testing",
          description: "Early merchant testing & final polish",
        },
        launch: {
          label: "Public launch",
          description: "Your dashboard unlocks automatically",
        },
      }),
    pickPrimaryAction: ({ daysAsFounder, isReturning, founderNumber }) => {
      if (daysAsFounder < 2) {
        return {
          id: "email",
          title: "Check your welcome email",
          description:
            "Your founder card PNG and certificate PDF were sent after activation.",
          hint: "Search inbox for Ettajer",
        };
      }
      if (founderNumber <= 10) {
        return {
          id: "card",
          title: "View your pioneer card",
          description:
            "As a top-10 pioneer, your founder card is your permanent proof of early belief.",
          hint: "Tap to flip",
          scrollTarget: "card",
        };
      }
      if (isReturning) {
        return {
          id: "help",
          title: "Prepare for launch",
          description:
            "Read guides on COD checkout, products, and store setup before your dashboard unlocks.",
          hint: "Browse Help Center",
          href: "/help",
        };
      }
      return {
        id: "card",
        title: "Save your founder card",
        description:
          "Download it from your welcome email or view it below — it's yours forever.",
        hint: "View card below",
        scrollTarget: "card",
      };
    },
    buildInsights: ({
      firstName,
      founderNumber,
      founderTier,
      daysAsFounder,
      launchProgress,
      estimatedLaunch,
      momentumMessage,
    }) => {
      const insights = [
        {
          id: "tier",
          title: founderTier.label,
          body: founderTier.description,
        },
        {
          id: "launch",
          title: `${launchProgress}% platform ready`,
          body: `We're targeting launch ${estimatedLaunch}. You'll get an email the moment your dashboard unlocks.`,
        },
        {
          id: "community",
          title: "Community pulse",
          body: momentumMessage,
        },
      ];

      if (founderNumber <= 5) {
        insights.unshift({
          id: "pioneer",
          title: `Top 5 pioneer — ${formatFounderNumberShort(founderNumber)}`,
          body: `${firstName}, you're among the very first merchants to believe in Ettajer. That won't change.`,
        });
      } else if (daysAsFounder >= 7) {
        insights.push({
          id: "patience",
          title: `${daysAsFounder} days as a founder`,
          body: "Your spot remains locked. No action needed — we're building for you.",
        });
      }

      return insights.slice(0, 4);
    },
    buildPersonalizedFaq: (founderNumber, estimatedLaunch, email) => {
      const masked = maskEmailFaq(email);
      return [
        {
          q: "When will my dashboard unlock?",
          a: `Your dashboard unlocks automatically at launch (${estimatedLaunch}). We'll email ${masked} the moment it's ready — zero action needed.`,
        },
        {
          q: "What can I do while I wait?",
          a: `Save your ${formatFounderNumber(founderNumber)} card from your welcome email, explore the Help Center, and reach out if you have questions. Your founder spot is already secured.`,
        },
        {
          q: "Am I guaranteed a founder spot?",
          a: `Yes. You're ${formatFounderNumber(founderNumber)} — one of only ${MAX_FOUNDERS} founding merchants. Your number is permanent and non-transferable.`,
        },
        {
          q: "How do I get priority support?",
          a: `Mention ${formatFounderNumberShort(founderNumber)} when contacting support — founders get faster responses from the Ettajer team.`,
        },
      ];
    },
    buildHeadline: ({ firstName, founderNumber, isReturning }) => {
      if (isReturning) return `Welcome back, ${firstName}`;
      if (founderNumber <= 10) return `${firstName}, you're a pioneer`;
      return "Your Ettajer journey starts here.";
    },
    buildSubheadline: ({
      founderNumber,
      isReturning,
      daysAsFounder,
      launchProgress,
      estimatedLaunch,
    }) => {
      if (isReturning) {
        if (daysAsFounder >= 7) {
          return `Day ${daysAsFounder} as ${formatFounderNumberShort(founderNumber)}. Platform is ${launchProgress}% ready — your dashboard unlocks at launch.`;
        }
        return `Your founder spot is secured. We're at ${launchProgress}% platform readiness — sit tight, we'll email you at launch.`;
      }
      if (founderNumber <= 10) {
        return `${formatFounderNumber(founderNumber)} puts you in the first 10. Your Ettajer journey starts here — launch is ${estimatedLaunch}.`;
      }
      return `You're ${formatFounderNumber(founderNumber)} of ${MAX_FOUNDERS}. Platform ${launchProgress}% ready — we'll notify you when your store dashboard unlocks.`;
    },
    buildStatusPill: ({ isReturning, founderNumber }) => {
      if (isReturning) return "Founder active";
      if (founderNumber <= 10) return "Pioneer founder";
      return "Early access";
    },
    buildNotification: ({ founderNumber, spotsLeft, estimatedLaunch }) => {
      if (founderNumber <= 10) {
        return {
          tone: "highlight" as const,
          message: `Pioneer perk: as ${formatFounderNumberShort(founderNumber)}, you're first in line when the dashboard goes live.`,
        };
      }
      if (spotsLeft <= 15) {
        return {
          tone: "info" as const,
          message: `Only ${spotsLeft} founder spots remain — you're already in.`,
        };
      }
      return {
        tone: "success" as const,
        message: `No action needed. We'll email you at launch (${estimatedLaunch}).`,
      };
    },
    buildRankLabel: (founderNumber) => {
      if (founderNumber <= 10) return "Top 10 pioneer";
      if (founderNumber <= 25) return "Top 25 early founder";
      return `Top ${Math.round((founderNumber / MAX_FOUNDERS) * 100)}%`;
    },
    launchPhaseLabel: (launchProgress) =>
      launchProgress >= 88 ? "Beta testing" : "Platform development",
  };
}

export { getFounderSeo } from "@/lib/founder/founder-seo";
export type { FounderSeoCopy } from "@/lib/founder/founder-seo";

export function getFounderFlowCopy(locale: LandingLocale): FounderFlowCopy {
  if (locale === "fr") return FR_COPY;
  if (locale === "ar") return AR_COPY;
  return EN_COPY;
}

export function getWaitingIntelligenceCopy(
  locale: LandingLocale,
): WaitingIntelligenceCopy {
  return buildWaitingIntelligenceCopy(locale);
}

export function formatJoinedDate(iso: string, locale: LandingLocale): string {
  return new Date(iso).toLocaleDateString(getDateLocale(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export { maskEmail };
