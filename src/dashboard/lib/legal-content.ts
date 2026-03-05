// Freenzy.io — Legal Content (French)
// All legal text as constants for version control and easy editing

export const LEGAL_LAST_UPDATED = '2 mars 2026';
export const COMPANY_NAME = 'SAS Freenzy.io France';
export const COMPANY_HOLDING = 'Freenzy Ltd';
export const COMPANY_EMAIL = 'contact@freenzy.io';
export const COMPANY_SITE = 'https://freenzy.io';

// ═══════════════════════════════════════
// CGU — Conditions Generales d'Utilisation
// ═══════════════════════════════════════

export const CGU_SECTIONS = [
  {
    id: 'objet',
    title: 'Article 1 — Objet',
    content: `Les presentes Conditions Generales d'Utilisation (ci-apres "CGU") regissent l'acces et l'utilisation de la plateforme Freenzy.io (ci-apres "le Service"), editee par ${COMPANY_NAME}, filiale de ${COMPANY_HOLDING}.

Le Service est une plateforme SaaS (Software as a Service) proposant des agents d'intelligence artificielle specialises pour la gestion d'entreprise, la creation de contenu, la communication et la productivite.

En creant un compte ou en utilisant le Service, l'Utilisateur accepte sans reserve les presentes CGU.`,
  },
  {
    id: 'inscription',
    title: 'Article 2 — Inscription et compte',
    content: `L'utilisation du Service necessite la creation d'un compte avec une adresse email valide et un mot de passe securise.

L'Utilisateur s'engage a :
- Fournir des informations exactes et a jour
- Maintenir la confidentialite de ses identifiants
- Ne pas creer plusieurs comptes
- Signaler immediatement toute utilisation non autorisee de son compte

${COMPANY_NAME} se reserve le droit de suspendre ou supprimer tout compte en cas de violation des presentes CGU.`,
  },
  {
    id: 'service',
    title: 'Article 3 — Description du Service',
    content: `Freenzy.io met a disposition de l'Utilisateur :
- 24 agents d'intelligence artificielle (12 business + 12 personnels) specialises dans differents domaines (communication, marketing, video, photo, finance, RH, etc.)
- Un studio creatif pour la production video et photo assistee par IA
- Un systeme de repondeur intelligent configurable
- Des outils de gestion documentaire et d'analyse
- Un tableau de bord de suivi et de pilotage

Le Service fonctionne sur un modele de prepaiement par credits (micro-credits). L'Utilisateur recharge son solde au montant de son choix et consomme des credits a chaque utilisation des agents IA.

L'inscription est gratuite. L'Utilisateur peut recharger des credits a tout moment pour utiliser les agents IA.`,
  },
  {
    id: 'credits',
    title: 'Article 4 — Systeme de credits',
    content: `Le Service utilise un systeme de micro-credits :
- 1 credit = 1 000 000 micro-credits
- Les credits sont consommes a chaque interaction avec les agents IA
- Le cout varie selon le type d'action (chat, generation de document, video, etc.)
- Les credits achetes n'expirent pas tant que le compte est actif

Des frais de serveur, gestion et assurance de 5% sont appliques sur les consommations. Les 5 000 premiers inscrits beneficient de 0% de frais.

L'Utilisateur peut consulter a tout moment son solde de credits et l'historique de sa consommation depuis son tableau de bord.`,
  },
  {
    id: 'utilisation',
    title: 'Article 5 — Utilisation acceptable',
    content: `L'Utilisateur s'engage a utiliser le Service de maniere responsable et legale. Il est interdit de :
- Utiliser le Service a des fins illegales, frauduleuses ou nuisibles
- Generer du contenu haineux, discriminatoire, violent ou pornographique
- Tenter de contourner les limites techniques ou de securite
- Revendre ou redistribuer le Service sans autorisation
- Utiliser le Service pour du spam, du phishing ou des attaques informatiques
- Copier, modifier ou desassembler le code source du Service

${COMPANY_NAME} se reserve le droit de suspendre l'acces en cas de violation, sans preavis ni remboursement.`,
  },
  {
    id: 'propriete',
    title: 'Article 6 — Propriete intellectuelle',
    content: `Le Service, son code source, son design, ses agents IA et ses algorithmes sont la propriete exclusive de ${COMPANY_NAME} et ${COMPANY_HOLDING}.

Le contenu genere par les agents IA pour l'Utilisateur appartient a l'Utilisateur, sous reserve du respect des presentes CGU et des droits des tiers.

L'Utilisateur conserve la propriete de ses donnees personnelles et de ses documents uploades.`,
  },
  {
    id: 'responsabilite',
    title: 'Article 7 — Limitation de responsabilite',
    content: `Le Service est fourni "en l'etat". ${COMPANY_NAME} ne garantit pas :
- L'exactitude ou la pertinence des reponses generees par les agents IA
- La disponibilite continue et ininterrompue du Service
- L'absence totale de bugs ou d'erreurs

Les agents IA sont des outils d'aide a la decision. L'Utilisateur reste seul responsable des decisions prises sur la base des resultats fournis par le Service.

En aucun cas ${COMPANY_NAME} ne pourra etre tenu responsable de dommages indirects, de pertes de donnees ou de manque a gagner lies a l'utilisation du Service.

La responsabilite de ${COMPANY_NAME} est limitee au montant des credits achetes par l'Utilisateur au cours des 12 derniers mois.`,
  },
  {
    id: 'resiliation',
    title: 'Article 8 — Resiliation',
    content: `L'Utilisateur peut resilier son compte a tout moment depuis son tableau de bord. Les credits restants non consommes ne sont pas remboursables, sauf dispositions contraires dans les CGV.

${COMPANY_NAME} peut resilier un compte en cas de :
- Violation des presentes CGU
- Inactivite prolongee (12 mois sans connexion)
- Demande de l'autorite competente

En cas de resiliation, les donnees de l'Utilisateur sont conservees pendant 30 jours puis supprimees, sauf obligation legale de conservation.`,
  },
  {
    id: 'modification',
    title: 'Article 9 — Modification des CGU',
    content: `${COMPANY_NAME} se reserve le droit de modifier les presentes CGU a tout moment. Les modifications entrent en vigueur des leur publication sur le Site.

L'Utilisateur sera informe des modifications substantielles par email ou notification dans le Service. L'utilisation continue du Service apres notification vaut acceptation des nouvelles CGU.`,
  },
  {
    id: 'droit',
    title: 'Article 10 — Droit applicable et litiges',
    content: `Les presentes CGU sont soumises au droit francais.

En cas de litige, les parties s'engagent a rechercher une solution amiable. A defaut, les tribunaux competents de Paris seront seuls competents.

Pour toute question relative aux presentes CGU, contactez-nous a : ${COMPANY_EMAIL}`,
  },
];

