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
      excerpt:
        "Le COD est intégré — gardez-le actif tout en ajoutant carte ou PayPal.",
      body: [
        "Ettajer inclut le paiement à la livraison — activé par défaut. Les clients saisissent nom, téléphone, ville et adresse — sans carte.",
        "Personnalisez le message COD, le minimum de commande et la note checkout dans Paramètres → Checkout. Toutes les options de paiement sont dans Paramètres → Paiements.",
        "Vous pouvez aussi accepter PayPal maintenant (l’argent va sur votre compte PayPal). Stripe (cartes) apparaît dans Paiements mais n’est pas activable encore — vers octobre 2026. Voir Configurer les paiements en ligne.",
        "Les commandes COD apparaissent comme non payées jusqu’à la livraison. PayPal est marqué payé après le checkout.",
      ],
    },
    ar: {
      title: "كيف يعمل الدفع عند الاستلام؟",
      excerpt: "الدفع عند الاستلام مدمج — أبقِه مفعّلاً مع PayPal.",
      body: [
        "يتضمن إيتاجر الدفع عند الاستلام — مفعّل افتراضياً. يُدخل المشتري الاسم والهاتف والمدينة والعنوان دون بطاقة.",
        "خصّص رسالة COD والحد الأدنى وملاحظة الدفع من الإعدادات → الدفع. كل خيارات الدفع في الإعدادات → المدفوعات.",
        "يمكنك أيضاً قبول PayPal الآن. Stripe للبطاقات يظهر في المدفوعات لكن لا يمكن تفعيله بعد — حوالي أكتوبر 2026. راجع إعداد المدفوعات عبر الإنترنت.",
        "طلبات COD تبقى غير مدفوعة حتى التسليم. طلبات PayPal تُعلَّم مدفوعة بعد إتمام الدفع.",
      ],
    },
  },
  "set-up-online-payments": {
    fr: {
      title: "Configurer les paiements en ligne (PayPal · Stripe bientôt)",
      excerpt:
        "Connectez PayPal dès maintenant. Les cartes Stripe dans environ 2 mois.",
      body: [
        "Ouvrez Paramètres → Paiements. Gardez le COD actif si besoin — COD et PayPal ensemble.",
        "Stripe : badge « Dans ~2 mois », interrupteur désactivé jusqu’à environ octobre 2026. Pas d’activation pour l’instant.",
        "PayPal : activez → créez une app sur developer.paypal.com → collez Client ID et Secret → Sandbox ou Live → Vérifier et connecter.",
        "PayPal ne prend pas en charge MAD. Passez en USD ou EUR dans Paramètres → Langues avant de connecter PayPal.",
        "Testez une petite commande Sandbox puis vérifiez Paid dans Commandes et les fonds dans PayPal.",
      ],
    },
    ar: {
      title: "إعداد المدفوعات عبر الإنترنت (PayPal · Stripe قريباً)",
      excerpt: "اربط PayPal الآن. بطاقات Stripe خلال نحو شهرين.",
      body: [
        "افتح الإعدادات → المدفوعات. أبقِ COD إن لزم — يمكنك تشغيل COD وPayPal معاً.",
        "Stripe: شارة «خلال ~شهرين» ومفتاح معطّل حتى حوالي أكتوبر 2026. لا يمكن التفعيل الآن.",
        "PayPal: فعّل → أنشئ تطبيقاً في developer.paypal.com → الصق Client ID والسر → Sandbox أو Live → تحقق واتصل.",
        "PayPal لا يدعم MAD. غيّر العملة إلى USD أو EUR من الإعدادات → اللغات قبل الربط.",
        "اختبر طلباً صغيراً في Sandbox ثم تأكد من Paid في الطلبات وظهور الأموال في PayPal.",
      ],
    },
  },
  "connect-stripe-for-cards": {
    fr: {
      title: "Stripe pour les cartes (dans ~2 mois)",
      excerpt:
        "Stripe est visible dans Paiements mais pas activable — vers octobre 2026.",
      body: [
        "Stripe permettra cartes, Apple Pay et Google Pay — l’argent ira sur votre banque Stripe.",
        "Aujourd’hui : Paramètres → Paiements montre Stripe avec « Dans ~2 mois » et un interrupteur désactivé.",
        "Activation prévue vers octobre 2026. Ensuite : Connect → onboarding → Actualiser.",
        "En attendant, utilisez COD et/ou PayPal.",
        "Voir Configurer les paiements en ligne et Connecter PayPal.",
      ],
    },
    ar: {
      title: "Stripe للبطاقات (خلال ~شهرين)",
      excerpt: "Stripe يظهر في المدفوعات لكن لا يُفعَّل بعد — حوالي أكتوبر 2026.",
      body: [
        "سيتيح Stripe البطاقات وApple Pay وGoogle Pay — والأموال إلى بنكك عبر Stripe.",
        "اليوم: الإعدادات → المدفوعات تظهر Stripe مع شارة «خلال ~شهرين» ومفتاح معطّل.",
        "التفعيل المتوقع حوالي أكتوبر 2026. بعد ذلك: Connect ثم التسجيل ثم Refresh.",
        "حتى ذلك الحين استخدم COD و/أو PayPal.",
        "راجع إعداد المدفوعات وربط PayPal.",
      ],
    },
  },
  "connect-paypal-checkout": {
    fr: {
      title: "Connecter PayPal au checkout",
      excerpt: "Collez Client ID et Secret, vérifiez, puis encaissez.",
      body: [
        "Créez une app sur developer.paypal.com → Apps & Credentials.",
        "Dans Ettajer : Paramètres → Paiements → activez PayPal → collez Client ID et Secret Key 1 → Sandbox ou Live → Vérifier et connecter.",
        "Un succès vert signifie que le checkout peut encaisser. Les boutons PayPal apparaissent au paiement.",
        "Devise : USD ou EUR — pas MAD. Changez la devise puis revérifiez.",
        "Après paiement client, la commande est Payée automatiquement. L’argent arrive sur votre compte PayPal.",
      ],
    },
    ar: {
      title: "ربط PayPal عند الدفع",
      excerpt: "الصق Client ID والسر، تحقق، ثم استلم الأموال.",
      body: [
        "أنشئ تطبيقاً في developer.paypal.com → Apps & Credentials.",
        "في إيتاجر: الإعدادات → المدفوعات → فعّل PayPal → الصق Client ID وSecret Key 1 → Sandbox أو Live → تحقق واتصل.",
        "النجاح الأخضر يعني أن الدفع جاهز. تظهر أزرار PayPal في المتجر.",
        "العملة: USD أو EUR — وليس MAD. غيّر العملة ثم أعد التحقق.",
        "بعد دفع العميل يُعلَّم الطلب مدفوعاً تلقائياً. الأموال في حساب PayPal الخاص بك.",
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
      excerpt:
        "Photos, prix, variantes et stock — ou importez depuis un fournisseur dropshipping.",
      body: [
        "Ouvrez Tableau de bord → Produits, puis cliquez sur Ajouter un produit. Choisissez le type : physique, digital, service ou dropshipping.",
        "En dropshipping, choisissez AliExpress, CJ ou BigBuy, collez le lien fournisseur et Importez — photos, prix, variantes et specs se remplissent automatiquement.",
        "Ajoutez des images, le prix de vente et le prix barré, puis gérez le stock ou indiquez qu’il vient du fournisseur.",
        "Utilisez les variantes (taille, couleur), les highlights et l’URL SEO avant de publier.",
        "Enregistrez en brouillon pour continuer plus tard, ou Publiez quand vous êtes prêt. Les brouillons restent masqués sur la boutique.",
      ],
    },
    ar: {
      title: "إنشاء أول منتج",
      excerpt: "الصور والسعر والمتغيرات والمخزون — أو الاستيراد من مورد دروبشيبينغ.",
      body: [
        "افتح لوحة التحكم → المنتجات ثم اضغط إضافة منتج. اختر النوع: مادي أو رقمي أو خدمة أو دروبشيبينغ.",
        "للدروبشيبينغ اختر AliExpress أو CJ أو BigBuy، الصق رابط المورد ثم استورد — تُعبأ الصور والسعر والمتغيرات والمواصفات تلقائياً.",
        "ارفع الصور، حدّد سعر البيع وسعر المقارنة، ثم أدر المخزون أو عيّنه من المورد.",
        "أضف المتغيرات (المقاس، اللون) والنقاط البارزة ومقبض رابط SEO قبل النشر.",
        "احفظ كمسودة للمتابعة لاحقاً، أو انشر عندما تكون جاهزاً. المسودات تبقى مخفية عن المتجر.",
      ],
    },
  },
  "connect-a-custom-domain": {
    fr: {
      title: "Connecter un domaine personnalisé",
      excerpt: "Votre domaine avec SSL automatique — pas à pas.",
      body: [
        "Boutique en ligne → Domaines. Choisissez Sous-domaine (shop.votre marque.com) ou Domaine racine (votre marque.com), saisissez le nom d’hôte, puis Connecter.",
        "Copiez les enregistrements DNS affichés. Domaine racine : A (@ → 76.76.21.21) et CNAME (www → cname.vercel-dns.com). Sous-domaine : un seul CNAME. Utilisez toujours les valeurs exactes de la page Domaines.",
        "Chez votre registrar (Namecheap, GoDaddy, Cloudflare, Hostinger, OVH, Google Domains / Squarespace), collez ces enregistrements. Supprimez les anciens A/AAAA/CNAME en conflit.",
        "Dans Ettajer, cliquez Vérifier DNS. Le statut devient Live quand DNS et SSL sont prêts — souvent en quelques minutes, parfois jusqu’à 48 h.",
        "Optionnel : définissez l’adresse principale (votre marque.com ou www) pour rediriger l’autre hôte (308).",
        "Besoin d’aide par registrar ? Voir les tutoriels Namecheap, GoDaddy, Cloudflare, Hostinger, OVH et Google Domains dans Aide → Domaines.",
      ],
    },
    ar: {
      title: "ربط نطاق مخصص",
      excerpt: "نطاقك مع SSL تلقائي — خطوة بخطوة.",
      body: [
        "المتجر الإلكتروني → النطاقات. اختر نطاقاً فرعياً (shop.yourbrand.com) أو النطاق الجذر (yourbrand.com)، ثم اربط.",
        "انسخ سجلات DNS المعروضة. للجذر: A (@ → 76.76.21.21) وCNAME (www → cname.vercel-dns.com). للنطاق الفرعي: CNAME واحد. استخدم القيم الظاهرة في الصفحة.",
        "في المسجّل (Namecheap أو GoDaddy أو Cloudflare أو Hostinger أو OVH أو Google Domains) الصق السجلات واحذف المتعارض منها.",
        "في إيتاجر اضغط تحقق من DNS حتى تصبح الحالة Live — غالباً خلال دقائق وقد تصل إلى 48 ساعة.",
        "اختياري: عيّن العنوان الأساسي (الجذر أو www) لإعادة توجيه الآخر (308).",
        "لشروحات المسجّلين راجع دروس Namecheap وGoDaddy وCloudflare وHostinger وOVH وGoogle Domains في المساعدة → النطاقات.",
      ],
    },
  },
  "connect-domain-namecheap": {
    fr: {
      title: "Connecter un domaine avec Namecheap",
      excerpt: "Configurer Advanced DNS (A + CNAME) vers Ettajer.",
      body: [
        "Dans Ettajer : Boutique en ligne → Domaines, connectez le domaine et gardez le tableau DNS ouvert.",
        "Sur namecheap.com → Domain List → Manage → Advanced DNS.",
        "Domaine racine : A Host @ → 76.76.21.21 ; CNAME Host www → cname.vercel-dns.com. Supprimez parking / redirections / anciens A en conflit.",
        "Sous-domaine (shop) : CNAME Host shop → cible CNAME Ettajer. Laissez @ si l’e-mail ou un autre site reste sur la racine.",
        "Enregistrez. TTL Automatic. Dans Ettajer, Vérifier DNS jusqu’à Live. SSL automatique.",
        "Astuce : ne supprimez pas les MX/TXT e-mail sauf si vous migrez la messagerie.",
      ],
    },
    ar: {
      title: "ربط النطاق مع Namecheap",
      excerpt: "ضبط Advanced DNS (A وCNAME) نحو إيتاجر.",
      body: [
        "في إيتاجر: المتجر الإلكتروني → النطاقات، اربط النطاق واترك جدول DNS مفتوحاً للنسخ.",
        "namecheap.com → Domain List → Manage → Advanced DNS.",
        "للجذر: A مع Host @ وقيمة 76.76.21.21؛ CNAME مع Host www وقيمة cname.vercel-dns.com. احذف السجلات المتعارضة.",
        "لنطاق فرعي مثل shop: CNAME مع Host shop وقيمة هدف إيتاجر.",
        "احفظ ثم في إيتاجر اضغط تحقق من DNS حتى Live. SSL تلقائي.",
        "لا تحذف سجلات MX/TXT للبريد إلا إذا نقلت البريد.",
      ],
    },
  },
  "connect-domain-godaddy": {
    fr: {
      title: "Connecter un domaine avec GoDaddy",
      excerpt: "Modifier les enregistrements DNS GoDaddy pour Ettajer.",
      body: [
        "Connectez le domaine dans Ettajer et copiez A / CNAME.",
        "GoDaddy → My Products → Domains → DNS.",
        "Racine : A @ → 76.76.21.21 ; CNAME www → cname.vercel-dns.com. Désactivez parking / forwarding.",
        "Sous-domaine : CNAME pour le label (shop) → cible Ettajer.",
        "Enregistrez puis Vérifier DNS dans Ettajer jusqu’à Live.",
        "Gardez les nameservers GoDaddy sauf si vous utilisez Cloudflare volontairement.",
      ],
    },
    ar: {
      title: "ربط النطاق مع GoDaddy",
      excerpt: "تعديل سجلات DNS في GoDaddy لإيتاجر.",
      body: [
        "اربط النطاق في إيتاجر وانسخ قيم A / CNAME.",
        "GoDaddy → My Products → Domains → DNS.",
        "للجذر: A لـ @ → 76.76.21.21؛ CNAME لـ www → cname.vercel-dns.com. أوقف التوجيه/الباركنج.",
        "لنطاق فرعي: CNAME للتسمية → هدف إيتاجر.",
        "احفظ ثم تحقق من DNS في إيتاجر حتى Live.",
        "أبقِ nameservers الخاصة بـ GoDaddy ما لم تستخدم Cloudflare عمداً.",
      ],
    },
  },
  "connect-domain-cloudflare": {
    fr: {
      title: "Connecter un domaine avec Cloudflare",
      excerpt: "Enregistrements DNS Cloudflare en mode DNS only (nuage gris).",
      body: [
        "Connectez l’hôte dans Ettajer et copiez les cibles.",
        "Cloudflare → DNS → Records.",
        "Racine : A @ → 76.76.21.21 ; CNAME www → cname.vercel-dns.com. Proxy = DNS only (gris) pendant le SSL.",
        "Sous-domaine : CNAME shop → cible Ettajer, aussi DNS only au début.",
        "Puis Vérifier DNS dans Ettajer jusqu’à Live. Vous pourrez activer le proxy ensuite si besoin.",
        "Si les nameservers sont chez Cloudflare, éditez DNS uniquement ici.",
      ],
    },
    ar: {
      title: "ربط النطاق مع Cloudflare",
      excerpt: "سجلات DNS في Cloudflare مع وضع DNS only (سحابة رمادية).",
      body: [
        "اربط المضيف في إيتاجر وانسخ الأهداف.",
        "Cloudflare → DNS → Records.",
        "للجذر: A لـ @ → 76.76.21.21؛ CNAME لـ www → cname.vercel-dns.com. Proxy = DNS only حتى يكتمل SSL.",
        "لنطاق فرعي: CNAME → هدف إيتاجر مع DNS only أولاً.",
        "ثم تحقق من DNS في إيتاجر حتى Live. يمكن تفعيل البروكسي لاحقاً إن لزم.",
        "إن كانت nameservers عند Cloudflare فعدّل DNS هناك فقط.",
      ],
    },
  },
  "connect-domain-hostinger": {
    fr: {
      title: "Connecter un domaine avec Hostinger",
      excerpt: "Mettre à jour DNS depuis hPanel vers Ettajer.",
      body: [
        "Connectez le domaine dans Ettajer et notez A / CNAME.",
        "hPanel → Domains → Manage → DNS Zone Editor.",
        "Racine : A @ → 76.76.21.21 ; CNAME www → cname.vercel-dns.com.",
        "Sous-domaine : CNAME (shop) → cible Ettajer.",
        "Enregistrez puis Vérifier DNS jusqu’à Live.",
        "Désactivez le Website Builder Hostinger s’il écrase vos DNS.",
      ],
    },
    ar: {
      title: "ربط النطاق مع Hostinger",
      excerpt: "تحديث DNS من hPanel نحو إيتاجر.",
      body: [
        "اربط النطاق في إيتاجر وسجّل قيم A / CNAME.",
        "hPanel → Domains → Manage → DNS Zone Editor.",
        "للجذر: A لـ @ → 76.76.21.21؛ CNAME لـ www → cname.vercel-dns.com.",
        "لنطاق فرعي: CNAME → هدف إيتاجر.",
        "احفظ ثم تحقق من DNS حتى Live.",
        "أوقف Website Builder إن كان يستبدل سجلاتك.",
      ],
    },
  },
  "connect-domain-ovh": {
    fr: {
      title: "Connecter un domaine avec OVHcloud",
      excerpt: "Modifier la zone DNS OVH (.com, .fr, .ma).",
      body: [
        "Connectez le domaine dans Ettajer et copiez les valeurs.",
        "OVHcloud → Web Cloud → Noms de domaine → Zone DNS.",
        "Racine : A (vide / @) → 76.76.21.21 ; CNAME www → cname.vercel-dns.com (point final si demandé).",
        "Sous-domaine : CNAME du label → cible Ettajer.",
        "Supprimez les conflits, appliquez la zone, puis Vérifier DNS dans Ettajer.",
        "Le SSL suit automatiquement après propagation.",
      ],
    },
    ar: {
      title: "ربط النطاق مع OVHcloud",
      excerpt: "تعديل منطقة DNS في OVH لنطاقات .com و.fr و.ma.",
      body: [
        "اربط النطاق في إيتاجر وانسخ القيم.",
        "OVHcloud → Web Cloud → Domain names → DNS zone.",
        "للجذر: A → 76.76.21.21؛ CNAME لـ www → cname.vercel-dns.com.",
        "لنطاق فرعي: CNAME → هدف إيتاجر.",
        "احذف المتعارض وطبق المنطقة ثم تحقق من DNS في إيتاجر.",
        "يُفعّل SSL تلقائياً بعد الانتشار.",
      ],
    },
  },
  "connect-domain-google-domains": {
    fr: {
      title: "Connecter un domaine Google Domains / Squarespace",
      excerpt: "DNS après le passage de Google Domains vers Squarespace.",
      body: [
        "Les anciens Google Domains sont gérés sur Squarespace Domains. Connectez d’abord l’hôte dans Ettajer.",
        "Squarespace Domains → votre domaine → DNS / Advanced DNS.",
        "Racine : A @ → 76.76.21.21 ; CNAME www → cname.vercel-dns.com.",
        "Sous-domaine : CNAME du label → cible Ettajer. Retirez les défauts Squarespace en conflit.",
        "Enregistrez puis Vérifier DNS jusqu’à Live.",
        "Si un e-mail de migration Squarespace est reçu, utilisez-le pour accéder à la nouvelle console DNS.",
      ],
    },
    ar: {
      title: "ربط نطاق Google Domains / Squarespace",
      excerpt: "DNS بعد انتقال Google Domains إلى Squarespace.",
      body: [
        "نطاقات Google السابقة تُدار في Squarespace Domains. اربط المضيف أولاً في إيتاجر.",
        "Squarespace Domains → نطاقك → DNS.",
        "للجذر: A لـ @ → 76.76.21.21؛ CNAME لـ www → cname.vercel-dns.com.",
        "لنطاق فرعي: CNAME → هدف إيتاجر. أزل إعدادات Squarespace المتعارضة.",
        "احفظ ثم تحقق من DNS حتى Live.",
        "إن وصلتك رسالة ترحيل من Squarespace فاستخدمها للوصول إلى لوحة DNS الجديدة.",
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
        "Changez de forfait dans Paramètres → Plan.",
      ],
    },
    ar: {
      title: "الخطط والتجربة المجانية",
      excerpt: "0 درهم الشهر الأول على Growth، ثم اشتراك شهري أو سنوي.",
      body: [
        "خطط Starter وGrowth وBusiness. Growth: 0 درهم الشهر الأول.",
        "بعد التجربة، فوترة شهرية أو سنوية (خصم ~20% سنوياً).",
        "غيّر الخطة من الإعدادات → الخطة.",
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
  "connect-meta-pixel": {
    fr: {
      title: "Connecter Meta Pixel avec Ettajer",
      excerpt:
        "Liez Facebook et Instagram avec Pixel, CAPI et Connect with Meta.",
      body: [
        "Allez dans Tableau de bord → Marketing → Intégrations → Meta.",
        "Recommandé : cliquez sur Connect with Meta, connectez-vous via Facebook Login for Business, puis choisissez le pixel. Ettajer enregistre l’ID Pixel et un jeton Conversions API.",
        "Sinon, collez votre Pixel ID depuis Events Manager → Sources de données → Pixels, puis enregistrez.",
        "Activez le suivi et les événements voulus. Purchase utilise un event_id partagé (purchase_{orderNumber}) pour dédupliquer Pixel navigateur et CAPI serveur.",
        "Optionnel : activez le mode test sous Avancé et collez un code Test events Meta pour valider avant de dépenser en pub.",
      ],
    },
    ar: {
      title: "ربط Meta Pixel مع إيتاجر",
      excerpt: "اربط إعلانات فيسبوك وإنستغرام عبر Pixel وCAPI وConnect with Meta.",
      body: [
        "انتقل إلى لوحة التحكم → التسويق → التكاملات → Meta.",
        "المفضّل: اضغط Connect with Meta، سجّل الدخول عبر Facebook Login for Business، ثم اختر البكسل. يحفظ إيتاجر معرّف البكسل ورمز Conversions API.",
        "بديل: الصق Pixel ID من Events Manager → مصادر البيانات → Pixels ثم احفظ.",
        "فعّل التتبع والأحداث المطلوبة. عملية الشراء تستخدم event_id مشتركاً (purchase_{orderNumber}) لدمج Pixel والمتصفح مع CAPI.",
        "اختياري: فعّل وضع الاختبار ضمن Advanced وألصق رمز اختبار Meta للتحقق قبل إنفاق الإعلانات.",
      ],
    },
  },
  "meta-conversions-api-and-advanced-matching": {
    fr: {
      title: "Conversions API Meta et advanced matching",
      excerpt:
        "Événements serveur quand les cookies sont bloqués, avec e-mail et téléphone hachés.",
      body: [
        "La Conversions API (CAPI) envoie les mêmes événements clés depuis les serveurs Ettajer — utile quand les navigateurs bloquent les cookies tiers.",
        "Connect with Meta enregistre automatiquement votre jeton. Un jeton CAPI manuel peut aussi être géré sous Meta → Avancé.",
        "InitiateCheckout et Purchase incluent e-mail/téléphone hachés (et nom/adresse si disponibles) pour l’advanced matching Meta.",
        "Pixel navigateur et CAPI partagent le même event_id pour une seule conversion. Purchase utilise toujours purchase_{orderNumber}.",
        "Consultez Marketing → Meta → Diagnostics pour les envois CAPI récents, échecs et sauts (même hors mode test).",
      ],
    },
    ar: {
      title: "Conversions API ومطابقة متقدمة في Meta",
      excerpt: "أحداث من الخادم عند حظر الكوكيز، مع تجزئة البريد والهاتف.",
      body: [
        "يرسل Conversions API (CAPI) نفس الأحداث الرئيسية من خوادم إيتاجر — مفيد عندما يحظر المتصفح الكوكيز.",
        "Connect with Meta يحفظ رمز الوصول تلقائياً. يمكن أيضاً إدارة رمز CAPI يدوياً ضمن Meta → Advanced.",
        "يتضمن InitiateCheckout وPurchase بريداً/هاتفاً مجزأً (والاسم/العنوان عند التوفر) للمطابقة المتقدمة.",
        "يشترك Pixel المتصفح وCAPI في نفس event_id لاحتساب تحويل واحد. الشراء يستخدم دائماً purchase_{orderNumber}.",
        "راجع التسويق → Meta → Diagnostics لآخر إرسالات CAPI والفشل والتخطي (حتى خارج وضع الاختبار).",
      ],
    },
  },
  "meta-product-catalog-feed": {
    fr: {
      title: "Synchroniser le catalogue produits avec Meta",
      excerpt: "Flux TSV planifié pour Dynamic Ads et Advantage+.",
      body: [
        "Ouvrez Marketing → Meta → Catalog. Copiez l’URL du flux (clé optionnelle).",
        "Dans Commerce Manager, créez ou sélectionnez un catalogue → Source planifiée → collez l’URL Ettajer (horaire ou quotidien).",
        "Les IDs produits du flux correspondent aux content_ids Pixel pour Dynamic Ads et le remarketing.",
        "Seuls les produits actifs avec image (visibilité boutique) sont inclus. Collez l’ID catalogue dans Ettajer pour suivre la progression.",
        "Faites tourner la clé du flux si l’URL a fuité — puis mettez à jour Commerce Manager après enregistrement.",
      ],
    },
    ar: {
      title: "مزامنة كتالوج المنتجات مع Meta",
      excerpt: "تغذية TSV مجدولة لإعلانات Dynamic وAdvantage+.",
      body: [
        "افتح التسويق → Meta → Catalog وانسخ رابط التغذية (مفتاح اختياري).",
        "في Commerce Manager أنشئ أو اختر كتالوجاً → مصدر مجدول → الصق رابط إيتاجر (ساعياً أو يومياً).",
        "معرّفات المنتجات في التغذية تطابق content_ids في Pixel لإعلانات Dynamic وإعادة الاستهداف.",
        "تُدرج المنتجات النشطة ذات صورة فقط. الصق Catalog ID في إيتاجر لتتبع التقدم.",
        "بدّل مفتاح التغذية إن انتشر الرابط — ثم حدّث Commerce Manager بعد الحفظ.",
      ],
    },
  },
  "meta-custom-audiences": {
    fr: {
      title: "Envoyer acheteurs et abandonnistes vers Meta",
      excerpt: "Custom Audiences depuis commandes et checkouts abandonnés.",
      body: [
        "Ouvrez Marketing → Meta → Audiences après Connect with Meta (permissions ads requises).",
        "Choisissez le compte publicitaire, puis Push to Meta pour Purchasers et/ou Abandoners.",
        "E-mails et téléphones sont hachés SHA-256 avant envoi. Les abandonnistes excluent les acheteurs connus.",
        "Utilisez ces listes pour le remarketing, les lookalikes, ou pour exclure les clients existants.",
        "Resynchronisez quand vous voulez remplacer la liste par les données les plus récentes.",
      ],
    },
    ar: {
      title: "دفع المشترين والمتخليين إلى جماهير Meta",
      excerpt: "Custom Audiences من الطلبات وعمليات الدفع المتروكة.",
      body: [
        "افتح التسويق → Meta → Audiences بعد Connect with Meta (صلاحيات الإعلانات مطلوبة).",
        "اختر حساب الإعلانات ثم ادفع إلى Meta للمشترين و/أو المتخليين.",
        "يُجزّأ البريد والهاتف بـ SHA-256 قبل الرفع. المتخلون يستثنون المشترين المعروفين.",
        "استخدم القوائم لإعادة الاستهداف أو الجماهير المشابهة أو استبعاد العملاء الحاليين.",
        "أعد المزامنة في أي وقت لاستبدال القائمة بأحدث البيانات.",
      ],
    },
  },
  "verify-meta-domain": {
    fr: {
      title: "Vérifier votre domaine avec Meta",
      excerpt: "Vérification de domaine pour AEM et la propriété des liens.",
      body: [
        "Meta vérifie un domaine que vous possédez — connectez d’abord un domaine personnalisé (Domaines). Les sous-domaines Ettajer ne suffisent pas.",
        "Dans Business Settings → Brand safety → Domains, ajoutez le domaine racine (example.com, sans www).",
        "Choisissez la vérification par meta-tag, copiez la valeur content, et collez-la dans Marketing → Meta → Domain.",
        "Enregistrez pour injecter facebook-domain-verification sur la page d’accueil, puis cliquez Verify dans Meta.",
        "Utilisez Check status dans Ettajer pour confirmer que la balise est en ligne.",
      ],
    },
    ar: {
      title: "التحقق من نطاقك مع Meta",
      excerpt: "التحقق من النطاق لـ AEM وملكية الروابط.",
      body: [
        "يتحقق Meta من نطاق تملكه — اربط نطاقاً مخصصاً أولاً (النطاقات). نطاقات إيتاجر الفرعية لا تكفي.",
        "في Business Settings → Brand safety → Domains أضف النطاق الجذري (example.com بدون www).",
        "اختر التحقق عبر meta-tag، انسخ قيمة content، والصقها في التسويق → Meta → Domain.",
        "احفظ ليُحقن facebook-domain-verification في الصفحة الرئيسية، ثم اضغط Verify في Meta.",
        "استخدم Check status في إيتاجر للتأكد من ظهور الوسم مباشرة.",
      ],
    },
  },
  "meta-event-diagnostics": {
    fr: {
      title: "Lire les diagnostics d’événements Meta",
      excerpt: "Voir les derniers envois CAPI et échecs, hors mode test.",
      body: [
        "Ouvrez Marketing → Meta → Diagnostics pour le journal Conversions API.",
        "Filtrez Sent / Failed / Skipped. Chaque ligne montre le nom, l’event_id partagé, la source et l’erreur éventuelle.",
        "Les PageViews réussis sont omis pour limiter le bruit ; les échecs PageView et les conversions restent.",
        "Combinez avec Events Manager → Test events si le mode test est actif sous Avancé.",
        "Si le journal est vide, parcourez la boutique live, ajoutez au panier ou passez une commande test, puis actualisez.",
      ],
    },
    ar: {
      title: "قراءة تشخيص أحداث Meta",
      excerpt: "عرض آخر إرسالات CAPI والفشل خارج وضع الاختبار.",
      body: [
        "افتح التسويق → Meta → Diagnostics لسجل Conversions API.",
        "صفِّ حسب Sent أو Failed أو Skipped. كل صف يعرض الاسم وevent_id والمصدر ورسالة الخطأ إن وُجدت.",
        "تُستبعد PageViews الناجحة لتقليل الضوضاء؛ تبقى إخفاقات PageView وجميع أحداث التحويل.",
        "اربط ذلك مع Events Manager → Test events عند تفعيل وضع الاختبار.",
        "إن كان السجل فارغاً، تصفّح المتجر الحي أو أضف للسلة أو أكمل طلباً تجريبياً ثم حدّث Diagnostics.",
      ],
    },
  },
  "pixel-not-firing": {
    fr: {
      title: "Le pixel marketing ne se déclenche pas",
      excerpt: "Vérifier le tracking Meta, TikTok ou Google.",
      body: [
        "Vérifiez l’ID Pixel dans Marketing → Intégrations (ou Meta → Connection), sans espaces.",
        "Pour Meta : utilisez Connect with Meta pour Pixel + CAPI. Consultez Diagnostics pour les échecs serveur.",
        "Désactivez les bloqueurs de pub. Utilisez Events Manager → Test events avec le mode test sous Avancé.",
        "Les événements partent sur la boutique live — l’aperçu builder peut ne pas déclencher les pixels. Purchase déduplique avec purchase_{orderNumber}.",
        "Attendez jusqu’à 24 h pour les données agrégées dans les plateformes pub.",
      ],
    },
    ar: {
      title: "بكسل التسويق لا يعمل",
      excerpt: "تحقق من تتبع Meta أو TikTok أو Google.",
      body: [
        "تأكد من صحة Pixel ID في التسويق → التكاملات (أو Meta → Connection) بدون مسافات زائدة.",
        "لـ Meta: استخدم Connect with Meta لتفعيل Pixel وCAPI. راجع Diagnostics لإخفاقات الخادم.",
        "عطّل حاجب الإعلانات عند الاختبار. استخدم Events Manager → Test events مع وضع الاختبار.",
        "تُطلق الأحداث على المتجر الحي — وضع المعاينة في المحرر قد لا يشغّل البكسل. الشراء يُدمَج عبر purchase_{orderNumber}.",
        "اسمح حتى 24 ساعة لظهور البيانات المجمّعة في منصات الإعلان.",
      ],
    },
  },
  "meta-ads-launch-checklist": {
    fr: {
      title: "Checklist lancement publicités Meta",
      excerpt: "Pixel, CAPI, catalogue, domaine et audiences avant de dépenser.",
      body: [
        "1. Connectez Pixel + CAPI via Marketing → Meta → Connect with Meta, puis activez Purchase et AddToCart.",
        "2. Passez une commande test avec le mode test + code Test events Meta ; confirmez que Pixel et CAPI partagent purchase_{orderNumber} dans Diagnostics.",
        "3. Collez l’URL du flux Catalog dans Commerce Manager et enregistrez le Catalog ID dans Ettajer.",
        "4. Connectez un domaine personnalisé et vérifiez-le sous Meta → Domain (requis pour AEM sur iOS).",
        "5. Poussez les audiences Purchasers et Abandoners, puis créez des campagnes qui excluent les acheteurs ou retargetent les abandonnistes.",
        "6. Désactivez le mode test avant de scaler. Gardez Diagnostics ouvert la première semaine.",
      ],
    },
    ar: {
      title: "قائمة إطلاق إعلانات Meta",
      excerpt: "Pixel وCAPI والكتالوج والنطاق والجماهير قبل الإنفاق.",
      body: [
        "1. اربط Pixel وCAPI عبر التسويق → Meta → Connect with Meta ثم فعّل Purchase وAddToCart.",
        "2. نفّذ طلباً تجريبياً مع وضع الاختبار ورمز Test events؛ تأكد أن Pixel وCAPI يشتركان في purchase_{orderNumber} في Diagnostics.",
        "3. الصق رابط تغذية الكتالوج في Commerce Manager واحفظ Catalog ID في إيتاجر.",
        "4. اربط نطاقاً مخصصاً وتحقق منه ضمن Meta → Domain (مطلوب لـ AEM على iOS).",
        "5. ادفع جماهير المشترين والمتخليين ثم أنشئ حملات تستبعد المشترين أو تستهدف المتخليين.",
        "6. عطّل وضع الاختبار قبل زيادة الإنفاق. راقب Diagnostics في الأسبوع الأول.",
      ],
    },
  },
  "meta-test-events-guide": {
    fr: {
      title: "Tester les événements Meta avant le live",
      excerpt: "Mode test et Events Manager sans polluer la prod.",
      body: [
        "Dans Marketing → Meta → Avancé, activez le mode test et collez le code TEST… depuis Events Manager → Test events.",
        "Ouvrez la boutique live (pas l’aperçu builder). Parcourez un produit, ajoutez au panier, démarrez le checkout, puis passez une petite commande test.",
        "Dans Test events Meta vous devez voir PageView, ViewContent, AddToCart, InitiateCheckout et Purchase — souvent en paires navigateur + serveur avec le même event_id.",
        "Dans Ettajer → Meta → Diagnostics, confirmez que Purchase et AddToCart sont Sent (pas Failed).",
        "Désactivez le mode test et effacez le code avant les vraies campagnes.",
      ],
    },
    ar: {
      title: "اختبار أحداث Meta قبل الإطلاق",
      excerpt: "وضع الاختبار وEvents Manager دون تلويث بيانات الإنتاج.",
      body: [
        "في التسويق → Meta → Advanced فعّل وضع الاختبار والصق رمز TEST… من Events Manager → Test events.",
        "افتح المتجر الحي (وليس معاينة المحرر). تصفّح منتجاً، أضف للسلة، ابدأ الدفع، ثم أكمل طلباً صغيراً.",
        "في Test events يجب أن ترى PageView وViewContent وAddToCart وInitiateCheckout وPurchase — غالباً كأزواج متصفح + خادم بنفس event_id.",
        "في إيتاجر → Meta → Diagnostics تأكد أن Purchase وAddToCart بحالة Sent.",
        "عطّل وضع الاختبار وامسح الرمز قبل الحملات الحقيقية.",
      ],
    },
  },
  "utm-links-and-attribution": {
    fr: {
      title: "Liens UTM et attribution campagne",
      excerpt: "Suivez le trafic Instagram, TikTok et Meta avec des liens tagués.",
      body: [
        "Créez des liens boutique avec utm_source, utm_medium et utm_campaign sur l’URL de votre boutique.",
        "Exemple : utm_source=instagram, utm_medium=social, utm_campaign=summer_sale. Partagez l’URL en bio, Stories et pubs.",
        "Ettajer stocke les UTM avec la commande pour voir quelles campagnes ont généré des achats COD.",
        "Utilisez un naming cohérent (minuscules, underscores) pour des rapports propres.",
        "Combinez UTM avec Pixel / CAPI pour l’optimisation ads, et Analytics pour votre mix de canaux.",
      ],
    },
    ar: {
      title: "روابط UTM ونَسب الحملات",
      excerpt: "تتبّع زيارات إنستغرام وتيك توك وMeta بروابط معلّمة.",
      body: [
        "ابنِ روابط متجر مع utm_source وutm_medium وutm_campaign على رابط متجرك.",
        "مثال: utm_source=instagram وutm_medium=social وutm_campaign=summer_sale. شارِك الرابط في البايو والستوريز والإعلانات.",
        "يحفظ إيتاجر قيم UTM مع الطلب لمعرفة أي الحملات جلبت مشتريات COD.",
        "استخدم تسمية موحّدة (حروف صغيرة وشرطات سفلية) لتقارير أوضح.",
        "اجمع UTM مع Pixel/CAPI لتحسين الإعلانات ومع Analytics لخليط القنوات.",
      ],
    },
  },
  "newsletter-subscribers": {
    fr: {
      title: "Vue d’ensemble Email Marketing",
      excerpt:
        "Accueil, campagnes, automatisations, abonnés — expliqué simplement.",
      body: [
        "Ouvrez Marketing → Email. L’accueil montre une checklist, la taille de la liste et les envois récents.",
        "Onglets principaux : Campagnes, Modèles, Automatisations, Abonnés et Analytique.",
        "Plus d’outils : Segments, Idées, Parcours e-mail, Statut d’envoi, Santé boîte de réception et Configuration e-mail.",
        "Développez la liste : ajoutez une section Newsletter dans le builder. Les inscrits apparaissent sous Abonnés.",
        "Commencez simple : créez un modèle → activez une automatisation de bienvenue → envoyez une première campagne.",
        "Chaque e-mail marketing inclut nom, adresse, e-mail support, préférences et désabonnement.",
        "Respectez les désabonnements — pas de listes achetées.",
        "Pour un parcours guidé, ouvrez la checklist de lancement Email Marketing.",
      ],
    },
    ar: {
      title: "نظرة عامة على التسويق بالبريد",
      excerpt: "الرئيسية والحملات والأتمتة والمشتركون — ببساطة.",
      body: [
        "افتح التسويق → البريد. تعرض الرئيسية قائمة إعداد وحجم القائمة وآخر الإرسالات.",
        "التبويبات: الحملات، القوالب، الأتمتة، المشتركون، والتحليلات.",
        "المزيد: الشرائح، الأفكار، تدفقات البريد، حالة الإرسال، صحة الصندوق، وإعداد البريد.",
        "نمِّ قائمتك: أضف قسم Newsletter في المحرر. يظهر المشتركون تحت المشتركون.",
        "ابدأ ببساطة: أنشئ قالباً ← فعّل ترحيباً آلياً ← أرسل أول حملة.",
        "كل بريد تسويقي يتضمن اسم النشاط والعنوان والبريد والدعم وإلغاء الاشتراك.",
        "احترم إلغاء الاشتراك — لا تشترِ قوائم بريد.",
        "للمسار خطوة بخطوة، افتح قائمة إطلاق التسويق بالبريد.",
      ],
    },
  },
  "email-marketing-launch-checklist": {
    fr: {
      title: "Checklist lancement Email Marketing",
      excerpt: "De la liste vide à la première campagne en sept étapes.",
      body: [
        "1. Marketing → Email → Plus → Configuration e-mail. Connectez un fournisseur et confirmez l’adresse d’expédition.",
        "2. Dans Santé boîte de réception, ajoutez et vérifiez le domaine (SPF, DKIM, DMARC).",
        "3. Ajoutez un bloc Newsletter dans le builder et publiez. Vérifiez l’inscription sous Abonnés.",
        "4. Créez un modèle (starter ou vide) avec objet, titre, corps et bouton.",
        "5. Activez Automatisations → Inscription newsletter avec ce modèle.",
        "6. Optionnel : créez un segment et activez Panier abandonné.",
        "7. Ouvrez Campagnes, envoyez ou planifiez, puis suivez Statut d’envoi et Analytique.",
      ],
    },
    ar: {
      title: "قائمة إطلاق التسويق بالبريد",
      excerpt: "من قائمة فارغة إلى أول حملة في سبع خطوات.",
      body: [
        "1. التسويق → البريد → المزيد → إعداد البريد. اربط مزوّداً وأكّد عنوان المرسل.",
        "2. في صحة الصندوق، أضف النطاق وتحقق من SPF وDKIM وDMARC.",
        "3. أضف قسم Newsletter في المحرر وانشر. تأكد من ظهور الاشتراك تحت المشتركون.",
        "4. أنشئ قالباً (من المعرض أو فارغ) مع الموضوع والعنوان والنص والزر.",
        "5. فعّل الأتمتة → اشتراك النشرة بهذا القالب.",
        "6. اختياري: أنشئ شريحة وفعّل السلة المتروكة.",
        "7. افتح الحملات، أرسل أو جدول، ثم راقب حالة الإرسال والتحليلات.",
      ],
    },
  },
  "email-campaigns-guide": {
    fr: {
      title: "Campagnes, modèles et envoi rapide",
      excerpt: "Concevez des e-mails réutilisables et diffusez-les.",
      body: [
        "Les modèles sont réutilisables. Créez-en un sous Modèles ou depuis la galerie.",
        "Dans l’éditeur : thème, objet, corps, bouton, et blocs produits optionnels.",
        "Utilisez l’écriture IA pour brouillons, puis relisez avant d’enregistrer.",
        "Les campagnes envoient un modèle à plusieurs personnes. Envoyez maintenant ou planifiez.",
        "Sur Abonnés, Envoi rapide ouvre un panneau pour un envoi ponctuel.",
        "L’historique montre brouillons, planifiés, en cours, terminés et échecs.",
        "Désabonnés, bounces et plaintes sont exclus automatiquement.",
      ],
    },
    ar: {
      title: "الحملات والقوالب والإرسال السريع",
      excerpt: "صمّم بريداً قابلاً لإعادة الاستخدام وأرسله للقائمة.",
      body: [
        "القوالب قابلة لإعادة الاستخدام. أنشئ واحداً أو ابدأ من المعرض.",
        "في المحرر: السمة والموضوع والنص والزر وكتل المنتجات اختيارياً.",
        "استخدم الكتابة بالذكاء الاصطناعي ثم راجع قبل الحفظ.",
        "الحملات ترسل قالباً لكثيرين. أرسل الآن أو جدول.",
        "في المشتركون، الإرسال السريع لحملة سريعة.",
        "يعرض السجل المسودات والمجدولة والجارية والمكتملة والفاشلة.",
        "يُستثنى تلقائياً من ألغى الاشتراك أو ارتد أو اشتكى.",
      ],
    },
  },
  "email-automations-and-flows": {
    fr: {
      title: "Automatisations et parcours e-mail",
      excerpt: "Envoyez quand le client agit — ou créez des parcours multi-étapes.",
      body: [
        "Les automatisations envoient un e-mail : inscription, achat, panier abandonné ou nouveau client.",
        "Choisissez un modèle par déclencheur et activez-le. Les reçus de commande restent séparés.",
        "Les parcours (Plus → Parcours e-mail) ajoutent délais, conditions et tags.",
        "Créez manuellement ou avec le générateur IA (brouillons Welcome, Cart, Win-back…).",
        "Relisez les brouillons avant d’Activer. Pause possible à tout moment.",
        "Idées suggère les prochains envois — lancez Score audience si la page est vide.",
      ],
    },
    ar: {
      title: "الأتمتة وتدفقات البريد",
      excerpt: "أرسل عند تفاعل العميل — أو ابنِ رحلات متعددة الخطوات.",
      body: [
        "الأتمتة ترسل بريداً عند الاشتراك أو الشراء أو السلة المتروكة أو عميل جديد.",
        "اختر قالباً لكل محفّز وفعّله. إيصالات الطلب منفصلة.",
        "التدفقات (المزيد → تدفقات البريد) تضيف تأخيراً وشروطاً ووسومًا.",
        "أنشئ يدوياً أو بمولّد الذكاء الاصطناعي (ترحيب، سلة، استرجاع…).",
        "راجع المسودات قبل التفعيل. يمكنك الإيقاف مؤقتاً في أي وقت.",
        "الأفكار تقترح ماذا ترسل لاحقاً — سجّل نقاط الجمهور إن كانت الصفحة فارغة.",
      ],
    },
  },
  "email-list-health": {
    fr: {
      title: "Abonnés, segments et santé boîte de réception",
      excerpt: "Gardez une liste propre et des e-mails qui arrivent.",
      body: [
        "Abonnés = votre liste. Filtrez, exportez, utilisez Envoi rapide.",
        "Les segments sont dynamiques (VIP, pays, jamais acheté…). Ils se recalculent à l’envoi.",
        "Statut d’envoi : en attente, en cours, envoyé, échec.",
        "Santé boîte de réception : réputation, domaines, suppressions.",
        "Ajoutez et vérifiez SPF, DKIM, DMARC pour votre domaine d’envoi.",
        "Configuration e-mail connecte fournisseurs et adresses d’expédition.",
        "Si bounces/plaintes montent : pausez, nettoyez, corrigez l’auth avant de scaler.",
      ],
    },
    ar: {
      title: "المشتركون والشرائح وصحة الصندوق",
      excerpt: "قائمة نظيفة وبريد يصل إلى الصندوق.",
      body: [
        "المشتركون قائمتك. صفِّ وصدّر واستخدم الإرسال السريع.",
        "الشرائح ديناميكية (VIP، بلد، لم يشترِ…). تُحدَّث عند الإرسال.",
        "حالة الإرسال: معلّق وجاري ومُرسل وفاشل.",
        "صحة الصندوق: السمعة والنطاقات وقائمة الحظر.",
        "أضف النطاق وتحقق من SPF وDKIM وDMARC.",
        "إعداد البريد يربط المزوّدين وعناوين المرسل.",
        "إن ارتفعت الارتدادات/الشكاوى: أوقف، نظّف، أصلِح المصادقة قبل التوسّع.",
      ],
    },
  },
  "customer-messages": {
    fr: {
      title: "Messages clients",
      excerpt: "Lisez et répondez aux messages du formulaire boutique.",
      body: [
        "Les messages du formulaire boutique passent par votre e-mail support — vérifiez Paramètres → Contact (et WhatsApp si utilisé).",
        "Répondez vite — cela aide la confirmation COD quand les clients posent des questions.",
        "Pour une commande précise, ouvrez-la dans Commandes.",
        "Les campagnes e-mail sont séparées : Email pour le marketing ; le support pour le one-to-one.",
      ],
    },
    ar: {
      title: "رسائل العملاء",
      excerpt: "اقرأ وارد نموذج التواصل في المتجر وردّ عليه.",
      body: [
        "رسائل نموذج التواصل تصل إلى بريد الدعم — تأكد من الإعدادات → التواصل (وواتساب إن وُجد).",
        "ردّ بسرعة — يحسّن تأكيد طلبات الدفع عند الاستلام.",
        "لأسئلة طلب معيّن، افتح الطلب من الطلبات.",
        "حملات البريد منفصلة: البريد للتسويق، وقناة الدعم للمحادثة الفردية.",
      ],
    },
  },
  "gift-cards-for-customers": {
    fr: {
      title: "Vendre et gérer les cartes cadeaux",
      excerpt: "Crédit boutique à utiliser au checkout.",
      body: [
        "Ouvrez Tableau de bord → Cartes cadeaux pour créer des codes avec solde et expiration optionnelle.",
        "Partagez les codes en privé (WhatsApp) ou vendez-les si votre thème le permet.",
        "Les clients utilisent le code au checkout ; le solde restant reste sur la carte.",
        "Désactivez immédiatement une carte partagée par erreur ou remboursée.",
        "Les cartes cadeaux fonctionnent avec le COD — idéal pour fêtes et influenceurs au Maroc.",
      ],
    },
    ar: {
      title: "بيع وإدارة بطاقات الهدايا",
      excerpt: "رصيد متجر يُستَخدم عند الدفع.",
      body: [
        "افتح لوحة التحكم → بطاقات الهدايا لإنشاء أكواد برصيد وتاريخ انتهاء اختياري.",
        "شارِك الأكواد خاصاً (واتساب) أو بِعها كمنتج إن دعم قالبك ذلك.",
        "يستبدل العملاء الكود عند الدفع؛ يبقى الرصيد المتبقي على البطاقة.",
        "عطّل البطاقة فوراً إن شارُكت بالخطأ أو أُعيدت قيمتها.",
        "تعمل بطاقات الهدايا مع الدفع عند الاستلام — مناسبة للأعياد وهدايا المؤثرين في المغرب.",
      ],
    },
  },
  "sell-digital-products": {
    fr: {
      title: "Vendre des produits digitaux et ebooks",
      excerpt: "Livrez des fichiers après achat sans expédition.",
      body: [
        "À la création du produit, choisissez Digital. Uploadez une couverture avant (et optionnelle arrière), puis le PDF sous Ebook file.",
        "PDF jusqu’à 50 Mo. Couvertures JPG/PNG/WebP sous 10 Mo pour le mobile.",
        "Les produits digitaux sautent la livraison — le checkout reste COD ou carte selon vos réglages.",
        "Après paiement ou confirmation, le client reçoit l’accès au téléchargement selon votre flux.",
        "N’uploadez pas de fichiers protégés que vous ne possédez pas.",
      ],
    },
    ar: {
      title: "بيع المنتجات الرقمية والكتب الإلكترونية",
      excerpt: "تسليم الملفات بعد الشراء دون شحن.",
      body: [
        "عند إنشاء المنتج اختر Digital. ارفع غلافاً أمامياً (وخلفي اختياري) ثم PDF تحت Ebook file.",
        "PDF حتى 50 ميغابايت. أغلفة JPG/PNG/WebP أقل من 10 ميغابايت للجوال.",
        "المنتجات الرقمية بلا شحن — الدفع يبقى COD أو بطاقة حسب إعداداتك.",
        "بعد الدفع أو التأكيد يحصل العميل على رابط التحميل وفق سير عملك.",
        "لا ترفع ملفات محمية لا تملك حقوقها.",
      ],
    },
  },
  "dropshipping-with-ettajer": {
    fr: {
      title: "Démarrer le dropshipping avec Ettajer",
      excerpt: "Importez depuis AliExpress, CJ ou BigBuy sans stock.",
      body: [
        "Créez un produit Dropshipping. Choisissez AliExpress, CJ Dropshipping ou BigBuy.",
        "Collez l’URL fournisseur et cliquez Importer — titre, images, prix et variantes se remplissent.",
        "Ajustez votre prix de vente pour la marge après livraison et frais COD.",
        "À la commande, fulfilez chez le fournisseur avec l’adresse client depuis Commandes.",
        "Si le fournisseur est en rupture, marquez le produit indisponible.",
      ],
    },
    ar: {
      title: "بدء الدروبشيبينغ مع إيتاجر",
      excerpt: "استورد من AliExpress أو CJ أو BigBuy دون مخزون.",
      body: [
        "أنشئ منتجاً من نوع Dropshipping واختر AliExpress أو CJ أو BigBuy.",
        "الصق رابط المورد واضغط استيراد — يُملأ العنوان والصور والسعر والمتغيرات.",
        "عدّل سعر البيع لهامش بعد الشحن ورسوم COD.",
        "عند الطلب نفّذ الشراء من المورد بعنوان العميل من الطلبات.",
        "إن نفد مخزون المورد عطّل المنتج لتفادي توصيلات مرفوضة.",
      ],
    },
  },
  "product-variants-size-color": {
    fr: {
      title: "Configurer tailles et couleurs",
      excerpt: "Options sans pages produit en double.",
      body: [
        "Éditez un produit et ajoutez des options Taille ou Couleur. Chaque combinaison devient une variante avec SKU et stock.",
        "Optionnel : image par option pour que la galerie change avec la sélection.",
        "Surchargez le prix par variante seulement si besoin (ex. XL plus cher).",
        "Sur la boutique, l’acheteur choisit avant Ajouter au panier — les combinaisons en rupture sont bloquées.",
        "Gardez des noms d’options courts et cohérents.",
      ],
    },
    ar: {
      title: "إعداد متغيرات المقاس واللون",
      excerpt: "خيارات بلا صفحات منتج مكررة.",
      body: [
        "عدّل المنتج وأضف خيارات مثل المقاس أو اللون. كل تركيبة تصبح متغيراً بـ SKU ومخزون.",
        "اختياري: صورة لكل خيار لتحديث المعرض عند الاختيار.",
        "غيّر السعر لكل متغير عند الحاجة فقط.",
        "في المتجر يختار المشتري قبل الإضافة للسلة — التركيبات النافدة تُحظر تلقائياً.",
        "حافظ على أسماء خيارات قصيرة ومتسقة.",
      ],
    },
  },
  "confirm-cod-orders-by-phone": {
    fr: {
      title: "Confirmer les commandes COD par téléphone",
      excerpt: "Appelez avant d’expédier pour réduire les refus.",
      body: [
        "Ouvrez la commande dans Tableau de bord → Commandes : nom, téléphone, ville, adresse.",
        "Appelez ou WhatsApp depuis la page commande. Confirmez produit, total et créneau.",
        "Si le numéro est invalide ou le client annule, marquez annulé avant le livreur.",
        "Utilisez Confirmer la commande après contact — le statut devient Confirmée.",
        "Ajoutez une note marchand (ex. « Confirmé 18:40 ») pour l’équipe.",
      ],
    },
    ar: {
      title: "تأكيد طلبات COD بالهاتف أو واتساب",
      excerpt: "اتصل قبل الشحن لتقليل الرفض.",
      body: [
        "افتح الطلب في لوحة التحكم → الطلبات لترى الاسم والهاتف والمدينة والعنوان.",
        "اتصل أو واتساب من صفحة الطلب. أكّد المنتج والمبلغ وموعد التسليم.",
        "إن كان الرقم غير صالح أو ألغى المشتري، ألغِ الطلب قبل التسليم للساعي.",
        "استخدم «تأكيد الطلب» بعد التواصل — تصبح الحالة مؤكّد.",
        "أضف ملاحظة تاجر قصيرة (مثل «تم التأكيد 18:40»).",
      ],
    },
  },
  "order-statuses-explained": {
    fr: {
      title: "Statuts de commande expliqués",
      excerpt: "En attente, confirmée, expédiée, livrée, annulée, retours.",
      body: [
        "Pending — nouvelle commande, pas encore confirmée.",
        "Confirmed — client vérifié ; prêt à emballer ou ramasser.",
        "Shipped — remise au livreur ; ajoutez le tracking en notes si besoin.",
        "Delivered — client a reçu (et payé COD le cas échéant).",
        "Cancelled / returned — stoppez la fulfillment ; restockez au retour.",
        "Mettez à jour le statut depuis la page commande pour l’historique et l’analytics.",
      ],
    },
    ar: {
      title: "شرح حالات الطلب",
      excerpt: "معلق، مؤكد، مشحون، مُسلَّم، ملغى، ومرتجع.",
      body: [
        "Pending — طلب جديد لم يُؤكَّد بعد.",
        "Confirmed — المشتري موثّق؛ جاهز للتعبئة أو الاستلام.",
        "Shipped — سُلِّم للساعي؛ أضف التتبع في الملاحظات إن وُجد.",
        "Delivered — استلم العميل (ودفع COD إن وُجد).",
        "Cancelled / returned — أوقف التنفيذ وأعد المخزون عند الرجوع.",
        "حدّث الحالة من صفحة الطلب لدعم وتقارير أدق.",
      ],
    },
  },
  "read-traffic-and-conversion-reports": {
    fr: {
      title: "Lire les rapports trafic et conversion",
      excerpt: "Sources, produits et pertes du parcours.",
      body: [
        "Ouvrez Analytics → Rapports et choisissez une période alignée sur votre campagne.",
        "Comparez sessions et commandes pour estimer le taux de conversion. Plus de trafic sans ventes = ads ou créas à revoir.",
        "Les top produits indiquent quoi restocker et mettre en avant.",
        "Avec des UTM, comparez tags et revenus pour scaler les bons canaux.",
        "Capturez les charts clés avant un changement de thème ou de prix.",
      ],
    },
    ar: {
      title: "قراءة تقارير الزيارات والتحويل",
      excerpt: "المصادر والمنتجات ونقاط التراجع.",
      body: [
        "افتح Analytics → Reports واختر نطاقاً زمنياً يطابق حملتك.",
        "قارن الجلسات بالطلبات لتقدير التحويل. زيادة زيارات بلا مبيعات تعني غالباً مشكلة في الإعلان أو الإبداع.",
        "أفضل المنتجات تُظهر ماذا تُعيد تخزينه وماذا تُبرز.",
        "مع روابط UTM قارن الوسوم بالإيرادات لتحديد القنوات للتصعيد.",
        "التقط لقطات للرسوم قبل تغيير القالب أو السعر.",
      ],
    },
  },
  "share-your-store-on-social": {
    fr: {
      title: "Partager votre boutique sur les réseaux",
      excerpt: "WhatsApp, Instagram et QR vers le checkout.",
      body: [
        "Copiez l’URL boutique depuis le dashboard. Un domaine personnalisé inspire plus confiance en pub.",
        "Partagez sur WhatsApp Status et bio Instagram avec une offre courte (livraison, COD).",
        "Générez un QR pour emballages, pop-ups ou flyers.",
        "Pour les posts payants, ajoutez des UTM (utm_source, utm_medium, utm_campaign) avant de coller le lien.",
        "Testez toujours le lien sur mobile — la majorité ouvre depuis Instagram ou WhatsApp.",
      ],
    },
    ar: {
      title: "مشاركة متجرك على وسائل التواصل",
      excerpt: "واتساب وإنستغرام وQR إلى الدفع.",
      body: [
        "انسخ رابط المتجر من لوحة التحكم. النطاق المخصص يبدو أوثق في الإعلانات.",
        "شارِك في حالة واتساب وبايو إنستغرام بعرض قصير (شحن مجاني، COD).",
        "أنشئ صورة QR للتغليف أو الفعاليات أو المنشورات المطبوعة.",
        "للمنشورات المدفوعة أضف وسوم UTM (utm_source وutm_medium وutm_campaign) قبل لصق الرابط.",
        "اختبر الرابط دائماً على الجوال — أغلب المشترين يفتحون من إنستغرام أو واتساب.",
      ],
    },
  },
  "change-store-name-currency-language": {
    fr: {
      title: "Changer nom, devise et langue",
      excerpt: "Marque, prix MAD et boutique FR/AR/EN.",
      body: [
        "Ouvrez Paramètres → Général pour le nom, contacts et logo.",
        "Définissez la devise (ex. MAD) pour les prix et totaux checkout.",
        "Choisissez la langue boutique (EN, FR ou AR). L’arabe active le RTL automatiquement.",
        "Enregistrez et ouvrez l’URL live en navigation privée pour vérifier.",
        "Changer de devise ne convertit pas les totaux des commandes passées.",
      ],
    },
    ar: {
      title: "تغيير اسم المتجر والعملة واللغة",
      excerpt: "علامتك وأسعار الدرهم وواجهة FR/AR/EN.",
      body: [
        "افتح الإعدادات → عام لتحديث الاسم والتواصل والشعار.",
        "عيّن العملة (مثل MAD) لعرض الأسعار وإجمالي الدفع بشكل صحيح.",
        "اختر لغة الواجهة (إنجليزي أو فرنسي أو عربي). العربية تفعّل RTL تلقائياً.",
        "احفظ وافتح رابط المتجر في نافذة خاصة للتأكد.",
        "تغيير العملة لا يحوّل مبالغ الطلبات السابقة.",
      ],
    },
  },
  "upgrade-or-change-your-plan": {
    fr: {
      title: "Upgrader ou changer de forfait",
      excerpt: "Passer entre Starter, Growth et Business.",
      body: [
        "Ouvrez Paramètres → Plan pour voir votre forfait et les upgrades.",
        "Growth et Business débloquent plus de limites, la vérification et 0 % de frais Ettajer.",
        "Les upgrades s’appliquent tout de suite ; la facturation est au prorata.",
        "Vous pouvez basculer mensuel ↔ annuel pour la réduction annuelle.",
        "Contactez le support avant un downgrade si vous utilisez des fonctions du forfait supérieur.",
      ],
    },
    ar: {
      title: "ترقية أو تغيير خطتك",
      excerpt: "التنقل بين Starter وGrowth وBusiness.",
      body: [
        "افتح الإعدادات → الخطة لرؤية خطتك والترقيات المتاحة.",
        "Growth وBusiness يفتحان حدوداً أعلى وأدوات تحقق و0% رسوم إيتاجر.",
        "تُطبَّق الترقيات فوراً؛ الفوترة تُحسب بالتناسب.",
        "يمكنك التبديل بين شهري وسنوي للحصول على خصم السنوي.",
        "تواصل مع الدعم قبل التخفيض إن كنت تعتمد على ميزات الخطة الأعلى.",
      ],
    },
  },
  "ssl-https-custom-domain": {
    fr: {
      title: "SSL et HTTPS sur votre domaine",
      excerpt: "Certificats gratuits après DNS correct.",
      body: [
        "Après connexion du domaine et propagation DNS, Ettajer provisionne le SSL automatiquement.",
        "Ouvrez https://votredomaine.com en navigation privée — cadenas sans alerte.",
        "Si HTTPS échoue, revérifiez DNS (A/CNAME) et attendez la propagation (minutes à 48 h).",
        "Partagez toujours des liens https dans pubs et WhatsApp.",
        "La vérification de domaine Meta exige aussi une homepage HTTPS propre.",
      ],
    },
    ar: {
      title: "SSL وHTTPS على نطاقك المخصص",
      excerpt: "شهادات مجانية بعد توجيه DNS بشكل صحيح.",
      body: [
        "بعد ربط النطاق وانتشار DNS يوفّر إيتاجر SSL تلقائياً.",
        "افتح https://yourdomain.com في نافذة خاصة — يجب أن ترى قفلاً بلا تحذيرات.",
        "إن فشل HTTPS أعد فحص DNS وانتظر الانتشار (دقائق حتى 48 ساعة).",
        "شارِك دائماً روابط https في الإعلانات وواتساب.",
        "التحقق من نطاق Meta يتوقع أيضاً صفحة رئيسية HTTPS تعمل بسلاسة.",
      ],
    },
  },
  "meta-connect-login-errors": {
    fr: {
      title: "Corriger les erreurs Connect with Meta",
      excerpt: "Invalid Scopes, config ID manquant, session expirée.",
      body: [
        "Ettajer utilise Facebook Login for Business avec un configuration ID — ne passez pas les scopes ads_* classiques (Invalid Scopes).",
        "Assurez META_APP_ID, META_APP_SECRET et META_LOGIN_CONFIG_ID, puis redémarrez après modification.",
        "Dans le tableau de bord Meta App : Business app → Facebook Login for Business → Configurations, puis collez le Configuration ID.",
        "Ajoutez l’URI de redirection OAuth (local : http://localhost:3000/api/marketing/meta/oauth/callback).",
        "Si le sélecteur de pixel dit session expirée, reconnectez. Pour la suppression des données, utilisez /data-deletion.",
      ],
    },
    ar: {
      title: "إصلاح أخطاء تسجيل دخول Meta Connect",
      excerpt: "Invalid Scopes أو نقص config ID أو انتهاء الجلسة.",
      body: [
        "يستخدم إيتاجر Facebook Login for Business مع Configuration ID — لا تمرّر صلاحيات ads_* الكلاسيكية (Invalid Scopes).",
        "تأكد من META_APP_ID وMETA_APP_SECRET وMETA_LOGIN_CONFIG_ID ثم أعد تشغيل الخادم بعد التغيير.",
        "في لوحة تطبيق Meta: تطبيق Business → Facebook Login for Business → Configurations ثم الصق Configuration ID.",
        "أضف URI إعادة التوجيه OAuth (محلياً: http://localhost:3000/api/marketing/meta/oauth/callback).",
        "إن قال منتقي البكسل إن الجلسة انتهت، أعد Connect with Meta. لحذف البيانات استخدم /data-deletion.",
      ],
    },
  },
  "checkout-not-completing": {
    fr: {
      title: "Le checkout ne se termine pas",
      excerpt: "Quand les acheteurs ne peuvent pas passer commande COD ou PayPal.",
      body: [
        "Vérifiez qu’au moins une méthode est active dans Paramètres → Paiements : COD ou PayPal (vérifié). Stripe n’est pas encore activable (~2 mois).",
        "Les champs adresse obligatoires doivent être remplis — ville et téléphone comptent pour le COD et les zones de livraison.",
        "Un montant minimum de commande bloque les petits paniers.",
        "Stripe : les cartes arrivent dans ~2 mois. En attendant utilisez COD ou PayPal.",
        "PayPal : le mode (Sandbox / Live) doit correspondre aux identifiants. Devise USD/EUR — pas MAD. Revérifiez après correction.",
        "Demandez de réessayer sur mobile sans bloqueurs de pub.",
        "Vérifiez Commandes → Abandonnés et Meta → Diagnostics si un Purchase attendu n’est pas arrivé.",
      ],
    },
    ar: {
      title: "الدفع لا يكتمل",
      excerpt: "عندما لا يستطيع المشتري إتمام طلب COD أو PayPal.",
      body: [
        "تأكد أن طريقة واحدة على الأقل مفعّلة في الإعدادات → المدفوعات: COD أو PayPal. Stripe غير قابل للتفعيل بعد (~شهرين).",
        "يجب ملء حقول العنوان — المدينة والهاتف مهمان لـ COD ومناطق الشحن.",
        "الحد الأدنى للطلب يمنع السلال الصغيرة.",
        "Stripe: البطاقات خلال نحو شهرين. حتى ذلك استخدم COD أو PayPal.",
        "PayPal: يجب أن يطابق الوضع (Sandbox/Live) بيانات الاعتماد. العملة USD/EUR وليس MAD.",
        "اطلب إعادة المحاولة على بيانات الجوال دون حاجب إعلانات.",
        "راجع الطلبات → متروكة وMeta → Diagnostics إن توقعت حدث شراء ولم يصل.",
      ],
    },
  },
  "ettajer-developer-console-overview": {
    fr: {
      title: "Console Ettajer for Developers",
      excerpt:
        "Créez des apps OAuth, copiez les identifiants et connectez Claude ou Cursor.",
      body: [
        "Ouvrez Tableau de bord → Developer (ou /dashboard/developer). Connectez-vous en tant que marchand propriétaire de la boutique. Cette console est séparée du tableau de bord boutique.",
        "Vous pouvez créer des applications, enregistrer des URI de redirection, copier ID client / secret, créer et faire tourner des clés API, voir les grants OAuth, révoquer l’accès, et consulter Activity.",
        "Créez une app avec un nom clair (Claude MCP, Cursor MCP). Utilisez les presets de redirection ou collez les callbacks exacts — pas de wildcards.",
        "Après création, une bannière unique affiche Client ID et secret. Copiez-les tout de suite. Le secret n’est plus jamais affiché ; sinon Régénérer le secret.",
        "Dépliez une app pour copier l’ID, régénérer le secret, créer une clé API (etsk_live_…), et voir URI et grants. Révoquez un grant pour déconnecter un agent sans supprimer l’app.",
        "Activity liste les actions récentes (thèmes, previews, API). L’endpoint MCP de production est affiché avec copie en un clic.",
        "Docs : /developers (Quickstart, MCP, OAuth, API, Guides). Articles : /help/category/developers.",
      ],
    },
    ar: {
      title: "وحدة تحكم Ettajer for Developers",
      excerpt:
        "أنشئ تطبيقات OAuth وانسخ بيانات الاعتماد واربط Claude أو Cursor.",
      body: [
        "افتح لوحة التحكم → Developer (أو /dashboard/developer) بحساب التاجر مالك المتجر. هذه الوحدة منفصلة عن لوحة المتجر.",
        "يمكنك إنشاء التطبيقات وتسجيل عناوين إعادة التوجيه ونسخ المعرف/السر وإنشاء مفاتيح API ومراجعتها ورؤية منح OAuth والإلغاء ومتابعة Activity.",
        "أنشئ تطبيقاً باسم واضح واستخدم الإعدادات المسبقة لـ Claude وCursor أو الصق العناوين بدقة — بلا بدائل عامة.",
        "بعد الإنشاء تظهر بطاقة لمرة واحدة بمعرف العميل والسر. انسخهما فوراً. لن يُعرض السر مجدداً؛ وإلا أعد توليده.",
        "وسّع التطبيق لنسخ المعرف وتدوير السر وإنشاء مفتاح API (etsk_live_…) ومراجعة المنح. ألغِ المنح لفصل الوكيل دون حذف التطبيق.",
        "Activity يعرض الإجراءات الأخيرة. نقطة MCP للإنتاج معروضة مع نسخ بنقرة.",
        "التوثيق: /developers . المقالات: /help/category/developers .",
      ],
    },
  },
  "create-developer-oauth-app": {
    fr: {
      title: "Créer une app OAuth pour Claude ou Cursor",
      excerpt:
        "Enregistrez les URI exactes, sauvegardez les identifiants, puis autorisez la boutique.",
      body: [
        "Connectez-vous, ouvrez /dashboard/developer, Create app. Nommez l’app d’après le client (Claude MCP, Cursor MCP).",
        "Presets : Claude https://claude.ai/api/mcp/auth_callback ; Cursor local http://localhost:8787/callback ; Cursor cloud https://www.cursor.com/agents/mcp/oauth/callback . Une URI par ligne.",
        "Autres URI possibles : cursor://anysphere.cursor-mcp/oauth/callback et http://localhost:3000/callback pour tests locaux.",
        "Créez l’app, copiez Client ID et secret immédiatement. Stockez-les dans un gestionnaire de mots de passe — pas dans git.",
        "Dans Claude/Cursor, démarrez OAuth PKCE S256. Approuvez les scopes pour une seule boutique. Le jeton est lié à cette boutique — n’envoyez jamais storeId.",
        "Scopes thème IA recommandés : store:read, products:read, collections:read, settings:read, themes:read/create/write/preview, pages:*, media:*, navigation:* . Ajoutez themes:publish seulement si besoin.",
        "En cas d’erreur redirect_uri, comparez caractère par caractère. Voir l’article Fix MCP OAuth redirect mismatch.",
        "Référence : /developers/oauth et /developers/ai-integration .",
      ],
    },
    ar: {
      title: "إنشاء تطبيق OAuth لـ Claude أو Cursor",
      excerpt:
        "سجّل عناوين إعادة التوجيه بدقة واحفظ البيانات ثم فوّض متجرك.",
      body: [
        "سجّل الدخول وافتح /dashboard/developer ثم Create app وسمِّه حسب العميل.",
        "الإعدادات المسبقة: Claude وCursor المحلي والسحابي. عنوان واحد في كل سطر دون بدائل عامة.",
        "أنشئ التطبيق وانسخ Client ID والسر فوراً إلى مدير كلمات مرور — ليس إلى git.",
        "في Claude أو Cursor ابدأ OAuth مع PKCE S256 ووافق على النطاقات لمتجر واحد. الرمز مرتبط بذلك المتجر ولا ترسل storeId.",
        "نطاقات السمات الموصى بها تشمل القراءة والإنشاء والمعاينة دون themes:publish إلا عند الحاجة.",
        "عند خطأ redirect_uri قارن العناوين حرفاً بحرف. راجع مقال إصلاح عدم تطابق إعادة التوجيه.",
        "المراجع: /developers/oauth و/developers/ai-integration .",
      ],
    },
  },
  "connect-claude-or-cursor-mcp": {
    fr: {
      title: "Connecter Claude ou Cursor avec MCP",
      excerpt:
        "Pointez votre client IA vers l’endpoint MCP Ettajer et autorisez via OAuth.",
      body: [
        "Endpoint : https://www.ettajer.com/api/v1/mcp — POST, JSON-RPC 2.0, Authorization: Bearer <token ou etsk_live_…>.",
        "Prérequis : app OAuth avec URI corrects, puis flux authorize ou clé API.",
        "Dans Claude/Cursor, ajoutez le serveur MCP Ettajer et terminez OAuth. Testez initialize, tools/list, resources/list.",
        "Flux agent : get_context → get_theme_schema → create_theme si besoin → apply_theme_batch → preview_theme → publication marchande (ou publish_theme avec themes:publish).",
        "Outils : get_store, get_context, produits/collections, thèmes/pages/sections/média/navigation, preview_theme, publish_theme.",
        "preview_theme renvoie une previewUrl signée courte durée. Gardez themes:publish désactivé pour l’IA par défaut.",
        "Principe : l’IA conçoit la présentation ; Ettajer garde panier, checkout et commandes. Ne jamais coller secrets dans le chat.",
        "Docs : /developers/mcp , /developers/quickstart , /developers/ai-system-prompt .",
      ],
    },
    ar: {
      title: "ربط Claude أو Cursor عبر MCP",
      excerpt:
        "وجّه عميل الذكاء الاصطناعي إلى نقطة MCP في إيتاجر وفوّض عبر OAuth.",
      body: [
        "النقطة: https://www.ettajer.com/api/v1/mcp — POST وJSON-RPC وBearer.",
        "المتطلبات: تطبيق OAuth بعناوين صحيحة ثم التفويض أو مفتاح API.",
        "أضف خادم MCP في Claude أو Cursor وأكمل OAuth ثم اختبر initialize وtools/list.",
        "التدفق: get_context ← المخطط ← إنشاء مسودة ← دفعة ← معاينة ← نشر التاجر (أو publish مع themes:publish).",
        "المعاينة تعيد رابطاً موقّعاً قصير العمر. اترك النشر معطّلاً للذكاء الاصطناعي افتراضياً.",
        "المبدأ: الذكاء الاصطناعي للعرض وإيتاجر للتجارة. لا تلصق الأسرار في المحادثات.",
        "التوثيق: /developers/mcp و/developers/quickstart .",
      ],
    },
  },
  "ai-theme-preview-without-publishing": {
    fr: {
      title: "Design de thème IA sans publication",
      excerpt:
        "Brouillons, lots validés et previews signés. La mise en ligne reste au marchand.",
      body: [
        "Règle : l’IA contrôle la présentation ; Ettajer contrôle panier, checkout et commandes.",
        "Commencez par get_context / GET /api/v1/context et suivez workflow.next. Réutilisez un brouillon existant.",
        "Chargez get_theme_schema, créez un brouillon si besoin, appliquez apply_theme_batch (validation fail-closed).",
        "preview_theme ou POST /api/v1/themes/:id/preview-token donne une URL signée. Les sessions marchand peuvent aussi prévisualiser.",
        "Itérez sans themes:publish. Le marchand publie depuis Themes → AI Designs quand c’est prêt.",
        "Sécurité locataire : pas d’accès cross-store (NOT_FOUND). Scope manquant → INSUFFICIENT_SCOPE.",
        "Prompt système : /developers/ai-system-prompt . Guides : /developers/ai-integration et /developers/themes .",
        "Astuce : testez la preview sur mobile — la plupart des acheteurs marocains naviguent sur téléphone.",
      ],
    },
    ar: {
      title: "تصميم السمة بالذكاء الاصطناعي دون نشر",
      excerpt:
        "مسودات ودفعات معتمدة ومعاينات موقّعة. يبقى النشر بيد التاجر.",
      body: [
        "القاعدة: الذكاء الاصطناعي للعرض وإيتاجر للسلة والدفع والطلبات.",
        "ابدأ بـ get_context واتبع workflow.next. أعد استخدام المسودة إن وُجدت.",
        "حمّل المخطط وأنشئ مسودة عند الحاجة وطبق apply_theme_batch بتحقق صارم.",
        "المعاينة عبر preview_theme أو رمز موقّع. جلسات التاجر يمكنها المعاينة أيضاً.",
        "كرّر بدون themes:publish. ينشر التاجر من Themes → AI Designs.",
        "لا وصول عبر المتاجر (NOT_FOUND). نقص النطاق → INSUFFICIENT_SCOPE.",
        "المزيد: /developers/ai-system-prompt و/developers/ai-integration و/developers/themes .",
        "جرّب المعاينة على الجوال — أغلب المشترين في المغرب يتصفحون من الهاتف.",
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
    developers: "technical",
  };
  return map[categoryId] ?? "general";
}
