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
  founderLaunchAnnounce: {
    subject: string;
    previewText: string;
    title: string;
    badge: string;
    greeting: (name: string) => string;
    body: (founderLabel: string, launchDateLabel: string) => string;
    cta: string;
    steps: string[];
    highlightTitle: string;
    highlightBody: string;
    footerNote: string;
  };
  founderBetaTesting: {
    subject: string;
    previewText: string;
    title: string;
    badge: string;
    greeting: (name: string) => string;
    body: (founderLabel: string, launchDateLabel: string) => string;
    cta: string;
    steps: string[];
    highlightTitle: string;
    highlightBody: string;
    footerNote: string;
  };
  founderAccessUnlocked: {
    subject: string;
    previewText: string;
    title: string;
    badge: string;
    greeting: (name: string) => string;
    body: (founderLabel: string) => string;
    cta: string;
    steps: string[];
    highlightTitle: string;
    highlightBody: string;
    footerNote: string;
  };
  verifyEmailReminder: {
    subject: string;
    previewText: string;
    title: string;
    badge: string;
    greeting: (name: string) => string;
    body: (launchDateLabel: string) => string;
    cta: string;
    steps: string[];
    footerNote: string;
  };
  merchantNewOrder: {
    subject: (orderNumber: string) => string;
    previewText: (orderNumber: string, customerName: string) => string;
    title: string;
    badge: string;
    greeting: (name: string) => string;
    body: (orderNumber: string, customerName: string, totalFormatted: string) => string;
    cta: string;
    orderLabel: string;
    customerLabel: string;
    totalLabel: string;
    footerNote: string;
  };
  storeLive: {
    subject: (storeName: string) => string;
    previewText: (storeName: string) => string;
    title: string;
    badge: string;
    greeting: (name: string) => string;
    body: (storeName: string, storeUrl: string) => string;
    cta: string;
    steps: string[];
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
  abandonedCart: {
    subject: (storeName: string) => string;
    previewText: string;
    title: string;
    badge: string;
    greeting: (name: string) => string;
    body: (storeName: string) => string;
    itemsHeader: string;
    totalHeader: string;
    cta: string;
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
  nameChangeInvite: {
    subject: string;
    previewText: string;
    title: string;
    badge: string;
    greeting: (name: string) => string;
    body: (currentName: string) => string;
    cta: string;
    expiryNote: string;
    steps: string[];
    footerNote: string;
  };
  nameChangeConfirmed: {
    subject: string;
    previewText: string;
    title: string;
    badge: string;
    greeting: (name: string) => string;
    body: (previousName: string, newName: string) => string;
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
    subject: (padded) => `Welcome to Ettajer — You're Founder #${padded}`,
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
  founderLaunchAnnounce: {
    subject: "Ettajer opens Thursday 23 July 2026",
    previewText: "Your founder dashboard unlocks on 23 July — countdown is live.",
    title: "Platform opens 23 July",
    badge: "Founder update",
    greeting: (name) => `Hi ${name},`,
    body: (founderLabel, launchDateLabel) =>
      `You're ${founderLabel} on Ettajer.<br /><br />The merchant platform opens on <strong>${launchDateLabel}</strong>. Your countdown is already live on the early-access page — when it hits zero, claim your dashboard and start building your store.`,
    cta: "View countdown",
    steps: [
      "Open early access and watch the countdown",
      "On launch day, tap “Open my dashboard”",
      "Complete onboarding and publish your first product",
    ],
    highlightTitle: "Founder seat secured",
    highlightBody:
      "You keep your founder number and early-access benefits. No action needed until launch day.",
    footerNote: "You're receiving this because you hold an Ettajer founder seat.",
  },
  founderBetaTesting: {
    subject: "Beta testing now — Ettajer platform development is done",
    previewText: "We're testing the live web now. Your early-access page shows Beta testing now.",
    title: "Beta testing now",
    badge: "Founder update",
    greeting: (name) => `Hi ${name},`,
    body: (founderLabel, launchDateLabel) =>
      `You're ${founderLabel} on Ettajer.<br /><br /><strong>Platform development is done.</strong> We're now <strong>beta testing the live web</strong> — polishing the store builder, checkout, and merchant experience before public launch on <strong>${launchDateLabel}</strong>.<br /><br />Open your early-access page to see the new status: <strong>Beta testing now</strong>.`,
    cta: "Open early access",
    steps: [
      "Open your early-access page — status shows Beta testing now",
      "Watch the countdown to public launch",
      "On launch day, unlock your merchant dashboard",
    ],
    highlightTitle: "What this means",
    highlightBody:
      "No action needed from you today. Your founder seat stays locked. We'll email you again when your dashboard unlocks at public launch.",
    footerNote: "You're receiving this because you hold an Ettajer founder seat.",
  },
  founderAccessUnlocked: {
    subject: "Your Ettajer dashboard is open",
    previewText: "Launch day is here — open your merchant dashboard and build your store.",
    title: "Dashboard unlocked",
    badge: "You're in",
    greeting: (name) => `Hi ${name},`,
    body: (founderLabel) =>
      `Ettajer is live and your founder seat (${founderLabel}) is active.<br /><br />Your merchant dashboard is ready — set up your store, add products, and start taking COD orders.`,
    cta: "Open my dashboard",
    steps: [
      "Complete store onboarding",
      "Add your first product",
      "Publish and share your store link",
    ],
    highlightTitle: "Founder benefits active",
    highlightBody:
      "Your founder number and early-access perks stay with you. Need help? Reply to this email or visit the help center.",
    footerNote: "You're receiving this because you unlocked your Ettajer founder account.",
  },
  verifyEmailReminder: {
    subject: "Verify your email to keep your founder seat",
    previewText: "One step left before launch — confirm your email on Ettajer.",
    title: "Verify your email",
    badge: "Action required",
    greeting: (name) => `Hi ${name},`,
    body: (launchDateLabel) =>
      `Your founder seat is reserved, but your email is not verified yet.<br /><br />Before we open on <strong>${launchDateLabel}</strong>, please confirm your email so you can claim your dashboard on launch day.`,
    cta: "Verify my email",
    steps: [
      "Open the activation page",
      "Enter the 6-digit code we sent you (or request a new one)",
      "Return to early access — you're all set for launch",
    ],
    footerNote: "If you already verified, you can ignore this reminder.",
  },
  merchantNewOrder: {
    subject: (orderNumber) => `New order ${orderNumber}`,
    previewText: (orderNumber, customerName) =>
      `New order ${orderNumber} from ${customerName}.`,
    title: "New order received",
    badge: "New sale",
    greeting: (name) => `Hi ${name},`,
    body: (orderNumber, customerName, totalFormatted) =>
      `You have a new order <strong>${orderNumber}</strong> from <strong>${customerName}</strong> for <strong>${totalFormatted}</strong>. Review it in your dashboard and confirm COD details.`,
    cta: "View order",
    orderLabel: "Order",
    customerLabel: "Customer",
    totalLabel: "Total",
    footerNote: "Manage notifications in your store settings.",
  },
  storeLive: {
    subject: (storeName) => `${storeName} is live on Ettajer`,
    previewText: (storeName) => `Your storefront ${storeName} is now published.`,
    title: "Your store is live",
    badge: "Published",
    greeting: (name) => `Hi ${name},`,
    body: (storeName, storeUrl) =>
      `Congratulations — <strong>${storeName}</strong> is now live at <a href="${storeUrl}" style="color:#3b82f6;">${storeUrl}</a>. Share the link and start receiving COD orders.`,
    cta: "View live store",
    steps: [
      "Share your store link on WhatsApp and social",
      "Add more products to grow your catalog",
      "Track orders from your dashboard",
    ],
    highlightTitle: "First sale tip",
    highlightBody:
      "Merchants who share their link with 10 contacts in the first week see faster first orders. COD checkout is already enabled.",
    footerNote: "You're receiving this because you published a store on Ettajer.",
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
  abandonedCart: {
    subject: (storeName) => `You left something behind at ${storeName}`,
    previewText: "Complete your order — your cart is waiting.",
    title: "Your cart is waiting",
    badge: "Reminder",
    greeting: (name) => `Hi ${name},`,
    body: (storeName) =>
      `You left items in your cart at <strong>${storeName}</strong>. Complete your order when you're ready — cash on delivery is available.`,
    itemsHeader: "Items",
    totalHeader: "Subtotal",
    cta: "Complete your order",
    footerNote: (storeName) =>
      `You're receiving this because you started checkout at ${storeName}.`,
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
    subject: "Your request is under review — Ettajer Support",
    previewText: "We received your message and it is now under review.",
    title: "Your request is under review",
    greeting: (name) => `Hi ${name},`,
    body: (topic) =>
      `Thanks for contacting us about <strong>${topic}</strong>. Your message is <strong>under review</strong> by Ettajer Support. We typically reply within 24 hours on business days.`,
    highlightTitle: "What happens next",
    highlightBody: (helpUrl) =>
      `Our team is studying your request. You’ll receive a follow-up by email. Meanwhile, browse the <a href="${helpUrl}" style="color:#3b82f6;">Help Center</a> for quick answers.`,
    footerNote: "Reply to this email if you need to add more details.",
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
  nameChangeInvite: {
    subject: "Update your official name — Ettajer Support",
    previewText: "We reviewed your request. Confirm your official name securely.",
    title: "Confirm your official name",
    badge: "Support",
    greeting: (name) => `Hi ${name},`,
    body: (currentName) =>
      `We studied your request to correct your account name. Your profile currently shows <strong>${currentName}</strong>. Use the secure button below to enter your official name — it will update your account and founder card.`,
    cta: "Update my name",
    expiryNote: "This secure link expires in 7 days and can be used once.",
    steps: [
      "Open the secure name update page",
      "Enter your official name as on your ID",
      "Save — your founder card will use the new name",
    ],
    footerNote:
      "If you did not request this, reply to this email and we will cancel the link.",
  },
  nameChangeConfirmed: {
    subject: "Your Ettajer name was updated",
    previewText: "Your account name was updated successfully.",
    title: "Name updated",
    badge: "Confirmed",
    greeting: (name) => `Hi ${name},`,
    body: (previousName, newName) =>
      `Your account name was changed from <strong>${previousName}</strong> to <strong>${newName}</strong>. Your founder card and profile now use this name.`,
    footerNote: "If you did not make this change, contact Ettajer Support immediately.",
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
    subject: (padded) => `Bienvenue sur Ettajer — Vous etes Fondateur #${padded}`,
    previewText: (padded) => `Bienvenue sur Ettajer — Vous etes Fondateur #${padded}`,
    title: "Bienvenue sur Ettajer",
    badge: (padded) => `Fondateur #${padded}`,
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
  founderLaunchAnnounce: {
    subject: "Ettajer ouvre jeudi 23 juillet 2026",
    previewText: "Votre tableau de bord fondateur s'ouvre le 23 juillet — le compte à rebours est en ligne.",
    title: "Ouverture le 23 juillet",
    badge: "Info fondateur",
    greeting: (name) => `Bonjour ${name},`,
    body: (founderLabel, launchDateLabel) =>
      `Vous êtes ${founderLabel} sur Ettajer.<br /><br />La plateforme marchand ouvre le <strong>${launchDateLabel}</strong>. Le compte à rebours est déjà disponible sur la page accès anticipé — à zéro, ouvrez votre tableau de bord et créez votre boutique.`,
    cta: "Voir le compte à rebours",
    steps: [
      "Ouvrez l'accès anticipé et suivez le compte à rebours",
      "Le jour J, cliquez sur « Ouvrir mon tableau de bord »",
      "Terminez l'onboarding et publiez votre premier produit",
    ],
    highlightTitle: "Place fondateur confirmée",
    highlightBody:
      "Votre numéro fondateur et vos avantages restent acquis. Rien à faire avant le jour d'ouverture.",
    footerNote: "Vous recevez cet e-mail car vous avez une place fondateur Ettajer.",
  },
  founderBetaTesting: {
    subject: "Tests bêta en cours — le développement Ettajer est terminé",
    previewText: "Nous testons le web en live. Votre page accès anticipé affiche Tests bêta en cours.",
    title: "Tests bêta en cours",
    badge: "Info fondateur",
    greeting: (name) => `Bonjour ${name},`,
    body: (founderLabel, launchDateLabel) =>
      `Vous êtes ${founderLabel} sur Ettajer.<br /><br /><strong>Le développement de la plateforme est terminé.</strong> Nous <strong>testons le web en live</strong> — peaufinage du créateur de boutique, du checkout et de l'expérience marchande avant le lancement public le <strong>${launchDateLabel}</strong>.<br /><br />Ouvrez votre page accès anticipé : le statut affiche <strong>Tests bêta en cours</strong>.`,
    cta: "Ouvrir l'accès anticipé",
    steps: [
      "Ouvrez l'accès anticipé — statut : Tests bêta en cours",
      "Suivez le compte à rebours jusqu'au lancement public",
      "Le jour J, débloquez votre tableau de bord marchand",
    ],
    highlightTitle: "Ce que cela signifie",
    highlightBody:
      "Aucune action de votre part aujourd'hui. Votre place fondateur reste sécurisée. Nous vous écrirons à nouveau quand votre tableau de bord s'ouvrira au lancement public.",
    footerNote: "Vous recevez cet e-mail car vous avez une place fondateur Ettajer.",
  },
  founderAccessUnlocked: {
    subject: "Votre tableau de bord Ettajer est ouvert",
    previewText: "Le jour J est arrivé — ouvrez votre tableau de bord marchand.",
    title: "Tableau de bord débloqué",
    badge: "C'est parti",
    greeting: (name) => `Bonjour ${name},`,
    body: (founderLabel) =>
      `Ettajer est en ligne et votre place fondateur (${founderLabel}) est active.<br /><br />Votre tableau de bord est prêt — configurez votre boutique, ajoutez des produits et recevez des commandes COD.`,
    cta: "Ouvrir mon tableau de bord",
    steps: [
      "Terminez l'onboarding boutique",
      "Ajoutez votre premier produit",
      "Publiez et partagez le lien de votre boutique",
    ],
    highlightTitle: "Avantages fondateur actifs",
    highlightBody:
      "Votre numéro fondateur et vos avantages restent acquis. Besoin d'aide ? Répondez à cet e-mail ou visitez le centre d'aide.",
    footerNote: "Vous recevez cet e-mail car vous avez débloqué votre compte fondateur Ettajer.",
  },
  verifyEmailReminder: {
    subject: "Vérifiez votre e-mail pour garder votre place fondateur",
    previewText: "Une étape avant l'ouverture — confirmez votre e-mail sur Ettajer.",
    title: "Vérifiez votre e-mail",
    badge: "Action requise",
    greeting: (name) => `Bonjour ${name},`,
    body: (launchDateLabel) =>
      `Votre place fondateur est réservée, mais votre e-mail n'est pas encore vérifié.<br /><br />Avant l'ouverture le <strong>${launchDateLabel}</strong>, confirmez votre e-mail pour ouvrir votre tableau de bord le jour J.`,
    cta: "Vérifier mon e-mail",
    steps: [
      "Ouvrez la page d'activation",
      "Entrez le code à 6 chiffres (ou demandez-en un nouveau)",
      "Retournez à l'accès anticipé — vous êtes prêt pour le lancement",
    ],
    footerNote: "Si vous avez déjà vérifié, ignorez ce rappel.",
  },
  merchantNewOrder: {
    subject: (orderNumber) => `Nouvelle commande ${orderNumber}`,
    previewText: (orderNumber, customerName) =>
      `Nouvelle commande ${orderNumber} de ${customerName}.`,
    title: "Nouvelle commande reçue",
    badge: "Nouvelle vente",
    greeting: (name) => `Bonjour ${name},`,
    body: (orderNumber, customerName, totalFormatted) =>
      `Vous avez une nouvelle commande <strong>${orderNumber}</strong> de <strong>${customerName}</strong> pour <strong>${totalFormatted}</strong>. Consultez-la dans votre tableau de bord et confirmez les détails COD.`,
    cta: "Voir la commande",
    orderLabel: "Commande",
    customerLabel: "Client",
    totalLabel: "Total",
    footerNote: "Gérez les notifications dans les paramètres de votre boutique.",
  },
  storeLive: {
    subject: (storeName) => `${storeName} est en ligne sur Ettajer`,
    previewText: (storeName) => `Votre boutique ${storeName} est publiée.`,
    title: "Votre boutique est en ligne",
    badge: "Publiée",
    greeting: (name) => `Bonjour ${name},`,
    body: (storeName, storeUrl) =>
      `Félicitations — <strong>${storeName}</strong> est en ligne sur <a href="${storeUrl}" style="color:#3b82f6;">${storeUrl}</a>. Partagez le lien et recevez des commandes COD.`,
    cta: "Voir la boutique",
    steps: [
      "Partagez votre lien sur WhatsApp et les réseaux",
      "Ajoutez plus de produits",
      "Suivez les commandes depuis le tableau de bord",
    ],
    highlightTitle: "Conseil première vente",
    highlightBody:
      "Les marchands qui partagent leur lien avec 10 contacts la première semaine obtiennent leurs premières commandes plus vite. Le COD est déjà activé.",
    footerNote: "Vous recevez cet e-mail car vous avez publié une boutique sur Ettajer.",
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
  abandonedCart: {
    subject: (storeName) => `Vous avez oublié quelque chose chez ${storeName}`,
    previewText: "Finalisez votre commande — votre panier vous attend.",
    title: "Votre panier vous attend",
    badge: "Rappel",
    greeting: (name) => `Bonjour ${name},`,
    body: (storeName) =>
      `Vous avez laissé des articles dans votre panier chez <strong>${storeName}</strong>. Finalisez votre commande quand vous voulez — le paiement à la livraison est disponible.`,
    itemsHeader: "Articles",
    totalHeader: "Sous-total",
    cta: "Finaliser la commande",
    footerNote: (storeName) =>
      `Vous recevez cet e-mail car vous avez commencé une commande chez ${storeName}.`,
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
    subject: "Votre demande est en cours d’examen — Support Ettajer",
    previewText: "Nous avons reçu votre message ; il est en cours d’examen.",
    title: "Demande en cours d’examen",
    greeting: (name) => `Bonjour ${name},`,
    body: (topic) =>
      `Merci de nous avoir contactés au sujet de <strong>${topic}</strong>. Votre message est <strong>en cours d’examen</strong> par le support Ettajer. Nous répondons généralement sous 24 h les jours ouvrables.`,
    highlightTitle: "Prochaines étapes",
    highlightBody: (helpUrl) =>
      `Notre équipe étudie votre demande. Vous recevrez une suite par e-mail. En attendant, consultez le <a href="${helpUrl}" style="color:#3b82f6;">Centre d’aide</a>.`,
    footerNote: "Répondez à cet e-mail pour ajouter des détails.",
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
  nameChangeInvite: {
    subject: "Mettez à jour votre nom officiel — Support Ettajer",
    previewText: "Nous avons étudié votre demande. Confirmez votre nom officiel.",
    title: "Confirmez votre nom officiel",
    badge: "Support",
    greeting: (name) => `Bonjour ${name},`,
    body: (currentName) =>
      `Nous avons étudié votre demande de correction de nom. Votre profil affiche actuellement <strong>${currentName}</strong>. Utilisez le bouton sécurisé ci-dessous pour indiquer votre nom officiel — il mettra à jour votre compte et votre carte fondateur.`,
    cta: "Mettre à jour mon nom",
    expiryNote: "Ce lien sécurisé expire dans 7 jours et ne peut être utilisé qu’une fois.",
    steps: [
      "Ouvrez la page sécurisée de mise à jour",
      "Saisissez votre nom officiel (comme sur votre pièce d’identité)",
      "Enregistrez — votre carte fondateur utilisera le nouveau nom",
    ],
    footerNote:
      "Si vous n’avez pas fait cette demande, répondez à cet e-mail et nous annulerons le lien.",
  },
  nameChangeConfirmed: {
    subject: "Votre nom Ettajer a été mis à jour",
    previewText: "Le nom de votre compte a été mis à jour avec succès.",
    title: "Nom mis à jour",
    badge: "Confirmé",
    greeting: (name) => `Bonjour ${name},`,
    body: (previousName, newName) =>
      `Le nom de votre compte est passé de <strong>${previousName}</strong> à <strong>${newName}</strong>. Votre carte fondateur et votre profil utilisent désormais ce nom.`,
    footerNote:
      "Si vous n’êtes pas à l’origine de ce changement, contactez immédiatement le support Ettajer.",
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
    subject: (padded) => `مرحبا بك في Ettajer — انت المؤسس رقم ${padded}`,
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
  founderLaunchAnnounce: {
    subject: "افتتاح Ettajer يوم الخميس 23 يوليو 2026",
    previewText: "لوحة المؤسس تُفتح في 23 يوليو — العدّ التنازلي مباشر.",
    title: "الافتتاح في 23 يوليو",
    badge: "تحديث المؤسس",
    greeting: (name) => `مرحباً ${name}،`,
    body: (founderLabel, launchDateLabel) =>
      `أنت ${founderLabel} على Ettajer.<br /><br />تفتح المنصة يوم <strong>${launchDateLabel}</strong>. العدّ التنازلي يظهر الآن في صفحة الوصول المبكر — عند الصفر، افتح لوحة التحكم وابدأ متجرك.`,
    cta: "عرض العدّ التنازلي",
    steps: [
      "افتح الوصول المبكر وتابع العدّ التنازلي",
      "في يوم الإطلاق اضغط «افتح لوحتي»",
      "أكمل الإعداد وانشر أول منتج",
    ],
    highlightTitle: "مقعد المؤسس محفوظ",
    highlightBody:
      "رقم المؤسس ومزاياك محفوظة. لا يلزم أي إجراء قبل يوم الافتتاح.",
    footerNote: "تصلك هذه الرسالة لأنك تملك مقعد مؤسس على Ettajer.",
  },
  founderBetaTesting: {
    subject: "اختبار تجريبي الآن — اكتمل تطوير منصة Ettajer",
    previewText: "نختبر الموقع المباشر الآن. صفحتك تعرض: اختبار تجريبي الآن.",
    title: "اختبار تجريبي الآن",
    badge: "تحديث المؤسس",
    greeting: (name) => `مرحباً ${name}،`,
    body: (founderLabel, launchDateLabel) =>
      `أنت ${founderLabel} على Ettajer.<br /><br /><strong>اكتمل تطوير المنصة.</strong> نحن الآن في مرحلة <strong>اختبار الويب المباشر</strong> — تحسين منشئ المتجر والدفع وتجربة التاجر قبل الإطلاق العام يوم <strong>${launchDateLabel}</strong>.<br /><br />افتح صفحة الوصول المبكر لترى الحالة الجديدة: <strong>اختبار تجريبي الآن</strong>.`,
    cta: "افتح الوصول المبكر",
    steps: [
      "افتح صفحة الوصول المبكر — الحالة: اختبار تجريبي الآن",
      "تابع العدّ التنازلي حتى الإطلاق العام",
      "في يوم الإطلاق افتح لوحة تحكم التاجر",
    ],
    highlightTitle: "ماذا يعني هذا؟",
    highlightBody:
      "لا يلزم أي إجراء منك اليوم. مقعدك المؤسس محفوظ. سنراسلك مجدداً عند فتح لوحة التحكم في الإطلاق العام.",
    footerNote: "تصلك هذه الرسالة لأنك تملك مقعد مؤسس على Ettajer.",
  },
  founderAccessUnlocked: {
    subject: "لوحة تحكم Ettajer مفتوحة الآن",
    previewText: "يوم الإطلاق هنا — افتح لوحة التاجر وابنِ متجرك.",
    title: "تم فتح لوحة التحكم",
    badge: "أنت جاهز",
    greeting: (name) => `مرحباً ${name}،`,
    body: (founderLabel) =>
      `Ettajer متاح الآن ومقعدك كمؤسس (${founderLabel}) مفعّل.<br /><br />لوحة التاجر جاهزة — أعد متجرك، أضف منتجات، وابدأ باستقبال طلبات COD.`,
    cta: "افتح لوحتي",
    steps: [
      "أكمل إعداد المتجر",
      "أضف أول منتج",
      "انشر وشارك رابط متجرك",
    ],
    highlightTitle: "مزايا المؤسس مفعّلة",
    highlightBody:
      "رقم المؤسس ومزايا الوصول المبكر تبقى لك. تحتاج مساعدة؟ رد على هذا البريد أو زر مركز المساعدة.",
    footerNote: "تصلك هذه الرسالة لأنك فعّلت حساب المؤسس على Ettajer.",
  },
  verifyEmailReminder: {
    subject: "تحقق من بريدك للاحتفاظ بمقعد المؤسس",
    previewText: "خطوة واحدة قبل الإطلاق — أكّد بريدك على Ettajer.",
    title: "تحقق من بريدك",
    badge: "إجراء مطلوب",
    greeting: (name) => `مرحباً ${name}،`,
    body: (launchDateLabel) =>
      `مقعدك محفوظ، لكن بريدك غير مُفعّل بعد.<br /><br />قبل الافتتاح في <strong>${launchDateLabel}</strong>، أكّد بريدك لتتمكن من فتح لوحتك يوم الإطلاق.`,
    cta: "تحقق من بريدي",
    steps: [
      "افتح صفحة التفعيل",
      "أدخل الرمز المكوّن من 6 أرقام (أو اطلب رمزاً جديداً)",
      "عد إلى الوصول المبكر — أنت جاهز للإطلاق",
    ],
    footerNote: "إذا كنت قد تحققت مسبقاً، تجاهل هذا التذكير.",
  },
  merchantNewOrder: {
    subject: (orderNumber) => `طلب جديد ${orderNumber}`,
    previewText: (orderNumber, customerName) =>
      `طلب جديد ${orderNumber} من ${customerName}.`,
    title: "طلب جديد",
    badge: "بيع جديد",
    greeting: (name) => `مرحباً ${name}،`,
    body: (orderNumber, customerName, totalFormatted) =>
      `لديك طلب جديد <strong>${orderNumber}</strong> من <strong>${customerName}</strong> بقيمة <strong>${totalFormatted}</strong>. راجعه في لوحة التحكم وأكّد تفاصيل COD.`,
    cta: "عرض الطلب",
    orderLabel: "الطلب",
    customerLabel: "العميل",
    totalLabel: "المجموع",
    footerNote: "أدر الإشعارات من إعدادات متجرك.",
  },
  storeLive: {
    subject: (storeName) => `${storeName} متاح الآن على Ettajer`,
    previewText: (storeName) => `متجرك ${storeName} منشور الآن.`,
    title: "متجرك متاح",
    badge: "منشور",
    greeting: (name) => `مرحباً ${name}،`,
    body: (storeName, storeUrl) =>
      `تهانينا — <strong>${storeName}</strong> متاح الآن على <a href="${storeUrl}" style="color:#3b82f6;">${storeUrl}</a>. شارك الرابط وابدأ باستقبال طلبات COD.`,
    cta: "عرض المتجر",
    steps: [
      "شارك الرابط على واتساب ووسائل التواصل",
      "أضف المزيد من المنتجات",
      "تابع الطلبات من لوحة التحكم",
    ],
    highlightTitle: "نصيحة أول بيع",
    highlightBody:
      "التجار الذين يشاركون الرابط مع 10 جهات اتصال في الأسبوع الأول يحصلون على أول طلب أسرع. COD مفعّل مسبقاً.",
    footerNote: "تصلك هذه الرسالة لأنك نشرت متجراً على Ettajer.",
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
  abandonedCart: {
    subject: (storeName) => `نسيت شيئاً في سلتك لدى ${storeName}`,
    previewText: "أكمل طلبك — سلتك بانتظارك.",
    title: "سلتك بانتظارك",
    badge: "تذكير",
    greeting: (name) => `مرحباً ${name}،`,
    body: (storeName) =>
      `تركت منتجات في سلتك لدى <strong>${storeName}</strong>. أكمل طلبك متى شئت — الدفع عند الاستلام متاح.`,
    itemsHeader: "المنتجات",
    totalHeader: "المجموع الفرعي",
    cta: "إكمال الطلب",
    footerNote: (storeName) =>
      `تصلك هذه الرسالة لأنك بدأت الطلب لدى ${storeName}.`,
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
    subject: "طلبك قيد المراجعة — دعم Ettajer",
    previewText: "استلمنا رسالتك وهي الآن قيد المراجعة.",
    title: "طلبك قيد المراجعة",
    greeting: (name) => `مرحباً ${name}،`,
    body: (topic) =>
      `شكراً لتواصلك بخصوص <strong>${topic}</strong>. رسالتك الآن <strong>قيد المراجعة</strong> لدى دعم Ettajer. نرد عادة خلال 24 ساعة في أيام العمل.`,
    highlightTitle: "ماذا بعد؟",
    highlightBody: (helpUrl) =>
      `فريقنا يدرس طلبك وسنراسلُك بالتحديث. يمكنك أيضاً تصفح <a href="${helpUrl}" style="color:#3b82f6;">مركز المساعدة</a>.`,
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
  nameChangeInvite: {
    subject: "حدّث اسمك الرسمي — دعم Ettajer",
    previewText: "درسنا طلبك. أكّد اسمك الرسمي عبر رابط آمن.",
    title: "تأكيد الاسم الرسمي",
    badge: "الدعم",
    greeting: (name) => `مرحباً ${name}،`,
    body: (currentName) =>
      `درسنا طلبك لتصحيح اسم حسابك. يظهر حالياً <strong>${currentName}</strong>. استخدمي الزر الآمن أدناه لإدخال اسمك الرسمي كما في وثائقك — سيُحدَّث الحساب وبطاقة المؤسِّس.`,
    cta: "تحديث اسمي",
    expiryNote: "هذا الرابط الآمن ينتهي خلال 7 أيام ويُستخدم مرة واحدة فقط.",
    steps: [
      "افتحي صفحة تحديث الاسم الآمنة",
      "أدخلي اسمك الرسمي كما في الهوية",
      "احفظي — ستستخدم بطاقة المؤسِّس الاسم الجديد",
    ],
    footerNote: "إذا لم تطلبي ذلك، ردي على هذا البريد وسنلغي الرابط.",
  },
  nameChangeConfirmed: {
    subject: "تم تحديث اسمك على Ettajer",
    previewText: "تم تحديث اسم حسابك بنجاح.",
    title: "تم تحديث الاسم",
    badge: "مؤكَّد",
    greeting: (name) => `مرحباً ${name}،`,
    body: (previousName, newName) =>
      `تم تغيير اسم حسابك من <strong>${previousName}</strong> إلى <strong>${newName}</strong>. بطاقة المؤسِّس وملفك يستخدمان هذا الاسم الآن.`,
    footerNote: "إذا لم تقومي بهذا التغيير، تواصلي مع دعم Ettajer فوراً.",
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
