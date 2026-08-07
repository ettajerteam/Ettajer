import type { LandingLocale } from "@/lib/landing/landing-i18n";

export type AuthStrengthLabel = "Weak" | "Fair" | "Good" | "Strong";

export type AuthCopy = {
  layout: {
    help: string;
    back: string;
    contact: string;
    language: string;
    languageAria: string;
  };
  login: {
    title: string;
    subtitle: string;
    email: string;
    password: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    showPassword: string;
    hidePassword: string;
    staySignedIn: string;
    forgotPassword: string;
    signIn: string;
    signingIn: string;
    emailLinkHint: string;
    or: string;
    continueGoogle: string;
    connectingGoogle: string;
    switchText: string;
    switchLink: string;
    needHelp: string;
    checkInbox: string;
    sentLinkPrefix: string;
    openEmailLink: string;
    resendLink: string;
    sending: string;
    useDifferentEmail: string;
    accountActivated: string;
    passwordUpdated: string;
    passwordUpdatedFor: (email: string) => string;
    needsActivation: string;
    goToActivation: string;
    createAccountLink: string;
    noProviders: string;
  };
  signup: {
    title: string;
    subtitle: string;
    firstName: string;
    surname: string;
    email: string;
    password: string;
    confirmPassword: string;
    firstNamePlaceholder: string;
    surnamePlaceholder: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    confirmPlaceholder: string;
    emailHint: string;
    createAccount: string;
    creatingAccount: string;
    noCard: string;
    nextStep: string;
    switchText: string;
    switchLink: string;
    termsPrefix: string;
    terms: string;
    and: string;
    privacy: string;
    marketing: string;
    passwordsMatch: string;
    passwordsMismatch: string;
    accountCreated: string;
    codeSentPrefix: string;
    redirecting: string;
    waitlist: string;
    flowAccount: string;
    flowVerify: string;
    flowWelcome: string;
    flowAria: string;
    continueGoogle: string;
    connectingGoogle: string;
    googleHint: string;
    orEmail: string;
    strengthLabel: string;
    strengthWeak: AuthStrengthLabel;
    strengthFair: AuthStrengthLabel;
    strengthGood: AuthStrengthLabel;
    strengthStrong: AuthStrengthLabel;
    strengthDisplay: Record<AuthStrengthLabel, string>;
    reqMinLength: string;
    reqLetter: string;
    reqNumber: string;
    passwordLooksGood: string;
  };
  errors: {
    configuration: string;
    accessDenied: string;
    verification: string;
    oauthSignin: string;
    oauthCallback: string;
    oauthAccountNotLinked: string;
    credentialsSignin: string;
    accountNotFound: string;
    invalidPassword: string;
    noPasswordAccount: string;
    accountLocked: string;
    emailNotVerified: string;
    rateLimited: string;
    default: string;
    accountLockedMinutes: (minutes: string) => string;
    invalidPasswordAttempts: (count: number) => string;
    enterEmail: string;
    enterPassword: string;
    emailNotConfigured: string;
    unableSendLink: string;
    somethingWrong: string;
    googleNotConfigured: string;
    unableGoogle: string;
    unableSignIn: string;
    passwordUpdatedToast: string;
    enterFirstName: string;
    enterSurname: string;
    invalidEmail: string;
    passwordRequirements: string;
    passwordsDoNotMatch: string;
    acceptTerms: string;
    tooManySignups: string;
    unableCreateAccount: string;
    noAccountFoundPhrase: string;
  };
  forgot: {
    title: string;
    subtitle: string;
    email: string;
    emailPlaceholder: string;
    sendLink: string;
    sending: string;
    googleHint: string;
    googleLink: string;
    backToSignIn: string;
    checkInbox: string;
    sentPrefix: string;
    expires: string;
    nextSteps: string;
    tip1: string;
    tip2: string;
    tip3: string;
    spamHint: string;
    resend: string;
    enterEmail: string;
    unableSend: string;
    sentToast: string;
    somethingWrong: string;
    flowEmail: string;
    flowInbox: string;
    flowPassword: string;
    flowDone: string;
  };
  activate: {
    title: string;
    subtitlePrefix: string;
    codeSentBadge: string;
    activatingOverlay: string;
    activating: string;
    activateAccount: string;
    resendPrompt: string;
    resendIn: (time: string) => string;
    codeHint: string;
    wrongEmail: string;
    signUpAgain: string;
    signIn: string;
    noEmail: string;
    backToSignup: string;
    digitAria: (n: number) => string;
    missingEmail: string;
    enterFullCode: string;
    activatedToast: string;
    activatedSignIn: string;
    unableResend: string;
    newCodeSent: string;
    invalidCode: string;
    flowAria: string;
  };
};

