import type { DeconnexionChallenge, OfflineActivity, MoodEntry, ChallengeLevel } from './deconnexion.types';

/**
 * Catalog of disconnection challenges by level
 */
export const CHALLENGES: Record<ChallengeLevel, Array<Omit<DeconnexionChallenge, 'id' | 'completed' | 'completedAt' | 'startedAt'>>> = {
  beginner: [
    {
      nom: 'Repas en Pleine Conscience',
      niveau: 'beginner',
      duree: '30 minutes',
      regles: ['Pas de telephone a table', 'Pas de TV', 'Se concentrer sur les saveurs'],
      tips: ['Prevenir les proches avant', 'Mettre le telephone dans une autre piece', 'Commencer par un repas par jour'],
      activites_suggerees: ['Cuisiner le repas soi-meme', 'Manger avec quelqu\'un'],
    },
    {
      nom: 'Reveil Analogique',
      niveau: 'beginner',
      duree: '1 heure',
      regles: ['Pas d\'ecran pendant la premiere heure apres le reveil', 'Utiliser un reveil classique'],
      tips: ['Preparer ses affaires la veille', 'Lire un livre au lieu de scroller', 'Faire des etirements'],
      activites_suggerees: ['Meditation matinale', 'Journal d\'ecriture', 'Petit-dejeuner elabore'],
    },
    {
      nom: 'Pause Decompression',
      niveau: 'beginner',
      duree: '1 heure',
      regles: ['1 heure sans aucun ecran', 'Pas de musique via smartphone'],
      tips: ['Choisir un creneau fixe chaque jour', 'Prevenir ses contacts', 'Avoir un livre ou une activite prete'],
      activites_suggerees: ['Promenade', 'Dessin', 'Jardinage'],
    },
    {
      nom: 'Soiree Vintage',
      niveau: 'beginner',
      duree: '2 heures',
      regles: ['Pas d\'ecran apres 20h', 'Activites analogiques uniquement'],
      tips: ['Preparer des jeux de societe', 'Avoir des bougies pour l\'ambiance', 'Inviter un ami'],
      activites_suggerees: ['Jeux de cartes', 'Lecture', 'Cuisine', 'Conversation'],
    },
  ],
  intermediate: [
    {
      nom: 'Demi-Journee Offline',
      niveau: 'intermediate',
      duree: '4 heures',
      regles: ['4 heures consecutives sans ecran', 'Telephone en mode avion', 'Exceptions : appels urgents uniquement'],
      tips: ['Choisir un samedi ou dimanche matin', 'Planifier les activites a l\'avance', 'Informer ses proches'],
      activites_suggerees: ['Randonnee', 'Visite de musee', 'Atelier creatif', 'Sport collectif'],
    },
    {
      nom: 'Soiree 100% Deconnectee',
      niveau: 'intermediate',
      duree: '6 heures',
      regles: ['De 18h a minuit sans aucun ecran', 'Telephone eteint (pas en silencieux, eteint)'],
      tips: ['Planifier un diner elabore', 'Preparer des activites pour la soiree', 'Tenir un journal de ses sensations'],
      activites_suggerees: ['Diner entre amis', 'Jeux de societe', 'Musique live', 'Observation des etoiles'],
    },
    {
      nom: 'Journee de Travail Minimale',
      niveau: 'intermediate',
      duree: '8 heures',
      regles: ['Utiliser l\'ordinateur uniquement pour le travail essentiel', 'Pas de reseaux sociaux', 'Pas de news en ligne', 'Pas de YouTube/streaming'],
      tips: ['Lister les taches essentielles le matin', 'Utiliser un bloc-notes papier', 'Faire les pauses dehors'],
      activites_suggerees: ['Notes manuscrites', 'Reunion en personne', 'Brainstorming sur tableau blanc'],
    },
  ],
  advanced: [
    {
      nom: 'Journee Sabbatique Numerique',
      niveau: 'advanced',
      duree: '24 heures',
      regles: ['24h sans aucun ecran', 'Telephone eteint et range', 'Pas d\'exception sauf urgence vitale'],
      tips: ['Choisir un jour ou on n\'attend rien d\'urgent', 'Prevenir tout le monde a l\'avance', 'Avoir un programme riche d\'activites', 'Tenir un journal papier de l\'experience'],
      activites_suggerees: ['Randonnee longue', 'Journee en nature', 'Atelier artisanal', 'Yoga intensif'],
    },
    {
      nom: 'Week-end Digital Detox',
      niveau: 'advanced',
      duree: '48 heures',
      regles: ['Du vendredi 18h au dimanche 18h', 'Zero ecran', 'Achats en personne uniquement', 'Navigation par carte papier si voyage'],
      tips: ['Planifier le week-end en detail a l\'avance', 'Preparer nourriture et activites', 'Partir en nature si possible', 'Ecrire ses reflexions dans un journal'],
      activites_suggerees: ['Camping', 'Retraite de meditation', 'Atelier poterie/peinture', 'Velo longue distance'],
    },
    {
      nom: 'Retraite Numerique (3 jours)',
      niveau: 'advanced',
      duree: '72 heures',
      regles: ['3 jours complets hors ligne', 'Prevenir tous les contacts professionnels et personnels', 'Delegation de toutes les urgences a un contact de confiance'],
      tips: ['Choisir un lieu inspire', 'Emporter des livres et du materiel creatif', 'Tenir un journal detaille', 'Profiter du silence digital pour la reflexion profonde'],
      activites_suggerees: ['Ecriture creative', 'Peinture en plein air', 'Randonnee multi-jours', 'Stage de meditation'],
    },
  ],
};

