import type { LandingLocale } from "@/lib/landing/landing-i18n";
import type { PageSeoCopy } from "@/lib/seo/types";
import type { ContactSupportInput } from "@/lib/validations/contact";

export type ContactTopic = ContactSupportInput["topic"];

export type ContactTopicOption = {
  value: ContactTopic;
  label: string;
};

export type ContactStat = {
  value: string;
  label: string;
};

export type ContactPageCopy = {
  metadata: {
    title: string;
    description: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    statsAria: string;
  };
  stats: ContactStat[];
  sidebar: {
    title: string;
    subtitle: string;
    emailTitle: string;
    emailHint: string;
    responseTimeTitle: string;
    responseTimeBody: string;
    helpCenterTitle: string;
    helpCenterBody: string;
    promoTitle: string;
    promoBody: string;
    seePricing: string;
  };
  form: {
    title: string;
    subtitle: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    topicLabel: string;
    messageLabel: string;
    messagePlaceholder: string;
    submit: string;
    submitting: string;
  };
  success: {
    title: string;
    body: (supportEmail: string) => string;
    sendAnother: string;
    backHome: string;
  };
  cta: {
    title: string;
    subtitle: string;
    button: string;
  };
  articlePrefill: (articleRef: string) => string;
};

export type ContactApiCopy = {
  success: string;
  failedToSend: string;
  invalidFormData: string;
  validation: {
    nameRequired: string;
    invalidEmail: string;
    messageMinLength: string;
  };
};

const TOPIC_VALUES: ContactTopic[] = [
  "general",
  "billing",
  "technical",
  "cod",
  "migration",
];

const EN_TOPICS: Record<ContactTopic, string> = {
  general: "General question",
  billing: "Billing & plans",
  technical: "Technical issue",
  cod: "COD & checkout",
  migration: "Store migration",
};

const FR_TOPICS: Record<ContactTopic, string> = {
  general: "Question générale",
  billing: "Facturation et forfaits",
  technical: "Problème technique",
  cod: "Paiement à la livraison",
  migration: "Migration de boutique",
};

const AR_TOPICS: Record<ContactTopic, string> = {
  general: "سؤال عام",
  billing: "الفوترة والخطط",
  technical: "مشكلة تقنية",
  cod: "الدفع عند الاستلام",
  migration: "نقل المتجر",
};

const EN: ContactPageCopy = {
  metadata: {
    title: "Contact Support",
    description:
      "Get help with Ettajer — plans, COD checkout, migrations, and technical support.",
  },
  hero: {
    eyebrow: "Contact support",
    title: "We're here to help.",
    subtitle:
      "Plans, COD setup, migrations, or technical issues — send a message and our team will get back to you by email.",
    statsAria: "Support stats",
  },
  stats: [
    { value: "< 24h", label: "Typical reply" },
    { value: "Mon–Fri", label: "Support hours" },
    { value: "Morocco", label: "Local team" },
  ],
  sidebar: {
    title: "Other ways to reach us",
    subtitle: "Prefer email or self-serve? Use any of the options below.",
    emailTitle: "Email",
    emailHint: "Replies go directly to you",
    responseTimeTitle: "Response time",
    responseTimeBody: "Monday – Friday, within 24 hours",
    helpCenterTitle: "Help center",
    helpCenterBody: "Browse frequently asked questions",
    promoTitle: "Growing your store?",
    promoBody: "New merchants get their first month at 0 DH on every plan.",
    seePricing: "See pricing",
  },
  form: {
    title: "Send us a message",
    subtitle: "Tell us what you need — we'll reply to the email you provide.",
    nameLabel: "Full name",
    namePlaceholder: "Yasmine El Amrani",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    topicLabel: "Topic",
    messageLabel: "Message",
    messagePlaceholder:
      "Tell us how we can help — include your store URL if you already have one.",
    submit: "Send message",
    submitting: "Sending...",
  },
  success: {
    title: "Message sent",
    body: (supportEmail) =>
      `A confirmation was sent to your inbox. Our team at ${supportEmail} will reply within one business day.`,
    sendAnother: "Send another message",
    backHome: "Back to home",
  },
  cta: {
    title: "Ready to launch your store?",
    subtitle:
      "Start free, customize with the visual builder, and go live with COD checkout in minutes.",
    button: "Start for free",
  },
  articlePrefill: (articleRef) =>
    `I read the help article "${articleRef}" and still need assistance with:\n\n`,
};