// ═══════════════════════════════════════
// CGV — Conditions Generales de Vente
// ═══════════════════════════════════════

export const CGV_SECTIONS = [
  {
    id: 'objet',
    title: 'Article 1 — Objet',
    content: `Les presentes Conditions Generales de Vente (ci-apres "CGV") regissent les conditions financieres d'utilisation du Service Freenzy.io, edite par ${COMPANY_NAME}.`,
  },
  {
    id: 'modele',
    title: 'Article 2 — Modele tarifaire',
    content: `Freenzy.io fonctionne sur un modele de prepaiement sans abonnement :
- Aucun frais d'inscription ni abonnement mensuel
- L'Utilisateur recharge son solde de credits au montant de son choix (minimum : 5 EUR)
- Les credits sont consommes a chaque utilisation des agents IA
- Le cout par action est affiche avant chaque utilisation

Des frais de serveur, gestion et assurance de 5% sont appliques sur les consommations de credits. Les 5 000 premiers inscrits beneficient d'une exoneration totale de ces frais (0%).

L'inscription est gratuite. L'Utilisateur peut recharger des credits a tout moment pour utiliser les agents IA.`,
  },
  {
    id: 'paiement',
    title: 'Article 3 — Paiement et facturation',
    content: `Les rechargements de credits sont effectues par carte bancaire ou virement via notre prestataire de paiement securise.

Une facture est emise pour chaque rechargement de credits et est disponible dans l'espace client. Les prix sont exprimes en euros TTC.

Le paiement est exigible au moment de la recharge. Les credits sont immediatement disponibles apres validation du paiement.`,
  },
  {
    id: 'remboursement',
    title: 'Article 4 — Politique de remboursement',
    content: `Les credits consommes ne sont pas remboursables.

En cas de probleme technique avere empeche l'utilisation du Service, ${COMPANY_NAME} pourra, a sa discretion, crediter le compte de l'Utilisateur du montant correspondant aux credits perdus.

Conformement a l'article L221-28 du Code de la consommation, le droit de retractation ne s'applique pas aux contenus numeriques fournis sur un support immateriel dont l'execution a commence avec l'accord du consommateur.

Pour les credits non utilises, un remboursement peut etre demande dans les 14 jours suivant l'achat, sous reserve qu'aucun credit n'ait ete consomme depuis la recharge concernee.`,
  },
  {
    id: 'tarifs',
    title: 'Article 5 — Grille tarifaire indicative',
    content: `A titre indicatif, voici les couts moyens par type d'action :
- Chat avec un agent : ~1 a 3 credits
- Generation de document : ~5 a 15 credits
- Generation de video (avatar IA) : ~25 credits
- Synthese vocale : ~0.5 a 2 credits
- Analyse de donnees : ~3 a 10 credits

Les couts exacts sont affiches dans l'interface avant chaque action. ${COMPANY_NAME} se reserve le droit de modifier la grille tarifaire. Les modifications n'affectent pas les credits deja achetes.`,
  },
  {
    id: 'litiges',
    title: 'Article 6 — Reclamations et litiges',
    content: `Pour toute reclamation relative a la facturation, contactez : ${COMPANY_EMAIL}

Conformement aux dispositions du Code de la consommation, l'Utilisateur peut recourir gratuitement au service de mediation de la consommation. Le mediateur sera designe ulterieurement et ses coordonnees communiquees sur le Site.

Les presentes CGV sont soumises au droit francais. Les tribunaux de Paris sont seuls competents en cas de litige.`,
  },
];

