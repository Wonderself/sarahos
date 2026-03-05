// ===============================================================
// Ceremonie Agent — System Prompts ("Maitre de Ceremonie")
// ===============================================================

import type { EventType, TimelineMilestone } from './ceremonie.types';

export const CEREMONIE_SYSTEM_PROMPT = `Tu es le Maitre de Ceremonie de Freenzy.io — un agent IA specialise dans l'organisation d'evenements personnels.

IDENTITE :
Tu es un organisateur d'evenements personnel, createur d'experiences memorables.
Tu combines rigueur logistique et creativite pour que chaque evenement soit parfait.
Tu connais les traditions francaises, les tendances actuelles et les astuces de pro.

TYPES D'EVENEMENTS GERES :
- Anniversaire : du gouter d'enfant a la fete surprise des 50 ans
- Mariage : du fiancailles au jour J (civil et/ou religieux)
- Fete : soiree a theme, garden party, fete de fin d'annee
- Reunion de famille : du simple repas au week-end complet
- Baby shower : decoration, jeux, cadeaux, gender reveal
- Pendaison de cremaillere : accueil, visite, buffet
- Noel : menu, cadeaux, decoration, planning des fetes
- Autre : tout evenement personnel sur mesure

MODES DE FONCTIONNEMENT :

1. PLAN — Planification globale de l'evenement
   - Definition du concept et du theme
   - Budget previsionnel detaille
   - Timeline avec jalons J-30, J-15, J-7, J-3, J-1, Jour J
   - Checklist complete par categorie (lieu, traiteur, decoration, animation, etc.)
   - Suggestions adaptees au type d'evenement et au budget

2. GUESTS — Gestion des invites
   - Liste d'invites avec coordonnees
   - Suivi RSVP (confirme, decline, peut-etre, en attente)
   - Gestion des regimes alimentaires et allergies
   - Plan de table (si applicable)
   - Gestion des +1
   - Envoi de rappels de confirmation

3. TIMELINE — Creation de timeline
   - Retroplanning detaille depuis J-30 (ou plus)
   - Jalons critiques : J-30, J-15, J-7, J-3, J-1, Jour J
   - Taches concretes pour chaque jalon
   - Deroulement minute par minute le jour J
   - Plan B en cas d'imprevu (meteo, retard traiteur, etc.)

4. BUDGET — Gestion du budget
   - Budget previsionnel par poste (lieu, traiteur, decoration, boisson, animation, photo, transport)
   - Suivi des depenses reelles vs previsionnel
   - Alertes de depassement
   - Suggestions d'economies sans compromettre la qualite
   - Bons plans et astuces

REGLES CRITIQUES :
- Reponds TOUJOURS en JSON structure
- Adapte le ton au type d'evenement (plus formel pour un mariage, plus fun pour un anniversaire)
- Propose TOUJOURS des alternatives budget-friendly
- Respecte les restrictions alimentaires et culturelles
- Anticipe les problemes (meteo, parking, accessibilite)
- Tous les montants sont en centimes d'euros

STRUCTURE DE REPONSE :
{
  "response": "Texte conseil pour l'utilisateur",
  "data": { ... },
  "suggestions": ["Suggestion 1", "Suggestion 2"],
  "nextSteps": ["Prochaine etape 1", "Prochaine etape 2"]
}`;

export const PLAN_PROMPT = `Cree un plan d'evenement personnalise.

Type d'evenement : {eventType}
Titre : {title}
Date : {eventDate}
Lieu : {venue}
Budget : {budget} centimes
Nombre d'invites : {guestCount}

Genere un plan complet avec : concept/theme, budget previsionnel detaille,
timeline J-30 a Jour J, checklist par categorie, suggestions adaptees.
Propose des idees creatives et des alternatives budget-friendly.`;

export const GUESTS_PROMPT = `Gere les invites de l'evenement.

Action : {action}
Evenement ID : {eventId}
Donnees invite : {guestData}
Liste actuelle : {currentGuests}

Selon l'action :
- list : resume la liste des invites avec statuts RSVP
- add : ajoute un invite et suggere des informations a completer
- update_rsvp : met a jour le statut et recalcule les totaux
- summary : genere un resume RSVP avec statistiques et alertes`;

export const TIMELINE_PROMPT = `Genere une timeline detaillee pour l'evenement.

Type d'evenement : {eventType}
Date : {eventDate}
Donnees actuelles : {eventData}

Genere un retroplanning complet :
- J-30 : reservations, invitations
- J-15 : confirmations, commandes
- J-7 : derniers details, courses
- J-3 : preparation lieu, decoration
- J-1 : installation, derniers ajustements
- Jour J : deroulement heure par heure
Include un plan B pour chaque etape critique.`;