const FR: ContactPageCopy = {
  metadata: {
    title: "Contacter le support",
    description:
      "Obtenez de l'aide sur Ettajer — forfaits, paiement à la livraison, migrations et support technique.",
  },
  hero: {
    eyebrow: "Contacter le support",
    title: "Nous sommes là pour vous aider.",
    subtitle:
      "Forfaits, configuration du paiement à la livraison, migrations ou problèmes techniques — envoyez-nous un message et notre équipe vous répondra par e-mail.",
    statsAria: "Statistiques du support",
  },
  stats: [
    { value: "< 24 h", label: "Délai de réponse" },
    { value: "Lun–Ven", label: "Horaires du support" },
    { value: "Maroc", label: "Équipe locale" },
  ],
  sidebar: {
    title: "Autres moyens de nous joindre",
    subtitle:
      "Vous préférez l'e-mail ou l'auto-assistance ? Utilisez l'une des options ci-dessous.",
    emailTitle: "E-mail",
    emailHint: "Les réponses vous sont envoyées directement",
    responseTimeTitle: "Délai de réponse",
    responseTimeBody: "Du lundi au vendredi, sous 24 heures",
    helpCenterTitle: "Centre d'aide",
    helpCenterBody: "Parcourez les questions fréquentes",
    promoTitle: "Vous développez votre boutique ?",
    promoBody:
      "Les nouveaux marchands bénéficient du premier mois à 0 DH sur tous les forfaits.",
    seePricing: "Voir les tarifs",
  },
  form: {
    title: "Envoyez-nous un message",
    subtitle:
      "Dites-nous ce dont vous avez besoin — nous répondrons à l'adresse e-mail indiquée.",
    nameLabel: "Nom complet",
    namePlaceholder: "Yasmine El Amrani",
    emailLabel: "E-mail",
    emailPlaceholder: "vous@exemple.com",
    topicLabel: "Sujet",
    messageLabel: "Message",
    messagePlaceholder:
      "Dites-nous comment nous pouvons vous aider — incluez l'URL de votre boutique si vous en avez déjà une.",
    submit: "Envoyer le message",
    submitting: "Envoi en cours...",
  },
  success: {
    title: "Message envoyé",
    body: (supportEmail) =>
      `Une confirmation a été envoyée dans votre boîte de réception. Notre équipe à ${supportEmail} vous répondra sous un jour ouvrable.`,
    sendAnother: "Envoyer un autre message",
    backHome: "Retour à l'accueil",
  },
  cta: {
    title: "Prêt à lancer votre boutique ?",
    subtitle:
      "Commencez gratuitement, personnalisez avec l'éditeur visuel et mettez en ligne le paiement à la livraison en quelques minutes.",
    button: "Commencer gratuitement",
  },
  articlePrefill: (articleRef) =>
    `J'ai lu l'article d'aide « ${articleRef} » et j'ai encore besoin d'assistance pour :\n\n`,
};

const AR: ContactPageCopy = {
  metadata: {
    title: "اتصل بالدعم",
    description:
      "احصل على المساعدة في Ettajer — الخطط، الدفع عند الاستلام، نقل المتاجر، والدعم التقني.",
  },
  hero: {
    eyebrow: "اتصل بالدعم",
    title: "نحن هنا لمساعدتك.",
    subtitle:
      "الخطط، إعداد الدفع عند الاستلام، نقل المتاجر، أو المشاكل التقنية — أرسل رسالة وسيرد فريقنا عليك عبر البريد الإلكتروني.",
    statsAria: "إحصائيات الدعم",
  },
  stats: [
    { value: "أقل من 24 ساعة", label: "مدة الرد المعتادة" },
    { value: "الإثنين–الجمعة", label: "ساعات الدعم" },
    { value: "المغرب", label: "فريق محلي" },
  ],
  sidebar: {
    title: "طرق أخرى للتواصل معنا",
    subtitle: "تفضّل البريد الإلكتروني أو المساعدة الذاتية؟ استخدم أيًا من الخيارات أدناه.",
    emailTitle: "البريد الإلكتروني",
    emailHint: "الردود تصل إليك مباشرة",
    responseTimeTitle: "مدة الرد",
    responseTimeBody: "من الإثنين إلى الجمعة، خلال 24 ساعة",
    helpCenterTitle: "مركز المساعدة",
    helpCenterBody: "تصفّح الأسئلة الشائعة",
    promoTitle: "تنمّي متجرك؟",
    promoBody: "يحصل التجار الجدد على الشهر الأول بـ 0 درهم على جميع الخطط.",
    seePricing: "عرض الأسعار",
  },
  form: {
    title: "أرسل لنا رسالة",
    subtitle: "أخبرنا بما تحتاج — سنرد على البريد الإلكتروني الذي تقدّمه.",
    nameLabel: "الاسم الكامل",
    namePlaceholder: "ياسمين الأمراني",
    emailLabel: "البريد الإلكتروني",
    emailPlaceholder: "you@example.com",
    topicLabel: "الموضوع",
    messageLabel: "الرسالة",
    messagePlaceholder:
      "أخبرنا كيف يمكننا مساعدتك — أضف رابط متجرك إن كان لديك واحد.",
    submit: "إرسال الرسالة",
    submitting: "جارٍ الإرسال...",
  },
  success: {
    title: "تم إرسال الرسالة",
    body: (supportEmail) =>
      `تم إرسال تأكيد إلى بريدك. سيرد فريقنا على ${supportEmail} خلال يوم عمل واحد.`,
    sendAnother: "إرسال رسالة أخرى",
    backHome: "العودة إلى الصفحة الرئيسية",
  },
  cta: {
    title: "مستعد لإطلاق متجرك؟",
    subtitle:
      "ابدأ مجانًا، خصّص واجهتك بالمحرّر المرئي، وانطلق مع الدفع عند الاستلام في دقائق.",
    button: "ابدأ مجانًا",
  },
  articlePrefill: (articleRef) =>
    `قرأت مقال المساعدة «${articleRef}» وما زلت بحاجة إلى مساعدة بخصوص:\n\n`,
};

