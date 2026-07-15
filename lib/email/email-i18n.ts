import type { OrderStatus } from "@/types";
import type { LandingLocale } from "@/lib/landing/landing-i18n";

export type EmailShellCopy = {
  whatHappensNext: string;
  buttonNotWorking: string;
  needHelp: string;
  visitHelpCenter: string;
  tagline: string;
};

export type EmailOrderStatusCopy = {
  label: string;
  message: string;
};

export type EmailCopy = {
  shell: EmailShellCopy;
  magicLink: {
    subject: string;
    previewText: string;
    title: string;
    greeting: string;
    body: (email: string) => string;
    cta: string;
    expiryNote: string;
    steps: string[];
    footerNote: string;
  };
  passwordReset: {
    subject: string;
    previewText: string;
    title: string;
    greeting: string;
    body: (email: string) => string;
    cta: string;
    expiryNote: string;
    steps: string[];
    footerNote: string;
  };
  passwordChanged: {
    subject: string;
    previewText: string;
    title: string;
    badge: string;
    greeting: string;
    body: (email: string) => string;
    cta: string;
    steps: string[];
    footerNote: string;
  };
  activation: {
    subject: (code: string) => string;
    previewText: (code: string) => string;
    title: string;
    badge: string;
    greeting: (name: string) => string;
    body: string;
    codeLabel: string;
    codeHint: string;
    cta: string;
    steps: string[];
    expiryNote: string;
    footerNote: string;
  };
  welcome: {
    subject: string;
    previewText: string;
    title: string;
    badge: string;
    greeting: (name: string) => string;
    body: (email: string) => string;
    cta: string;
    steps: string[];
    highlightTitle: string;
    highlightBody: string;
    footerNote: string;
  };
  founderWelcome: {
    subject: (padded: string) => string;
    previewText: (padded: string) => string;
    title: string;
    badge: (padded: string) => string;
    greeting: (name: string) => string;
    body: (founderLabel: string) => string;
    cardLabel: string;
    cardHint: string;
    founderNumber: string;
    status: string;
    statusValue: string;
    cta: string;
    highlightTitle: string;
    highlightBody: string;
    footerNote: string;
  };
  orderConfirmed: {
    subject: (orderNumber: string) => string;
    previewText: (orderNumber: string) => string;
    title: string;
    badge: string;
    greeting: (name: string) => string;
    body: string;
    orderLabel: string;
    shipToLabel: string;
    itemsHeader: string;
    totalHeader: string;
    subtotal: string;
    shipping: string;
    shippingFree: string;
    total: string;
    footerNote: (storeName: string) => string;
  };
  orderStatus: {
    subject: (orderNumber: string, statusLabel: string) => string;
    previewText: (orderNumber: string, statusLabel: string) => string;
    title: (statusLabel: string) => string;
    greeting: (name: string) => string;
    orderLabel: string;
    totalLabel: string;
    noteLabel: string;
    footerNote: (storeName: string) => string;
    statuses: Record<OrderStatus, EmailOrderStatusCopy>;
  };
  supportConfirmation: {
    subject: string;
    previewText: string;
    title: string;
    greeting: (name: string) => string;
    body: (topic: string) => string;
    highlightTitle: string;
    highlightBody: (helpUrl: string) => string;
    footerNote: string;
  };
  supportTicket: {
    previewText: (topic: string) => string;
    badge: string;
    greeting: (name: string) => string;
    emailLabel: string;
    articleLabel: string;
    footerNote: string;
  };
};

