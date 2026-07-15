import type { LandingLocale } from "@/lib/landing/landing-i18n";

export type FounderCardSection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export type FounderTierRow = {
  range: string;
  label: string;
  description: string;
};

export type FounderCardFaq = {
  q: string;
  a: string;
};

export type FounderCardExplainerCopy = {
  pageUpdated: string;
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    lastUpdated: string;
  };
  stats: {
    joined: string;
    spotsLeft: string;
    filled: string;
    full: string;
  };
  preview: {
    label: string;
    tapHint: string;
    badge: string;
    swipeHint: string;
    demoName: string;
  };
  toc: {
    onThisPage: string;
    faqTitle: string;
  };
  intro: {
    body: string;
    related: string;
    createAccount: string;
    signIn: string;
    helpCenter: string;
  };
  tierTable: {
    range: string;
    tier: string;
    meaning: string;
  };
  cta: {
    fullTitle: string;
    readyTitle: string;
    fullBody: string;
    readyBody: (spotsLeft: number) => string;
    createAccount: string;
    claimCard: string;
    emailSupport: string;
  };
  backToTop: string;
  sections: FounderCardSection[];
  tierRows: FounderTierRow[];
  faq: FounderCardFaq[];
};

const EN: FounderCardExplainerCopy = {
  pageUpdated: "July 14, 2026",
  hero: {
    eyebrow: "Early access",
    title: "The Ettajer Founder Card",
    subtitle:
      "Everything you need to know about the exclusive membership card for the first 100 founding merchants — what it is, how to get it, and what you receive.",
    lastUpdated: "Last updated July 14, 2026",
  },
  stats: {
    joined: "Joined",
    spotsLeft: "Spots left",
    filled: "Filled",
    full: "Full",
  },
  preview: {
    label: "Live preview",
    tapHint: "Tap the card to flip front and back",
    badge: "Founder #0042 preview",
    swipeHint: "Swipe to view full card →",
    demoName: "Your Name",
  },
  toc: {
    onThisPage: "On this page",
    faqTitle: "10. Frequently asked questions",
  },
  intro: {
    body: "The Founder Card is Ettajer's way of honoring the first 100 merchants who join before public launch. It is your permanent identity in our community — with a collectible design, email delivery, and a PDF certificate you keep forever.",
    related: "Related:",
    createAccount: "Create account",
    signIn: "Sign in",
    helpCenter: "Help center",
  },
  tierTable: {
    range: "Number range",
    tier: "Tier",
    meaning: "Meaning",
  },
  cta: {
    fullTitle: "Founder program is full",
    readyTitle: "Ready to claim your card?",
    fullBody:
      "All 100 founder spots have been claimed. You can still sign up for Ettajer and join the waitlist for launch.",
    readyBody: (spotsLeft) =>
      `Only ${spotsLeft} founder cards remain. Create your free account, verify your email, and your card is issued instantly.`,
    createAccount: "Create account",
    claimCard: "Claim your founder card",
    emailSupport: "Email support",
  },
  backToTop: "Back to top",
  sections: [
    {
      id: "what-is-it",
      title: "1. What is the Founder Card?",
      paragraphs: [
        "The Ettajer Founder Card is a premium digital membership card issued to the first 100 merchants who join our platform during early access. It is not a payment card — it is your permanent founder identity inside the Ettajer community.",
        "Each card displays your legal name, a unique founder number (for example Founder #0042), your member ID, and Ettajer branding with a collectible, card-style design you can view, flip, save, and share.",
        "Your founder number is assigned once at signup and never changes. Lower numbers were claimed earlier — Founder #0001 was the very first merchant to believe in Ettajer.",
      ],
    },
    {
      id: "who-qualifies",
      title: "2. Who can get a founder card?",
      paragraphs: [
        "Founder cards are limited to the first 100 verified merchant accounts. When you create a free Ettajer account and complete email activation, you are automatically assigned the next available founder number — as long as spots remain.",
        "Once all 100 founder slots are filled, new signups can still create accounts but will not receive a founder number or card. The program is first-come, first-served.",
      ],
      bullets: [
        "You must create an account at ettajer.com/signup",
        "You must verify your email through the activation link we send",
        "Founder numbers are assigned in signup order — not chosen manually",
        "One founder card per person; numbers are non-transferable",
        "Available only while founder spots remain (100 total)",
      ],
    },
    {
      id: "how-to-claim",
      title: "3. How to claim yours",
      paragraphs: [
        "Getting your founder card takes a few minutes. After activation, you are redirected to your early access dashboard where the card is ready to view immediately.",
      ],
      bullets: [
        "Step 1 — Sign up free at /signup with your name, email, and password",
        "Step 2 — Open the activation email and verify your address",
        "Step 3 — Land on your welcome screen and view your founder card preview",
        "Step 4 — Sign in anytime at /login to access /early-access and your card tab",
        "Step 5 — Check your inbox for the founder welcome email with PNG + PDF attachments",
      ],
    },
    {
      id: "card-details",
      title: "4. What's on the card",
      paragraphs: [
        "The founder card is designed like a premium physical membership card, with a front and back you can flip on screen.",
      ],
      bullets: [
        "Front: Ettajer logo, gold EMV-style chip, your name, founder number badge, and Early Access Member status",
        "Back: Magnetic stripe styling, signature panel, unique member ID (ETJR-2026-XXXX format), and security details",
        "Interactive: Tap or click to flip; on desktop, subtle 3D tilt on hover",
        "Fixed size on mobile so the card never shrinks — scroll horizontally to view the full design",
      ],
    },
    {
      id: "benefits",
      title: "5. Founder benefits",
      paragraphs: [
        "Beyond the card itself, founders receive ongoing perks while Ettajer is in pre-launch and after public release.",
      ],
      bullets: [
        "Permanent founder number and digital card — proof you were here from the start",
        "Early access to new features before public launch",
        "Priority support — mention your founder number for faster help",
        "Exclusive partner rewards and promotions as the platform grows",
        "Founder-only updates on launch progress and product roadmap",
        "0 DH first month on every plan when billing begins",
      ],
    },
    {
      id: "tiers",
      title: "6. Founder tiers",
      paragraphs: [
        "All 100 founders receive the same core benefits, but your tier reflects how early you joined. Earlier numbers carry extra prestige in the community.",
      ],
    },
    {
      id: "email-certificate",
      title: "7. Email, PNG & PDF certificate",
      paragraphs: [
        "Shortly after you activate your account, Ettajer sends a founder welcome email to the address you registered with.",
      ],
      bullets: [
        "Inline card image embedded in the email body (viewable in most modern clients)",
        "Downloadable PNG: high-resolution founder card image for saving or sharing",
        "Downloadable PDF certificate: designed membership document with your founder number, issue date, benefits summary, and card visual",
        "If you don't see the email, check spam or contact support@ettajer.com with your registered email",
      ],
    },
    {
      id: "early-access",
      title: "8. Early access while you wait",
      paragraphs: [
        "Ettajer is still in pre-launch. After signup, founders enter the early access waiting experience — not the full merchant dashboard yet.",
        "On /early-access you can view your card, track launch progress, see how many founder spots are filled, read personalized updates, and contact support. Your store dashboard unlocks automatically at public launch.",
      ],
    },
    {
      id: "important-notes",
      title: "9. Important notes",
      paragraphs: ["Please keep these details in mind about the founder program."],
      bullets: [
        "The founder card is a digital membership identity — not a bank card or payment method",
        "Founder numbers cannot be sold, transferred, or reassigned to another person",
        "Deleting your account may forfeit your founder status permanently",
        "Founder pricing and promotional offers are subject to the Terms of Service",
        "Ettajer may update card design or certificate layout; your founder number remains the same",
      ],
    },
  ],
  tierRows: [
    {
      range: "#0001 – #0010",
      label: "Pioneer Founder",
      description: "The first 10 merchants — Ettajer's inner circle.",
    },
    {
      range: "#0011 – #0025",
      label: "Early Founder",
      description: "Joined in the first wave of believers.",
    },
    {
      range: "#0026 – #0050",
      label: "Founding Member",
      description: "First half of the founding merchant community.",
    },
    {
      range: "#0051 – #0100",
      label: "Founder Merchant",
      description: "Official member of the exclusive first 100.",
    },
  ],
  faq: [
    {
      q: "Is the founder card free?",
      a: "Yes. Creating your account and receiving a founder card is completely free while spots are available. No credit card is required to sign up.",
    },
    {
      q: "Can I choose my founder number?",
      a: "No. Numbers are assigned automatically in the order accounts are created and activated. The earlier you join, the lower your number.",
    },
    {
      q: "What if I sign up after 100 founders?",
      a: "You can still create an Ettajer account, but you will not receive a founder number or card. Only the first 100 activated merchants qualify.",
    },
    {
      q: "Where do I view my card after signup?",
      a: "Sign in and go to /early-access, or open the Card tab on mobile. You can also find PNG and PDF copies in your founder welcome email.",
    },
    {
      q: "Can I share my founder card?",
      a: "Yes. Save the PNG from your email or take a screenshot from your early access page. Many founders share their card on social media to show they were early.",
    },
    {
      q: "When does the full dashboard unlock?",
      a: "The merchant dashboard unlocks at public launch. Until then, founders use the early access waiting page and receive email updates on progress.",
    },
  ],
};

