export type ContradicteurTaskType = 'debate' | 'matrix' | 'bias' | 'review';

export interface DecisionArgument {
  title: string;
  explanation: string;
  strength: 'strong' | 'moderate' | 'weak';
}

export interface DebateResult {
  pour: DecisionArgument[];
  contre: DecisionArgument[];
  hypotheses_implicites: string[];
  synthese: string;
}

export interface DecisionCriterion {
  name: string;
  weight: number;
  justification: string;
}

export interface DecisionMatrix {
  criteres: DecisionCriterion[];
  options: string[];
  scores: Record<string, Record<string, number>>;
  classement: Array<{ option: string; score_pondere: number }>;
  analyse: string;
}

export interface CognitiveBias {
  name: string;
  description: string;
  example: string;
}

export interface DetectedBias {
  name: string;
  description: string;
  extrait_texte: string;
  impact: 'high' | 'medium' | 'low';
  contre_mesure: string;
}

export interface BiasAnalysis {
  biais_detectes: DetectedBias[];
  impact_global: string;
  recommandations: string[];
}

export interface ReviewResult {
  forces: string[];
  risques: Array<{ description: string; probabilite: string; impact: string }>;
  plan_b: string;
  plan_c: string;
  signaux_alerte: string[];
}
