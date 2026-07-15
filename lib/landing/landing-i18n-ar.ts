import { USD_TO_MAD, type PricingCurrency } from "@/lib/landing/pricing";
import type { HeroSlide, LandingCopy } from "@/lib/landing/landing-i18n";

export const AR_COPY: LandingCopy = {
  nav: {
    pricing: "الأسعار",
    signIn: "تسجيل الدخول",
    startFree: "ابدأ مجاناً",
    languageAria: "اللغة",
  },
  hero: {
    eyebrow: "مصمم للتجار المغاربة",
    ctaPrimary: "ابدأ مجاناً",
    ctaSecondary: "اكتشف حلول الدفع عند الاستلام",
    disclaimer: "بدون بطاقة بنكية · 0 درهم الشهر الأول على كل باقة",
    carouselAria: "العناوين الرئيسية",
    showHeadlineAria: (n) => `عرض العنوان ${n}`,
  },
  socialProof: {
    eyebrow: "موثوق من طرف المقاولات المغربية",
    storesSuffix: " متجراً",
    storesLabel: "متاجر مغربية تعمل على Ettajer",
    metrics: [
      { label: "طلبات وهمية أقل", detail: "متوسط بعد التحقق" },
      { label: "وقت الإطلاق الوسطي", detail: "من التسجيل إلى المتجر" },
      { label: "ارتفاع التحويل على الهاتف", detail: "مقارنة بالمنصات السابقة" },
    ],
  },
  liveActivity: {
    template: (city, message) => `تاجر في ${city} ${message}`,
    events: [
      { id: "1", city: "الدار البيضاء", message: "فعّل التحقق من الدفع عند الاستلام", timeAgo: "منذ دقيقتين" },
      { id: "2", city: "الرباط", message: "أطلق متجراً جديداً", timeAgo: "منذ 5 دقائق" },
      { id: "3", city: "مراكش", message: "أكد 12 طلباً COD", timeAgo: "منذ 8 دقائق" },
      { id: "4", city: "طنجة", message: "ربط Meta Pixel", timeAgo: "منذ 11 دقيقة" },
      { id: "5", city: "فاس", message: "خفّض الطلبات الوهمية بنسبة 43%", timeAgo: "منذ 14 دقيقة" },
      { id: "6", city: "أكادير", message: "نشر أول منتج", timeAgo: "منذ 18 دقيقة" },
    ],
  },
  founderCard: {
    eyebrow: "وصول مبكر",
    title: "انضم إلى أول 100 مؤسس.",
    subtitle:
      "أنشئ حسابك الليلة واحصل على بطاقة مؤسس Ettajer الحصرية — دليل دائم على أنك كنت هنا من اليوم الأول.",
    stats: {
      foundersJoined: "المؤسسون المنضمون",
      spotsLeft: "الأماكن المتبقية",
      full: "مكتمل",
      community: "المجتمع",
    },
    preview: {
      label: "معاينة بطاقة المؤسس",
      lead: "اضغط للقلب · تُرسل بالبريد بعد التسجيل",
      badge: "معاينة مؤسس #0042",
      demoName: "اسمك",
      swipeHint: "اسحب لعرض البطاقة كاملة",
    },
    identity: {
      title: "هويتك على Ettajer تبدأ هنا.",
      body: "سجّل مجاناً، فعّل حسابك واحصل على بطاقة المؤسس من صفحة الوصول المبكر. نرسل أيضاً صورة البطاقة وشهادة PDF بالبريد.",
    },
    mobile: {
      benefitsLabel: "ما يحصل عليه المؤسسون",
      benefitsLead: "تصفح مزايا العضوية",
      carouselAria: "مزايا المؤسسين",
    },
    benefits: [
      {
        title: "بطاقة مؤسس",
        description: "بطاقة عضوية رقمية مميزة برقم مؤسسك الدائم.",
      },
      {
        title: "وصول مبكر",
        description: "جرّب الميزات الجديدة قبل الإطلاق العام.",
      },
      {
        title: "دعم أولوية",
        description: "تواصل مباشر مع فريق Ettajer أثناء بناء المنصة.",
      },
      {
        title: "مكافآت مستقبلية",
        description: "مزايا حصرية من Ettajer وشركاء التجار.",
      },
    ],
    cta: {
      claim: "احصل على بطاقة المؤسس",
      full: "برنامج المؤسسين مكتمل",
      learnMore: "اعرف المزيد",
      signIn: "مؤسس بالفعل؟ سجّل الدخول",
    },
    footer: {
      full: "الأماكن الـ100 للمؤسسين ممتلئة. يمكنك إنشاء حساب والانضمام لقائمة الانتظار.",
      remaining: (spots, max) => `متبقي ${spots} بطاقة مؤسس من ${max} · التسجيل مجاني`,
    },
  },
  whyEttajer: {
    eyebrow: "الميزات",
    title: "كل ما تحتاجه. بلا تعقيد.",
    subtitle: "مجموعة أدوات مركزة للإطلاق والبيع والنمو — بدون إضافات ثقيلة أو تطبيقات منفصلة.",
    mobile: {
      exploreLabel: "استكشف المنصة",
      exploreLead: "تصفح الأدوات الأساسية للدفع عند الاستلام",
      carouselAria: "ميزات المنصة",
    },
    visualBuilder: {
      title: "محرر مرئي",
      description: "اسحب الأقسام، عدّل الألوان والمسافات، وانشر متجراً أنيقاً بدون برمجة.",
      imageAlt: "تصميم متجر إلكتروني",
      cta: "جرّب المحرر",
    },
    features: [
      {
        title: "الدفع عند الاستلام",
        description: "دفع محلي مع المدينة والحي والهاتف — بدون بوابة دفع.",
      },
      {
        title: "حماية من الطلبات الوهمية",
        description: "تحقق عبر واتساب وSMS قبل التغليف والشحن.",
      },
      {
        title: "أتمتة الطلبات",
        description: "الحالات والإشعارات وتدفق التسليم في لوحة واحدة.",
      },
      {
        title: "متجر للهاتف أولاً",
        description: "كل قسم متجاوب لتحويل مشتري COD على أي جهاز.",
      },
    ],
    performance: {
      title: "أداء فائق السرعة",
      description: "توصيل محسّن يبقي صفحاتك سريعة وجاهزة لمحركات البحث من اليوم الأول.",
      cta: "اكتشف الاستضافة",
    },
  },
  cod: {
    eyebrow: "الدفع عند الاستلام",
    title: "حزمة COD المتكاملة",
    subtitle: "كل الأدوات التي يحتاجها التجار المغاربة — من الدفع إلى التسليم للساعي.",
    subtitleDesktop:
      "كل الأدوات التي يحتاجها التجار المغاربة — من الدفع إلى التسليم. تحقق، امنع الطلبات الوهمية واشحن بثقة.",
    imageAlt: "طرود جاهزة للشحن",
    stats: { tools: "أدوات COD", steps: "خطوات", fees: "الرسوم" },
    feesValue: "0 درهم",
    includedLabel: "مشمول في كل باقة",
    capabilities: [
      "دفع COD",
      "تحقق واتساب",
      "تحقق SMS",
      "حماية من الطلبات الوهمية",
      "التحقق من العنوان",
      "أتمتة الطلبات",
      "تكامل شركات التوصيل",
    ],
    workflow: {
      label: "كيف يعمل",
      lead: "ثلاث خطوات من الطلب إلى الشحن",
      carouselAria: "مسار COD",
      stepBadge: (step) => `الخطوة ${step}`,
      steps: [
        {
          title: "دفع COD",
          description: "الزبناء يطلبون بحقول عنوان محلية. بدون بطاقة، بدون بوابة.",
        },
        {
          title: "تحقق واتساب وSMS",
          description: "الزبناء يؤكدون أو يلغون بنقرة. الطلبات الوهمية لا تصل للساعي.",
        },
        {
          title: "أتمتة وشحن",
          description: "الطلبات المؤكدة تصل للوحة مع التحقق من العنوان وتسليم الساعي.",
        },
      ],
    },
    cta: "ابدأ مع COD",
  },
  hosting: {
    eyebrow: "استضافة الجيل القادم",
    title: "السرعة في قلب كل معاملة.",
    subtitle: "عرض مسبق، تخزين على الحافة وتوصيل عالمي — الزبناء لا ينتظرون عند الدفع.",
    imageAlt: "تسويق رقمي وتحليلات",
    stats: {
      load: "التحميل",
      uptime: "التوفر",
      regions: "المناطق",
      loadTime: "وقت التحميل",
      edgeRegions: "مناطق الحافة",
    },
    mobile: {
      highlightsLabel: "أبرز الأداء",
      highlightsLead: "تخزين على الحافة وتوصيل عالمي لدفع سريع",
      carouselAria: "ميزات الاستضافة",
    },
    features: [
      "صفحات المتجر معروضة مسبقاً على الحافة",
      "تحسين وتخزين الصور تلقائياً",
      "نسخ CDN عالمية فورية",
      "Core Web Vitals محسّنة للدفع",
    ],
  },
  integrations: {
    eyebrow: "التكاملات",
    title: "اربط الأدوات التي تستخدمها.",
    subtitle: "بكسلات التسويق والتحليلات — متصلة بدون إضافات أو كود مخصص.",
    mobile: {
      partnerToolsLabel: "أدوات الشركاء",
      partnerToolsLead: "بكسلات وتحليلات وتكاملات تسويقية",
      carouselAria: "التكاملات",
    },
    logoAlt: (name) => `شعار ${name}`,
    groups: [
      {
        title: "التسويق والتحليلات",
        description: "تتبع الحملات ونسّب المبيعات عبر منصات الإعلان.",
      },
    ],
  },
  showcase: {
    eyebrow: "معرض المتاجر",
    title: "مصمم لأذواق راقية.",
    subtitle: "قوالب عالية التحويل — خطوط ومسافات وأقسام جاهزة.",
    mobile: {
      galleryLabel: "معرض القوالب",
      galleryLead: "تصفح قوالب المتاجر",
      carouselAria: "عرض المتاجر",
    },
    stores: [
      {
        name: "Atlas Craft",
        category: "حرف يدوية",
        description: "متجر حرفي بصور كبيرة ودفع COD واضح.",
      },
      {
        name: "Benali Gear",
        category: "معدات رياضية",
        description: "كتالوج منتجات نظيف مع فلاتر سريعة ودفع محلي.",
      },
      {
        name: "Maison Yasmine",
        category: "موضة",
        description: "واجهة أنيقة مع عروض موسمية وتحقق واتساب.",
      },
    ],
    storefrontAlt: (name) => `واجهة متجر ${name}`,
    cta: "استكشف القوالب",
  },
  merchants: {
    eyebrow: "موثوق من التجار المغاربة",
    title: "تجار حقيقيون. نتائج حقيقية.",
    subtitle: "من الدار البيضاء إلى أكادير، العلامات المغربية تستخدم Ettajer للإطلاق والبيع والنمو بثقة.",
    mobile: {
      storiesLabel: "قصص التجار",
      storiesLead: "تصفح تجارب ناجحة",
      carouselAria: "شهادات التجار",
    },
    testimonials: [
      {
        name: "ياسمين الأمراني",
        role: "مؤسسة",
        store: "Maison Yasmine",
        city: "الدار البيضاء",
        quote: "أطلقنا في بعد ظهر واحد. التحقق عبر واتساب وحده خفّض الطلبات الوهمية تقريباً للنصف.",
        avatar: "/landing/profiles/yasmine-el-amrani.jpg",
      },
      {
        name: "كريم بنعلي",
        role: "مالك",
        store: "Benali Gear",
        city: "الرباط",
        quote: "المحرر سريع ونظيف. أعدت تصميم الصفحة الرئيسية بدون سطر برمجة واحد.",
        avatar: "/landing/profiles/karim-benali.jpg",
      },
      {
        name: "سلمى الإدريسي",
        role: "مؤسسة",
        store: "Idrissi Ceramics",
        city: "فاس",
        quote: "واجهة المتجر أصبحت فاخرة. الزبناء يثقون أكثر والدفع COD أسلس.",
        avatar: "/landing/profiles/salma-idrissi.jpg",
      },
      {
        name: "مهدي العلوي",
        role: "مسؤول العمليات",
        store: "Alaoui Essentials",
        city: "مراكش",
        quote: "الطلبات وتسليم الساعي وتأكيد COD في مكان واحد. وفّر علينا ساعات كل أسبوع.",
        avatar: "/landing/profiles/mehdi-alaoui.jpg",
      },
      {
        name: "نادية الشرقاوي",
        role: "مؤسسة",
        store: "Cherkaoui Beauty",
        city: "طنجة",
        quote: "الشهر الأول بـ0 درهم سمح لنا باختبار COD جيداً قبل توسيع الإعلانات.",
        avatar: "/landing/profiles/nadia-cherkaoui.jpg",
      },
      {
        name: "عمر التازي",
        role: "شريك مؤسس",
        store: "Tazi Streetwear",
        city: "أكادير",
        quote: "سرعة الصفحات أفضل بكثير. مبيعات COD على الهاتف انطلقت من الأسبوع الأول.",
        avatar: "/landing/profiles/omar-tazi.jpg",
      },
    ],
  },
  pricing: {
    eyebrow: "أسعار بسيطة",
    title: "ثلاث باقات. بلا مفاجآت.",
    subtitle:
      "0 درهم الشهر الأول على Starter وGrowth وBusiness. كل باقة تشمل دفع COD واستضافة edge والمحرر المرئي.",
    billing: {
      monthly: "شهري",
      annualMobile: "سنوي · خصم 20%",
      annualDesktop: "سنوياً · وفّر 20%",
    },
    mobile: {
      choosePlanLabel: "اختر باقتك",
      choosePlanLead: "قارن Starter وGrowth وBusiness",
      carouselAria: "باقات الأسعار",
    },
    badge: { mostPopular: "الأكثر شعبية" },
    firstMonth: { label: "الشهر الأول", value: "0 درهم", then: "ثم " },
    footnote: {
      mobile: "0 درهم الشهر الأول على كل باقة.",
      desktop: (includes) => `0 درهم الشهر الأول على كل باقة. كل الباقات تشمل ${includes}.`,
    },
    everyPlanIncludes: "كل باقة تشمل",
    includes: [
      "0% رسوم على Growth وBusiness",
      "أمان SSL",
      "استضافة edge",
      "دفع جاهز لـ COD",
    ],
    plans: [
      {
        name: "Starter",
        description: "أطلق متجرك الأول واختبر كتالوجك مع COD.",
        cta: "اختر Starter",
        features: [
          "دفع COD مشمول",
          "حتى 100 منتج",
          "نطاق مخصص واحد",
          "محرر متجر مرئي",
        ],
      },
      {
        name: "Growth",
        description: "انمو بـ0% رسوم منصة وأتمتة COD كاملة.",
        cta: "اختر Growth",
        features: [
          "0% رسوم معاملات Ettajer",
          "تحقق واتساب وSMS",
          "منتجات غير محدودة",
          "3 نطاقات مخصصة",
          "أتمتة الطلبات",
        ],
      },
      {
        name: "Business",
        description: "عمليات COD كثيفة مع دعم مخصص.",
        cta: "اختر Business",
        features: [
          "0% رسوم معاملات Ettajer",
          "تكامل شركات التوصيل",
          "متاجر ونطاقات غير محدودة",
          "مساعدة في الهجرة",
          "مدير حساب مخصص",
        ],
      },
    ],
    formatPrice: (amountUsd, currency, perMonth) => {
      if (currency === "MAD") {
        const mad = amountUsd * USD_TO_MAD;
        return perMonth ? `${mad} درهم/شهر` : `${mad} درهم`;
      }
      return perMonth ? `${amountUsd} $/شهر` : `${amountUsd} $`;
    },
    formatSavings: (savedUsd, currency) => {
      if (currency === "MAD") return `وفّر ${savedUsd * USD_TO_MAD} درهم/سنة`;
      return `وفّر ${savedUsd} $/سنة`;
    },
    formatAnnualTotal: (totalUsd, currency) => {
      if (currency === "MAD") return `${totalUsd * USD_TO_MAD} درهم/سنة`;
      return `${totalUsd} $/سنة`;
    },
  },
  faq: {
    eyebrow: "مركز المساعدة",
    title: "الأسئلة الشائعة",
    subtitle: "إجابات سريعة حول الإعداد والأسعار والهجرة والإطلاق.",
    stillHaveQuestions: "لا تزال لديك أسئلة؟",
    browseHelpCenter: "تصفح مركز المساعدة",
    browseHelpCenterCta: "مركز المساعدة",
    sidebarBody: "نساعدك في اختيار الباقة أو هجرة الكتالوج أو إعداد COD.",
    items: [
      {
        category: "الإعداد",
        question: "كم يستغرق الإطلاق مع COD؟",
        answer:
          "معظم التجار يذهبون للإنترنت في أقل من خمس دقائق. سجّل، أضف منتجات، فعّل دفع COD وانشر متجرك. التحقق عبر واتساب وSMS متاح فوراً — بدون بوابة دفع أو مطور.",
      },
      {
        category: "COD",
        question: "كيف يقلل Ettajer الطلبات الوهمية؟",
        answer:
          "بعد الدفع، الزبناء يؤكدون أو يلغون عبر واتساب أو SMS قبل الشحن. الأرقام غير الصالحة والطلبات غير المؤكدة لا تدخل قائمة التجهيز. التجار يلاحظون انخفاضاً حاداً في الرفض عند التسليم.",
      },
      {
        category: "النطاقات",
        question: "هل يمكنني ربط نطاقي الخاص؟",
        answer:
          "نعم — على كل باقة. أضف نطاقك في الإعدادات، حدّث DNS وEttajer يوفّر SSL تلقائياً. متجرك يبقى على نفس شبكة الحافة.",
      },
      {
        category: "الهجرة",
        question: "هل يمكنني الهجرة من Shopify أو WooCommerce؟",
        answer:
          "نعم. استورد عبر CSV أو اربط Shopify مباشرة. نحافظ على العناوين والصور والمتغيرات والروابط قدر الإمكان. أعد بناء واجهتك في المحرر المرئي — معظم الهجرات تتم في يوم واحد.",
      },
      {
        category: "الأسعار",
        question: "هل تفرضون رسوم معاملات؟",
        answer:
          "باقات Growth وBusiness تشمل 0% رسوم Ettajer — تحتفظ بمزيد من كل بيعة COD أو بطاقة. Starter يشمل رسوم منصة صغيرة. رسوم Stripe للبطاقات تنطبق فقط إن قبلت الدفع الإلكتروني.",
      },
      {
        category: "النمو",
        question: "ما الذي يجعل Ettajer أفضل للمغرب من Shopify؟",
        answer:
          "Ettajer مبني حول COD: حقول دفع محلية، تحقق واتساب، حماية من الطلبات الوهمية، التحقق من العنوان وأتمتة الطلبات جاهزة. بدون إضافات أو حيل — متجر ولوحة مصممان لكيفية بيع التجار المغاربة فعلياً.",
      },
    ],
  },
  cta: {
    eyebrow: "أطلق اليوم",
    title: "مستعد للبناء؟",
    subtitle: "دفع COD والتحقق ومحرر مرئي — جاهز في دقائق.",
    startForFree: "ابدأ مجاناً",
    signIn: "تسجيل الدخول",
  },
  footer: {
    tagline: "تجارة COD للتجار المغاربة — أطلق، تحقق وسلّم من منصة واحدة.",
    copyright: (year) => `© ${year} Ettajer. جميع الحقوق محفوظة.`,
    mobile: {
      getStarted: "ابدأ",
      startForFree: "ابدأ مجاناً",
      firstMonthSubtitle: "0 درهم الشهر الأول",
      explore: "استكشف",
      support: "الدعم",
      signInSubtitle: "ادخل إلى لوحتك",
    },
    nav: {
      platform: {
        title: "المنصة",
        links: {
          features: "الميزات",
          templates: "القوالب",
          integrations: "التكاملات",
          pricing: "الأسعار",
        },
      },
      features: {
        title: "الميزات",
        links: {
          codSuite: "حزمة COD",
          visualBuilder: "المحرر المرئي",
          orderManagement: "إدارة الطلبات",
          performance: "الأداء",
        },
      },
      resources: {
        title: "الموارد",
        links: {
          helpCenter: "مركز المساعدة",
          founderCard: "بطاقة المؤسس",
          contactSupport: "اتصل بالدعم",
          faq: "الأسئلة الشائعة",
          migration: "الهجرة",
        },
      },
      company: {
        title: "الشركة",
        links: {
          merchants: "التجار",
          about: "من نحن",
          signUp: "إنشاء حساب",
          signIn: "تسجيل الدخول",
        },
      },
      legal: {
        title: "قانوني",
        links: {
          privacy: "الخصوصية",
          terms: "الشروط",
          cookies: "ملفات تعريف الارتباط",
          apiDocs: "وثائق API",
        },
      },
      support: {
        title: "الدعم",
        links: {
          getHelp: "احصل على مساعدة",
          contact: "اتصل",
          emailSupport: "دعم بالبريد",
        },
      },
    },
  },
  mobileNav: {
    openMenu: "فتح القائمة",
    closeMenu: "إغلاق القائمة",
    navigationMenu: "قائمة التنقل",
    close: "إغلاق",
    tagline: "تجارة COD للتجار المغاربة",
    startForFree: "ابدأ مجاناً",
    explore: "استكشف",
    account: "الحساب",
    support: "الدعم",
    language: "اللغة",
    createAccount: "إنشاء حساب",
    createAccountSubtitle: "0 درهم الشهر الأول · انضم للمؤسسين",
    signInSubtitle: "ادخل إلى لوحتك",
    sections: {
      founderCard: { label: "بطاقة المؤسس", subtitle: "أول 100 عضو" },
      features: { label: "الميزات", subtitle: "المحرر والأدوات" },
      cod: { label: "COD", subtitle: "الدفع عند الاستلام" },
      gallery: { label: "المعرض", subtitle: "قوالب المتاجر" },
      pricing: { label: "الأسعار", subtitle: "0 درهم الشهر الأول" },
      faq: { label: "الأسئلة الشائعة", subtitle: "إجابات سريعة" },
    },
    supportLinks: {
      helpCenter: "مركز المساعدة",
      contactSupport: "اتصل بالدعم",
    },
  },
};

