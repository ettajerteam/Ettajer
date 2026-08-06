import type { LandingLocale } from "@/lib/landing/landing-i18n";
import { toLandingLocale } from "@/lib/landing/landing-i18n";

export type HomeCopy = {
  yourWebsite: string;
  liveStorefront: string;
  openLiveStore: string;
  copyLink: string;
  copied: string;
  shareWhatsApp: string;
  aiInsights: string;
  recommended: string;
  viewRecommendations: string;
  revenueBreakdown: string;
  visitors: string;
  trafficQuality: string;
  liveVisitors: string;
  activeRightNow: (n: number) => string;
  noLiveVisitors: string;
  recentOrders: string;
  latestPurchases: string;
  viewAll: string;
  noOrdersYet: string;
  noOrdersHint: string;
  createOrder: string;
  shareStore: string;
  inventory: string;
  catalogStock: string;
  marketing: string;
  campaignsRecovery: string;
  bestSelling: string;
  noSalesYet: string;
  bestSellingHint: string;
  addProduct: string;
  customers: string;
  audienceValue: string;
  customerAnalytics: string;
  whereShoppers: string;
  storeHealth: string;
  operationalReadiness: string;
  activity: string;
  liveTimeline: string;
  noActivity: string;
  growBusiness: string;
  setupTasks: string;
  storeCompletion: string;
  news: string;
  resourcesUpdates: string;
  quickActions: string;
  jumpTasks: string;
  monthlyGoal: string;
  storeHealthy: string;
  updated: string;
  notifications: string;
  performance: string;
  firstSaleTitle: string;
  firstSaleSubtitle: string;
  firstSaleStepProduct: string;
  firstSaleStepProductHint: string;
  firstSaleStepShare: string;
  firstSaleStepShareHint: string;
  firstSaleStepOrder: string;
  firstSaleStepOrderHint: string;
  firstSaleCtaProduct: string;
  firstSaleCtaShare: string;
  firstSaleCtaOpen: string;
  firstSaleDone: string;
  firstSaleProgress: (done: number, total: number) => string;
};

const en: HomeCopy = {
  yourWebsite: "Your website",
  liveStorefront: "Live storefront",
  openLiveStore: "Open live store",
  copyLink: "Copy link",
  copied: "Copied",
  shareWhatsApp: "Share on WhatsApp",
  aiInsights: "AI Insights",
  recommended: "Recommended",
  viewRecommendations: "View recommendations",
  revenueBreakdown: "Revenue breakdown",
  visitors: "Visitors",
  trafficQuality: "Traffic quality signals",
  liveVisitors: "Live visitors",
  activeRightNow: (n) => `${n} active right now`,
  noLiveVisitors: "No live visitors right now.",
  recentOrders: "Recent orders",
  latestPurchases: "Latest customer purchases",
  viewAll: "View all",
  noOrdersYet: "No orders yet",
  noOrdersHint: "Create your first order or share your store to start receiving sales.",
  createOrder: "Create order",
  shareStore: "Share store",
  inventory: "Inventory",
  catalogStock: "Catalog and stock health",
  marketing: "Marketing",
  campaignsRecovery: "Discounts and recovery",
  bestSelling: "Best selling products",
  noSalesYet: "No sales yet",
  bestSellingHint: "Your best-selling products will appear here.",
  addProduct: "Add product",
  customers: "Customers",
  audienceValue: "Audience value",
  customerAnalytics: "Customer analytics",
  whereShoppers: "Where shoppers browse from",
  storeHealth: "Store health",
  operationalReadiness: "Operational readiness across your store",
  activity: "Activity",
  liveTimeline: "Live timeline of store events",
  noActivity: "No recent activity.",
  growBusiness: "Grow your business",
  setupTasks: "Recommended setup tasks",
  storeCompletion: "Store completion",
  news: "News",
  resourcesUpdates: "Resources and platform updates",
  quickActions: "Quick actions",
  jumpTasks: "Jump into common merchant tasks",
  monthlyGoal: "Monthly goal",
  storeHealthy: "Store Healthy",
  updated: "Updated",
  notifications: "Notifications",
  performance: "Performance",
  firstSaleTitle: "Get your first sale",
  firstSaleSubtitle: "Three steps — usually under 30 minutes. COD checkout is already on.",
  firstSaleStepProduct: "Add your first product",
  firstSaleStepProductHint: "Name, price, photos — then publish.",
  firstSaleStepShare: "Share your store",
  firstSaleStepShareHint: "Send the link on WhatsApp to friends or customers.",
  firstSaleStepOrder: "Get your first order",
  firstSaleStepOrderHint: "Open your live store and place a test order, or wait for a real one.",
  firstSaleCtaProduct: "Add product",
  firstSaleCtaShare: "Share on WhatsApp",
  firstSaleCtaOpen: "Open live store",
  firstSaleDone: "Done",
  firstSaleProgress: (done, total) => `${done} of ${total} complete`,
};

