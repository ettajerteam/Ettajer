import type { PrivacySection } from "./privacy-sections";

export const PRIVACY_SECTIONS_FR: PrivacySection[] = [
  {
    id: "introduction",
    title: "1. Introduction",
    paragraphs: [
      "La présente Politique de confidentialité explique comment Ettajer (« Ettajer », « nous », « notre » ou « nos ») collecte, utilise, divulgue et protège les informations personnelles lorsque vous visitez notre site web, créez un compte marchand, utilisez notre tableau de bord, publiez une boutique en ligne ou interagissez de toute autre manière avec nos services (collectivement, le « Service »).",
      "Nous nous engageons à traiter les données personnelles de manière responsable et transparente. Cette politique s'applique aux marchands, aux visiteurs du site et — le cas échéant — aux acheteurs qui interagissent avec les boutiques hébergées par Ettajer.",
      "En utilisant le Service, vous reconnaissez avoir lu la présente Politique de confidentialité. Lorsque l'inscription exige une acceptation, vous confirmez également accepter nos pratiques en matière de données telles que décrites ici et dans nos Conditions d'utilisation.",
    ],
  },
  {
    id: "controller",
    title: "2. Responsable du traitement de vos données",
    paragraphs: [
      "Aux fins de la présente Politique de confidentialité, Ettajer est l'exploitant de la plateforme et l'entité responsable du traitement des données personnelles liées aux comptes marchands, à la facturation, à la sécurité de la plateforme, aux communications d'assistance et à notre propre marketing auprès des utilisateurs inscrits.",
      "Lorsque vous exploitez une boutique sur Ettajer, vous pouvez également traiter des données personnelles concernant vos acheteurs (telles que les noms, numéros de téléphone et adresses de livraison). Dans ces cas, vous êtes responsable de vos propres mentions d'information destinées aux acheteurs et de vos obligations de conformité en tant qu'entreprise indépendante.",
      "Les questions relatives à cette politique ou à nos pratiques en matière de données peuvent être adressées à support@ettajer.com.",
    ],
  },
  {
    id: "information-we-collect",
    title: "3. Informations que nous collectons",
    paragraphs: [
      "Nous collectons des informations de trois manières principales : les informations que vous fournissez directement, les informations générées par votre utilisation du Service, et les informations provenant de tiers ou d'intégrations que vous activez.",
    ],
    bullets: [
      "Données d'inscription au compte : nom, adresse e-mail, mot de passe (stocké sous forme hachée), informations commerciales et préférences telles que la langue ou l'opt-in marketing",
      "Données de facturation : formule d'abonnement, statut de paiement, factures et métadonnées de paiement limitées provenant des processeurs de paiement (nous ne stockons pas les numéros de carte complets sur nos serveurs)",
      "Contenu de la boutique et du marchand : produits, images, pages, image de marque et paramètres de configuration que vous téléversez",
      "Données de commandes et d'exploitation : enregistrements de commandes, coordonnées des acheteurs soumises lors du paiement, statuts de vérification et notes de traitement dans votre tableau de bord",
      "Communications d'assistance : messages que vous envoyez via les formulaires de contact, l'e-mail ou les demandes d'aide",
      "Données techniques et d'utilisation : adresse IP, type d'appareil, navigateur, pages consultées, horodatages, journaux, cookies et événements de diagnostic",
      "Données de sécurité : tentatives de connexion, demandes d'activation, événements de limitation de débit et signaux de prévention de la fraude",
    ],
  },
  {
    id: "buyer-data",
    title: "4. Données des acheteurs et du paiement à la livraison (COD)",
    paragraphs: [
      "Lorsqu'un acheteur passe une commande sur une boutique hébergée par Ettajer, nous traitons les informations de commande pour le compte de ce marchand afin que la commande puisse être honorée. Cela comprend généralement le nom de l'acheteur, son numéro de téléphone, son adresse de livraison, sa ville, son quartier, le contenu de la commande et les détails liés au paiement à la livraison (COD).",
      "Les fonctionnalités de vérification telles que la confirmation par WhatsApp ou SMS peuvent traiter les numéros de téléphone des acheteurs et le statut de livraison des messages afin d'aider les marchands à réduire les commandes fictives ou de faible intention. Les marchands choisissent s'ils utilisent ces outils et comment les utiliser.",
      "Ettajer traite les données de paiement des acheteurs pour fournir le service de plateforme aux marchands. Les marchands demeurent responsables d'informer les acheteurs de l'utilisation de leurs données, de la durée de conservation et des modalités d'exercice de leurs droits.",
    ],
  },
  {
    id: "how-we-use",
    title: "5. Comment nous utilisons les informations personnelles",
    paragraphs: [
      "Nous utilisons les informations personnelles uniquement lorsque nous avons une finalité légitime liée à l'exploitation, la sécurisation et l'amélioration du Service.",
    ],
    bullets: [
      "Créer et gérer les comptes marchands, y compris l'activation et l'authentification",
      "Fournir l'hébergement de boutique, la gestion des commandes, les flux COD et les fonctionnalités du tableau de bord",
      "Traiter les abonnements, les factures et les communications liées au compte",
      "Envoyer des messages transactionnels tels que les e-mails de vérification, les alertes de sécurité et les avis de service",
      "Envoyer des e-mails marketing facultatifs lorsque vous y avez consenti, et honorer les demandes de désinscription",
      "Fournir une assistance client et répondre aux demandes",
      "Surveiller les performances, corriger les erreurs, prévenir les abus et protéger contre la fraude ou les accès non autorisés",
      "Respecter les obligations légales, faire appliquer nos Conditions et résoudre les litiges",
      "Analyser les tendances d'utilisation agrégées ou anonymisées afin d'améliorer le produit",
    ],
  },
  {
    id: "legal-bases",
    title: "6. Bases juridiques du traitement",
    paragraphs: [
      "Selon votre localisation et le type de données concerné, nous nous appuyons sur une ou plusieurs des bases juridiques suivantes :",
    ],
    bullets: [
      "Exécution du contrat : traitement nécessaire pour fournir le Service que vous avez demandé, tel que la création de compte, l'exploitation de la boutique et la facturation",
      "Consentement : lorsque vous acceptez de recevoir des e-mails marketing ou activez certaines fonctionnalités facultatives",
      "Intérêts légitimes : sécurisation de la plateforme, prévention des abus, amélioration des fonctionnalités et communication sur les changements importants du service, en équilibre avec vos droits",
      "Obligation légale : conservation ou divulgation d'informations lorsque la loi applicable, la réglementation ou une procédure juridique valide l'exigent",
    ],
  },
  {
    id: "marketing",
    title: "7. Communications marketing",
    paragraphs: [
      "Lors de l'inscription, vous pouvez choisir de recevoir des e-mails marketing concernant les mises à jour du produit, des conseils pour marchands, des promotions et de nouvelles fonctionnalités. Les e-mails marketing ne sont pas requis pour utiliser le Service.",
      "Vous pouvez retirer votre consentement marketing à tout moment en utilisant le lien de désinscription dans un e-mail marketing ou en contactant support@ettajer.com. Des messages transactionnels et liés à la sécurité peuvent continuer à être envoyés tant que votre compte reste actif.",
      "Nous ne vendons pas votre adresse e-mail à des marketeurs tiers sans lien avec nos services.",
    ],
  },
  {
    id: "cookies",
    title: "8. Cookies et technologies similaires",
    paragraphs: [
      "Nous utilisons des cookies, le stockage local et des technologies similaires pour vous maintenir connecté, mémoriser vos préférences, mesurer l'utilisation du produit et protéger les comptes.",
    ],
    bullets: [
      "Cookies essentiels : requis pour l'authentification, la gestion de session et la sécurité",
      "Cookies de préférence : mémorisent des paramètres tels que la langue ou les choix d'interface",
      "Cookies analytiques : nous aident à comprendre comment le Service est utilisé afin de l'améliorer",
      "Suivi configuré par le marchand : les boutiques peuvent inclure des pixels d'analyse ou de publicité tiers configurés par les marchands, régis par les politiques de ces fournisseurs",
    ],
  },
  {
    id: "sharing",
    title: "9. Quand nous partageons des informations",
    paragraphs: [
      "Nous ne vendons pas d'informations personnelles. Nous ne partageons des données que dans les circonstances ci-dessous :",
    ],
    bullets: [
      "Prestataires de services : hébergement, envoi d'e-mails, traitement des paiements, analytique, outils d'assistance client et fournisseurs de sécurité qui traitent les données selon nos instructions",
      "Intégrations que vous activez : outils de publicité, d'analytique, de messagerie ou de logistique connectés par les marchands",
      "Obligations légales et sécurité : lorsque la loi, une décision de justice ou une demande gouvernementale l'exige, ou pour protéger les droits, la sécurité et l'intégrité de la plateforme",
      "Transferts d'entreprise : dans le cadre d'une fusion, acquisition, opération de financement ou cession d'actifs, sous réserve de garanties de confidentialité appropriées",
      "Selon vos instructions : lorsque vous nous demandez de partager des informations ou de les rendre publiques via votre boutique",
    ],
  },
  {
    id: "retention",
    title: "10. Conservation des données",
    paragraphs: [
      "Nous conservons les informations personnelles uniquement pendant la durée nécessaire pour fournir le Service, respecter les obligations légales, résoudre les litiges et faire appliquer les accords.",
    ],
    bullets: [
      "Les données du compte marchand actif sont conservées tant que le compte reste ouvert et selon les besoins pour fournir le Service",
      "Les données de commandes et d'acheteurs dans votre tableau de bord sont conservées selon le statut de votre compte et les besoins opérationnels",
      "Les dossiers de facturation et fiscaux peuvent être conservés pendant la période exigée par la loi applicable",
      "Les journaux de sécurité et les enregistrements de prévention des abus peuvent être conservés pendant une durée limitée pour protéger la plateforme",
      "Lorsqu'un compte est clôturé, nous supprimons ou anonymisons les données dans un délai raisonnable, sauf si la conservation est exigée par la loi ou justifiée par des besoins commerciaux légitimes tels que la prévention de la fraude",
    ],
  },
  {
    id: "security",
    title: "11. Mesures de sécurité",
    paragraphs: [
      "Nous mettons en œuvre des mesures administratives, techniques et organisationnelles destinées à protéger les informations personnelles, notamment des contrôles d'accès, le chiffrement des transmissions (HTTPS), le hachage des mots de passe, la limitation de débit et la surveillance des activités suspectes.",
      "Aucune méthode de transmission ou de stockage n'est totalement sécurisée. Bien que nous nous efforcions de protéger vos informations, nous ne pouvons garantir une sécurité absolue. Vous êtes responsable de la protection de vos identifiants de compte et de l'utilisation d'un mot de passe fort et unique.",
      "Si nous prenons connaissance d'un incident de données présentant un risque significatif, nous prendrons les mesures appropriées, qui peuvent inclure une enquête, des actions d'atténuation et une notification lorsque la loi l'exige.",
    ],
  },
  {
    id: "your-rights",
    title: "12. Vos droits en matière de confidentialité",
    paragraphs: [
      "Selon votre localisation, vous pouvez disposer de droits concernant vos informations personnelles. Ceux-ci peuvent inclure :",
    ],
    bullets: [
      "Accès : demander une copie des informations personnelles que nous détenons à votre sujet",
      "Rectification : demander la correction d'informations inexactes ou incomplètes",
      "Suppression : demander la suppression de certaines informations, sous réserve des limites légales et contractuelles",
      "Limitation ou opposition : vous opposer à certaines activités de traitement ou en demander la limitation",
      "Portabilité : demander une copie lisible par machine des informations que vous avez fournies, le cas échéant",
      "Retrait du consentement : lorsque le traitement repose sur le consentement, par exemple pour les e-mails marketing",
    ],
  },
  {
    id: "merchant-obligations",
    title: "13. Responsabilités des marchands",
    paragraphs: [
      "Si vous êtes marchand, vous agissez en tant qu'entreprise indépendante responsable des données des acheteurs collectées via votre boutique. Vous devez :",
    ],
    bullets: [
      "Publier une mention d'information claire sur votre boutique lorsque la loi l'exige",
      "Ne collecter que les informations des acheteurs nécessaires aux commandes, à la livraison et à l'assistance client",
      "Répondre aux demandes de confidentialité des acheteurs relatives aux données que vous contrôlez",
      "Utiliser les outils de vérification et de messagerie de manière licite et respectueuse",
      "Maintenir des allégations produit et promotionnelles exactes et non trompeuses",
    ],
  },
  {
    id: "children",
    title: "14. Confidentialité des mineurs",
    paragraphs: [
      "Le Service est destiné aux marchands et utilisateurs professionnels âgés d'au moins 18 ans. Nous ne collectons pas sciemment d'informations personnelles auprès d'enfants de moins de 18 ans.",
      "Si vous pensez qu'un mineur nous a fourni des informations personnelles, contactez support@ettajer.com et nous prendrons les mesures appropriées pour examiner et supprimer ces informations lorsque la loi l'exige.",
    ],
  },
  {
    id: "international",
    title: "15. Utilisateurs internationaux et transferts",
    paragraphs: [
      "Ettajer est exploité avec les marchands marocains comme public principal, mais le Service peut être consulté depuis d'autres pays. Vos informations peuvent être traitées au Maroc et dans d'autres lieux où nos prestataires de services opèrent.",
      "Lorsque la loi l'exige, nous prenons des mesures destinées à garantir des garanties appropriées pour les transferts transfrontaliers. En utilisant le Service, vous comprenez que vos informations peuvent être traitées en dehors de votre pays de résidence.",
    ],
  },
  {
    id: "third-party-links",
    title: "16. Sites web tiers",
    paragraphs: [
      "Notre site web ou les boutiques marchandes peuvent contenir des liens vers des sites web tiers, des portails de livreurs, des applications de messagerie ou des pages de paiement. Nous ne sommes pas responsables des pratiques de confidentialité de ces tiers. Nous vous encourageons à consulter leurs politiques de confidentialité avant de fournir des informations personnelles.",
    ],
  },
  {
    id: "changes",
    title: "17. Modifications de cette politique",
    paragraphs: [
      "Nous pouvons mettre à jour la présente Politique de confidentialité de temps à autre. En cas de modifications importantes, nous publierons la politique mise à jour sur cette page, réviserons la date de « Dernière mise à jour » et, le cas échéant, informerons les titulaires de compte par e-mail ou via une notification dans le tableau de bord.",
      "Votre utilisation continue du Service après l'entrée en vigueur d'une mise à jour signifie que vous reconnaissez la politique révisée.",
    ],
  },
  {
    id: "contact",
    title: "18. Nous contacter",
    paragraphs: [
      "Pour toute question, demande ou réclamation relative à la confidentialité, contactez :",
      "Ettajer — Confidentialité et assistance",
      "E-mail : support@ettajer.com",
      "Site web : https://ettajer.com",
      "Vous pouvez également nous joindre via la page Contact à /contact, le Centre d'aide à /help ou notre Politique des cookies à /cookies.",
    ],
  },
];
