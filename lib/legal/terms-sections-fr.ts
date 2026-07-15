import type { TermsSection } from "./terms-sections";

export const TERMS_SECTIONS_FR: TermsSection[] = [
  {
    id: "introduction",
    title: "1. Introduction et acceptation",
    paragraphs: [
      "Les présentes Conditions d'utilisation (« Conditions ») régissent votre accès et votre utilisation de la plateforme Ettajer, y compris notre site web, le tableau de bord marchand, le créateur de boutique, les API, les expériences mobiles et les services associés (collectivement, le « Service »), exploités par Ettajer (« Ettajer », « nous », « notre » ou « nos »).",
      "En créant un compte, en accédant au Service ou en cliquant pour accepter ces Conditions lors de l'inscription, vous acceptez d'être lié par ces Conditions et par notre Politique de confidentialité. Si vous n'acceptez pas, vous ne devez pas utiliser le Service.",
      "Si vous vous inscrivez au nom d'une société ou d'une autre entité juridique, vous déclarez disposer de l'autorité nécessaire pour engager cette entité au titre des présentes Conditions. Dans ce cas, « vous » et « votre » désignent cette entité.",
    ],
  },
  {
    id: "definitions",
    title: "2. Définitions",
    paragraphs: ["Pour plus de clarté dans l'ensemble des présentes Conditions :"],
    bullets: [
      "« Compte » désigne le profil marchand enregistré utilisé pour accéder au Service.",
      "« Acheteur » ou « Client » désigne un utilisateur final qui passe une commande via votre boutique.",
      "« COD » désigne le paiement à la livraison — un mode de paiement par lequel l'acheteur règle à la réception des marchandises.",
      "« Contenu » désigne les textes, images, données produit, éléments de marque, extraits de code et autres éléments que vous téléversez ou publiez via le Service.",
      "« Commande » désigne une transaction initiée par un Acheteur via votre boutique.",
      "« Boutique » désigne le site e-commerce public que vous créez et publiez à l'aide d'Ettajer.",
      "« Abonnement » désigne votre formule d'accès payante ou promotionnelle au Service.",
    ],
  },
  {
    id: "eligibility",
    title: "3. Éligibilité et inscription au compte",
    paragraphs: [
      "Vous devez être âgé d'au moins 18 ans et juridiquement capable de conclure des contrats contraignants pour utiliser le Service. Si vous vous inscrivez en tant qu'entreprise, vous devez disposer de la capacité juridique d'exploiter cette activité dans votre juridiction.",
      "Vous acceptez de fournir des informations d'inscription exactes, à jour et complètes, y compris votre nom légal, une adresse e-mail valide et toute information commerciale que nous demandons raisonnablement. Vous êtes responsable de la mise à jour de vos informations de compte.",
      "Vous êtes responsable de la confidentialité de vos identifiants de connexion et de toute activité effectuée sous votre Compte. Informez-nous immédiatement à support@ettajer.com si vous suspectez un accès non autorisé.",
      "Nous pouvons refuser une inscription, suspendre ou résilier des Comptes fournissant de fausses informations, violant ces Conditions ou présentant un risque de sécurité, juridique ou de fraude.",
    ],
  },
  {
    id: "services",
    title: "4. Description du Service",
    paragraphs: [
      "Ettajer fournit des outils logiciels permettant aux marchands — notamment ceux opérant au Maroc et sur des marchés similaires — de lancer et gérer des boutiques en ligne avec des fonctionnalités telles que la création visuelle de boutique, la gestion des produits et des commandes, des flux de paiement orientés COD, des outils de vérification des acheteurs, des intégrations et l'hébergement des pages de boutique publiées.",
      "Nous pouvons ajouter, modifier ou supprimer des fonctionnalités à tout moment. Nous déploierons des efforts raisonnables pour informer les marchands des changements importants affectant significativement les flux de travail essentiels, mais nous ne sommes pas tenus de maintenir indéfiniment une fonctionnalité spécifique.",
      "Le Service est fourni en tant que plateforme professionnelle. Ettajer n'est pas le vendeur officiel des produits répertoriés sur votre Boutique, sauf indication contraire expresse dans un accord écrit distinct.",
    ],
    bullets: [
      "Créateur de boutique et personnalisation du thème",
      "Gestion des produits, collections et stocks",
      "Tableau de bord des commandes et flux de statuts",
      "Paiement COD et champs acheteur localisés",
      "Outils de vérification WhatsApp et SMS (lorsqu'ils sont activés)",
      "Intégrations marketing et connexions analytiques",
      "Diffusion hébergée en périphérie du contenu de boutique publié",
    ],
  },
  {
    id: "merchant-responsibilities",
    title: "5. Responsabilités des marchands",
    paragraphs: [
      "Vous êtes seul responsable de votre Boutique, de vos produits, de vos tarifs, de vos promotions, de l'exécution des commandes, du service client, des remboursements, des retours et du respect de toutes les lois applicables à votre activité.",
      "Vous déclarez et garantissez disposer de tous les droits nécessaires pour vendre vos produits, utiliser votre image de marque et publier votre Contenu via le Service.",
      "Vous ne devez pas utiliser le Service à des fins illicites, trompeuses, abusives ou préjudiciables. Vous êtes responsable de l'exactitude des descriptions produit, de la disponibilité, des délais de livraison et de toute affirmation faite aux Acheteurs.",
    ],
    bullets: [
      "Respecter la protection des consommateurs, la publicité, la fiscalité et la réglementation e-commerce au Maroc et sur tout marché où vous vendez",
      "Honorer les commandes passées via votre Boutique conformément à vos politiques déclarées",
      "Répondre aux demandes et litiges des Acheteurs de manière rapide et professionnelle",
      "Conserver des registres appropriés des transactions, communications et exécutions",
      "Garantir la qualité, la sécurité des produits et la légalité des importations/exportations le cas échéant",
    ],
  },
  {
    id: "cod-terms",
    title: "6. Conditions relatives au paiement à la livraison (COD)",
    paragraphs: [
      "Ettajer fournit des outils conçus pour prendre en charge les flux COD courants chez les marchands marocains, notamment des champs de paiement localisés, la vérification des commandes et l'automatisation opérationnelle. Ettajer ne garantit pas qu'un Acheteur effectuera le paiement à la livraison, acceptera un colis ou qu'un livreur parviendra à encaisser les fonds.",
      "Les fonctionnalités de vérification telles que la confirmation par WhatsApp ou SMS sont des aides visant à réduire les commandes fictives ou de faible intention. Elles n'éliminent pas entièrement le risque de fraude. Vous demeurez responsable de l'évaluation du risque commande, de l'emballage, de l'expédition et des résultats d'encaissement.",
      "Vous êtes responsable des relations avec les livreurs, les prestataires logistiques et tout tiers impliqué dans l'exécution ou l'encaissement. Ettajer n'est ni un livreur, ni un processeur de paiement pour les transactions par carte, ni un agent de séquestre, sauf indication expresse dans un accord distinct.",
    ],
    bullets: [
      "Configurer avec exactitude les champs de paiement pour vos zones de livraison",
      "Examiner les commandes à risque élevé avant exécution le cas échéant",
      "Maintenir des politiques COD claires et visibles pour les Acheteurs",
      "Gérer les refus de livraison, paiements partiels et retours conformément à vos politiques",
      "Ne pas utiliser les outils de vérification pour harceler les Acheteurs ou collecter des données au-delà des finalités licites",
    ],
  },
  {
    id: "billing",
    title: "7. Abonnements, facturation et tarification",
    paragraphs: [
      "L'accès à certaines fonctionnalités nécessite un Abonnement. Les noms de formules, tarifs, options de devise, offres promotionnelles et fonctionnalités incluses sont décrits sur nos pages tarifaires et peuvent évoluer.",
      "Lorsqu'une offre promotionnelle telle qu'un premier mois réduit ou gratuit est affichée, elle s'applique uniquement aux conditions indiquées lors du paiement et pour les nouveaux Comptes éligibles, sauf mention contraire. Après toute période promotionnelle, les tarifs standard s'appliquent sauf annulation ou changement de formule.",
      "Vous nous autorisez à débiter les frais d'Abonnement applicables via le moyen de paiement que vous fournissez. En cas d'échec de paiement, nous pouvons suspendre ou limiter l'accès jusqu'à régularisation du solde.",
      "Les frais sont généralement non remboursables, sauf lorsque la loi applicable l'exige ou lorsqu'Ettajer l'indique expressément par écrit. Les rétrogradations ou annulations prennent effet selon les règles de cycle de facturation affichées dans les paramètres de votre compte.",
    ],
    bullets: [
      "Les prix peuvent être affichés en MAD, USD ou dans d'autres devises prises en charge",
      "Les options de facturation annuelle et mensuelle peuvent différer en coût total",
      "Des taxes, droits ou charges gouvernementales peuvent s'appliquer lorsque la loi l'exige",
      "Les tarifs fondateur, accès anticipé ou bêta peuvent inclure des conditions particulières communiquées séparément",
    ],
  },
  {
    id: "acceptable-use",
    title: "8. Politique d'utilisation acceptable",
    paragraphs: [
      "Vous acceptez de ne pas détourner le Service ni d'aider d'autres personnes à le faire. Nous pouvons enquêter et prendre des mesures — y compris la suspension ou la résiliation — si nous estimons que votre utilisation viole cette section ou crée un risque pour Ettajer, d'autres marchands ou des Acheteurs.",
    ],
    bullets: [
      "Aucun produit ou service illicite, y compris contrefaçons, substances interdites, objets volés ou contenu portant atteinte aux droits de propriété intellectuelle",
      "Aucun logiciel malveillant, hameçonnage, spam, attaques par scraping ou tentatives de compromettre la sécurité de la plateforme",
      "Aucun harcèlement, discours haineux, exploitation ou contenu à caractère sexuel abusif impliquant des mineurs",
      "Aucun prix faux ou trompeur, pratique d'appât ni usurpation d'autres marques ou personnes",
      "Aucun contournement des limites de débit, restrictions de compte ou systèmes de vérification",
      "Aucune revente ou sous-licence du Service sauf autorisation expresse",
      "Aucun abus automatisé des canaux d'inscription, de connexion, d'activation ou d'assistance",
    ],
  },
  {
    id: "intellectual-property",
    title: "9. Propriété intellectuelle",
    paragraphs: [
      "Ettajer et ses concédants détiennent tous les droits, titres et intérêts relatifs au Service, y compris les logiciels, designs, modèles, documentation, marques, logos et technologies sous-jacentes. Les présentes Conditions ne vous accordent aucun droit de propriété sur le Service ni sur nos actifs de marque.",
      "Sous réserve des présentes Conditions, nous vous accordons une licence limitée, non exclusive, non transférable et révocable pour utiliser le Service à des fins professionnelles internes pendant un Abonnement actif.",
      "Vous ne pouvez pas copier, modifier, distribuer, vendre, louer, procéder à de l'ingénierie inverse ni créer des œuvres dérivées du Service, sauf dans les limites permises par la loi ou avec notre accord écrit préalable.",
      "Si vous fournissez des commentaires ou suggestions concernant le Service, vous accordez à Ettajer une licence perpétuelle, mondiale et exempte de redevances pour utiliser ces commentaires sans obligation envers vous.",
    ],
  },
  {
    id: "your-content",
    title: "10. Votre contenu et données de boutique",
    paragraphs: [
      "Vous conservez la propriété du Contenu que vous téléversez, à condition de disposer des droits nécessaires sur ce Contenu. Vous accordez à Ettajer une licence mondiale et non exclusive pour héberger, reproduire, afficher et transmettre votre Contenu uniquement dans la mesure nécessaire pour exploiter le Service, publier votre Boutique, créer des sauvegardes et fournir une assistance.",
      "Vous êtes responsable de vous assurer que votre Contenu ne porte pas atteinte aux droits de tiers ni ne viole la loi. Nous pouvons supprimer ou restreindre un Contenu que nous estimons raisonnablement violer ces Conditions ou la loi applicable.",
      "Vous êtes responsable de maintenir vos propres sauvegardes des données commerciales critiques le cas échéant. Bien que nous mettions en œuvre des mesures de fiabilité, aucun système n'est exempt de défaillance.",
    ],
    bullets: [
      "Images produit, descriptions et tarifs que vous publiez",
      "Communications client que vous initiez via des outils connectés",
      "Image de marque de la boutique, pages personnalisées et paramètres de configuration",
      "Données de commandes et d'acheteurs générées via votre Boutique",
    ],
  },
  {
    id: "privacy",
    title: "11. Confidentialité et protection des données",
    paragraphs: [
      "Notre collecte et utilisation des données personnelles sont décrites dans notre Politique de confidentialité. En utilisant le Service, vous reconnaissez que nous traitons les données de compte, d'utilisation et techniques tel que décrit dans celle-ci.",
      "En tant que marchand, vous pouvez traiter des données personnelles d'Acheteurs via votre Boutique. Vous êtes responsable de fournir des mentions appropriées aux Acheteurs, d'obtenir les bases juridiques de traitement requises et de traiter les demandes des personnes concernées conformément à la loi applicable.",
      "Vous ne devez pas téléverser de données personnelles sensibles sur le Service, sauf si la fonctionnalité est expressément conçue à cet effet et que vous avez mis en place des garanties appropriées.",
    ],
  },
  {
    id: "third-parties",
    title: "12. Services tiers",
    paragraphs: [
      "Le Service peut s'intégrer à des outils tiers tels que des fournisseurs d'analytique, des pixels publicitaires, des plateformes de messagerie, des systèmes de livraison ou des services de paiement. Votre utilisation des services tiers est régie par leurs propres conditions et politiques.",
      "Ettajer ne contrôle pas et n'est pas responsable des services tiers, de leurs interruptions, changements tarifaires, application de politiques ou traitement des données par ces fournisseurs. L'activation d'une intégration constitue votre instruction pour que nous échangions les données nécessaires à son fonctionnement.",
    ],
  },
  {
    id: "availability",
    title: "13. Disponibilité et modifications du Service",
    paragraphs: [
      "Nous nous efforçons de maintenir le Service fiable et sécurisé, mais un fonctionnement ininterrompu ou exempt d'erreurs n'est pas garanti. La maintenance, les mises à jour, les problèmes réseau, les défaillances de tiers ou les cas de force majeure peuvent entraîner des interruptions temporaires.",
      "Nous pouvons mettre à jour le Service pour améliorer les performances, la sécurité ou les fonctionnalités. Les changements importants affectant négativement des fonctionnalités payantes seront traités conformément à la loi applicable et aux termes de votre Abonnement.",
      "Les fonctionnalités bêta, expérimentales ou en accès anticipé peuvent être fournies « en l'état » avec une assistance limitée et peuvent être modifiées ou retirées à tout moment.",
    ],
  },
  {
    id: "termination",
    title: "14. Suspension et résiliation",
    paragraphs: [
      "Vous pouvez annuler votre Compte ou Abonnement via les paramètres du produit ou en contactant support@ettajer.com. L'annulation met fin à la facturation future selon les termes de votre formule, mais ne donne pas nécessairement droit au remboursement des montants déjà payés.",
      "Nous pouvons suspendre ou résilier votre accès immédiatement si vous violez substantiellement ces Conditions, ne payez pas les frais, créez une exposition juridique, abusez de la plateforme ou si la loi ou une décision de justice l'exige.",
      "À la résiliation, votre droit d'utiliser le Service prend fin. Nous pouvons conserver ou supprimer des données conformément à notre Politique de confidentialité, aux obligations légales et aux calendriers de sauvegarde raisonnables. L'accès public à la Boutique peut être désactivé lorsque votre Compte est clôturé ou impayé.",
    ],
  },
  {
    id: "disclaimers",
    title: "15. Exclusions de garantie",
    paragraphs: [
      "DANS LA MESURE MAXIMALE PERMISE PAR LA LOI APPLICABLE, LE SERVICE EST FOURNI « EN L'ÉTAT » ET « SELON DISPONIBILITÉ », SANS GARANTIE D'AUCUNE SORTE, EXPRESSE, IMPLICITE OU LÉGALE, Y COMPRIS LES GARANTIES IMPLICITES DE QUALITÉ MARCHANDE, D'ADÉQUATION À UN USAGE PARTICULIER, DE TITRE ET DE NON-CONTREFAÇON.",
      "Ettajer ne garantit pas que le Service répondra à vos exigences commerciales, augmentera vos ventes, éliminera les commandes frauduleuses ou garantira les résultats de livraison ou d'encaissement pour les transactions COD.",
      "Toute déclaration sur notre site concernant des résultats typiques, des exemples de marchands ou des indicateurs de performance est fournie à titre illustratif uniquement et ne constitue pas une garantie.",
    ],
  },
  {
    id: "liability",
    title: "16. Limitation de responsabilité",
    paragraphs: [
      "DANS LA MESURE MAXIMALE PERMISE PAR LA LOI APPLICABLE, ETTAJER ET SES FILIALES, DIRIGEANTS, ADMINISTRATEURS, EMPLOYÉS ET FOURNISSEURS NE SERONT PAS RESPONSABLES DE TOUT DOMMAGE INDIRECT, ACCESSOIRE, SPÉCIAL, CONSÉCUTIF, EXEMPLAIRE OU PUNITIF, NI DE TOUTE PERTE DE PROFITS, REVENUS, FONDS COMMERCIAUX, DONNÉES OU OPPORTUNITÉS COMMERCIALES, DÉCOULANT DE OU LIÉE À VOTRE UTILISATION DU SERVICE.",
      "DANS LA MESURE MAXIMALE PERMISE PAR LA LOI APPLICABLE, LA RESPONSABILITÉ TOTALE AGRÉGÉE D'ETTAJER POUR TOUTES LES RÉCLAMATIONS DÉCOULANT DE OU LIÉES AU SERVICE OU AUX PRÉSENTES CONDITIONS NE DÉPASSERA PAS LE PLUS ÉLEVÉ DES MONTANTS SUIVANTS : (A) LES MONTANTS QUE VOUS AVEZ VERSÉS À ETTAJER POUR LE SERVICE AU COURS DES DOUZE (12) MOIS PRÉCÉDANT L'ÉVÉNEMENT À L'ORIGINE DE LA RÉCLAMATION, OU (B) CENT DOLLARS AMÉRICAINS (100 USD) OU L'ÉQUIVALENT EN MAD.",
      "Certaines juridictions n'autorisent pas certaines limitations de responsabilité. Dans ces juridictions, notre responsabilité est limitée dans la plus grande mesure permise par la loi.",
    ],
  },
  {
    id: "indemnification",
    title: "17. Indemnisation",
    paragraphs: [
      "Vous acceptez de défendre, d'indemniser et de dégager de toute responsabilité Ettajer et ses filiales, dirigeants, administrateurs, employés et mandataires contre toute réclamation, dommage, perte, responsabilité, coût et dépense (y compris des honoraires juridiques raisonnables) découlant de ou liés à :",
    ],
    bullets: [
      "Votre Boutique, vos produits, votre Contenu ou vos pratiques commerciales",
      "Votre violation des présentes Conditions ou de la loi applicable",
      "Les litiges, remboursements, blessures ou pertes des Acheteurs liés à vos produits ou à l'exécution",
      "Votre utilisation abusive des outils de vérification, de messagerie ou de marketing",
      "La violation ou l'allégation de violation des droits de tiers par votre Contenu",
    ],
  },
  {
    id: "governing-law",
    title: "18. Droit applicable et litiges",
    paragraphs: [
      "Les présentes Conditions sont régies par le droit du Royaume du Maroc, sans égard aux principes de conflit de lois, sauf lorsque des règles impératives de protection des consommateurs dans votre juridiction en disposent autrement.",
      "Avant d'engager une procédure formelle, vous acceptez de contacter support@ettajer.com et de tenter de résoudre le litige à l'amiable dans un délai de trente (30) jours.",
      "Si la résolution amiable échoue, les litiges seront soumis aux tribunaux compétents du Maroc, sauf si la loi applicable impose une autre juridiction. Rien dans cette section ne limite le droit de chaque partie de solliciter une mesure injonctive en cas d'atteinte à la propriété intellectuelle ou de menace pour la sécurité.",
    ],
  },
  {
    id: "changes",
    title: "19. Modifications des présentes Conditions",
    paragraphs: [
      "Nous pouvons mettre à jour ces Conditions de temps à autre. En cas de modifications importantes, nous fournirons un avis en publiant les Conditions mises à jour sur cette page, en actualisant la date de « Dernière mise à jour » et, le cas échéant, en vous informant par e-mail ou via un message dans le tableau de bord.",
      "Votre utilisation continue du Service après la date d'entrée en vigueur des Conditions révisées constitue une acceptation des modifications. Si vous n'acceptez pas, vous devez cesser d'utiliser le Service et résilier votre Compte.",
    ],
  },
  {
    id: "contact",
    title: "20. Coordonnées",
    paragraphs: [
      "Les questions relatives aux présentes Conditions doivent être adressées à :",
      "Ettajer — Juridique et assistance",
      "E-mail : support@ettajer.com",
      "Site web : https://ettajer.com",
      "Pour les questions de compte, de facturation ou techniques, vous pouvez également utiliser notre Centre d'aide à /help ou la page Contact à /contact.",
    ],
  },
];