const fr: HomeCopy = {
  yourWebsite: "Votre site",
  liveStorefront: "Boutique en ligne",
  openLiveStore: "Ouvrir la boutique",
  copyLink: "Copier le lien",
  copied: "Copié",
  shareWhatsApp: "Partager sur WhatsApp",
  aiInsights: "Insights IA",
  recommended: "Recommandé",
  viewRecommendations: "Voir les recommandations",
  revenueBreakdown: "Répartition du chiffre d'affaires",
  visitors: "Visiteurs",
  trafficQuality: "Signaux de qualité du trafic",
  liveVisitors: "Visiteurs en direct",
  activeRightNow: (n) => `${n} actifs en ce moment`,
  noLiveVisitors: "Aucun visiteur en direct pour le moment.",
  recentOrders: "Commandes récentes",
  latestPurchases: "Derniers achats clients",
  viewAll: "Tout voir",
  noOrdersYet: "Pas encore de commandes",
  noOrdersHint: "Créez votre première commande ou partagez votre boutique pour commencer à vendre.",
  createOrder: "Créer une commande",
  shareStore: "Partager la boutique",
  inventory: "Inventaire",
  catalogStock: "Catalogue et stock",
  marketing: "Marketing",
  campaignsRecovery: "Remises et récupération",
  bestSelling: "Meilleures ventes",
  noSalesYet: "Pas encore de ventes",
  bestSellingHint: "Vos meilleurs produits apparaîtront ici.",
  addProduct: "Ajouter un produit",
  customers: "Clients",
  audienceValue: "Valeur de l'audience",
  customerAnalytics: "Analytique clients",
  whereShoppers: "D'où viennent vos visiteurs",
  storeHealth: "Santé de la boutique",
  operationalReadiness: "État opérationnel de votre boutique",
  activity: "Activité",
  liveTimeline: "Fil d'événements en direct",
  noActivity: "Aucune activité récente.",
  growBusiness: "Développez votre activité",
  setupTasks: "Tâches de configuration recommandées",
  storeCompletion: "Complétion de la boutique",
  news: "Actualités",
  resourcesUpdates: "Ressources et mises à jour",
  quickActions: "Actions rapides",
  jumpTasks: "Accédez aux tâches courantes",
  monthlyGoal: "Objectif mensuel",
  storeHealthy: "Boutique saine",
  updated: "Mis à jour",
  notifications: "Notifications",
  performance: "Performance",
  firstSaleTitle: "Obtenez votre première vente",
  firstSaleSubtitle: "Trois étapes — souvent moins de 30 minutes. Le COD est déjà activé.",
  firstSaleStepProduct: "Ajoutez votre premier produit",
  firstSaleStepProductHint: "Nom, prix, photos — puis publiez.",
  firstSaleStepShare: "Partagez votre boutique",
  firstSaleStepShareHint: "Envoyez le lien sur WhatsApp à des proches ou clients.",
  firstSaleStepOrder: "Recevez votre première commande",
  firstSaleStepOrderHint: "Ouvrez la boutique et passez une commande test, ou attendez une vraie.",
  firstSaleCtaProduct: "Ajouter un produit",
  firstSaleCtaShare: "Partager sur WhatsApp",
  firstSaleCtaOpen: "Ouvrir la boutique",
  firstSaleDone: "Fait",
  firstSaleProgress: (done, total) => `${done} sur ${total} terminées`,
};

