import type { CognitiveBias, DecisionMatrix, DecisionArgument } from './contradicteur.types';

/**
 * Catalog of cognitive biases the agent can detect
 */
export const COGNITIVE_BIASES: CognitiveBias[] = [
  {
    name: 'Biais de confirmation',
    description: 'Tendance a chercher ou interpreter les informations de maniere a confirmer ses croyances preexistantes.',
    example: 'Ignorer les avis negatifs sur un produit qu\'on a deja decide d\'acheter.',
  },
  {
    name: 'Biais d\'ancrage',
    description: 'Tendance a accorder trop d\'importance a la premiere information recue (l\'ancre) pour prendre des decisions.',
    example: 'Un prix initial eleve fait paraitre toute reduction comme une bonne affaire.',
  },
  {
    name: 'Biais du statu quo',
    description: 'Preference pour l\'etat actuel des choses, meme quand le changement serait benefique.',
    example: 'Rester dans un emploi insatisfaisant par peur du changement.',
  },
  {
    name: 'Erreur des couts irrecuperables (sunk cost)',
    description: 'Continuer un investissement en raison des ressources deja engagees plutot que des perspectives futures.',
    example: 'Continuer un projet non-rentable parce qu\'on y a deja investi 2 ans.',
  },
  {
    name: 'Biais de disponibilite',
    description: 'Juger la probabilite d\'un evenement en fonction de la facilite avec laquelle on s\'en souvient.',
    example: 'Surestimer le risque d\'accident d\'avion apres un crash mediatise.',
  },
  {
    name: 'Effet de halo',
    description: 'L\'impression generale d\'une personne ou chose influence l\'evaluation de ses traits specifiques.',
    example: 'Croire qu\'un bon developpeur sera forcement un bon manager.',
  },
  {
    name: 'Biais de surconfiance',
    description: 'Tendance a surestimer ses propres capacites, connaissances ou la precision de ses predictions.',
    example: 'Estimer un projet a 2 semaines alors qu\'il en prendra 6.',
  },
  {
    name: 'Biais de conformite',
    description: 'Tendance a aligner son comportement ou ses opinions sur ceux du groupe.',
    example: 'Valider une decision en reunion parce que tout le monde semble d\'accord.',
  },
  {
    name: 'Effet de cadrage (framing)',
    description: 'La maniere dont une information est presentee influence la decision, meme si le fond est identique.',
    example: '"95% de survie" semble mieux que "5% de mortalite" pour la meme operation.',
  },
  {
    name: 'Biais de recence',
    description: 'Accorder plus de poids aux evenements ou informations recents.',
    example: 'Juger un employe sur son dernier trimestre plutot que sur l\'annee entiere.',
  },
  {
    name: 'Aversion a la perte',
    description: 'La douleur d\'une perte est ressentie plus fortement que le plaisir d\'un gain equivalent.',
    example: 'Refuser un pari a 50/50 de gagner 110 EUR ou perdre 100 EUR.',
  },
  {
    name: 'Biais d\'optimisme',
    description: 'Tendance a croire qu\'on est moins susceptible de vivre des evenements negatifs que les autres.',
    example: 'Penser que son startup reussira malgre un taux d\'echec de 90% dans le secteur.',
  },
  {
    name: 'Effet Dunning-Kruger',
    description: 'Les personnes peu competentes surestiment leurs capacites tandis que les experts les sous-estiment.',
    example: 'Un debutant en trading pense battre le marche apres quelques gains chanceux.',
  },
  {
    name: 'Biais retrospectif (hindsight)',
    description: 'Tendance a croire, apres coup, qu\'on avait predit le resultat.',
    example: '"Je savais que cette startup allait echouer" — dit apres la faillite.',
  },
  {
    name: 'Biais de selection',
    description: 'Ne considerer qu\'un sous-ensemble non-representatif des donnees disponibles.',
    example: 'Ne regarder que les entreprises qui ont reussi pour definir les facteurs de succes.',
  },
  {
    name: 'Pensee de groupe (groupthink)',
    description: 'Desir d\'harmonie au sein du groupe qui empeche l\'evaluation critique des alternatives.',
    example: 'Personne n\'ose contredire le CEO sur une strategie risquee.',
  },
];

/**
 * Formats a decision matrix into a readable string for LLM context
 */
export function formatDecisionMatrix(matrix: DecisionMatrix): string {
  const lines: string[] = [];

  lines.push('=== MATRICE DE DECISION ===');
  lines.push('');

  // Header
  lines.push(`Criteres (${matrix.criteres.length}) :`);
  for (const c of matrix.criteres) {
    lines.push(`  - ${c.name} (poids: ${c.weight}) — ${c.justification}`);
  }
  lines.push('');

  // Scores
  lines.push('Scores par option :');
  for (const option of matrix.options) {
    const optionScores = matrix.scores[option] ?? {};
    const details = matrix.criteres
      .map((c) => `${c.name}: ${optionScores[c.name] ?? 'N/A'}/10`)
      .join(', ');
    lines.push(`  ${option}: ${details}`);
  }
  lines.push('');

  // Ranking
  lines.push('Classement final :');
  for (let i = 0; i < matrix.classement.length; i++) {
    const item = matrix.classement[i];
    lines.push(`  ${i + 1}. ${item!.option} — Score pondre: ${item!.score_pondere.toFixed(2)}`);
  }
  lines.push('');
  lines.push(`Analyse : ${matrix.analyse}`);

  return lines.join('\n');
}

/**
 * Formats pros and cons for display
 */
export function formatProsCons(
  pour: DecisionArgument[],
  contre: DecisionArgument[]
): string {
  const lines: string[] = [];

  lines.push('=== ARGUMENTS POUR ===');
  for (const arg of pour) {
    const strengthIcon = arg.strength === 'strong' ? '[+++]' : arg.strength === 'moderate' ? '[++]' : '[+]';
    lines.push(`${strengthIcon} ${arg.title}`);
    lines.push(`    ${arg.explanation}`);
  }

  lines.push('');
  lines.push('=== ARGUMENTS CONTRE ===');
  for (const arg of contre) {
    const strengthIcon = arg.strength === 'strong' ? '[---]' : arg.strength === 'moderate' ? '[--]' : '[-]';
    lines.push(`${strengthIcon} ${arg.title}`);
    lines.push(`    ${arg.explanation}`);
  }

  return lines.join('\n');
}