/**
 * Catalog of offline activities by category
 */
export const OFFLINE_ACTIVITIES: Record<string, OfflineActivity[]> = {
  sport: [
    { nom: 'Jogging matinal', description: 'Course a pied en plein air, ideal pour commencer la journee', duree_estimee: '30-45 min', materiel_necessaire: ['Chaussures de course'], niveau_energie_requis: 'high', categorie: 'sport' },
    { nom: 'Yoga doux', description: 'Seance de yoga relaxante, accessible a tous niveaux', duree_estimee: '30-60 min', materiel_necessaire: ['Tapis de yoga'], niveau_energie_requis: 'low', categorie: 'sport' },
    { nom: 'Natation', description: 'Nager en piscine ou en eau libre pour un effort complet', duree_estimee: '45-60 min', materiel_necessaire: ['Maillot', 'Lunettes de natation'], niveau_energie_requis: 'medium', categorie: 'sport' },
    { nom: 'Velo ballade', description: 'Promenade a velo sans objectif de performance', duree_estimee: '1-2h', materiel_necessaire: ['Velo', 'Casque'], niveau_energie_requis: 'medium', categorie: 'sport' },
  ],
  creativite: [
    { nom: 'Dessin libre', description: 'Dessiner sans but precis, laisser aller la main', duree_estimee: '30-60 min', materiel_necessaire: ['Carnet', 'Crayons'], niveau_energie_requis: 'low', categorie: 'creativite' },
    { nom: 'Ecriture creative', description: 'Ecrire une nouvelle, un poeme ou un journal', duree_estimee: '30-90 min', materiel_necessaire: ['Carnet', 'Stylo'], niveau_energie_requis: 'low', categorie: 'creativite' },
    { nom: 'Poterie / Modelage', description: 'Travailler la terre avec ses mains, tres apaisant', duree_estimee: '1-2h', materiel_necessaire: ['Argile', 'Outils de modelage'], niveau_energie_requis: 'medium', categorie: 'creativite' },
    { nom: 'Aquarelle', description: 'Peindre a l\'aquarelle, ideal en exterieur', duree_estimee: '1-2h', materiel_necessaire: ['Aquarelles', 'Papier', 'Pinceaux', 'Eau'], niveau_energie_requis: 'low', categorie: 'creativite' },
  ],
  social: [
    { nom: 'Cafe avec un ami', description: 'Prendre un cafe en tete-a-tete, telephones ranges', duree_estimee: '1-2h', materiel_necessaire: [], niveau_energie_requis: 'low', categorie: 'social' },
    { nom: 'Jeux de societe', description: 'Soiree jeux en famille ou entre amis', duree_estimee: '2-3h', materiel_necessaire: ['Jeux de societe'], niveau_energie_requis: 'medium', categorie: 'social' },
    { nom: 'Pique-nique', description: 'Repas en plein air avec des proches', duree_estimee: '2-3h', materiel_necessaire: ['Nourriture', 'Couverture'], niveau_energie_requis: 'low', categorie: 'social' },
  ],
  nature: [
    { nom: 'Randonnee en foret', description: 'Marche en nature, observation de la faune et flore', duree_estimee: '2-4h', materiel_necessaire: ['Chaussures de marche', 'Eau', 'Snacks'], niveau_energie_requis: 'medium', categorie: 'nature' },
    { nom: 'Jardinage', description: 'S\'occuper de son jardin ou de plantes d\'interieur', duree_estimee: '1-2h', materiel_necessaire: ['Outils de jardinage', 'Gants'], niveau_energie_requis: 'medium', categorie: 'nature' },
    { nom: 'Observation des oiseaux', description: 'Se poser et observer la nature autour de soi', duree_estimee: '1-2h', materiel_necessaire: ['Jumelles (optionnel)', 'Guide des oiseaux'], niveau_energie_requis: 'low', categorie: 'nature' },
  ],
  lecture: [
    { nom: 'Lecture d\'un roman', description: 'S\'immerger dans une histoire longue', duree_estimee: '1-3h', materiel_necessaire: ['Livre'], niveau_energie_requis: 'low', categorie: 'lecture' },
    { nom: 'Magazine / revue', description: 'Feuilleter un magazine sur un sujet qui passionne', duree_estimee: '30-60 min', materiel_necessaire: ['Magazine'], niveau_energie_requis: 'low', categorie: 'lecture' },
  ],
  cuisine: [
    { nom: 'Recette elaboree', description: 'Cuisiner un plat complexe qui demande du temps et de l\'attention', duree_estimee: '1-3h', materiel_necessaire: ['Ingredients', 'Ustensiles de cuisine'], niveau_energie_requis: 'medium', categorie: 'cuisine' },
    { nom: 'Patisserie', description: 'Faire un gateau, des biscuits ou du pain maison', duree_estimee: '2-3h', materiel_necessaire: ['Farine', 'Beurre', 'Sucre', 'Oeufs'], niveau_energie_requis: 'medium', categorie: 'cuisine' },
  ],
  meditation: [
    { nom: 'Meditation guidee (sans appli)', description: 'Suivre une technique de respiration simple', duree_estimee: '15-30 min', materiel_necessaire: ['Coussin de meditation (optionnel)'], niveau_energie_requis: 'low', categorie: 'meditation' },
    { nom: 'Marche meditative', description: 'Marcher lentement en pleine conscience', duree_estimee: '20-40 min', materiel_necessaire: [], niveau_energie_requis: 'low', categorie: 'meditation' },
  ],
};

