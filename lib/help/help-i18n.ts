import type { HelpArticle } from "@/lib/help/help-data";

export type HelpLocale = "en" | "fr" | "ar";

export const HELP_LOCALE_LABELS: Record<HelpLocale, string> = {
  en: "EN",
  fr: "FR",
  ar: "AR",
};

type LocalizedArticle = {
  title: string;
  excerpt: string;
  body: string[];
};

export const HELP_TRANSLATIONS: Record<
  string,
  Partial<Record<HelpLocale, LocalizedArticle>>
> = {
  "how-long-does-setup-take": {
    fr: {
      title: "Combien de temps prend la configuration ?",
      excerpt:
        "La plupart des marchands lancent leur boutique en moins de cinq minutes.",
      body: [
        "Ettajer est conçu pour la rapidité. Après inscription, choisissez un modèle et personnalisez visuellement — sans code.",
        "La plupart des marchands publient leur première boutique en moins de cinq minutes. Import produits, COD et domaine peuvent suivre.",
        "Besoin d'aide ? Contactez le support depuis le centre d'aide.",
      ],
    },
    ar: {
      title: "كم يستغرق الإعداد؟",
      excerpt: "يُطلق أغلب التجار متاجرهم في أقل من خمس دقائق.",
      body: [
        "إيتاجر مبني للسرعة. بعد التسجيل، اختر قالباً وعدّل واجهة متجرك بصرياً دون برمجة.",
        "يُنشر أغلب التجار متجرهم الأول في أقل من خمس دقائق. يمكن إضافة المنتجات والدفع عند الاستلام والنطاق لاحقاً.",
        "للمساعدة، تواصل مع الدعم من مركز المساعدة.",
      ],
    },
  },
  "how-cod-checkout-works": {
    fr: {
      title: "Comment fonctionne le paiement à la livraison ?",
      excerpt: "Le COD est intégré — aucune passerelle de paiement requise.",
      body: [
        "Ettajer inclut le paiement à la livraison. Les clients saisissent nom, téléphone, ville et adresse.",
        "Activez le COD dans Paramètres → Paiement. La vérification par téléphone réduit les fausses commandes.",
        "Les commandes apparaissent dans Tableau de bord → Commandes avec tous les détails client.",
      ],
    },
    ar: {
      title: "كيف يعمل الدفع عند الاستلام؟",
      excerpt: "الدفع عند الاستلام مدمج — لا حاجة لبوابة دفع.",
      body: [
        "يتضمن إيتاجر الدفع عند الاستلام. يُدخل المشتري الاسم والهاتف والمدينة والعنوان.",
        "فعّل الدفع عند الاستلام من الإعدادات → الدفع. التحقق بالهاتف يقلل الطلبات الوهمية.",
        "تظهر الطلبات في لوحة التحكم → الطلبات مع بيانات العميل كاملة.",
      ],
    },
  },
  "reduce-fake-cod-orders": {
    fr: {
      title: "Réduire les fausses commandes COD",
      excerpt: "Vérification SMS et WhatsApp avant expédition.",
      body: [
        "Les fausses commandes COD sont fréquentes au Maroc. Ettajer permet la confirmation par SMS ou WhatsApp.",
        "Activez la vérification dans Paramètres → Paiement → Vérification COD.",
        "Les marchands constatent une baisse notable des livraisons refusées après activation.",
      ],
    },
    ar: {
      title: "تقليل الطلبات الوهمية عند الاستلام",
      excerpt: "التحقق عبر SMS وواتساب قبل الشحن.",
      body: [
        "الطلبات الوهمية شائعة في المغرب. يتيح إيتاجر التأكيد عبر SMS أو واتساب.",
        "فعّل التحقق من الإعدادات → الدفع → تحقق COD.",
        "يلاحظ التجار انخفاضاً ملحوظاً في التسليمات المرفوضة بعد التفعيل.",
      ],
    },
  },
  "create-your-first-product": {
    fr: {
      title: "Créer votre premier produit",
      excerpt: "Photos, prix, variantes et stock dans le tableau de bord.",
      body: [
        "Allez dans Tableau de bord → Produits → Ajouter un produit.",
        "Les produits publiés apparaissent immédiatement sur la boutique.",
        "Utilisez collections et catégories pour organiser votre catalogue mobile.",
      ],
    },
    ar: {
      title: "إنشاء أول منتج",
      excerpt: "الصور والسعر والمتغيرات والمخزون من لوحة التحكم.",
      body: [
        "اذهب إلى لوحة التحكم → المنتجات → إضافة منتج.",
        "تظهر المنتجات المنشورة فوراً على المتجر.",
        "استخدم المجموعات والفئات لتنظيم الكتالوج على الجوال.",
      ],
    },
  },
  "connect-a-custom-domain": {
    fr: {
      title: "Connecter un domaine personnalisé",
      excerpt: "Votre domaine avec SSL et CDN automatiques.",
      body: [
        "Boutique en ligne → Domaines. Entrez votre nom de domaine et suivez les instructions DNS.",
        "Le SSL est provisionné automatiquement après propagation DNS.",
        "Domaines personnalisés sur tous les plans payants.",
      ],
    },
    ar: {
      title: "ربط نطاق مخصص",
      excerpt: "نطاقك مع SSL وCDN تلقائياً.",
      body: [
        "الإعدادات → النطاقات → إضافة نطاق. اتبع تعليمات DNS.",
        "يُفعّل SSL تلقائياً بعد انتشار DNS.",
        "النطاقات المخصصة متاحة في الخطط المدفوعة.",
      ],
    },
  },
  "pricing-plans-and-trial": {
    fr: {
      title: "Forfaits et essai gratuit",
      excerpt: "0 DH le premier mois sur Growth, puis facturation mensuelle ou annuelle.",
      body: [
        "Starter, Growth et Business. Growth : 0 DH le premier mois.",
        "Après l'essai, facturation mensuelle ou annuelle (-20 % en annuel).",
        "Changez de forfait dans Paramètres → Facturation.",
      ],
    },
    ar: {
      title: "الخطط والتجربة المجانية",
      excerpt: "0 درهم الشهر الأول على Growth، ثم اشتراك شهري أو سنوي.",
      body: [
        "خطط Starter وGrowth وBusiness. Growth: 0 درهم الشهر الأول.",
        "بعد التجربة، فوترة شهرية أو سنوية (خصم ~20% سنوياً).",
        "غيّر الخطة من الإعدادات → الفوترة.",
      ],
    },
  },
  "migrate-from-shopify": {
    fr: {
      title: "Migrer depuis Shopify",
      excerpt: "Importez produits, clients et commandes.",
      body: [
        "Paramètres → Migration : API Shopify ou CSV produits.",
        "Import avec images, variantes et descriptions. Redirections URL possibles.",
        "Assistance équipe sur le plan Business pour gros catalogues.",
      ],
    },
    ar: {
      title: "الانتقال من Shopify",
      excerpt: "استيراد المنتجات والعملاء والطلبات.",
      body: [
        "الإعدادات → الانتقال: API Shopify أو CSV منتجات.",
        "استيراد مع الصور والمتغيرات والأوصاف. إعادة توجيه الروابط ممكنة.",
        "مساعدة الفريق في خطة Business للكتالوجات الكبيرة.",
      ],
    },
  },
};

export function getLocalizedArticle(
  article: HelpArticle,
  locale: HelpLocale,
): Pick<HelpArticle, "title" | "excerpt" | "body"> {
  if (locale === "en") {
    return {
      title: article.title,
      excerpt: article.excerpt,
      body: article.body,
    };
  }

  const translation = HELP_TRANSLATIONS[article.slug]?.[locale];
  if (!translation) {
    return {
      title: article.title,
      excerpt: article.excerpt,
      body: article.body,
    };
  }

  return translation;
}

export function getContactTopicForCategory(
  categoryId: string,
): "general" | "billing" | "technical" | "cod" | "migration" {
  const map: Record<string, "general" | "billing" | "technical" | "cod" | "migration"> = {
    billing: "billing",
    migration: "migration",
    "orders-cod": "cod",
    troubleshooting: "technical",
    catalog: "general",
    marketing: "general",
    analytics: "general",
    "store-builder": "technical",
    "domains-hosting": "technical",
    account: "general",
    "getting-started": "general",
  };
  return map[categoryId] ?? "general";
}
