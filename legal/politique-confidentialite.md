# Politique de Confidentialite

**Freenzy.io — Plateforme d'agents IA**

*Derniere mise a jour : Mars 2026*

---

## Preambule

La presente Politique de Confidentialite decrit comment **Freenzy Ltd**, societe de droit israelien (ci-apres « Freenzy », « nous », « notre »), collecte, utilise, stocke et protege les donnees personnelles des utilisateurs (ci-apres « l'Utilisateur », « vous ») de la plateforme accessible a l'adresse **https://freenzy.io** (ci-apres « la Plateforme »).

Freenzy Ltd est une societe **israelienne**. L'interface de la Plateforme est proposee en francais pour les utilisateurs francophones. Les donnees des utilisateurs sont hebergees au sein de l'Union europeenne (Hetzner, Allemagne) afin de garantir la conformite au RGPD.

Cette politique est redigee en conformite avec :
- Le **Reglement General sur la Protection des Donnees (RGPD)** — Reglement (UE) 2016/679 ;
- La **Loi israelienne sur la Protection de la Vie Privee** (Privacy Protection Law, 5741-1981) et ses reglements d'application ;
- La **loi francaise Informatique et Libertes** (loi n 78-17 du 6 janvier 1978 modifiee) ;
- Toute autre legislation applicable en matiere de protection des donnees personnelles.

---

## Article 1 — Responsable de traitement

Le responsable du traitement des donnees personnelles est :

- **Raison sociale** : Freenzy Ltd
- **Forme juridique** : Societe de droit israelien
- **Siege social** : Israel
- **Contact** : contact@freenzy.io
- **Contact DPO (Delegue a la Protection des Donnees)** : contact@freenzy.io

## Article 2 — Donnees collectees

### 2.1 — Donnees fournies directement par l'Utilisateur

| Categorie | Donnees | Finalite |
|-----------|---------|----------|
| Identification | Nom, prenom, adresse email, nom d'affichage | Creation et gestion du compte |
| Authentification | Mot de passe (hashe avec scrypt, jamais stocke en clair), cles 2FA TOTP | Securite du compte |
| Profil | Photo de profil, preferences, configuration des agents | Personnalisation |
| Facturation | Raison sociale, adresse, n TVA (B2B) | Facturation |
| Communication | Messages, requetes aux agents IA, documents uploades | Fourniture du service |
| Entreprise | Informations de profil d'entreprise, configuration du repondeur (FAQ, contacts VIP) | Fonctionnalites business |
| Support | Emails, messages de support | Assistance utilisateur |

### 2.2 — Donnees collectees automatiquement

| Categorie | Donnees | Finalite |
|-----------|---------|----------|
| Connexion | Adresse IP, type de navigateur, systeme d'exploitation | Securite, statistiques |
| Navigation | Pages visitees, duree de session | Amelioration du service |
| Technique | Logs d'erreur, performances | Maintenance technique |
| Cookies | Identifiants de session, preferences | Fonctionnement (cf. Politique Cookies) |

### 2.3 — Donnees generees par l'utilisation

| Categorie | Donnees | Finalite |
|-----------|---------|----------|
| Interactions IA | Historique des requetes et reponses, contenu genere (documents, scripts, briefings) | Fourniture du service |
| Credits | Historique de consommation | Gestion du compte |
| Transactions | Historique des achats | Facturation, conformite |
| Audit | Logs d'actions | Securite, conformite |
| Voix | Enregistrements vocaux pour transcription (non conserves) | Fonctionnalite vocale |

### 2.4 — Donnees de paiement

Les donnees de carte bancaire sont traitees exclusivement par **Stripe** (certifie PCI-DSS) et ne sont **jamais stockees** sur nos serveurs.

### 2.5 — Donnees sensibles

Freenzy ne collecte pas intentionnellement de donnees sensibles (donnees de sante, origine ethnique, opinions politiques, croyances religieuses, orientation sexuelle, donnees biometriques).

Si un Utilisateur communique des donnees sensibles dans ses interactions avec les agents IA, Freenzy traite ces donnees uniquement dans le cadre de la fourniture du service demande, sans les exploiter a d'autres fins.

## Article 3 — Bases legales du traitement

Conformement a l'article 6 du RGPD, les traitements de donnees personnelles reposent sur les bases legales suivantes :

| Base legale | Traitements concernes |
|-------------|----------------------|
| **Execution du contrat** (art. 6.1.b) | Creation de compte, authentification (JWT + 2FA TOTP), fourniture des services IA, gestion des credits, traitement des paiements, support client |
| **Consentement** (art. 6.1.a) | Cookies non essentiels, communications marketing, newsletter |
| **Interet legitime** (art. 6.1.f) | Amelioration des services, analyse statistique anonymisee, prevention de la fraude, securite, detection des abus |
| **Obligation legale** (art. 6.1.c) | Conservation des donnees de facturation (10 ans), reponse aux requisitions judiciaires, conformite fiscale |

## Article 4 — Finalites du traitement

Les donnees personnelles sont traitees pour les finalites suivantes :

### 4.1 — Fourniture des services
- Creation et gestion des comptes utilisateurs ;
- Fonctionnement des agents IA (traitement des requetes, generation de contenus) ;
- Gestion du systeme de credits (deduction, remboursement, historique) ;
- Traitement des paiements via Stripe ;
- Communication avec l'Utilisateur (notifications, confirmations, support).

### 4.2 — Securite
- Authentification et controle d'acces (JWT, 2FA TOTP) ;
- Detection et prevention de la fraude et des abus ;
- Journalisation des acces et des actions (audit logs) ;
- Validation des webhooks Twilio par signature HMAC ;
- Protection contre les attaques informatiques.

### 4.3 — Amelioration des services
- Analyse statistique anonymisee de l'utilisation ;
- Amelioration des performances et de la qualite des agents IA ;
- Developpement de nouvelles fonctionnalites.

### 4.4 — Conformite legale
- Respect des obligations fiscales et comptables ;
- Reponse aux requisitions judiciaires ;
- Application des CGU et CGV.

## Article 5 — Hebergement et localisation des donnees

**Toutes les donnees sont hebergees dans l'Union europeenne** :

| Service | Localisation | Finalite |
|---------|-------------|----------|
| Hetzner Online GmbH | Allemagne (UE) | Hebergement serveurs (backend, PostgreSQL, Redis) |

Les donnees sont stockees et traitees exclusivement sur des infrastructures localisees dans l'Espace Economique Europeen (EEE). Ce choix garantit la conformite au RGPD et permet aux utilisateurs europeens de beneficier de la protection la plus elevee.

## Article 6 — Destinataires des donnees et transferts internationaux

### 6.1 — Services internes

Les donnees personnelles sont accessibles uniquement aux collaborateurs de Freenzy habilites, dans la stricte mesure necessaire a l'exercice de leurs fonctions.

### 6.2 — Sous-traitants et transferts internationaux

Les donnees sont stockees dans l'UE. Cependant, les services tiers suivants peuvent traiter certaines donnees en dehors de l'UE dans le cadre de l'execution du Service :

| Sous-traitant | Fonction | Localisation | Garanties |
|---------------|----------|-------------|-----------|
| **Hetzner** | Hebergement serveurs et donnees | Allemagne (UE) | RGPD (localisation UE) |
| **Anthropic** | Moteur IA (Claude) | Etats-Unis | Clauses Contractuelles Types (CCT) + DPF |
| **Stripe** | Paiement securise | USA/UE | PCI-DSS + CCT + DPF |
| **Twilio** | Telephonie, SMS, WhatsApp | Etats-Unis | CCT + DPF, SOC 2 |
| **ElevenLabs** | Synthese vocale | USA/UE | CCT + DPF |
| **fal.ai** | Generation d'images | UE/USA | CCT |
| **D-ID** | Creation d'avatars | Israel/USA | CCT, loi israelienne |
| **Runway ML** | Generation video | Etats-Unis | CCT |

Tous les transferts vers les Etats-Unis sont encadres par :
- Les **Clauses Contractuelles Types** (CCT) de la Commission Europeenne (Decision 2021/914) ;
- Le **Data Privacy Framework** (DPF) EU-US quand le sous-traitant est certifie ;
- Des **garanties supplementaires** conformes aux recommandations du Comite europeen de la protection des donnees (EDPB).

### 6.3 — Autorites

Les donnees peuvent etre communiquees aux autorites competentes (judiciaires, fiscales, reglementaires) en reponse a une obligation legale ou a une requisition judiciaire.

### 6.4 — Pas de vente de donnees

Freenzy ne vend **jamais** les donnees personnelles de ses utilisateurs a des tiers. Freenzy ne partage pas les donnees a des fins publicitaires avec des tiers.

## Article 7 — Duree de conservation

Les donnees personnelles sont conservees pour les durees suivantes :

| Type de donnees | Duree de conservation | Justification |
|----------------|----------------------|---------------|
| Donnees de compte | Duree du compte + 90 jours | Execution du contrat + purge |
| Donnees de facturation | 10 ans | Obligation legale (fiscale) |
| Journaux de connexion | 12 mois | Obligation legale, securite |
| Logs d'audit | 12 mois | Securite, conformite |
| Documents uploades | Duree de vie du compte (suppression a la demande) | Execution du contrat |
| Conversations IA | 90 jours (sauf sauvegarde explicite par l'Utilisateur) | Limitation de stockage |
| Donnees du repondeur | Configurable (7 a 365 jours, defaut 90 jours) | Parametrage utilisateur |
| Donnees PII dans les logs | Masquees automatiquement | Securite |
| Donnees de support | 3 ans apres cloture du ticket | Interet legitime |
| Cookies | Cf. Politique Cookies | Cf. Politique Cookies |

A l'expiration de ces durees, les donnees sont **supprimees ou anonymisees de maniere irreversible**. Une purge automatique des donnees est effectuee au-dela de 90 jours conformement a notre politique de minimisation.

En cas de cloture du compte, les donnees personnelles sont purgees dans un delai de **90 jours**, a l'exception des donnees dont la conservation est imposee par la loi.

## Article 8 — Securite des donnees

Freenzy met en oeuvre des mesures techniques et organisationnelles appropriees pour garantir la securite des donnees personnelles :

### 8.1 — Mesures techniques
- **Chiffrement en transit** : TLS 1.3 / HTTPS pour toutes les communications ;
- **Chiffrement au repos** : AES-256 pour les donnees sensibles ;
- **Authentification** : JWT (JSON Web Tokens) avec expiration, 2FA TOTP natif ;
- **Hachage** : Mots de passe haches avec scrypt (jamais stockes en clair) ;
- **Controle d'acces** : RBAC (Role-Based Access Control) avec 4 niveaux (admin, operator, viewer, system) ;
- **Isolation** : Isolation des donnees entre utilisateurs ;
- **Sauvegarde** : Sauvegardes regulieres chiffrees ;
- **Surveillance** : Monitoring continu, detection d'intrusion ;
- **Webhooks** : Validation des webhooks Twilio par signature HMAC ;
- **Infrastructure** : Serveurs dedies au sein de l'UE (Hetzner), isolation reseau.

### 8.2 — Mesures organisationnelles
- Politique de moindre privilege pour l'acces aux donnees ;
- Sensibilisation des collaborateurs a la protection des donnees ;
- Procedures de gestion des incidents de securite ;
- Audit de securite regulier ;
- Journalisation complete des actions (audit logs).

### 8.3 — Masquage des donnees
- Les informations personnelles identifiables (PII) sont **masquees automatiquement dans les logs** de production ;
- Les donnees sensibles ne sont jamais exposees dans les messages d'erreur.

## Article 9 — Droits des utilisateurs

### 9.1 — Droits RGPD (Utilisateurs EEE)

Conformement au RGPD (articles 15 a 22), vous disposez des droits suivants :

- **Droit d'acces** (art. 15) : obtenir une copie de vos donnees personnelles ;
- **Droit de rectification** (art. 16) : corriger des donnees inexactes ;
- **Droit a l'effacement** (art. 17) : demander la suppression de vos donnees ;
- **Droit a la portabilite** (art. 20) : recevoir vos donnees dans un format structure (JSON) ;
- **Droit d'opposition** (art. 21) : vous opposer au traitement de vos donnees ;
- **Droit a la limitation** (art. 18) : limiter le traitement dans certains cas ;
- **Droit de retirer votre consentement** a tout moment quand le traitement est fonde sur le consentement ;
- **Droit relatif aux decisions automatisees** (art. 22) : ne pas faire l'objet d'une decision fondee exclusivement sur un traitement automatise produisant des effets juridiques. Freenzy n'utilise pas de prise de decision entierement automatisee produisant de tels effets.

### 9.2 — Droits en vertu du droit israelien

Conformement a la loi israelienne sur la protection de la vie privee (5741-1981), vous disposez du droit d'acces, de rectification et de suppression de vos donnees personnelles.

### 9.3 — Exercice des droits

Pour exercer vos droits, adressez votre demande a :

- **Email** : contact@freenzy.io
- **Objet** : « Exercice de droits — Protection des donnees »

Freenzy s'engage a repondre dans un delai de **30 jours** a compter de la reception de la demande. Ce delai peut etre prolonge de 60 jours supplementaires en cas de demande complexe, sous reserve d'en informer l'Utilisateur.

Une piece d'identite pourra etre demandee pour verifier l'identite du demandeur.

### 9.4 — Autorites de controle

Vous pouvez egalement introduire une reclamation aupres de l'autorite de controle de votre pays de residence :
- **France** : CNIL — https://www.cnil.fr — 3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07
- **Belgique** : APD — https://www.autoriteprotectiondonnees.be — Rue de la Presse 35, 1000 Bruxelles
- **Israel** : Privacy Protection Authority (PPA) — https://www.gov.il/en/departments/the_privacy_protection_authority
- Toute autorite de protection des donnees de votre pays de residence.

## Article 10 — Traitement des donnees par les agents IA

### 10.1 — Nature du traitement

Lorsque l'Utilisateur interagit avec un agent IA, les donnees suivantes sont traitees :
- Le contenu de la requete de l'Utilisateur ;
- Le contexte de la conversation (historique de la session) ;
- Les documents uploades pour le contexte des agents ;
- Les metadonnees techniques (horodatage, type d'agent, niveau IA).

### 10.2 — Traitement par Anthropic

Les requetes sont traitees par le moteur IA **Anthropic Claude** (modeles Haiku, Sonnet et Opus). Les donnees transmises a Anthropic sont :
- Soumises aux conditions de traitement de donnees d'Anthropic ;
- Encadrees par des Clauses Contractuelles Types (CCT) et le Data Privacy Framework ;
- Utilisees uniquement pour la generation de la reponse et ne sont pas utilisees par Anthropic pour l'entrainement de ses modeles sans consentement explicite.

### 10.3 — Conservation des interactions

Les historiques d'interactions avec les agents IA sont conserves pendant **90 jours** maximum, puis sont automatiquement purges. L'Utilisateur peut demander la suppression anticipee de son historique. Le contenu genere (documents, scripts, briefings) est conserve pour la duree de vie du compte.

### 10.4 — Services tiers impliques

Selon les fonctionnalites utilisees, les donnees peuvent etre traitees par des services tiers supplementaires (Twilio pour la telephonie, ElevenLabs pour la voix, fal.ai pour les images, D-ID pour les avatars, Runway ML pour la video). L'Utilisateur est informe avant l'utilisation de ces services.

## Article 11 — Option Hebergement Prive

Pour une maitrise totale de vos donnees, Freenzy.io propose une solution d'hebergement dedie : une instance privee deployee sur vos propres serveurs ou sur un cloud prive de votre choix.

Avec l'hebergement prive :
- Vos donnees ne quittent jamais votre infrastructure ;
- Vous gardez un controle total sur le stockage et les sauvegardes ;
- Les mises a jour sont appliquees selon votre calendrier ;
- Aucune donnee n'est partagee avec des tiers.

Contactez-nous pour en savoir plus : contact@freenzy.io

## Article 12 — Donnees des mineurs

La Plateforme est destinee aux personnes agees de **18 ans et plus**. Freenzy ne collecte pas sciemment les donnees personnelles de mineurs. Si Freenzy decouvre que des donnees d'un mineur ont ete collectees, elles seront supprimees dans les meilleurs delais.

## Article 13 — Notification des violations de donnees

Conformement aux articles 33 et 34 du RGPD, en cas de violation de donnees personnelles :

- Freenzy notifie l'autorite de controle competente dans un delai de **72 heures** apres en avoir pris connaissance ;
- Si la violation est susceptible d'engendrer un risque eleve pour les droits et libertes des personnes concernees, Freenzy en informe egalement les utilisateurs concernes dans les meilleurs delais ;
- Un registre des violations de donnees est tenu conformement aux obligations legales.

## Article 14 — Analyse d'impact (DPIA)

Conformement a l'article 35 du RGPD, Freenzy realise des analyses d'impact relatives a la protection des donnees (DPIA) pour les traitements susceptibles d'engendrer un risque eleve pour les droits et libertes des personnes, notamment en ce qui concerne les traitements impliquant l'intelligence artificielle.

## Article 15 — Modifications de la politique

Freenzy se reserve le droit de modifier la presente Politique de Confidentialite a tout moment. Les modifications substantielles seront notifiees par email ou notification dans le Service au moins **15 jours** avant leur entree en vigueur.

La date de derniere mise a jour est indiquee en haut de cette page.

## Article 16 — Droit applicable

La presente Politique de Confidentialite est regie par :
- Le **droit israelien**, et en particulier la Privacy Protection Law (5741-1981) ;
- Le **RGPD** (Reglement (UE) 2016/679) pour les utilisateurs residant dans l'EEE ;
- La **loi Informatique et Libertes** (loi n 78-17) pour les utilisateurs residant en France.

Tout litige relatif a la presente politique sera soumis a la competence exclusive des **tribunaux de Tel Aviv, Israel**, sous reserve des juridictions imperatives au benefice des consommateurs europeens.

## Article 17 — Contact

Pour toute question relative a la protection de vos donnees personnelles :

- **Email** : contact@freenzy.io
- **Objet** : « Protection des donnees personnelles »
- **Site web** : https://freenzy.io

---

*La presente Politique de Confidentialite est en vigueur a compter de sa publication sur la Plateforme.*

**Freenzy Ltd** — Societe de droit israelien

---

**A valider par un avocat -- Ce document est un modele indicatif et ne constitue pas un conseil juridique.**