const EN_API: ContactApiCopy = {
  success: "Your message has been sent. We'll get back to you soon.",
  failedToSend: "Failed to send message",
  invalidFormData: "Invalid form data",
  validation: {
    nameRequired: "Name is required",
    invalidEmail: "Enter a valid email",
    messageMinLength: "Message must be at least 10 characters",
  },
};

const FR_API: ContactApiCopy = {
  success: "Votre message a été envoyé. Nous vous répondrons bientôt.",
  failedToSend: "Échec de l'envoi du message",
  invalidFormData: "Données du formulaire invalides",
  validation: {
    nameRequired: "Le nom est requis",
    invalidEmail: "Entrez une adresse e-mail valide",
    messageMinLength: "Le message doit contenir au moins 10 caractères",
  },
};

const AR_API: ContactApiCopy = {
  success: "تم إرسال رسالتك. سنعود إليك قريبًا.",
  failedToSend: "فشل إرسال الرسالة",
  invalidFormData: "بيانات النموذج غير صالحة",
  validation: {
    nameRequired: "الاسم مطلوب",
    invalidEmail: "أدخل بريدًا إلكترونيًا صالحًا",
    messageMinLength: "يجب أن تحتوي الرسالة على 10 أحرف على الأقل",
  },
};

const PAGE_COPY: Record<LandingLocale, ContactPageCopy> = { en: EN, fr: FR, ar: AR };
const API_COPY: Record<LandingLocale, ContactApiCopy> = { en: EN_API, fr: FR_API, ar: AR_API };
const TOPIC_LABELS: Record<LandingLocale, Record<ContactTopic, string>> = {
  en: EN_TOPICS,
  fr: FR_TOPICS,
  ar: AR_TOPICS,
};

const VALIDATION_MESSAGE_MAP: Record<string, keyof ContactApiCopy["validation"]> = {
  [EN_API.validation.nameRequired]: "nameRequired",
  [EN_API.validation.invalidEmail]: "invalidEmail",
  [EN_API.validation.messageMinLength]: "messageMinLength",
};

export function getContactCopy(locale: LandingLocale): ContactPageCopy {
  return PAGE_COPY[locale] ?? PAGE_COPY.en;
}

export function getContactSeo(locale: LandingLocale): PageSeoCopy {
  return getContactCopy(locale).metadata;
}

export function getContactApiCopy(locale: LandingLocale): ContactApiCopy {
  return API_COPY[locale] ?? API_COPY.en;
}

export function getContactTopics(locale: LandingLocale): ContactTopicOption[] {
  const labels = TOPIC_LABELS[locale] ?? TOPIC_LABELS.en;
  return TOPIC_VALUES.map((value) => ({ value, label: labels[value] }));
}

export function getContactTopicLabel(
  locale: LandingLocale,
  topic: ContactTopic | string,
): string {
  const labels = TOPIC_LABELS[locale] ?? TOPIC_LABELS.en;
  if (topic in labels) {
    return labels[topic as ContactTopic];
  }
  return topic;
}

export function localizeContactValidationMessage(
  locale: LandingLocale,
  message: string | undefined,
): string {
  const api = getContactApiCopy(locale);
  const key = message ? VALIDATION_MESSAGE_MAP[message] : undefined;
  if (key) return api.validation[key];
  return message ?? api.invalidFormData;
}