// ═══════════════════════════════════════
// Mentions Legales
// ═══════════════════════════════════════

export const MENTIONS_SECTIONS = [
  {
    id: 'editeur',
    title: 'Editeur du site',
    content: `**${COMPANY_NAME}**
Societe par Actions Simplifiee (SAS)
Capital social : [a completer]
RCS : [a completer]
Siege social : [a completer — France]
Numero de TVA intracommunautaire : [a completer]

Filiale de **${COMPANY_HOLDING}** (holding)

Directeur de la publication : [a completer]
Contact : ${COMPANY_EMAIL}
Site web : ${COMPANY_SITE}`,
  },
  {
    id: 'hebergeur',
    title: 'Hebergement',
    content: `Le Service est heberge sur des serveurs securises situes en **Union Europeenne**, conformement au Reglement General sur la Protection des Donnees (RGPD).

Hebergeur principal : [a completer]
Adresse : [a completer — Union Europeenne]

Les donnees sont stockees et traitees exclusivement sur des infrastructures localisees dans l'Espace Economique Europeen.`,
  },
  {
    id: 'activite',
    title: 'Activite',
    content: `Freenzy.io est une plateforme SaaS d'intelligence artificielle pour la gestion d'entreprise. Le Service propose des agents IA specialises, un studio de creation video et photo, et des outils de productivite.

Le Service est accessible depuis tout navigateur web moderne a l'adresse ${COMPANY_SITE}.`,
  },
  {
    id: 'credits-medias',
    title: 'Credits et medias',
    content: `Les icones et illustrations utilisees sur le Site proviennent de ressources libres de droits ou sont la propriete de ${COMPANY_NAME}.

L'intelligence artificielle est alimentee par la technologie Claude d'Anthropic. Les integrations video et voix utilisent les services D-ID, Deepgram et ElevenLabs.`,
  },
];

// ═══════════════════════════════════════
// Politique de Confidentialite
// ═══════════════════════════════════════