const ar: HomeCopy = {
  yourWebsite: "موقعك",
  liveStorefront: "المتجر المباشر",
  openLiveStore: "فتح المتجر المباشر",
  copyLink: "نسخ الرابط",
  copied: "تم النسخ",
  shareWhatsApp: "مشاركة عبر واتساب",
  aiInsights: "رؤى الذكاء الاصطناعي",
  recommended: "موصى به",
  viewRecommendations: "عرض التوصيات",
  revenueBreakdown: "تفصيل الإيرادات",
  visitors: "الزوار",
  trafficQuality: "إشارات جودة الزيارات",
  liveVisitors: "الزوار الآن",
  activeRightNow: (n) => `${n} نشط الآن`,
  noLiveVisitors: "لا يوجد زوار نشطون الآن.",
  recentOrders: "الطلبات الأخيرة",
  latestPurchases: "أحدث مشتريات العملاء",
  viewAll: "عرض الكل",
  noOrdersYet: "لا توجد طلبات بعد",
  noOrdersHint: "أنشئ أول طلب أو شارك متجرك لبدء المبيعات.",
  createOrder: "إنشاء طلب",
  shareStore: "مشاركة المتجر",
  inventory: "المخزون",
  catalogStock: "صحة الكتالوج والمخزون",
  marketing: "التسويق",
  campaignsRecovery: "الخصومات واستعادة السلات",
  bestSelling: "الأكثر مبيعًا",
  noSalesYet: "لا مبيعات بعد",
  bestSellingHint: "ستظهر منتجاتك الأكثر مبيعًا هنا.",
  addProduct: "إضافة منتج",
  customers: "العملاء",
  audienceValue: "قيمة الجمهور",
  customerAnalytics: "تحليلات العملاء",
  whereShoppers: "من أين يتصفح المتسوقون",
  storeHealth: "صحة المتجر",
  operationalReadiness: "الجاهزية التشغيلية لمتجرك",
  activity: "النشاط",
  liveTimeline: "الخط الزمني للأحداث",
  noActivity: "لا نشاط حديث.",
  growBusiness: "نمِّ عملك",
  setupTasks: "مهام الإعداد الموصى بها",
  storeCompletion: "اكتمال المتجر",
  news: "الأخبار",
  resourcesUpdates: "الموارد وتحديثات المنصة",
  quickActions: "إجراءات سريعة",
  jumpTasks: "انتقل إلى المهام الشائعة",
  monthlyGoal: "الهدف الشهري",
  storeHealthy: "المتجر بصحة جيدة",
  updated: "تم التحديث",
  notifications: "الإشعارات",
  performance: "الأداء",
  firstSaleTitle: "احصل على أول عملية بيع",
  firstSaleSubtitle: "ثلاث خطوات — غالباً أقل من 30 دقيقة. الدفع عند الاستلام مفعّل مسبقاً.",
  firstSaleStepProduct: "أضف منتجك الأول",
  firstSaleStepProductHint: "الاسم والسعر والصور — ثم انشر.",
  firstSaleStepShare: "شارك متجرك",
  firstSaleStepShareHint: "أرسل الرابط عبر واتساب للأصدقاء أو العملاء.",
  firstSaleStepOrder: "احصل على أول طلب",
  firstSaleStepOrderHint: "افتح المتجر المباشر وجرّب طلباً، أو انتظر طلباً حقيقياً.",
  firstSaleCtaProduct: "إضافة منتج",
  firstSaleCtaShare: "مشاركة عبر واتساب",
  firstSaleCtaOpen: "فتح المتجر المباشر",
  firstSaleDone: "تم",
  firstSaleProgress: (done, total) => `${done} من ${total} مكتملة`,
};

const COPIES: Record<LandingLocale, HomeCopy> = { en, fr, ar };

export function getHomeCopy(locale: string | null | undefined): HomeCopy {
  return COPIES[toLandingLocale(locale ?? "en")];
}