export const BUDGET_PROMPT = `Gere le budget de l'evenement.

Action : {action}
Budget total : {budgetTotal} centimes
Depenses actuelles : {currentSpent} centimes
Items budget : {budgetItems}

Selon l'action :
- overview : resume budget avec graphique, alertes depassement, suggestions economies
- add_item : ajoute un poste de depense, verifie coherence avec budget
- update_item : met a jour un poste, recalcule totaux

Propose toujours des alternatives moins cheres si le budget est serre.`;

// ── Timeline Templates ──

export const TIMELINE_TEMPLATES: Record<EventType, TimelineMilestone[]> = {
  anniversaire: [
    {
      label: 'J-30',
      daysBeforeEvent: 30,
      description: 'Lancement de la preparation',
      isDone: false,
      tasks: [
        'Definir le theme et le concept',
        'Fixer le budget',
        'Reserver le lieu',
        'Dresser la liste des invites',
        'Envoyer les invitations (physiques ou digitales)',
      ],
    },
    {
      label: 'J-15',
      daysBeforeEvent: 15,
      description: 'Confirmations et commandes',
      isDone: false,
      tasks: [
        'Relancer les invites sans reponse',
        'Commander le gateau',
        'Reserver traiteur/restaurant',
        'Planifier les animations/jeux',
        'Commander decoration et ballons',
      ],
    },
    {
      label: 'J-7',
      daysBeforeEvent: 7,
      description: 'Derniers details',
      isDone: false,
      tasks: [
        'Finaliser le menu',
        'Preparer la playlist musicale',
        'Confirmer toutes les reservations',
        'Acheter les boissons et consommables',
        'Preparer les cadeaux / sacs de fete',
      ],
    },
    {
      label: 'J-3',
      daysBeforeEvent: 3,
      description: 'Preparation finale',
      isDone: false,
      tasks: [
        'Faire les courses alimentaires perissables',
        'Preparer la decoration',
        'Verifier la sono / eclairage',
        'Imprimer plan de table si besoin',
      ],
    },
    {
      label: 'J-1',
      daysBeforeEvent: 1,
      description: 'Veille du jour J',
      isDone: false,
      tasks: [
        'Installer la decoration du lieu',
        'Preparer les plats qui se conservent',
        'Charger les batteries (telephone, enceinte, camera)',
        'Derniere verification de la checklist',
      ],
    },
    {
      label: 'Jour J',
      daysBeforeEvent: 0,
      description: 'Le grand jour !',
      isDone: false,
      tasks: [
        'Installer les derniers elements (fleurs, bougies)',
        'Recuperer le gateau',
        'Accueillir les invites',
        'Lancer la musique et les animations',
        'Gateau + bougies + chanson',
        'Photos de groupe',
        'Ranger et nettoyer',
      ],
    },
  ],

  mariage: [
    {
      label: 'J-30',
      daysBeforeEvent: 30,
      description: 'Derniere ligne droite',
      isDone: false,
      tasks: [
        'Confirmer tous les prestataires',
        'Essayage final tenue',
        'Finaliser le plan de table',
        'Confirmer RSVP definitifs',
        'Imprimer menus et marque-places',
        'Preparer les alliances et cadeaux invites',
      ],
    },
    {
      label: 'J-15',
      daysBeforeEvent: 15,
      description: 'Coordination finale',
      isDone: false,
      tasks: [
        'Reunion avec le coordinateur/DJ/photographe',
        'Confirmer horaires mairie/eglise/lieu',
        'Preparer les discours/voeux',
        'Organiser le cortege de voitures',
        'Verifier assurances et autorisations',
      ],
    },
    {
      label: 'J-7',
      daysBeforeEvent: 7,
      description: 'Semaine du mariage',
      isDone: false,
      tasks: [
        'Derniers ajustements plan de table',
        'Recuperer les tenues',
        'Preparer les valises lune de miel',
        'Confirmer transferts et transports',
        'Repeter la ceremonie si prevu',
      ],
    },
    {
      label: 'J-3',
      daysBeforeEvent: 3,
      description: 'Preparation intensive',
      isDone: false,
      tasks: [
        'Soins beaute (coiffeur, manucure)',
        'Diner de repetition / pre-soiree',
        'Livraison decoration au lieu',
        'Verifier la meteo et plan B',
      ],
    },
    {
      label: 'J-1',
      daysBeforeEvent: 1,
      description: 'Veille du grand jour',
      isDone: false,
      tasks: [
        'Installation et decoration du lieu',
        'Deposer affaires sur place',
        'Soiree calme, se reposer',
        'Relire ses voeux',
        'Preparer la tenue complete',
      ],
    },
    {
      label: 'Jour J',
      daysBeforeEvent: 0,
      description: 'Le plus beau jour !',
      isDone: false,
      tasks: [
        'Preparation maries (coiffure, maquillage, habillage)',
        'Photos avant ceremonie',
        'Ceremonie civile/religieuse',
        'Photos de couple et de groupe',
        'Vin d\'honneur / cocktail',
        'Diner / soiree dansante',
        'Premiere danse, gateau, lancer de bouquet',
      ],
    },
  ],

  fete: [
    {
      label: 'J-30', daysBeforeEvent: 30, description: 'Preparation initiale', isDone: false,
      tasks: ['Choisir le theme', 'Reserver le lieu', 'Creer la liste d\'invites', 'Envoyer les invitations'],
    },
    {
      label: 'J-15', daysBeforeEvent: 15, description: 'Organisation', isDone: false,
      tasks: ['Confirmer les presences', 'Commander decoration', 'Planifier menu/boissons', 'Preparer playlist'],
    },
    {
      label: 'J-7', daysBeforeEvent: 7, description: 'Derniers details', isDone: false,
      tasks: ['Acheter boissons', 'Confirmer animations', 'Preparer jeux/activites'],
    },
    {
      label: 'J-3', daysBeforeEvent: 3, description: 'Achats finaux', isDone: false,
      tasks: ['Courses alimentaires', 'Verifier sono/eclairage', 'Confirmer planning'],
    },
    {
      label: 'J-1', daysBeforeEvent: 1, description: 'Installation', isDone: false,
      tasks: ['Decorer le lieu', 'Preparer le buffet', 'Tester le materiel'],
    },
    {
      label: 'Jour J', daysBeforeEvent: 0, description: 'C\'est la fete !', isDone: false,
      tasks: ['Derniers preparatifs', 'Accueil des invites', 'Animation et ambiance', 'Rangement'],
    },
  ],

  reunion_famille: [
    {
      label: 'J-30', daysBeforeEvent: 30, description: 'Organisation', isDone: false,
      tasks: ['Choisir la date avec la famille', 'Reserver le lieu', 'Envoyer invitations', 'Definir le menu collectif'],
    },
    {
      label: 'J-15', daysBeforeEvent: 15, description: 'Coordination', isDone: false,
      tasks: ['Confirmer presences', 'Repartir les plats (qui apporte quoi)', 'Organiser hebergement si necessaire'],
    },
    {
      label: 'J-7', daysBeforeEvent: 7, description: 'Preparation', isDone: false,
      tasks: ['Courses communes', 'Preparer activites intergenerationnelles', 'Organiser le planning de la journee'],
    },
    {
      label: 'J-3', daysBeforeEvent: 3, description: 'Logistique', isDone: false,
      tasks: ['Verifier tables et chaises', 'Preparer jeux pour enfants', 'Confirmer les arrivees'],
    },
    {
      label: 'J-1', daysBeforeEvent: 1, description: 'Mise en place', isDone: false,
      tasks: ['Installer tables et decoration', 'Preparer les plats', 'Accueillir les premiers arrivants'],
    },
    {
      label: 'Jour J', daysBeforeEvent: 0, description: 'Reunion !', isDone: false,
      tasks: ['Accueil de tous', 'Repas convivial', 'Photos de famille', 'Activites et souvenirs', 'Rangement collectif'],
    },
  ],

  baby_shower: [
    {
      label: 'J-30', daysBeforeEvent: 30, description: 'Preparation', isDone: false,
      tasks: ['Choisir le theme (neutre ou genre)', 'Reserver le lieu', 'Creer la liste de naissance', 'Envoyer invitations'],
    },
    {
      label: 'J-15', daysBeforeEvent: 15, description: 'Organisation', isDone: false,
      tasks: ['Commander decoration', 'Planifier les jeux (devine le prenom, biberon relais...)', 'Commander le gateau/desserts'],
    },
    {
      label: 'J-7', daysBeforeEvent: 7, description: 'Details', isDone: false,
      tasks: ['Confirmer presences', 'Preparer sacs cadeaux invites', 'Acheter accessoires photo (props)'],
    },
    {
      label: 'J-3', daysBeforeEvent: 3, description: 'Achats', isDone: false,
      tasks: ['Courses alimentaires', 'Imprimer jeux et quiz', 'Preparer decoration'],
    },
    {
      label: 'J-1', daysBeforeEvent: 1, description: 'Installation', isDone: false,
      tasks: ['Decorer le lieu', 'Installer coin photo', 'Preparer le buffet'],
    },
    {
      label: 'Jour J', daysBeforeEvent: 0, description: 'Baby Shower !', isDone: false,
      tasks: ['Accueil et boissons', 'Jeux et animations', 'Ouverture des cadeaux', 'Photos souvenir', 'Gateau'],
    },
  ],

  pendaison_cremaillere: [
    {
      label: 'J-30', daysBeforeEvent: 30, description: 'Preparation', isDone: false,
      tasks: ['Fixer la date', 'Inviter amis/famille/voisins', 'Planifier visite guidee de l\'appart'],
    },
    {
      label: 'J-15', daysBeforeEvent: 15, description: 'Organisation', isDone: false,
      tasks: ['Confirmer presences', 'Planifier buffet/apero', 'Acheter boissons en gros'],
    },
    {
      label: 'J-7', daysBeforeEvent: 7, description: 'Preparation', isDone: false,
      tasks: ['Ranger et nettoyer l\'appartement', 'Preparer playlist ambiance', 'Commander si besoin (pizzas, sushi...)'],
    },
    {
      label: 'J-3', daysBeforeEvent: 3, description: 'Achats', isDone: false,
      tasks: ['Courses finales', 'Acheter verres/assiettes jetables si besoin'],
    },
    {
      label: 'J-1', daysBeforeEvent: 1, description: 'Mise en place', isDone: false,
      tasks: ['Grand menage final', 'Installer coin buffet', 'Preparer ambiance (bougies, guirlandes)'],
    },
    {
      label: 'Jour J', daysBeforeEvent: 0, description: 'Bienvenue chez moi !', isDone: false,
      tasks: ['Derniers rangements', 'Installer buffet', 'Accueillir les invites', 'Visite guidee', 'Profiter !'],
    },
  ],

  noel: [
    {
      label: 'J-30', daysBeforeEvent: 30, description: 'Debut des preparatifs', isDone: false,
      tasks: ['Definir le menu de Noel', 'Dresser liste des cadeaux', 'Reserver la dinde/chapon', 'Ecrire les cartes de voeux'],
    },
    {
      label: 'J-15', daysBeforeEvent: 15, description: 'Shopping et organisation', isDone: false,
      tasks: ['Acheter les cadeaux', 'Commander buche et desserts', 'Installer le sapin et decoration', 'Confirmer les invites'],
    },
    {
      label: 'J-7', daysBeforeEvent: 7, description: 'Derniere semaine', isDone: false,
      tasks: ['Emballer les cadeaux', 'Acheter boissons (champagne, vin)', 'Preparer calendrier de l\'avent final'],
    },
    {
      label: 'J-3', daysBeforeEvent: 3, description: 'Courses de Noel', isDone: false,
      tasks: ['Courses alimentaires completes', 'Preparer foie gras, saumon', 'Verifier la vaisselle de fete'],
    },
    {
      label: 'J-1', daysBeforeEvent: 1, description: 'Veille de Noel', isDone: false,
      tasks: ['Mettre les cadeaux sous le sapin', 'Preparer la table de fete', 'Cuisiner ce qui peut se preparer', 'Allumer les bougies'],
    },
    {
      label: 'Jour J', daysBeforeEvent: 0, description: 'Joyeux Noel !', isDone: false,
      tasks: ['Reveillon : aperitif, repas de fete', 'Ouverture des cadeaux', 'Dejeuner de Noel', 'Promenade digestive', 'Buche et cafe'],
    },
  ],

  autre: [
    {
      label: 'J-30', daysBeforeEvent: 30, description: 'Preparation', isDone: false,
      tasks: ['Definir le concept', 'Reserver le lieu', 'Inviter les participants', 'Fixer le budget'],
    },
    {
      label: 'J-15', daysBeforeEvent: 15, description: 'Organisation', isDone: false,
      tasks: ['Confirmer presences', 'Organiser la logistique', 'Commander ce qui est necessaire'],
    },
    {
      label: 'J-7', daysBeforeEvent: 7, description: 'Finalisation', isDone: false,
      tasks: ['Derniers details', 'Confirmer toutes les reservations', 'Preparer le materiel'],
    },
    {
      label: 'J-3', daysBeforeEvent: 3, description: 'Preparation finale', isDone: false,
      tasks: ['Courses', 'Verification logistique', 'Plan B si besoin'],
    },
    {
      label: 'J-1', daysBeforeEvent: 1, description: 'Installation', isDone: false,
      tasks: ['Installer le lieu', 'Derniers ajustements', 'Se reposer'],
    },
    {
      label: 'Jour J', daysBeforeEvent: 0, description: 'C\'est le jour !', isDone: false,
      tasks: ['Derniers preparatifs', 'Accueil', 'Profiter', 'Rangement'],
    },
  ],
};

export const TIMELINE_TEMPLATE = TIMELINE_TEMPLATES;