export const PRIVACY_SECTIONS = [
  {
    id: 'introduction',
    title: '1. Introduction',
    content: `${COMPANY_NAME} (filiale de ${COMPANY_HOLDING}) s'engage a proteger la vie privee de ses Utilisateurs. La presente Politique de Confidentialite decrit les donnees collectees, les finalites de leur traitement et les droits des Utilisateurs conformement au Reglement General sur la Protection des Donnees (RGPD — Reglement UE 2016/679).

Responsable du traitement : ${COMPANY_NAME}
Contact DPO : ${COMPANY_EMAIL}`,
  },
  {
    id: 'donnees-collectees',
    title: '2. Donnees collectees',
    content: `Nous collectons les categories de donnees suivantes :

**Donnees d'identification :**
- Adresse email, nom d'affichage, mot de passe (hashe)

**Donnees d'utilisation :**
- Historique des interactions avec les agents IA
- Consommation de credits et transactions
- Configuration des agents et preferences
- Journaux de connexion (IP, date, navigateur)

**Donnees de contenu :**
- Documents uploades pour le contexte des agents
- Contenu genere par les agents (documents, scripts, briefings)
- Enregistrements vocaux (pour la transcription, non conserves)

**Donnees d'entreprise :**
- Informations de profil d'entreprise (onboarding)
- Configuration du repondeur (FAQ, contacts VIP)`,
  },
  {
    id: 'finalites',
    title: '3. Finalites du traitement',
    content: `Vos donnees sont traitees pour les finalites suivantes :

**Execution du Service (base legale : contrat) :**
- Gestion de votre compte et authentification
- Fonctionnement des agents IA et traitement de vos requetes
- Facturation et gestion des credits
- Support client

**Amelioration du Service (base legale : interet legitime) :**
- Analyse statistique anonymisee de l'utilisation
- Amelioration des performances des agents IA
- Detection et prevention des abus

**Securite (base legale : interet legitime) :**
- Prevention de la fraude et des acces non autorises
- Journalisation pour la securite informatique

Les donnees anonymisees et agregees peuvent etre utilisees a des fins d'amelioration du service et de partenariats strategiques, dans le strict respect du cadre legal en vigueur.`,
  },
  {
    id: 'conservation',
    title: '4. Duree de conservation',
    content: `Les donnees sont conservees selon les durees suivantes :
- **Donnees de compte** : duree de vie du compte + 30 jours apres suppression
- **Donnees de facturation** : 10 ans (obligation legale)
- **Journaux de connexion** : 12 mois
- **Documents uploades** : duree de vie du compte (suppression a la demande)
- **Conversations IA** : 90 jours (sauf sauvegarde explicite par l'Utilisateur)
- **Donnees du repondeur** : configurable par l'Utilisateur (7 a 365 jours, defaut 90 jours)`,
  },
  {
    id: 'droits',
    title: '5. Vos droits (RGPD)',
    content: `Conformement au RGPD, vous disposez des droits suivants :

- **Droit d'acces** : obtenir une copie de vos donnees personnelles
- **Droit de rectification** : corriger des donnees inexactes
- **Droit a l'effacement** : demander la suppression de vos donnees
- **Droit a la portabilite** : recevoir vos donnees dans un format structure
- **Droit d'opposition** : vous opposer au traitement de vos donnees
- **Droit a la limitation** : limiter le traitement dans certains cas

Pour exercer ces droits, contactez-nous a : ${COMPANY_EMAIL}

Nous repondrons a votre demande dans un delai maximum de 30 jours. Vous pouvez egalement introduire une reclamation aupres de la CNIL (Commission Nationale de l'Informatique et des Libertes).`,
  },
  {
    id: 'securite',
    title: '6. Securite des donnees',
    content: `Nous mettons en oeuvre les mesures de securite suivantes :
- Chiffrement des communications (TLS/HTTPS)
- Hashage des mots de passe (scrypt)
- Chiffrement des donnees sensibles au repos (AES-256)
- Authentification JWT avec expiration
- Isolation des donnees entre utilisateurs
- Sauvegardes regulieres chiffrees
- Serveurs heberges exclusivement en Union Europeenne
- Controle d'acces role (RBAC) strict`,
  },
  {
    id: 'transferts',
    title: '7. Transferts internationaux',
    content: `Vos donnees sont traitees et stockees exclusivement sur des serveurs situes dans l'Union Europeenne.

Les services tiers integres (Anthropic Claude AI, D-ID, Deepgram, ElevenLabs) peuvent traiter certaines donnees aux Etats-Unis dans le cadre de l'execution du Service. Ces transferts sont encadres par les Clauses Contractuelles Types (CCT) de la Commission Europeenne et/ou le Data Privacy Framework EU-US.`,
  },
  {
    id: 'hebergement-prive',
    title: '8. Option Hebergement Prive',
    content: `Pour une maitrise totale de vos donnees, Freenzy.io propose une solution d'hebergement dedie : une instance privee deployee sur vos propres serveurs ou sur un cloud prive de votre choix.

Avec l'hebergement prive :
- Vos donnees ne quittent jamais votre infrastructure
- Vous gardez un controle total sur le stockage et les sauvegardes
- Les mises a jour sont appliquees selon votre calendrier
- Aucune donnee n'est partagee avec des tiers

Contactez-nous pour en savoir plus : ${COMPANY_EMAIL}`,
  },
  {
    id: 'sous-traitants',
    title: '9. Sous-traitants',
    content: `Les sous-traitants suivants peuvent acceder a certaines de vos donnees dans le cadre de l'execution du Service :

| Sous-traitant | Finalite | Localisation |
|--------------|----------|--------------|
| Anthropic (Claude AI) | Intelligence artificielle | USA (CCT) |
| D-ID | Generation video avatar | Israel/USA (CCT) |
| Deepgram | Transcription et synthese vocale | USA (CCT) |
| ElevenLabs | Synthese vocale premium | USA/UE (CCT) |
| [Hebergeur] | Hebergement serveurs | Union Europeenne |

Chaque sous-traitant est contractuellement tenu de respecter les obligations du RGPD.`,
  },
  {
    id: 'modification',
    title: '10. Modification de la politique',
    content: `${COMPANY_NAME} se reserve le droit de modifier la presente Politique de Confidentialite. Les modifications substantielles seront notifiees par email ou notification dans le Service.

La date de derniere mise a jour est indiquee en haut de cette page.

Pour toute question : ${COMPANY_EMAIL}`,
  },
];