const FR: FounderCardExplainerCopy = {
  pageUpdated: "14 juillet 2026",
  hero: {
    eyebrow: "Accès anticipé",
    title: "La Carte Fondateur Ettajer",
    subtitle:
      "Tout ce qu'il faut savoir sur la carte d'adhésion exclusive des 100 premiers marchands fondateurs — ce qu'elle est, comment l'obtenir et ce que vous recevez.",
    lastUpdated: "Dernière mise à jour : 14 juillet 2026",
  },
  stats: {
    joined: "Inscrits",
    spotsLeft: "Places restantes",
    filled: "Rempli",
    full: "Complet",
  },
  preview: {
    label: "Aperçu en direct",
    tapHint: "Appuyez sur la carte pour la retourner",
    badge: "Aperçu Fondateur n°0042",
    swipeHint: "Glissez pour voir la carte entière →",
    demoName: "Votre nom",
  },
  toc: {
    onThisPage: "Sur cette page",
    faqTitle: "10. Questions fréquentes",
  },
  intro: {
    body: "La Carte Fondateur est la façon d'Ettajer d'honorer les 100 premiers marchands qui rejoignent avant le lancement public. C'est votre identité permanente dans notre communauté — avec un design collectionnable, une livraison par e-mail et un certificat PDF à garder pour toujours.",
    related: "Voir aussi :",
    createAccount: "Créer un compte",
    signIn: "Se connecter",
    helpCenter: "Centre d'aide",
  },
  tierTable: {
    range: "Plage de numéros",
    tier: "Niveau",
    meaning: "Signification",
  },
  cta: {
    fullTitle: "Le programme fondateur est complet",
    readyTitle: "Prêt à réclamer votre carte ?",
    fullBody:
      "Les 100 places fondateur ont été attribuées. Vous pouvez toujours vous inscrire sur Ettajer et rejoindre la liste d'attente pour le lancement.",
    readyBody: (spotsLeft) =>
      `Il ne reste que ${spotsLeft} cartes fondateur. Créez votre compte gratuit, vérifiez votre e-mail, et votre carte est émise instantanément.`,
    createAccount: "Créer un compte",
    claimCard: "Réclamer votre carte fondateur",
    emailSupport: "Contacter par e-mail",
  },
  backToTop: "Retour en haut",
  sections: [
    {
      id: "what-is-it",
      title: "1. Qu'est-ce que la Carte Fondateur ?",
      paragraphs: [
        "La Carte Fondateur Ettajer est une carte d'adhésion numérique premium délivrée aux 100 premiers marchands qui rejoignent la plateforme pendant l'accès anticipé. Ce n'est pas une carte de paiement — c'est votre identité fondateur permanente au sein de la communauté Ettajer.",
        "Chaque carte affiche votre nom légal, un numéro fondateur unique (par exemple Fondateur n°0042), votre ID membre et le branding Ettajer avec un design collectionnable que vous pouvez voir, retourner, enregistrer et partager.",
        "Votre numéro fondateur est attribué une seule fois à l'inscription et ne change jamais. Les numéros plus bas ont été réclamés plus tôt — le Fondateur n°0001 fut le tout premier marchand à croire en Ettajer.",
      ],
    },
    {
      id: "who-qualifies",
      title: "2. Qui peut obtenir une carte fondateur ?",
      paragraphs: [
        "Les cartes fondateur sont limitées aux 100 premiers comptes marchands vérifiés. Lorsque vous créez un compte Ettajer gratuit et activez votre e-mail, le prochain numéro fondateur disponible vous est automatiquement attribué — tant qu'il reste des places.",
        "Une fois les 100 places remplies, les nouvelles inscriptions peuvent toujours créer un compte mais ne recevront pas de numéro fondateur ni de carte. Le programme fonctionne selon le principe du premier arrivé, premier servi.",
      ],
      bullets: [
        "Vous devez créer un compte sur ettajer.com/signup",
        "Vous devez vérifier votre e-mail via le lien d'activation envoyé",
        "Les numéros fondateur sont attribués dans l'ordre d'inscription — pas choisis manuellement",
        "Une carte fondateur par personne ; les numéros ne sont pas transférables",
        "Disponible uniquement tant qu'il reste des places fondateur (100 au total)",
      ],
    },
    {
      id: "how-to-claim",
      title: "3. Comment obtenir la vôtre",
      paragraphs: [
        "Obtenir votre carte fondateur prend quelques minutes. Après activation, vous êtes redirigé vers votre tableau de bord d'accès anticipé où la carte est immédiatement visible.",
      ],
      bullets: [
        "Étape 1 — Inscrivez-vous gratuitement sur /signup avec nom, e-mail et mot de passe",
        "Étape 2 — Ouvrez l'e-mail d'activation et vérifiez votre adresse",
        "Étape 3 — Arrivez sur l'écran de bienvenue et prévisualisez votre carte",
        "Étape 4 — Connectez-vous à tout moment sur /login pour accéder à /early-access et l'onglet Carte",
        "Étape 5 — Consultez votre boîte mail pour l'e-mail de bienvenue avec pièces jointes PNG + PDF",
      ],
    },
    {
      id: "card-details",
      title: "4. Ce qui figure sur la carte",
      paragraphs: [
        "La carte fondateur est conçue comme une carte d'adhésion physique premium, avec un recto et un verso que vous pouvez retourner à l'écran.",
      ],
      bullets: [
        "Recto : logo Ettajer, puce dorée style EMV, votre nom, badge numéro fondateur et statut Membre accès anticipé",
        "Verso : bande magnétique stylisée, panneau signature, ID membre unique (format ETJR-2026-XXXX) et détails de sécurité",
        "Interactif : appuyez ou cliquez pour retourner ; sur ordinateur, léger effet 3D au survol",
        "Taille fixe sur mobile pour que la carte ne rétrécisse pas — faites défiler horizontalement pour voir le design complet",
      ],
    },
    {
      id: "benefits",
      title: "5. Avantages fondateur",
      paragraphs: [
        "Au-delà de la carte elle-même, les fondateurs bénéficient d'avantages continus pendant la pré-lancement et après la sortie publique.",
      ],
      bullets: [
        "Numéro fondateur permanent et carte numérique — preuve que vous étiez là dès le début",
        "Accès anticipé aux nouvelles fonctionnalités avant le lancement public",
        "Support prioritaire — mentionnez votre numéro fondateur pour une aide plus rapide",
        "Récompenses et promotions partenaires exclusives au fil de la croissance de la plateforme",
        "Mises à jour réservées aux fondateurs sur l'avancement du lancement et la feuille de route",
        "0 DH le premier mois sur chaque forfait au début de la facturation",
      ],
    },
    {
      id: "tiers",
      title: "6. Niveaux fondateur",
      paragraphs: [
        "Les 100 fondateurs reçoivent les mêmes avantages de base, mais votre niveau reflète votre ancienneté. Les numéros plus bas ont plus de prestige dans la communauté.",
      ],
    },
    {
      id: "email-certificate",
      title: "7. E-mail, PNG et certificat PDF",
      paragraphs: [
        "Peu après l'activation de votre compte, Ettajer envoie un e-mail de bienvenue fondateur à l'adresse enregistrée.",
      ],
      bullets: [
        "Image de carte intégrée dans le corps de l'e-mail (visible dans la plupart des clients modernes)",
        "PNG téléchargeable : image haute résolution de la carte pour enregistrer ou partager",
        "Certificat PDF téléchargeable : document d'adhésion avec numéro fondateur, date d'émission, résumé des avantages et visuel de la carte",
        "Si vous ne voyez pas l'e-mail, vérifiez les spams ou contactez support@ettajer.com avec votre e-mail enregistré",
      ],
    },
    {
      id: "early-access",
      title: "8. Accès anticipé en attendant",
      paragraphs: [
        "Ettajer est encore en pré-lancement. Après inscription, les fondateurs entrent dans l'expérience d'attente d'accès anticipé — pas encore le tableau de bord marchand complet.",
        "Sur /early-access vous pouvez voir votre carte, suivre l'avancement du lancement, voir combien de places sont remplies, lire des mises à jour personnalisées et contacter le support. Votre tableau de bord boutique se débloque automatiquement au lancement public.",
      ],
    },
    {
      id: "important-notes",
      title: "9. Notes importantes",
      paragraphs: ["Gardez ces points en tête concernant le programme fondateur."],
      bullets: [
        "La carte fondateur est une identité d'adhésion numérique — pas une carte bancaire ni un moyen de paiement",
        "Les numéros fondateur ne peuvent être vendus, transférés ou réattribués à une autre personne",
        "Supprimer votre compte peut faire perdre définitivement votre statut fondateur",
        "Les tarifs et offres promotionnelles fondateur sont soumis aux Conditions d'utilisation",
        "Ettajer peut mettre à jour le design de la carte ou du certificat ; votre numéro fondateur reste le même",
      ],
    },
  ],
  tierRows: [
    {
      range: "#0001 – #0010",
      label: "Fondateur Pionnier",
      description: "Les 10 premiers marchands — le cercle intérieur d'Ettajer.",
    },
    {
      range: "#0011 – #0025",
      label: "Fondateur Précoce",
      description: "Rejoints dans la première vague de convaincus.",
    },
    {
      range: "#0026 – #0050",
      label: "Membre Fondateur",
      description: "Première moitié de la communauté marchande fondatrice.",
    },
    {
      range: "#0051 – #0100",
      label: "Marchand Fondateur",
      description: "Membre officiel des 100 premiers exclusifs.",
    },
  ],
  faq: [
    {
      q: "La carte fondateur est-elle gratuite ?",
      a: "Oui. Créer votre compte et recevoir une carte fondateur est entièrement gratuit tant qu'il reste des places. Aucune carte bancaire n'est requise pour s'inscrire.",
    },
    {
      q: "Puis-je choisir mon numéro fondateur ?",
      a: "Non. Les numéros sont attribués automatiquement dans l'ordre de création et d'activation des comptes. Plus vous rejoignez tôt, plus votre numéro est bas.",
    },
    {
      q: "Et si je m'inscris après les 100 fondateurs ?",
      a: "Vous pouvez toujours créer un compte Ettajer, mais vous ne recevrez pas de numéro fondateur ni de carte. Seuls les 100 premiers marchands activés sont éligibles.",
    },
    {
      q: "Où voir ma carte après inscription ?",
      a: "Connectez-vous et allez sur /early-access, ou ouvrez l'onglet Carte sur mobile. Vous trouverez aussi les copies PNG et PDF dans votre e-mail de bienvenue fondateur.",
    },
    {
      q: "Puis-je partager ma carte fondateur ?",
      a: "Oui. Enregistrez le PNG de votre e-mail ou faites une capture depuis votre page d'accès anticipé. Beaucoup de fondateurs partagent leur carte sur les réseaux sociaux.",
    },
    {
      q: "Quand le tableau de bord complet se débloque-t-il ?",
      a: "Le tableau de bord marchand se débloque au lancement public. D'ici là, les fondateurs utilisent la page d'attente d'accès anticipé et reçoivent des mises à jour par e-mail.",
    },
  ],
};