const EN: EmailCopy = {
  shell: {
    whatHappensNext: "What happens next",
    buttonNotWorking: "Button not working? Copy this link:",
    needHelp: "Need help?",
    visitHelpCenter: "Visit Help Center",
    tagline: "Built for Moroccan merchants",
  },
  magicLink: {
    subject: "Sign in to Ettajer",
    previewText: "Your secure sign-in link for Ettajer is ready.",
    title: "Sign in to Ettajer",
    greeting: "Hi there,",
    body: (email) =>
      `Tap the button below to sign in to <strong>${email}</strong>. No password needed.`,
    cta: "Sign in securely",
    expiryNote: "This link expires in 24 hours.",
    steps: [
      "Open the secure sign-in page",
      "Access your dashboard instantly",
      "Manage orders, products, and your store",
    ],
    footerNote: "If you didn't request this email, you can safely ignore it.",
  },
  passwordReset: {
    subject: "Reset your Ettajer password",
    previewText: "Reset your Ettajer password with this secure link.",
    title: "Reset your password",
    greeting: "Hi there,",
    body: (email) =>
      `We received a request to reset the password for <strong>${email}</strong>.`,
    cta: "Choose new password",
    expiryNote: "This link expires in 1 hour for your security.",
    steps: [
      "Open the secure reset page",
      "Create a strong new password",
      "Sign in to your dashboard",
    ],
    footerNote:
      "If you didn't request a password reset, ignore this email. Your password won't change.",
  },
  passwordChanged: {
    subject: "Your Ettajer password was updated",
    previewText: "Your Ettajer password was updated successfully.",
    title: "Password updated",
    badge: "Security",
    greeting: "Hi there,",
    body: (email) =>
      `Your password for <strong>${email}</strong> was changed successfully.`,
    cta: "Sign in to Ettajer",
    steps: [
      "Go to the sign-in page",
      "Enter your email and new password",
      "Continue managing your store",
    ],
    footerNote: "If you didn't make this change, contact support immediately.",
  },
  activation: {
    subject: (code) => `${code} is your Ettajer activation code`,
    previewText: (code) => `Your Ettajer activation code is ${code}`,
    title: "Activate your account",
    badge: "Verification",
    greeting: (name) => `Hi ${name},`,
    body: "Thanks for joining Ettajer. Use the code below to verify your email and activate your founder account.",
    codeLabel: "Your activation code",
    codeHint:
      "Enter this 6-digit code to activate your account. Expires in 15 minutes.",
    cta: "Activate my account",
    steps: [
      "Open the activation page",
      "Enter the 6-digit code from this email",
      "Access your founder card and early access",
    ],
    expiryNote: "This code expires in 15 minutes for your security.",
    footerNote:
      "If you didn't create an Ettajer account, you can safely ignore this email.",
  },
  welcome: {
    subject: "Welcome to Ettajer — let's launch your store",
    previewText: "Welcome to Ettajer — launch your COD store in minutes.",
    title: "Welcome to Ettajer",
    badge: "New account",
    greeting: (name) => `Hi ${name},`,
    body: (email) =>
      `Your merchant account <strong>${email}</strong> is ready. Launch your COD storefront, verify buyers, and manage orders from one dashboard.`,
    cta: "Set up your store",
    steps: [
      "Complete your store profile",
      "Add products and enable COD checkout",
      "Publish and start receiving orders",
    ],
    highlightTitle: "Built for Morocco",
    highlightBody:
      "Native COD checkout, WhatsApp verification, and courier-ready order flows — no payment gateway required.",
    footerNote: "You're receiving this because you created an Ettajer account.",
  },
  founderWelcome: {
    subject: (padded) => `Welcome to Ettajer — You're Founder #${padded} 🎉`,
    previewText: (padded) => `Welcome to Ettajer — You're Founder #${padded}`,
    title: "Welcome to Ettajer",
    badge: (padded) => `Founder #${padded}`,
    greeting: (name) => `Hi ${name},`,
    body: (founderLabel) =>
      `Welcome to Ettajer.<br /><br />Your account has been created successfully.<br /><br />You are officially part of our <strong>first merchant community</strong> — ${founderLabel}.`,
    cardLabel: "Your Founder Card",
    cardHint:
      "Your founder card PNG and membership certificate PDF are also attached to this email.",
    founderNumber: "Founder Number",
    status: "Status",
    statusValue: "Early Access Member",
    cta: "View your early access",
    highlightTitle: "What's next",
    highlightBody:
      "We'll notify you when your store dashboard becomes available. Save your attached founder card and certificate — they're yours forever.",
    footerNote: "Thank you for building Ettajer with us. The Ettajer Team",
  },
  orderConfirmed: {
    subject: (orderNumber) => `Order confirmed — ${orderNumber}`,
    previewText: (orderNumber) => `Your order ${orderNumber} is confirmed.`,
    title: "Order confirmed",
    badge: "Confirmed",
    greeting: (name) => `Hi ${name},`,
    body: "We've received your order and will process it shortly. Here's your summary:",
    orderLabel: "Order",
    shipToLabel: "Ship to",
    itemsHeader: "Items",
    totalHeader: "Total",
    subtotal: "Subtotal",
    shipping: "Shipping",
    shippingFree: "Free",
    total: "Total",
    footerNote: (storeName) => `Thank you for shopping with ${storeName}.`,
  },
  orderStatus: {
    subject: (orderNumber, statusLabel) =>
      `Order ${orderNumber} — ${statusLabel}`,
    previewText: (orderNumber, statusLabel) =>
      `Order ${orderNumber} is now ${statusLabel.toLowerCase()}.`,
    title: (statusLabel) => `Order ${statusLabel}`,
    greeting: (name) => `Hi ${name},`,
    orderLabel: "Order",
    totalLabel: "Total",
    noteLabel: "Note",
    footerNote: (storeName) => `Thank you for shopping with ${storeName}.`,
    statuses: {
      draft: { label: "Draft", message: "This order is still a draft." },
      pending: {
        label: "Pending",
        message: "We've received your order and will process it shortly.",
      },
      processing: {
        label: "Processing",
        message: "Your order is now being prepared for shipment.",
      },
      shipped: {
        label: "Shipped",
        message: "Great news — your order is on its way.",
      },
      delivered: {
        label: "Delivered",
        message: "Your order has been delivered. Enjoy your purchase!",
      },
      returned: { label: "Returned", message: "Your return has been processed." },
      cancelled: {
        label: "Cancelled",
        message:
          "Your order was cancelled. Contact the store if you have questions.",
      },
    },
  },
  supportConfirmation: {
    subject: "We received your message — Ettajer Support",
    previewText: "We received your support message and will reply soon.",
    title: "We got your message",
    greeting: (name) => `Hi ${name},`,
    body: (topic) =>
      `Thanks for reaching out about <strong>${topic}</strong>. Our team typically replies within 24 hours on business days.`,
    highlightTitle: "While you wait",
    highlightBody: (helpUrl) =>
      `Browse the <a href="${helpUrl}" style="color:#3b82f6;">Help Center</a> for instant answers on COD checkout, orders, and store setup.`,
    footerNote: "Reply to this email to add more details to your request.",
  },
  supportTicket: {
    previewText: (topic) => `New support request: ${topic}`,
    badge: "Support ticket",
    greeting: (name) => `From ${name}`,
    emailLabel: "Email",
    articleLabel: "Article",
    footerNote:
      "Reply directly to this email — your response goes to the customer.",
  },
};