// ═══════════════════════════════════════
// Politique de Cookies
// ═══════════════════════════════════════

export const COOKIES_SECTIONS = [
  {
    id: 'definition',
    title: '1. Qu\'est-ce qu\'un cookie ?',
    content: `Un cookie est un petit fichier texte depose sur votre terminal (ordinateur, tablette, smartphone) lors de la visite d'un site web. Il permet au site de se souvenir de certaines informations pour ameliorer votre experience.`,
  },
  {
    id: 'utilisation',
    title: '2. Cookies utilises par Freenzy.io',
    content: `Freenzy.io utilise **exclusivement des cookies necessaires** au fonctionnement du Service :

| Cookie | Finalite | Duree |
|--------|----------|-------|
| fz_session | Authentification utilisateur | Session |
| fz_cookies_accepted | Consentement cookies | 30 jours |
| fz_low_credit_dismissed | Preference UI | 24 heures |

**Aucun cookie de tracking, de publicite ou d'analyse tiers n'est utilise.**

Nous n'utilisons pas Google Analytics, Facebook Pixel, ni aucun outil de suivi publicitaire.`,
  },
  {
    id: 'localstorage',
    title: '3. Stockage local (localStorage)',
    content: `Freenzy.io utilise egalement le stockage local de votre navigateur pour :
- Sauvegarder vos preferences d'interface
- Stocker temporairement l'historique de vos conversations
- Conserver la configuration locale de vos agents

Ces donnees sont stockees uniquement sur votre appareil et ne sont pas transmises a nos serveurs (sauf sauvegarde explicite par vos soins).`,
  },
  {
    id: 'gestion',
    title: '4. Gestion de vos cookies',
    content: `Vous pouvez configurer votre navigateur pour refuser les cookies. Cependant, cela pourrait empecher le bon fonctionnement du Service (notamment l'authentification).

Pour plus d'informations sur la gestion des cookies :
- Chrome : chrome://settings/cookies
- Firefox : about:preferences#privacy
- Safari : Preferences > Confidentialite
- Edge : edge://settings/privacy`,
  },
  {
    id: 'contact',
    title: '5. Contact',
    content: `Pour toute question relative a notre utilisation des cookies : ${COMPANY_EMAIL}`,
  },
];