const AR: FounderCardExplainerCopy = {
  pageUpdated: "14 يوليو 2026",
  hero: {
    eyebrow: "الوصول المبكر",
    title: "بطاقة المؤسس Ettajer",
    subtitle:
      "كل ما تحتاج معرفته عن بطاقة العضوية الحصرية لأول 100 تاجر مؤسس — ما هي، وكيف تحصل عليها، وماذا تستلم.",
    lastUpdated: "آخر تحديث: 14 يوليو 2026",
  },
  stats: {
    joined: "انضموا",
    spotsLeft: "المقاعد المتبقية",
    filled: "ممتلئ",
    full: "مكتمل",
  },
  preview: {
    label: "معاينة مباشرة",
    tapHint: "اضغط على البطاقة لقلب الوجهين",
    badge: "معاينة المؤسس رقم 0042",
    swipeHint: "اسحب لعرض البطاقة كاملة ←",
    demoName: "اسمك",
  },
  toc: {
    onThisPage: "في هذه الصفحة",
    faqTitle: "10. الأسئلة الشائعة",
  },
  intro: {
    body: "بطاقة المؤسس هي طريقة Ettajer لتكريم أول 100 تاجر ينضمون قبل الإطلاق العام. إنها هويتك الدائمة في مجتمعنا — بتصميم قابل للجمع، وتسليم عبر البريد، وشهادة PDF تحتفظ بها للأبد.",
    related: "روابط ذات صلة:",
    createAccount: "إنشاء حساب",
    signIn: "تسجيل الدخول",
    helpCenter: "مركز المساعدة",
  },
  tierTable: {
    range: "نطاق الأرقام",
    tier: "المستوى",
    meaning: "المعنى",
  },
  cta: {
    fullTitle: "برنامج المؤسسين مكتمل",
    readyTitle: "مستعد للحصول على بطاقتك؟",
    fullBody:
      "تم حجز جميع مقاعد الـ 100 مؤسس. يمكنك التسجيل في Ettajer والانضمام لقائمة انتظار الإطلاق.",
    readyBody: (spotsLeft) =>
      `تبقى ${spotsLeft} بطاقة مؤسس فقط. أنشئ حسابك المجاني، فعّل بريدك، وستُصدر بطاقتك فوراً.`,
    createAccount: "إنشاء حساب",
    claimCard: "احصل على بطاقة المؤسس",
    emailSupport: "راسل الدعم",
  },
  backToTop: "العودة للأعلى",
  sections: [
    {
      id: "what-is-it",
      title: "1. ما هي بطاقة المؤسس؟",
      paragraphs: [
        "بطاقة المؤسس Ettajer هي بطاقة عضوية رقمية مميزة تُمنح لأول 100 تاجر ينضمون للمنصة خلال الوصول المبكر. ليست بطاقة دفع — بل هويتك الدائمة كمؤسس داخل مجتمع Ettajer.",
        "تعرض كل بطاقة اسمك القانوني، ورقماً فريداً للمؤسس (مثل المؤسس رقم 0042)، ومعرّف العضو، وهوية Ettajer بتصميم بطاقة قابل للجمع يمكنك عرضه وقلبه وحفظه ومشاركته.",
        "يُمنح رقم المؤسس مرة واحدة عند التسجيل ولا يتغير. الأرقام الأقل حُجزت أولاً — المؤسس رقم 0001 كان أول تاجر يؤمن بـ Ettajer.",
      ],
    },
    {
      id: "who-qualifies",
      title: "2. من يمكنه الحصول على بطاقة مؤسس؟",
      paragraphs: [
        "بطاقات المؤسس محدودة بأول 100 حساب تاجر موثّق. عند إنشاء حساب Ettajer مجاني وتفعيل البريد، يُخصص لك تلقائياً الرقم التالي المتاح — ما دامت المقاعد متوفرة.",
        "عند اكتمال الـ 100 مقعد، يمكن للمسجلين الجدد إنشاء حساب لكن لن يحصلوا على رقم مؤسس أو بطاقة. البرنامج بأساس من سبق له الحجز.",
      ],
      bullets: [
        "يجب إنشاء حساب على ettajer.com/signup",
        "يجب تفعيل البريد عبر رابط التفعيل المرسل",
        "أرقام المؤسس تُخصص بترتيب التسجيل — لا يمكن اختيارها يدوياً",
        "بطاقة مؤسس واحدة لكل شخص؛ الأرقام غير قابلة للنقل",
        "متاحة فقط ما دامت مقاعد المؤسس متبقية (100 إجمالاً)",
      ],
    },
    {
      id: "how-to-claim",
      title: "3. كيف تحصل على بطاقتك",
      paragraphs: [
        "الحصول على بطاقة المؤسس يستغرق دقائق. بعد التفعيل، تُوجَّه إلى لوحة الوصول المبكر حيث البطاقة جاهزة للعرض فوراً.",
      ],
      bullets: [
        "الخطوة 1 — سجّل مجاناً على /signup بالاسم والبريد وكلمة المرور",
        "الخطوة 2 — افتح بريد التفعيل وفعّل عنوانك",
        "الخطوة 3 — انتقل لشاشة الترحيب واعرض معاينة بطاقتك",
        "الخطوة 4 — سجّل الدخول في أي وقت على /login للوصول إلى /early-access وتبويب البطاقة",
        "الخطوة 5 — راجع بريدك لرسالة ترحيب المؤسس مع مرفقات PNG + PDF",
      ],
    },
    {
      id: "card-details",
      title: "4. ما على البطاقة",
      paragraphs: [
        "صُممت بطاقة المؤسس كبطاقة عضوية فاخرة بوجهين يمكن قلبهما على الشاشة.",
      ],
      bullets: [
        "الوجه الأمامي: شعار Ettajer، شريحة ذهبية، اسمك، شارة رقم المؤسس، وحالة عضو الوصول المبكر",
        "الخلف: شريط مغناطيسي، لوحة توقيع، معرّف عضو فريد (ETJR-2026-XXXX) وتفاصيل أمنية",
        "تفاعلي: اضغط للقلب؛ على سطح المكتب ميل ثلاثي الأبعاد خفيف عند التمرير",
        "حجم ثابت على الجوال حتى لا تتقلص البطاقة — مرّر أفقياً لرؤية التصميم كاملاً",
      ],
    },
    {
      id: "benefits",
      title: "5. مزايا المؤسس",
      paragraphs: [
        "بجانب البطاقة نفسها، يحصل المؤسسون على مزايا مستمرة قبل الإطلاق وبعده.",
      ],
      bullets: [
        "رقم مؤسس دائم وبطاقة رقمية — دليل أنك كنت هنا من البداية",
        "وصول مبكر للميزات الجديدة قبل الإطلاق العام",
        "دعم أولوي — اذكر رقم المؤسس للمساعدة الأسرع",
        "مكافآت وعروض شركاء حصرية مع نمو المنصة",
        "تحديثات خاصة بالمؤسسين عن تقدم الإطلاق وخارطة الطريق",
        "0 درهم الشهر الأول على كل خطة عند بدء الفوترة",
      ],
    },
    {
      id: "tiers",
      title: "6. مستويات المؤسس",
      paragraphs: [
        "يحصل الـ 100 مؤسس على نفس المزايا الأساسية، لكن مستواك يعكس مدى مبكر انضمامك. الأرقام الأقل تحمل مكانة أكبر في المجتمع.",
      ],
    },
    {
      id: "email-certificate",
      title: "7. البريد وPNG وشهادة PDF",
      paragraphs: [
        "بعد تفعيل حسابك بقليل، يرسل Ettajer بريد ترحيب مؤسس إلى عنوانك المسجّل.",
      ],
      bullets: [
        "صورة البطاقة مضمّنة في نص البريد (تظهر في معظم العملاء الحديثة)",
        "PNG قابل للتنزيل: صورة عالية الدقة للحفظ أو المشاركة",
        "شهادة PDF: وثيقة عضوية برقم المؤسس وتاريخ الإصدار وملخص المزايا وصورة البطاقة",
        "إن لم تجد البريد، راجع البريد المزعج أو تواصل مع support@ettajer.com",
      ],
    },
    {
      id: "early-access",
      title: "8. الوصول المبكر أثناء الانتظار",
      paragraphs: [
        "Ettajer لا يزال في مرحلة ما قبل الإطلاق. بعد التسجيل يدخل المؤسسون تجربة انتظار الوصول المبكر — وليس لوحة التاجر الكاملة بعد.",
        "على /early-access يمكنك عرض بطاقتك، متابعة تقدم الإطلاق، رؤية المقاعد المملوءة، قراءة تحديثات مخصصة والتواصل مع الدعم. تُفتح لوحة متجرك تلقائياً عند الإطلاق العام.",
      ],
    },
    {
      id: "important-notes",
      title: "9. ملاحظات مهمة",
      paragraphs: ["يرجى مراعاة هذه النقاط حول برنامج المؤسس."],
      bullets: [
        "بطاقة المؤسس هوية عضوية رقمية — وليست بطاقة بنكية أو وسيلة دفع",
        "لا يمكن بيع أو نقل أو إعادة تخصيص أرقام المؤسس",
        "حذف حسابك قد يفقدك حالة المؤسس نهائياً",
        "أسعار وعروض المؤسس تخضع لشروط الخدمة",
        "قد يحدّث Ettajer تصميم البطاقة أو الشهادة؛ رقم المؤسس يبقى كما هو",
      ],
    },
  ],
  tierRows: [
    {
      range: "#0001 – #0010",
      label: "مؤسس رائد",
      description: "أول 10 تجار — الدائرة الداخلية لـ Ettajer.",
    },
    {
      range: "#0011 – #0025",
      label: "مؤسس مبكر",
      description: "انضموا في الموجة الأولى من المؤمنين.",
    },
    {
      range: "#0026 – #0050",
      label: "عضو مؤسس",
      description: "النصف الأول من مجتمع التجار المؤسسين.",
    },
    {
      range: "#0051 – #0100",
      label: "تاجر مؤسس",
      description: "عضو رسمي في الـ 100 الأوائل الحصريين.",
    },
  ],
  faq: [
    {
      q: "هل بطاقة المؤسس مجانية؟",
      a: "نعم. إنشاء الحساب والحصول على البطاقة مجاني تماماً ما دامت المقاعد متاحة. لا حاجة لبطاقة بنكية للتسجيل.",
    },
    {
      q: "هل يمكنني اختيار رقم المؤسس؟",
      a: "لا. تُخصص الأرقام تلقائياً بترتيب إنشاء وتفعيل الحسابات. كلما انضممت أبكر، كان رقمك أقل.",
    },
    {
      q: "ماذا لو سجلت بعد الـ 100 مؤسس؟",
      a: "يمكنك إنشاء حساب Ettajer، لكن لن تحصل على رقم مؤسس أو بطاقة. فقط أول 100 تاجر مفعّل مؤهلون.",
    },
    {
      q: "أين أعرض بطاقتي بعد التسجيل؟",
      a: "سجّل الدخول واذهب إلى /early-access، أو افتح تبويب البطاقة على الجوال. ستجد أيضاً نسخ PNG وPDF في بريد الترحيب.",
    },
    {
      q: "هل يمكنني مشاركة بطاقة المؤسس؟",
      a: "نعم. احفظ PNG من بريدك أو التقط شاشة من صفحة الوصول المبكر. يشارك كثير من المؤسسين بطاقتهم على وسائل التواصل.",
    },
    {
      q: "متى تُفتح لوحة التحكم الكاملة؟",
      a: "تُفتح لوحة التاجر عند الإطلاق العام. حتى ذلك الحين يستخدم المؤسسون صفحة الانتظار ويتلقون تحديثات بالبريد.",
    },
  ],
};

const COPIES: Record<LandingLocale, FounderCardExplainerCopy> = {
  en: EN,
  fr: FR,
  ar: AR,
};

export function getFounderCardExplainerCopy(
  locale: LandingLocale,
): FounderCardExplainerCopy {
  return COPIES[locale] ?? EN;
}