const EN_COPY: AuthCopy = {
  layout: {
    help: "Help",
    back: "Back",
    contact: "Contact",
    language: "Language",
    languageAria: "Language",
  },
  login: {
    title: "Welcome back",
    subtitle: "Sign in to your Ettajer account to manage your store.",
    email: "Email",
    password: "Password",
    emailPlaceholder: "you@yourstore.ma",
    passwordPlaceholder: "Enter your password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    staySignedIn: "Keep me signed in",
    forgotPassword: "Forgot password?",
    signIn: "Sign in",
    signingIn: "Signing in…",
    emailLinkHint: "We will email you a secure sign-in link.",
    or: "or",
    continueGoogle: "Continue with Google",
    connectingGoogle: "Connecting…",
    switchText: "New to Ettajer?",
    switchLink: "Create account",
    needHelp: "Need help? Contact us",
    checkInbox: "Check your inbox",
    sentLinkPrefix: "We sent a link to",
    openEmailLink: "Open the link in your email to continue.",
    resendLink: "Resend link",
    sending: "Sending…",
    useDifferentEmail: "Use different email",
    accountActivated:
      "Account activated! Sign in with your email and password to see your founder card.",
    passwordUpdated: "Password updated successfully. Sign in with your new password",
    passwordUpdatedFor: (email) => ` for ${email}.`,
    needsActivation: "Your account isn't activated yet. Enter the 6-digit code we emailed you.",
    goToActivation: "Go to activation",
    createAccountLink: "Create an account",
    noProviders: "No sign-in providers configured.",
  },
  signup: {
    title: "Create account",
    subtitle: "Join Moroccan merchants building online stores with Ettajer.",
    firstName: "First name",
    surname: "Surname",
    email: "Email address",
    password: "Password",
    confirmPassword: "Repeat password",
    firstNamePlaceholder: "First name",
    surnamePlaceholder: "Surname",
    emailPlaceholder: "you@yourstore.ma",
    passwordPlaceholder: "Password",
    confirmPlaceholder: "Repeat password",
    emailHint: "Use a valid email you can access for activation.",
    createAccount: "Create account",
    creatingAccount: "Creating account…",
    noCard: "No credit card required.",
    nextStep: "Next step: verify your email with a 6-digit code.",
    switchText: "Already have an account?",
    switchLink: "Sign in",
    termsPrefix: "I agree to the",
    terms: "Terms",
    and: "and",
    privacy: "Privacy",
    marketing: "Email me product updates and merchant tips",
    passwordsMatch: "Passwords match",
    passwordsMismatch: "Passwords do not match",
    accountCreated: "Account created",
    codeSentPrefix: "We sent a 6-digit code to",
    redirecting: "Taking you to activation…",
    waitlist: "Contact us to join the waitlist",
    flowAccount: "Account",
    flowVerify: "Verify",
    flowWelcome: "Welcome",
    flowAria: "Account setup progress",
    continueGoogle: "Continue with Google",
    connectingGoogle: "Connecting…",
    googleHint: "Skip the form — use your Gmail account.",
    orEmail: "or create an account with email",
    strengthLabel: "Password strength",
    strengthWeak: "Weak",
    strengthFair: "Fair",
    strengthGood: "Good",
    strengthStrong: "Strong",
    strengthDisplay: {
      Weak: "Weak",
      Fair: "Fair",
      Good: "Good",
      Strong: "Strong",
    },
    reqMinLength: "At least 8 characters",
    reqLetter: "Contains a letter",
    reqNumber: "Contains a number",
    passwordLooksGood: "Password looks good.",
  },
  errors: {
    configuration: "Sign-in is not configured. Contact support.",
    accessDenied: "Access denied. You may not have permission.",
    verification: "The sign-in link expired. Request a new one.",
    oauthSignin: "Could not start Google sign-in. Try again.",
    oauthCallback: "Google sign-in failed. Try again.",
    oauthAccountNotLinked: "This email is linked to another sign-in method.",
    credentialsSignin: "Invalid email or password.",
    accountNotFound: "No account found with this email. Check the address or create an account.",
    invalidPassword: "Incorrect password.",
    noPasswordAccount: "This account uses Google or email link sign-in. Try another method.",
    accountLocked: "Account temporarily locked due to failed sign-in attempts.",
    emailNotVerified: "Activate your account with the 6-digit code we emailed you.",
    rateLimited: "Too many sign-in attempts from this network. Wait a bit and try again.",
    default: "Something went wrong. Please try again.",
    accountLockedMinutes: (minutes) =>
      `Too many failed attempts. Try again in ${minutes} minutes or reset your password.`,
    invalidPasswordAttempts: (count) =>
      `Incorrect password. ${count} attempt${count === 1 ? "" : "s"} remaining before lockout.`,
    enterEmail: "Enter your email address.",
    enterPassword: "Enter your password.",
    emailNotConfigured: "Email sign-in is not configured yet.",
    unableSendLink: "Unable to send link. Try again.",
    somethingWrong: "Something went wrong.",
    googleNotConfigured: "Google sign-in is not configured.",
    unableGoogle: "Unable to sign in with Google.",
    unableSignIn: "Unable to sign in. Try again.",
    passwordUpdatedToast: "Password updated. Sign in with your new password.",
    enterFirstName: "Enter your first name.",
    enterSurname: "Enter your surname.",
    invalidEmail: "Enter a valid email address (e.g. you@yourstore.ma).",
    passwordRequirements: "Choose a password that meets all requirements below.",
    passwordsDoNotMatch: "Passwords do not match.",
    acceptTerms: "You must accept the Terms of Service and Privacy Policy.",
    tooManySignups:
      "Too many signup attempts. Wait about an hour, or open the activation page if you already started.",
    unableCreateAccount: "Unable to create account.",
    noAccountFoundPhrase: "No account found",
  },
  forgot: {
    title: "Forgot password?",
    subtitle: "Enter your email and we'll send a secure link to reset your password.",
    email: "Email",
    emailPlaceholder: "you@yourstore.ma",
    sendLink: "Send reset link",
    sending: "Sending…",
    googleHint: "Signed up with Google? You can set a password here, or use",
    googleLink: "Continue with Google",
    backToSignIn: "Back to sign in",
    checkInbox: "Check your inbox",
    sentPrefix: "We sent password reset instructions to",
    expires: "The secure link expires in 1 hour.",
    nextSteps: "Next steps",
    tip1: "Open the email titled “Reset your Ettajer password”",
    tip2: "Tap “Choose new password” in the email",
    tip3: "Create your new password and sign in",
    spamHint: "Didn't get it? Check spam or promotions. You can resend below.",
    resend: "Resend email",
    enterEmail: "Enter your email address.",
    unableSend: "Unable to send reset email.",
    sentToast: "Reset email sent. Check your inbox.",
    somethingWrong: "Something went wrong. Try again.",
    flowEmail: "Email",
    flowInbox: "Inbox",
    flowPassword: "Password",
    flowDone: "Done",
  },
  activate: {
    title: "Activate your account",
    subtitlePrefix: "Enter the 6-digit code we sent to",
    codeSentBadge: "Code sent just now — check your inbox",
    activatingOverlay: "Activating your account…",
    activating: "Activating…",
    activateAccount: "Activate account",
    resendPrompt: "Didn't receive it? Resend code",
    resendIn: (time) => `Resend code in ${time}`,
    codeHint: "Code expires in 15 minutes · Wait time increases after each resend",
    wrongEmail: "Wrong email?",
    signUpAgain: "Sign up again",
    signIn: "Sign in",
    noEmail: "No email provided.",
    backToSignup: "Back to sign up",
    digitAria: (n) => `Digit ${n}`,
    missingEmail: "Missing email. Please sign up again.",
    enterFullCode: "Enter the full 6-digit code.",
    activatedToast: "Account activated!",
    activatedSignIn: "Account activated! Please sign in.",
    unableResend: "Unable to resend code.",
    newCodeSent: "New activation code sent.",
    invalidCode: "Invalid code. Please try again.",
    flowAria: "Account setup progress",
  },
};

