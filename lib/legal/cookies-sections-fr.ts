import type { CookiesSection, CookieTableRow } from "./cookies-sections";

export const COOKIES_SECTIONS_FR: CookiesSection[] = [
  {
    id: "introduction",
    title: "1. Introduction",
    paragraphs: [
      "La présente Politique des cookies explique comment Ettajer (« Ettajer », « nous », « notre » ou « nos ») utilise les cookies et technologies similaires sur notre site web, le tableau de bord marchand, les flux d'authentification et les pages associées de la plateforme (collectivement, le « Service »).",
      "Cette politique doit être lue conjointement avec notre Politique de confidentialité et nos Conditions d'utilisation. En continuant à utiliser le Service, vous consentez à l'utilisation des cookies et technologies similaires tel que décrit ici, sauf lorsque votre navigateur ou les paramètres de votre compte vous permettent de bloquer les technologies non essentielles.",
    ],
  },
  {
    id: "what-are-cookies",
    title: "2. Que sont les cookies ?",
    paragraphs: [
      "Les cookies sont de petits fichiers texte déposés sur votre appareil lorsque vous visitez un site web. Ils aident les sites à mémoriser des informations sur votre visite, telles que l'état de connexion, les préférences ou les jetons de sécurité.",
      "Nous utilisons également des technologies similaires telles que le stockage local, le stockage de session et les identifiants de session côté serveur. Dans la présente politique, nous désignons l'ensemble de ces technologies par le terme « cookies », sauf lorsqu'une distinction est nécessaire.",
    ],
  },
  {
    id: "why-we-use",
    title: "3. Pourquoi nous utilisons des cookies",
    paragraphs: [
      "Ettajer utilise des cookies pour exploiter une plateforme e-commerce sécurisée et fiable pour les marchands. Sans certains cookies, des fonctionnalités essentielles telles que la connexion, le maintien de session ou la protection des comptes ne fonctionneraient pas correctement.",
    ],
    bullets: [
      "Vous maintenir connecté à votre tableau de bord marchand",
      "Protéger les comptes contre les accès non autorisés et les abus",
      "Mémoriser la langue ou les préférences d'interface lorsque cela est pris en charge",
      "Mesurer l'utilisation du produit et diagnostiquer les problèmes techniques",
      "Prendre en charge le paiement, le panier et les fonctionnalités de boutique le cas échéant",
      "Activer les intégrations facultatives configurées par les marchands",
    ],
  },
  {
    id: "types",
    title: "4. Types de cookies que nous utilisons",
    paragraphs: [
      "Nous regroupons les cookies dans les catégories ci-dessous. Les cookies essentiels sont requis pour le fonctionnement du Service. Les autres catégories peuvent être limitées ou désactivées via les paramètres du navigateur, bien que certaines fonctionnalités puissent alors cesser de fonctionner correctement.",
    ],
    bullets: [
      "Cookies essentiels : authentification, gestion de session, sécurité, répartition de charge et prévention de la fraude",
      "Cookies fonctionnels : préférences telles que la langue ou l'état de l'interface qui améliorent votre expérience",
      "Cookies analytiques : nous aident à comprendre l'utilisation des fonctionnalités, les performances et les erreurs de manière agrégée",
      "Cookies tiers : déposés par des services externes que vous ou un marchand connectez, tels que des pixels d'analytique ou de publicité",
    ],
  },
  {
    id: "platform-cookies",
    title: "5. Cookies de la plateforme Ettajer",
    paragraphs: [
      "Le tableau ci-dessous décrit les cookies et clés de stockage couramment utilisés sur les pages appartenant à Ettajer, telles que le site marketing, le parcours d'inscription, la connexion, le tableau de bord et le centre d'aide. Les noms exacts peuvent varier au fur et à mesure de l'amélioration de la plateforme.",
    ],
    table: [
      {
        name: "session / jeton d'authentification",
        purpose: "Vous maintient connecté et vérifie les requêtes authentifiées vers votre compte",
        duration: "Session ou jusqu'à 30 jours si « Se souvenir de moi » est activé",
        type: "Essentiel",
      },
      {
        name: "csrf / jeton de sécurité",
        purpose: "Contribue à protéger les formulaires et actions de compte contre la falsification de requête intersites",
        duration: "Session",
        type: "Essentiel",
      },
      {
        name: "préférence de langue",
        purpose: "Enregistre la langue sélectionnée pour l'interface lorsque la localisation est activée",
        duration: "Jusqu'à 12 mois",
        type: "Fonctionnel",
      },
      {
        name: "état du consentement aux cookies",
        purpose: "Mémorise la fermeture de l'avis cookies ou les choix de préférences lorsqu'ils sont affichés",
        duration: "Jusqu'à 12 mois",
        type: "Fonctionnel",
      },
      {
        name: "session analytique",
        purpose: "Compte les visites et l'utilisation des fonctionnalités de manière agrégée pour améliorer le produit",
        duration: "De la session à 24 mois selon le fournisseur",
        type: "Analytique",
      },
    ] ,
  },
  {
    id: "storefront-cookies",
    title: "6. Cookies des boutiques marchandes",
    paragraphs: [
      "Lorsque des acheteurs visitent une boutique publiée par un marchand Ettajer, des cookies ou entrées de stockage local supplémentaires peuvent être utilisés pour prendre en charge les fonctionnalités d'achat.",
    ],
    bullets: [
      "Identifiants de panier et de session permettant aux acheteurs d'ajouter des produits et de finaliser le paiement",
      "Progression du paiement et état du formulaire pour les flux de commande COD",
      "Assistants de performance et de mise en cache pour une livraison rapide des pages",
      "Pixels marketing ou analytiques installés par le marchand, tels que Meta, Google, TikTok ou outils similaires",
    ],
  },
  {
    id: "third-party",
    title: "7. Cookies tiers et intégrations",
    paragraphs: [
      "Les marchands peuvent connecter des services tiers à leurs boutiques ou tableaux de bord. Ces services peuvent déposer leurs propres cookies ou collecter des identifiants selon leurs propres politiques.",
      "Ettajer ne contrôle pas les cookies tiers. Nous encourageons les marchands à divulguer les outils qu'ils activent et à consulter la documentation des fournisseurs. Les acheteurs doivent consulter la boutique du marchand et la politique du tiers pour plus d'informations.",
    ],
    bullets: [
      "Pixels publicitaires et de conversion",
      "Plateformes d'analytique",
      "Fournisseurs de messagerie ou de vérification",
      "Processeurs de paiement ou de facturation pour les abonnements marchands",
    ],
  },
  {
    id: "managing",
    title: "8. Comment gérer les cookies",
    paragraphs: [
      "La plupart des navigateurs permettent de bloquer, supprimer ou limiter les cookies via leurs paramètres. Vous trouverez généralement ces contrôles dans la section confidentialité ou sécurité de votre navigateur.",
      "Si vous bloquez les cookies essentiels, certaines parties du Service peuvent ne pas fonctionner, notamment la connexion, l'activation de compte, l'accès au tableau de bord et les flux de paiement.",
    ],
    bullets: [
      "Chrome : Paramètres → Confidentialité et sécurité → Cookies et autres données de sites",
      "Safari : Réglages → Confidentialité → Bloquer tous les cookies / Gérer les données des sites web",
      "Firefox : Paramètres → Vie privée et sécurité → Cookies et données de sites",
      "Edge : Paramètres → Cookies et autorisations de site → Gérer et supprimer les cookies",
      "Navigateurs mobiles : les paramètres de confidentialité varient selon l'appareil et la version de l'application",
    ],
  },
  {
    id: "do-not-track",
    title: "9. Do Not Track et contrôles globaux de confidentialité",
    paragraphs: [
      "Certains navigateurs proposent des signaux « Do Not Track » ou similaires. Les normes du secteur pour répondre à ces signaux n'étant pas uniformes, Ettajer peut ne pas répondre de la même manière à chaque signal.",
      "Lorsque la loi applicable l'exige, nous respectons les mécanismes d'opposition légalement reconnus pour certaines technologies d'analytique ou de publicité.",
    ],
  },
  {
    id: "retention",
    title: "10. Conservation des cookies",
    paragraphs: [
      "Les cookies de session expirent lorsque vous fermez votre navigateur. Les cookies persistants restent jusqu'à leur date d'expiration ou jusqu'à ce que vous les supprimiez manuellement.",
      "Nous examinons périodiquement l'utilisation des cookies et visons à conserver des durées de conservation non supérieures à ce qui est nécessaire pour la finalité décrite.",
    ],
  },
  {
    id: "changes",
    title: "11. Modifications de cette politique",
    paragraphs: [
      "Nous pouvons mettre à jour la présente Politique des cookies lorsque nous ajoutons des fonctionnalités, des intégrations ou que les exigences légales évoluent. La date de « Dernière mise à jour » en haut de cette page reflétera la dernière version.",
      "Les modifications importantes peuvent également être communiquées via le site web, des avis dans le tableau de bord ou par e-mail le cas échéant.",
    ],
  },
  {
    id: "contact",
    title: "12. Nous contacter",
    paragraphs: [
      "Pour toute question concernant notre utilisation des cookies ou technologies similaires, contactez :",
      "Ettajer — Confidentialité et assistance",
      "E-mail : support@ettajer.com",
      "Pour les demandes plus larges en matière de confidentialité, consultez notre Politique de confidentialité à /privacy.",
    ],
  },
];