const FR: EmailCopy = {
  shell: {
    whatHappensNext: "Prochaines étapes",
    buttonNotWorking: "Le bouton ne fonctionne pas ? Copiez ce lien :",
    needHelp: "Besoin d'aide ?",
    visitHelpCenter: "Centre d'aide",
    tagline: "Conçu pour les commerçants marocains",
  },
  magicLink: {
    subject: "Connexion à Ettajer",
    previewText: "Votre lien de connexion sécurisé Ettajer est prêt.",
    title: "Connexion à Ettajer",
    greeting: "Bonjour,",
    body: (email) =>
      `Appuyez sur le bouton ci-dessous pour vous connecter à <strong>${email}</strong>. Aucun mot de passe requis.`,
    cta: "Se connecter en toute sécurité",
    expiryNote: "Ce lien expire dans 24 heures.",
    steps: [
      "Ouvrez la page de connexion sécurisée",
      "Accédez instantanément à votre tableau de bord",
      "Gérez commandes, produits et boutique",
    ],
    footerNote:
      "Si vous n'avez pas demandé cet e-mail, vous pouvez l'ignorer en toute sécurité.",
  },
  passwordReset: {
    subject: "Réinitialisez votre mot de passe Ettajer",
    previewText: "Réinitialisez votre mot de passe Ettajer avec ce lien sécurisé.",
    title: "Réinitialiser le mot de passe",
    greeting: "Bonjour,",
    body: (email) =>
      `Nous avons reçu une demande de réinitialisation du mot de passe pour <strong>${email}</strong>.`,
    cta: "Choisir un nouveau mot de passe",
    expiryNote: "Ce lien expire dans 1 heure pour votre sécurité.",
    steps: [
      "Ouvrez la page de réinitialisation sécurisée",
      "Créez un nouveau mot de passe fort",
      "Connectez-vous à votre tableau de bord",
    ],
    footerNote:
      "Si vous n'avez pas demandé de réinitialisation, ignorez cet e-mail. Votre mot de passe ne changera pas.",
  },
  passwordChanged: {
    subject: "Votre mot de passe Ettajer a été mis à jour",
    previewText: "Votre mot de passe Ettajer a été mis à jour avec succès.",
    title: "Mot de passe mis à jour",
    badge: "Sécurité",
    greeting: "Bonjour,",
    body: (email) =>
      `Le mot de passe de <strong>${email}</strong> a été modifié avec succès.`,
    cta: "Se connecter à Ettajer",
    steps: [
      "Allez à la page de connexion",
      "Entrez votre e-mail et votre nouveau mot de passe",
      "Continuez à gérer votre boutique",
    ],
    footerNote:
      "Si vous n'avez pas effectué ce changement, contactez le support immédiatement.",
  },
  activation: {
    subject: (code) => `${code} est votre code d'activation Ettajer`,
    previewText: (code) => `Votre code d'activation Ettajer est ${code}`,
    title: "Activez votre compte",
    badge: "Vérification",
    greeting: (name) => `Bonjour ${name},`,
    body: "Merci de rejoindre Ettajer. Utilisez le code ci-dessous pour vérifier votre e-mail et activer votre compte fondateur.",
    codeLabel: "Votre code d'activation",
    codeHint:
      "Entrez ce code à 6 chiffres pour activer votre compte. Expire dans 15 minutes.",
    cta: "Activer mon compte",
    steps: [
      "Ouvrez la page d'activation",
      "Entrez le code à 6 chiffres de cet e-mail",
      "Accédez à votre carte fondateur et à l'accès anticipé",
    ],
    expiryNote: "Ce code expire dans 15 minutes pour votre sécurité.",
    footerNote:
      "Si vous n'avez pas créé de compte Ettajer, vous pouvez ignorer cet e-mail.",
  },
  welcome: {
    subject: "Bienvenue sur Ettajer — lancez votre boutique",
    previewText: "Bienvenue sur Ettajer — lancez votre boutique COD en quelques minutes.",
    title: "Bienvenue sur Ettajer",
    badge: "Nouveau compte",
    greeting: (name) => `Bonjour ${name},`,
    body: (email) =>
      `Votre compte marchand <strong>${email}</strong> est prêt. Lancez votre boutique COD, vérifiez les acheteurs et gérez les commandes depuis un seul tableau de bord.`,
    cta: "Configurer votre boutique",
    steps: [
      "Complétez le profil de votre boutique",
      "Ajoutez des produits et activez le paiement COD",
      "Publiez et commencez à recevoir des commandes",
    ],
    highlightTitle: "Conçu pour le Maroc",
    highlightBody:
      "Paiement COD natif, vérification WhatsApp et flux de commandes prêts pour les livreurs — sans passerelle de paiement.",
    footerNote: "Vous recevez cet e-mail car vous avez créé un compte Ettajer.",
  },
  founderWelcome: {
    subject: (padded) => `Bienvenue sur Ettajer — Vous êtes Fondateur n°${padded} 🎉`,
    previewText: (padded) => `Bienvenue sur Ettajer — Vous êtes Fondateur n°${padded}`,
    title: "Bienvenue sur Ettajer",
    badge: (padded) => `Fondateur n°${padded}`,
    greeting: (name) => `Bonjour ${name},`,
    body: (founderLabel) =>
      `Bienvenue sur Ettajer.<br /><br />Votre compte a été créé avec succès.<br /><br />Vous faites officiellement partie de notre <strong>première communauté de marchands</strong> — ${founderLabel}.`,
    cardLabel: "Votre carte Fondateur",
    cardHint:
      "Votre carte fondateur PNG et votre certificat PDF sont également joints à cet e-mail.",
    founderNumber: "Numéro fondateur",
    status: "Statut",
    statusValue: "Membre accès anticipé",
    cta: "Voir votre accès anticipé",
    highlightTitle: "La suite",
    highlightBody:
      "Nous vous préviendrons quand votre tableau de bord boutique sera disponible. Conservez votre carte et certificat joints — ils sont à vous pour toujours.",
    footerNote: "Merci de construire Ettajer avec nous. L'équipe Ettajer",
  },
  orderConfirmed: {
    subject: (orderNumber) => `Commande confirmée — ${orderNumber}`,
    previewText: (orderNumber) => `Votre commande ${orderNumber} est confirmée.`,
    title: "Commande confirmée",
    badge: "Confirmée",
    greeting: (name) => `Bonjour ${name},`,
    body: "Nous avons reçu votre commande et la traiterons sous peu. Voici le récapitulatif :",
    orderLabel: "Commande",
    shipToLabel: "Livraison",
    itemsHeader: "Articles",
    totalHeader: "Total",
    subtotal: "Sous-total",
    shipping: "Livraison",
    shippingFree: "Gratuit",
    total: "Total",
    footerNote: (storeName) => `Merci d'avoir acheté chez ${storeName}.`,
  },
  orderStatus: {
    subject: (orderNumber, statusLabel) =>
      `Commande ${orderNumber} — ${statusLabel}`,
    previewText: (orderNumber, statusLabel) =>
      `La commande ${orderNumber} est maintenant ${statusLabel.toLowerCase()}.`,
    title: (statusLabel) => `Commande ${statusLabel}`,
    greeting: (name) => `Bonjour ${name},`,
    orderLabel: "Commande",
    totalLabel: "Total",
    noteLabel: "Note",
    footerNote: (storeName) => `Merci d'avoir acheté chez ${storeName}.`,
    statuses: {
      draft: { label: "Brouillon", message: "Cette commande est encore un brouillon." },
      pending: {
        label: "En attente",
        message: "Nous avons reçu votre commande et la traiterons sous peu.",
      },
      processing: {
        label: "En traitement",
        message: "Votre commande est en cours de préparation pour l'expédition.",
      },
      shipped: {
        label: "Expédiée",
        message: "Bonne nouvelle — votre commande est en route.",
      },
      delivered: {
        label: "Livrée",
        message: "Votre commande a été livrée. Bon shopping !",
      },
      returned: { label: "Retournée", message: "Votre retour a été traité." },
      cancelled: {
        label: "Annulée",
        message:
          "Votre commande a été annulée. Contactez la boutique si vous avez des questions.",
      },
    },
  },
  supportConfirmation: {
    subject: "Nous avons reçu votre message — Support Ettajer",
    previewText: "Nous avons reçu votre message et répondrons bientôt.",
    title: "Message bien reçu",
    greeting: (name) => `Bonjour ${name},`,
    body: (topic) =>
      `Merci de nous avoir contactés au sujet de <strong>${topic}</strong>. Notre équipe répond généralement sous 24 h les jours ouvrables.`,
    highlightTitle: "En attendant",
    highlightBody: (helpUrl) =>
      `Consultez le <a href="${helpUrl}" style="color:#3b82f6;">Centre d'aide</a> pour des réponses instantanées sur le COD, les commandes et la configuration de boutique.`,
    footerNote: "Répondez à cet e-mail pour ajouter des détails à votre demande.",
  },
  supportTicket: {
    previewText: (topic) => `Nouvelle demande de support : ${topic}`,
    badge: "Ticket support",
    greeting: (name) => `De ${name}`,
    emailLabel: "E-mail",
    articleLabel: "Article",
    footerNote:
      "Répondez directement à cet e-mail — votre réponse ira au client.",
  },
};