const FR_COPY: AuthCopy = {
  ...EN_COPY,
  layout: {
    help: "Aide",
    back: "Retour",
    contact: "Contact",
    language: "Langue",
    languageAria: "Langue",
  },
  login: {
    ...EN_COPY.login,
    title: "Bon retour",
    subtitle: "Connectez-vous à votre compte Ettajer pour gérer votre boutique.",
    email: "E-mail",
    password: "Mot de passe",
    passwordPlaceholder: "Entrez votre mot de passe",
    showPassword: "Afficher le mot de passe",
    hidePassword: "Masquer le mot de passe",
    staySignedIn: "Se souvenir de moi",
    forgotPassword: "Mot de passe oublié ?",
    signIn: "Se connecter",
    signingIn: "Connexion…",
    emailLinkHint: "Nous vous enverrons un lien de connexion sécurisé.",
    or: "ou",
    continueGoogle: "Continuer avec Google",
    connectingGoogle: "Connexion…",
    switchText: "Nouveau sur Ettajer ?",
    switchLink: "Créer un compte",
    needHelp: "Besoin d'aide ? Contactez-nous",
    checkInbox: "Vérifiez votre boîte mail",
    sentLinkPrefix: "Nous avons envoyé un lien à",
    openEmailLink: "Ouvrez le lien dans votre e-mail pour continuer.",
    resendLink: "Renvoyer le lien",
    sending: "Envoi…",
    useDifferentEmail: "Utiliser un autre e-mail",
    accountActivated:
      "Compte activé ! Connectez-vous avec votre e-mail et mot de passe pour voir votre carte fondateur.",
    passwordUpdated: "Mot de passe mis à jour. Connectez-vous avec votre nouveau mot de passe",
    passwordUpdatedFor: (email) => ` pour ${email}.`,
    needsActivation:
      "Votre compte n'est pas encore activé. Entrez le code à 6 chiffres envoyé par e-mail.",
    goToActivation: "Aller à l'activation",
    createAccountLink: "Créer un compte",
    noProviders: "Aucun mode de connexion configuré.",
  },
  signup: {
    ...EN_COPY.signup,
    title: "Créer un compte",
    subtitle: "Rejoignez les marchands marocains qui lancent leur boutique avec Ettajer.",
    firstName: "Prénom",
    surname: "Nom",
    email: "Adresse e-mail",
    password: "Mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    firstNamePlaceholder: "Prénom",
    surnamePlaceholder: "Nom",
    emailPlaceholder: "vous@votreboutique.ma",
    passwordPlaceholder: "Mot de passe",
    confirmPlaceholder: "Confirmer le mot de passe",
    emailHint: "Utilisez une adresse e-mail valide pour l'activation.",
    createAccount: "Créer un compte",
    creatingAccount: "Création du compte…",
    noCard: "Aucune carte bancaire requise.",
    nextStep: "Étape suivante : vérifiez votre e-mail avec un code à 6 chiffres.",
    switchText: "Vous avez déjà un compte ?",
    switchLink: "Se connecter",
    termsPrefix: "J'accepte les",
    terms: "Conditions",
    and: "et la",
    privacy: "Confidentialité",
    marketing: "Recevoir les nouveautés produit et conseils marchands",
    passwordsMatch: "Les mots de passe correspondent",
    passwordsMismatch: "Les mots de passe ne correspondent pas",
    accountCreated: "Compte créé",
    codeSentPrefix: "Nous avons envoyé un code à 6 chiffres à",
    redirecting: "Redirection vers l'activation…",
    waitlist: "Contactez-nous pour rejoindre la liste d'attente",
    flowAccount: "Compte",
    flowVerify: "Vérifier",
    flowWelcome: "Bienvenue",
    flowAria: "Progression de la création du compte",
    continueGoogle: "Continuer avec Google",
    connectingGoogle: "Connexion…",
    googleHint: "Passez le formulaire — utilisez votre compte Gmail.",
    orEmail: "ou créez un compte par e-mail",
    strengthLabel: "Force du mot de passe",
    strengthDisplay: {
      Weak: "Faible",
      Fair: "Moyen",
      Good: "Bon",
      Strong: "Fort",
    },
    reqMinLength: "Au moins 8 caractères",
    reqLetter: "Contient une lettre",
    reqNumber: "Contient un chiffre",
    passwordLooksGood: "Mot de passe correct.",
  },
  errors: {
    ...EN_COPY.errors,
    configuration: "La connexion n'est pas configurée. Contactez le support.",
    accessDenied: "Accès refusé. Vous n'avez peut-être pas l'autorisation.",
    verification: "Le lien de connexion a expiré. Demandez-en un nouveau.",
    oauthSignin: "Impossible de lancer la connexion Google. Réessayez.",
    oauthCallback: "Échec de la connexion Google. Réessayez.",
    oauthAccountNotLinked: "Cet e-mail est lié à une autre méthode de connexion.",
    credentialsSignin: "E-mail ou mot de passe invalide.",
    accountNotFound:
      "Aucun compte avec cet e-mail. Vérifiez l'adresse ou créez un compte.",
    invalidPassword: "Mot de passe incorrect.",
    noPasswordAccount:
      "Ce compte utilise Google ou un lien e-mail. Essayez une autre méthode.",
    accountLocked: "Compte temporairement verrouillé après trop de tentatives.",
    emailNotVerified: "Activez votre compte avec le code à 6 chiffres envoyé par e-mail.",
    rateLimited:
      "Trop de tentatives de connexion depuis ce réseau. Attendez un moment et réessayez.",
    default: "Une erreur s'est produite. Veuillez réessayer.",
    accountLockedMinutes: (minutes) =>
      `Trop de tentatives. Réessayez dans ${minutes} minutes ou réinitialisez votre mot de passe.`,
    invalidPasswordAttempts: (count) =>
      `Mot de passe incorrect. ${count} tentative${count === 1 ? "" : "s"} restante${count === 1 ? "" : "s"} avant verrouillage.`,
    enterEmail: "Entrez votre adresse e-mail.",
    enterPassword: "Entrez votre mot de passe.",
    emailNotConfigured: "La connexion par e-mail n'est pas encore configurée.",
    unableSendLink: "Impossible d'envoyer le lien. Réessayez.",
    somethingWrong: "Une erreur s'est produite.",
    googleNotConfigured: "La connexion Google n'est pas configurée.",
    unableGoogle: "Impossible de se connecter avec Google.",
    unableSignIn: "Impossible de se connecter. Réessayez.",
    passwordUpdatedToast: "Mot de passe mis à jour. Connectez-vous avec le nouveau.",
    enterFirstName: "Entrez votre prénom.",
    enterSurname: "Entrez votre nom.",
    invalidEmail: "Entrez une adresse e-mail valide (ex. vous@boutique.ma).",
    passwordRequirements: "Choisissez un mot de passe qui respecte toutes les exigences.",
    passwordsDoNotMatch: "Les mots de passe ne correspondent pas.",
    acceptTerms: "Vous devez accepter les Conditions et la Politique de confidentialité.",
    tooManySignups:
      "Trop de tentatives d'inscription. Attendez environ une heure ou ouvrez la page d'activation.",
    unableCreateAccount: "Impossible de créer le compte.",
    noAccountFoundPhrase: "Aucun compte",
  },
  forgot: {
    title: "Mot de passe oublié ?",
    subtitle: "Entrez votre e-mail et nous vous enverrons un lien sécurisé pour réinitialiser votre mot de passe.",
    email: "E-mail",
    emailPlaceholder: "vous@votreboutique.ma",
    sendLink: "Envoyer le lien",
    sending: "Envoi…",
    googleHint: "Inscrit avec Google ? Vous pouvez définir un mot de passe ici, ou utiliser",
    googleLink: "Continuer avec Google",
    backToSignIn: "Retour à la connexion",
    checkInbox: "Vérifiez votre boîte mail",
    sentPrefix: "Nous avons envoyé les instructions à",
    expires: "Le lien sécurisé expire dans 1 heure.",
    nextSteps: "Prochaines étapes",
    tip1: "Ouvrez l’e-mail « Réinitialiser votre mot de passe Ettajer »",
    tip2: "Appuyez sur « Choisir un nouveau mot de passe »",
    tip3: "Créez votre nouveau mot de passe et connectez-vous",
    spamHint: "Rien reçu ? Vérifiez les spams. Vous pouvez renvoyer l’e-mail ci-dessous.",
    resend: "Renvoyer l’e-mail",
    enterEmail: "Entrez votre adresse e-mail.",
    unableSend: "Impossible d’envoyer l’e-mail de réinitialisation.",
    sentToast: "E-mail envoyé. Vérifiez votre boîte de réception.",
    somethingWrong: "Une erreur s’est produite. Réessayez.",
    flowEmail: "E-mail",
    flowInbox: "Boîte",
    flowPassword: "Mot de passe",
    flowDone: "Terminé",
  },
  activate: {
    title: "Activez votre compte",
    subtitlePrefix: "Entrez le code à 6 chiffres envoyé à",
    codeSentBadge: "Code envoyé — vérifiez votre boîte mail",
    activatingOverlay: "Activation de votre compte…",
    activating: "Activation…",
    activateAccount: "Activer le compte",
    resendPrompt: "Pas reçu ? Renvoyer le code",
    resendIn: (time) => `Renvoyer dans ${time}`,
    codeHint: "Le code expire dans 15 minutes · Le délai augmente après chaque renvoi",
    wrongEmail: "Mauvais e-mail ?",
    signUpAgain: "S'inscrire à nouveau",
    signIn: "Se connecter",
    noEmail: "Aucun e-mail fourni.",
    backToSignup: "Retour à l'inscription",
    digitAria: (n) => `Chiffre ${n}`,
    missingEmail: "E-mail manquant. Veuillez vous réinscrire.",
    enterFullCode: "Entrez le code complet à 6 chiffres.",
    activatedToast: "Compte activé !",
    activatedSignIn: "Compte activé ! Veuillez vous connecter.",
    unableResend: "Impossible de renvoyer le code.",
    newCodeSent: "Nouveau code d'activation envoyé.",
    invalidCode: "Code invalide. Veuillez réessayer.",
    flowAria: "Progression de la création du compte",
  },
};

