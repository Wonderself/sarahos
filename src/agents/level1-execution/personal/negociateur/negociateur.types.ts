// ═══════════════════════════════════════════════════════
// NegociateurAgent — Type Definitions
// ═══════════════════════════════════════════════════════

// ── Task Types ──

export type NegociateurTaskType = 'salary' | 'rent' | 'contract' | 'roleplay';

// ── Difficulty Levels ──

export type NegotiationDifficulty = 'easy' | 'medium' | 'hard';

// ── Result Shapes ──

export interface SalaryNegotiationResult {
  analysis: string;
  strategy: string;
  script: string;
  counterArguments: CounterArgument[];
  batna: string;
  tips: string[];
}

export interface RentNegotiationResult {
  analysis: string;
  strategy: string;
  script: string;
  legalPoints: string[];
  counterArguments: CounterArgument[];
  tips: string[];
}

export interface ContractNegotiationResult {
  analysis: string;
  strategy: string;
  script: string;
  clausesToNegotiate: string[];
  counterArguments: CounterArgument[];
  tips: string[];
}

export interface RoleplayResult {
  character: string;
  opening: string;
  response: string;
  difficulty: NegotiationDifficulty;
  debrief?: string;
}

// ── Common Types ──

export interface CounterArgument {
  objection: string;
  response: string;
  technique: string;
}

export interface NegotiationScript {
  opening: string;
  arguments: string[];
  closingPhrase: string;
  fallbackPhrase: string;
}