export const HERO_SLIDES_AR: HeroSlide[] = [
  {
    lines: [
      { before: "ابنِ علامتك وبع لزبائنك", highlight: "", after: "" },
      { before: "في ", highlight: "العالم", after: " — من واجهة متجر واحدة أنيقة." },
    ],
    subtitle:
      "وصل للمشترين في المغرب وخارجه بمتجر مصقول ودفع محلي وأدوات للنمو عبر الحدود.",
  },
  {
    lines: [
      { before: "أنشئ وانشر وبع منتجات ", highlight: "رقمية", after: "" },
      { before: "تُسلّم فوراً وتتوسع بلا حدود.", highlight: "", after: "" },
    ],
    subtitle:
      "دورات وقوالب وتحميلات واشتراكات — أطلق بسرعة، اقبل الدفع بطريقتك واجمع كل مبيعة في لوحة واحدة.",
  },
  {
    lines: [
      { before: "أدر عمل ", highlight: "دروبشيبينغ", after: " بدون مستودعات،" },
      { before: "بدون إضافات وبدون صداع تشغيلي.", highlight: "", after: "" },
    ],
    subtitle:
      "وفّر المنتجات، أتمت الطلبات وسلّم من أي مكان — Ettajer يدير المتجر وأنت تدير النمو.",
  },
  {
    lines: [
      { before: "تجارة ", highlight: "COD", after: " للتجار المغاربة،" },
      {
        before: "مصممة للتحقق من الطلبات والتسليم الأسرع والنمو بثقة.",
        highlight: "",
        after: "",
      },
    ],
    subtitle:
      "دفع عند الاستلام أصلي، تحقق واتساب وSMS وأتمتة الطلبات — بدون بوابة دفع.",
  },
];