const AR_COPY: AuthCopy = {
  ...EN_COPY,
  layout: {
    help: "المساعدة",
    back: "رجوع",
    contact: "اتصل بنا",
    language: "اللغة",
    languageAria: "اللغة",
  },
  login: {
    ...EN_COPY.login,
    title: "مرحباً بعودتك",
    subtitle: "سجّل الدخول إلى حسابك على Ettajer لإدارة متجرك.",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    passwordPlaceholder: "أدخل كلمة المرور",
    showPassword: "إظهار كلمة المرور",
    hidePassword: "إخفاء كلمة المرور",
    staySignedIn: "ابقَ متصلاً",
    forgotPassword: "نسيت كلمة المرور؟",
    signIn: "تسجيل الدخول",
    signingIn: "جاري تسجيل الدخول…",
    emailLinkHint: "سنرسل لك رابط تسجيل دخول آمن بالبريد.",
    or: "أو",
    continueGoogle: "المتابعة مع Google",
    connectingGoogle: "جاري الاتصال…",
    switchText: "جديد على Ettajer؟",
    switchLink: "إنشاء حساب",
    needHelp: "تحتاج مساعدة؟ تواصل معنا",
    checkInbox: "تحقق من بريدك",
    sentLinkPrefix: "أرسلنا رابطاً إلى",
    openEmailLink: "افتح الرابط في بريدك للمتابعة.",
    resendLink: "إعادة إرسال الرابط",
    sending: "جاري الإرسال…",
    useDifferentEmail: "استخدام بريد آخر",
    accountActivated:
      "تم تفعيل الحساب! سجّل الدخول ببريدك وكلمة المرور لرؤية بطاقة المؤسس.",
    passwordUpdated: "تم تحديث كلمة المرور. سجّل الدخول بكلمة المرور الجديدة",
    passwordUpdatedFor: (email) => ` لـ ${email}.`,
    needsActivation: "حسابك غير مفعّل بعد. أدخل الرمز المكوّن من 6 أرقام المرسل بالبريد.",
    goToActivation: "الذهاب إلى التفعيل",
    createAccountLink: "إنشاء حساب",
    noProviders: "لا توجد طرق تسجيل دخول مفعّلة.",
  },
  signup: {
    ...EN_COPY.signup,
    title: "إنشاء حساب",
    subtitle: "انضم إلى التجار المغاربة الذين يبنون متاجرهم على Ettajer.",
    firstName: "الاسم الأول",
    surname: "اسم العائلة",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    firstNamePlaceholder: "الاسم الأول",
    surnamePlaceholder: "اسم العائلة",
    emailPlaceholder: "you@yourstore.ma",
    passwordPlaceholder: "كلمة المرور",
    confirmPlaceholder: "تأكيد كلمة المرور",
    emailHint: "استخدم بريداً صالحاً يمكنك الوصول إليه للتفعيل.",
    createAccount: "إنشاء حساب",
    creatingAccount: "جاري إنشاء الحساب…",
    noCard: "لا حاجة لبطاقة بنكية.",
    nextStep: "الخطوة التالية: تحقق من بريدك برمز من 6 أرقام.",
    switchText: "لديك حساب بالفعل؟",
    switchLink: "تسجيل الدخول",
    termsPrefix: "أوافق على",
    terms: "الشروط",
    and: "و",
    privacy: "الخصوصية",
    marketing: "أرسل لي تحديثات المنتج ونصائح للتجار",
    passwordsMatch: "كلمتا المرور متطابقتان",
    passwordsMismatch: "كلمتا المرور غير متطابقتين",
    accountCreated: "تم إنشاء الحساب",
    codeSentPrefix: "أرسلنا رمزاً من 6 أرقام إلى",
    redirecting: "جاري التوجيه إلى التفعيل…",
    waitlist: "اتصل بنا للانضمام لقائمة الانتظار",
    flowAccount: "الحساب",
    flowVerify: "التحقق",
    flowWelcome: "مرحباً",
    flowAria: "تقدم إعداد الحساب",
    continueGoogle: "المتابعة مع Google",
    connectingGoogle: "جاري الاتصال…",
    googleHint: "تخطَّ النموذج — استخدم حساب Gmail.",
    orEmail: "أو التسجيل بالبريد الإلكتروني",
    strengthLabel: "قوة كلمة المرور",
    strengthDisplay: {
      Weak: "ضعيفة",
      Fair: "متوسطة",
      Good: "جيدة",
      Strong: "قوية",
    },
    reqMinLength: "8 أحرف على الأقل",
    reqLetter: "تحتوي على حرف",
    reqNumber: "تحتوي على رقم",
    passwordLooksGood: "كلمة المرور جيدة.",
  },
  errors: {
    ...EN_COPY.errors,
    configuration: "تسجيل الدخول غير مُعد. اتصل بالدعم.",
    accessDenied: "تم رفض الوصول. قد لا تملك الصلاحية.",
    verification: "انتهت صلاحية رابط تسجيل الدخول. اطلب رابطاً جديداً.",
    oauthSignin: "تعذّر بدء تسجيل الدخول عبر Google. حاول مجدداً.",
    oauthCallback: "فشل تسجيل الدخول عبر Google. حاول مجدداً.",
    oauthAccountNotLinked: "هذا البريد مرتبط بطريقة تسجيل دخول أخرى.",
    credentialsSignin: "البريد أو كلمة المرور غير صحيحة.",
    accountNotFound: "لا يوجد حساب بهذا البريد. تحقق من العنوان أو أنشئ حساباً.",
    invalidPassword: "كلمة المرور غير صحيحة.",
    noPasswordAccount: "هذا الحساب يستخدم Google أو رابط البريد. جرّب طريقة أخرى.",
    accountLocked: "الحساب مقفل مؤقتاً بسبب محاولات فاشلة.",
    emailNotVerified: "فعّل حسابك بالرمز المكوّن من 6 أرقام المرسل بالبريد.",
    rateLimited: "محاولات تسجيل دخول كثيرة من هذه الشبكة. انتظر قليلاً ثم حاول مجدداً.",
    default: "حدث خطأ. يرجى المحاولة مجدداً.",
    accountLockedMinutes: (minutes) =>
      `محاولات كثيرة فاشلة. حاول بعد ${minutes} دقيقة أو أعد تعيين كلمة المرور.`,
    invalidPasswordAttempts: (count) =>
      `كلمة مرور غير صحيحة. متبقي ${count} محاولة${count === 1 ? "" : "ات"} قبل القفل.`,
    enterEmail: "أدخل بريدك الإلكتروني.",
    enterPassword: "أدخل كلمة المرور.",
    emailNotConfigured: "تسجيل الدخول بالبريد غير مُعد بعد.",
    unableSendLink: "تعذّر إرسال الرابط. حاول مجدداً.",
    somethingWrong: "حدث خطأ.",
    googleNotConfigured: "تسجيل الدخول عبر Google غير مُعد.",
    unableGoogle: "تعذّر تسجيل الدخول عبر Google.",
    unableSignIn: "تعذّر تسجيل الدخول. حاول مجدداً.",
    passwordUpdatedToast: "تم تحديث كلمة المرور. سجّل الدخول بالجديدة.",
    enterFirstName: "أدخل اسمك الأول.",
    enterSurname: "أدخل اسم العائلة.",
    invalidEmail: "أدخل بريداً إلكترونياً صالحاً (مثال: you@yourstore.ma).",
    passwordRequirements: "اختر كلمة مرور تستوفي كل المتطلبات أدناه.",
    passwordsDoNotMatch: "كلمتا المرور غير متطابقتين.",
    acceptTerms: "يجب الموافقة على شروط الخدمة وسياسة الخصوصية.",
    tooManySignups:
      "محاولات تسجيل كثيرة. انتظر ساعة تقريباً أو افتح صفحة التفعيل إن بدأت مسبقاً.",
    unableCreateAccount: "تعذّر إنشاء الحساب.",
    noAccountFoundPhrase: "لا يوجد حساب",
  },
  forgot: {
    title: "نسيت كلمة المرور؟",
    subtitle: "أدخل بريدك وسنرسل رابطاً آمناً لإعادة تعيين كلمة المرور.",
    email: "البريد الإلكتروني",
    emailPlaceholder: "you@yourstore.ma",
    sendLink: "إرسال رابط إعادة التعيين",
    sending: "جارٍ الإرسال…",
    googleHint: "سجّلت عبر Google؟ يمكنك تعيين كلمة مرور هنا، أو استخدام",
    googleLink: "المتابعة مع Google",
    backToSignIn: "العودة لتسجيل الدخول",
    checkInbox: "تحقق من بريدك",
    sentPrefix: "أرسلنا تعليمات إعادة التعيين إلى",
    expires: "ينتهي الرابط الآمن خلال ساعة.",
    nextSteps: "الخطوات التالية",
    tip1: "افتح الرسالة بعنوان «إعادة تعيين كلمة مرور إيتاجر»",
    tip2: "اضغط «اختر كلمة مرور جديدة» في الرسالة",
    tip3: "أنشئ كلمة المرور الجديدة وسجّل الدخول",
    spamHint: "لم تصل؟ تحقق من البريد غير المرغوب. يمكنك إعادة الإرسال أدناه.",
    resend: "إعادة إرسال البريد",
    enterEmail: "أدخل بريدك الإلكتروني.",
    unableSend: "تعذر إرسال بريد إعادة التعيين.",
    sentToast: "تم إرسال البريد. تحقق من صندوق الوارد.",
    somethingWrong: "حدث خطأ. حاول مجدداً.",
    flowEmail: "البريد",
    flowInbox: "الوارد",
    flowPassword: "كلمة المرور",
    flowDone: "تم",
  },
  activate: {
    title: "فعّل حسابك",
    subtitlePrefix: "أدخل الرمز المكوّن من 6 أرقام المرسل إلى",
    codeSentBadge: "تم إرسال الرمز — تحقق من بريدك",
    activatingOverlay: "جاري تفعيل حسابك…",
    activating: "جاري التفعيل…",
    activateAccount: "تفعيل الحساب",
    resendPrompt: "لم يصلك؟ أعد إرسال الرمز",
    resendIn: (time) => `إعادة الإرسال خلال ${time}`,
    codeHint: "ينتهي الرمز خلال 15 دقيقة · يزيد وقت الانتظار بعد كل إعادة إرسال",
    wrongEmail: "بريد خاطئ؟",
    signUpAgain: "التسجيل مجدداً",
    signIn: "تسجيل الدخول",
    noEmail: "لم يُقدَّم بريد إلكتروني.",
    backToSignup: "العودة للتسجيل",
    digitAria: (n) => `الرقم ${n}`,
    missingEmail: "البريد مفقود. يرجى التسجيل مجدداً.",
    enterFullCode: "أدخل الرمز الكامل المكوّن من 6 أرقام.",
    activatedToast: "تم تفعيل الحساب!",
    activatedSignIn: "تم التفعيل! يرجى تسجيل الدخول.",
    unableResend: "تعذّر إعادة إرسال الرمز.",
    newCodeSent: "تم إرسال رمز تفعيل جديد.",
    invalidCode: "رمز غير صحيح. حاول مجدداً.",
    flowAria: "تقدم إعداد الحساب",
  },
};