/**
 * Format mood trend for display / LLM context
 */
export function formatMoodTrend(entries: MoodEntry[]): string {
  if (entries.length === 0) return 'Aucune entree d\'humeur enregistree.';

  const lines: string[] = [];
  lines.push(`=== TENDANCE HUMEUR (${entries.length} entrees) ===`);
  lines.push('');

  // Show last 10 entries
  const recent = entries.slice(-10);
  for (const entry of recent) {
    const date = entry.timestamp.substring(0, 10);
    const typeLabel = entry.type === 'before_disconnect' ? '[AVANT]'
      : entry.type === 'after_disconnect' ? '[APRES]'
      : '[GENERAL]';
    lines.push(`${date} ${typeLabel} Humeur: ${entry.mood}/10 | Stress: ${entry.stress}/10 | Sommeil: ${entry.sleep}/10`);
    if (entry.notes) {
      lines.push(`  Notes: ${entry.notes}`);
    }
  }

  // Calculate averages
  const avgMood = entries.reduce((sum, e) => sum + e.mood, 0) / entries.length;
  const avgStress = entries.reduce((sum, e) => sum + e.stress, 0) / entries.length;
  const avgSleep = entries.reduce((sum, e) => sum + e.sleep, 0) / entries.length;

  lines.push('');
  lines.push(`Moyennes globales : Humeur ${avgMood.toFixed(1)} | Stress ${avgStress.toFixed(1)} | Sommeil ${avgSleep.toFixed(1)}`);

  // Compare before vs after if we have both
  const befores = entries.filter((e) => e.type === 'before_disconnect');
  const afters = entries.filter((e) => e.type === 'after_disconnect');

  if (befores.length > 0 && afters.length > 0) {
    const avgMoodBefore = befores.reduce((s, e) => s + e.mood, 0) / befores.length;
    const avgMoodAfter = afters.reduce((s, e) => s + e.mood, 0) / afters.length;
    const delta = avgMoodAfter - avgMoodBefore;
    const direction = delta > 0 ? 'amelioration' : delta < 0 ? 'deterioration' : 'stable';
    lines.push(`Comparaison avant/apres deconnexion : ${direction} de humeur (${delta > 0 ? '+' : ''}${delta.toFixed(1)})`);
  }

  return lines.join('\n');
}

/**
 * Get all challenge names as a flat array
 */
export function getAllChallengeNames(): string[] {
  const names: string[] = [];
  for (const level of Object.keys(CHALLENGES) as ChallengeLevel[]) {
    for (const challenge of CHALLENGES[level]) {
      names.push(challenge.nom);
    }
  }
  return names;
}

/**
 * Get all activity category names
 */
export function getActivityCategories(): string[] {
  return Object.keys(OFFLINE_ACTIVITIES);
}