const AR: EmailCopy = {
  shell: {
    whatHappensNext: "الخطوات التالية",
    buttonNotWorking: "الزر لا يعمل؟ انسخ هذا الرابط:",
    needHelp: "تحتاج مساعدة؟",
    visitHelpCenter: "مركز المساعدة",
    tagline: "مُصمَّم للتجار المغاربة",
  },
  magicLink: {
    subject: "تسجيل الدخول إلى Ettajer",
    previewText: "رابط تسجيل الدخول الآمن إلى Ettajer جاهز.",
    title: "تسجيل الدخول إلى Ettajer",
    greeting: "مرحباً،",
    body: (email) =>
      `اضغط الزر أدناه لتسجيل الدخول إلى <strong>${email}</strong>. لا حاجة لكلمة مرور.`,
    cta: "تسجيل دخول آمن",
    expiryNote: "ينتهي هذا الرابط خلال 24 ساعة.",
    steps: [
      "افتح صفحة تسجيل الدخول الآمنة",
      "ادخل إلى لوحة التحكم فوراً",
      "أدر الطلبات والمنتجات ومتجرك",
    ],
    footerNote: "إذا لم تطلب هذا البريد، يمكنك تجاهله بأمان.",
  },
  passwordReset: {
    subject: "إعادة تعيين كلمة مرور Ettajer",
    previewText: "أعد تعيين كلمة مرور Ettajer عبر هذا الرابط الآمن.",
    title: "إعادة تعيين كلمة المرور",
    greeting: "مرحباً،",
    body: (email) =>
      `تلقينا طلباً لإعادة تعيين كلمة المرور لـ <strong>${email}</strong>.`,
    cta: "اختر كلمة مرور جديدة",
    expiryNote: "ينتهي هذا الرابط خلال ساعة لحمايتك.",
    steps: [
      "افتح صفحة إعادة التعيين الآمنة",
      "أنشئ كلمة مرور قوية جديدة",
      "سجّل الدخول إلى لوحة التحكم",
    ],
    footerNote:
      "إذا لم تطلب إعادة التعيين، تجاهل هذا البريد. لن تتغير كلمة مرورك.",
  },
  passwordChanged: {
    subject: "تم تحديث كلمة مرور Ettajer",
    previewText: "تم تحديث كلمة مرور Ettajer بنجاح.",
    title: "تم تحديث كلمة المرور",
    badge: "الأمان",
    greeting: "مرحباً،",
    body: (email) =>
      `تم تغيير كلمة المرور لـ <strong>${email}</strong> بنجاح.`,
    cta: "تسجيل الدخول إلى Ettajer",
    steps: [
      "اذهب إلى صفحة تسجيل الدخول",
      "أدخل بريدك وكلمة المرور الجديدة",
      "تابع إدارة متجرك",
    ],
    footerNote: "إذا لم تقم بهذا التغيير، تواصل مع الدعم فوراً.",
  },
  activation: {
    subject: (code) => `${code} هو رمز تفعيل Ettajer`,
    previewText: (code) => `رمز تفعيل Ettajer هو ${code}`,
    title: "فعّل حسابك",
    badge: "التحقق",
    greeting: (name) => `مرحباً ${name}،`,
    body: "شكراً لانضمامك إلى Ettajer. استخدم الرمز أدناه للتحقق من بريدك وتفعيل حساب المؤسس.",
    codeLabel: "رمز التفعيل",
    codeHint: "أدخل هذا الرمز المكوّن من 6 أرقام لتفعيل حسابك. ينتهي خلال 15 دقيقة.",
    cta: "تفعيل حسابي",
    steps: [
      "افتح صفحة التفعيل",
      "أدخل الرمز المكوّن من 6 أرقام من هذا البريد",
      "ادخل إلى بطاقة المؤسس والوصول المبكر",
    ],
    expiryNote: "ينتهي هذا الرمز خلال 15 دقيقة لحمايتك.",
    footerNote: "إذا لم تنشئ حساب Ettajer، يمكنك تجاهل هذا البريد.",
  },
  welcome: {
    subject: "مرحباً بك في Ettajer — أطلق متجرك",
    previewText: "مرحباً بك في Ettajer — أطلق متجر COD في دقائق.",
    title: "مرحباً بك في Ettajer",
    badge: "حساب جديد",
    greeting: (name) => `مرحباً ${name}،`,
    body: (email) =>
      `حساب التاجر <strong>${email}</strong> جاهز. أطلق متجر COD، تحقق من المشترين، وأدر الطلبات من لوحة واحدة.`,
    cta: "إعداد متجرك",
    steps: [
      "أكمل ملف متجرك",
      "أضف المنتجات وفعّل الدفع عند الاستلام",
      "انشر وابدأ باستقبال الطلبات",
    ],
    highlightTitle: "مُصمَّم للمغرب",
    highlightBody:
      "دفع COD أصلي، تحقق عبر واتساب، وتدفقات طلبات جاهزة للشحن — بدون بوابة دفع.",
    footerNote: "تتلقى هذا البريد لأنك أنشأت حساب Ettajer.",
  },
  founderWelcome: {
    subject: (padded) => `مرحباً بك في Ettajer — أنت المؤسس رقم ${padded} 🎉`,
    previewText: (padded) => `مرحباً بك في Ettajer — أنت المؤسس رقم ${padded}`,
    title: "مرحباً بك في Ettajer",
    badge: (padded) => `مؤسس رقم ${padded}`,
    greeting: (name) => `مرحباً ${name}،`,
    body: (founderLabel) =>
      `مرحباً بك في Ettajer.<br /><br />تم إنشاء حسابك بنجاح.<br /><br />أنت رسمياً جزء من <strong>مجتمع التجار الأول</strong> — ${founderLabel}.`,
    cardLabel: "بطاقة المؤسس",
    cardHint: "بطاقة المؤسس PNG وشهادة العضوية PDF مرفقتان أيضاً بهذا البريد.",
    founderNumber: "رقم المؤسس",
    status: "الحالة",
    statusValue: "عضو الوصول المبكر",
    cta: "عرض الوصول المبكر",
    highlightTitle: "ما التالي",
    highlightBody:
      "سنُبلغك عند توفر لوحة متجرك. احفظ بطاقة المؤسس والشهادة المرفقتين — هما لك للأبد.",
    footerNote: "شكراً لبناء Ettajer معنا. فريق Ettajer",
  },
  orderConfirmed: {
    subject: (orderNumber) => `تم تأكيد الطلب — ${orderNumber}`,
    previewText: (orderNumber) => `تم تأكيد طلبك ${orderNumber}.`,
    title: "تم تأكيد الطلب",
    badge: "مؤكد",
    greeting: (name) => `مرحباً ${name}،`,
    body: "استلمنا طلبك وسنعالجه قريباً. إليك الملخص:",
    orderLabel: "الطلب",
    shipToLabel: "الشحن إلى",
    itemsHeader: "المنتجات",
    totalHeader: "المجموع",
    subtotal: "المجموع الفرعي",
    shipping: "الشحن",
    shippingFree: "مجاني",
    total: "الإجمالي",
    footerNote: (storeName) => `شكراً لتسوقك من ${storeName}.`,
  },
  orderStatus: {
    subject: (orderNumber, statusLabel) =>
      `الطلب ${orderNumber} — ${statusLabel}`,
    previewText: (orderNumber, statusLabel) =>
      `الطلب ${orderNumber} أصبح الآن ${statusLabel}.`,
    title: (statusLabel) => `الطلب ${statusLabel}`,
    greeting: (name) => `مرحباً ${name}،`,
    orderLabel: "الطلب",
    totalLabel: "الإجمالي",
    noteLabel: "ملاحظة",
    footerNote: (storeName) => `شكراً لتسوقك من ${storeName}.`,
    statuses: {
      draft: { label: "مسودة", message: "هذا الطلب لا يزال مسودة." },
      pending: {
        label: "قيد الانتظار",
        message: "استلمنا طلبك وسنعالجه قريباً.",
      },
      processing: {
        label: "قيد المعالجة",
        message: "طلبك قيد التحضير للشحن.",
      },
      shipped: {
        label: "تم الشحن",
        message: "أخبار سارة — طلبك في الطريق.",
      },
      delivered: {
        label: "تم التسليم",
        message: "تم تسليم طلبك. نتمنى لك تسوقاً ممتعاً!",
      },
      returned: { label: "مُرتجع", message: "تمت معالجة إرجاعك." },
      cancelled: {
        label: "ملغى",
        message: "تم إلغاء طلبك. تواصل مع المتجر إذا لديك أسئلة.",
      },
    },
  },
  supportConfirmation: {
    subject: "استلمنا رسالتك — دعم Ettajer",
    previewText: "استلمنا رسالة الدعم وسنرد قريباً.",
    title: "استلمنا رسالتك",
    greeting: (name) => `مرحباً ${name}،`,
    body: (topic) =>
      `شكراً لتواصلك بخصوص <strong>${topic}</strong>. يرد فريقنا عادة خلال 24 ساعة في أيام العمل.`,
    highlightTitle: "أثناء الانتظار",
    highlightBody: (helpUrl) =>
      `تصفح <a href="${helpUrl}" style="color:#3b82f6;">مركز المساعدة</a> لإجابات فورية عن COD والطلبات وإعداد المتجر.`,
    footerNote: "رد على هذا البريد لإضافة تفاصيل لطلبك.",
  },
  supportTicket: {
    previewText: (topic) => `طلب دعم جديد: ${topic}`,
    badge: "تذكرة دعم",
    greeting: (name) => `من ${name}`,
    emailLabel: "البريد",
    articleLabel: "المقال",
    footerNote: "رد مباشرة على هذا البريد — سيصل ردك إلى العميل.",
  },
};

const COPIES: Record<LandingLocale, EmailCopy> = {
  en: EN,
  fr: FR,
  ar: AR,
};

export function getEmailCopy(locale: LandingLocale): EmailCopy {
  return COPIES[locale] ?? EN;
}

export function emailGreetingName(name: string | null | undefined, fallback: string): string {
  return name?.trim() || fallback;
}