export { getAuthSeo } from "@/lib/auth/auth-seo";
export type { AuthSeoCopy } from "@/lib/auth/auth-seo";

export function getAuthCopy(locale: LandingLocale): AuthCopy {
  if (locale === "fr") return FR_COPY;
  if (locale === "ar") return AR_COPY;
  return EN_COPY;
}

export function getAuthErrorMap(copy: AuthCopy): Record<string, string> {
  return {
    Configuration: copy.errors.configuration,
    AccessDenied: copy.errors.accessDenied,
    Verification: copy.errors.verification,
    OAuthSignin: copy.errors.oauthSignin,
    OAuthCallback: copy.errors.oauthCallback,
    OAuthAccountNotLinked: copy.errors.oauthAccountNotLinked,
    CredentialsSignin: copy.errors.credentialsSignin,
    ACCOUNT_NOT_FOUND: copy.errors.accountNotFound,
    INVALID_PASSWORD: copy.errors.invalidPassword,
    NO_PASSWORD_ACCOUNT: copy.errors.noPasswordAccount,
    AccountLocked: copy.errors.accountLocked,
    EMAIL_NOT_VERIFIED: copy.errors.emailNotVerified,
    RATE_LIMITED: copy.errors.rateLimited,
    Default: copy.errors.default,
  };
}

export function parseAuthLoginError(error: string, copy: AuthCopy): string {
  if (error.startsWith("ACCOUNT_LOCKED:")) {
    const minutes = error.split(":")[1] ?? "15";
    return copy.errors.accountLockedMinutes(minutes);
  }
  if (error.startsWith("INVALID_PASSWORD:")) {
    const remaining = error.split(":")[1] ?? "0";
    const count = Number.parseInt(remaining, 10);
    if (count > 0) {
      return copy.errors.invalidPasswordAttempts(count);
    }
    return copy.errors.invalidPassword;
  }
  const map = getAuthErrorMap(copy);
  return map[error] ?? copy.errors.default;
}

export function getFounderOnboardingFlow(copy: AuthCopy) {
  return [
    { id: "account" as const, label: copy.signup.flowAccount },
    { id: "verify" as const, label: copy.signup.flowVerify },
    { id: "welcome" as const, label: copy.signup.flowWelcome },
  ];
}
