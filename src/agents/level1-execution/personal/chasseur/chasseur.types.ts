// ═══════════════════════════════════════════════════════
// Chasseur Agent — Type Definitions
// ═══════════════════════════════════════════════════════

// ── Task Types ──

export type ChasseurTaskType = 'search' | 'proposal' | 'pipeline' | 'optimize';

// ── Mission Status Flow ──

export type MissionStatus =
  | 'discovered'
  | 'applied'
  | 'interview'
  | 'negotiation'
  | 'won'
  | 'lost'
  | 'archived';

export const MISSION_STATUS_FLOW: MissionStatus[] = [
  'discovered',
  'applied',
  'interview',
  'negotiation',
  'won',
  'lost',
  'archived',
];

// ── Freelance Platforms ──

export type FreelancePlatform =
  | 'malt'
  | 'comet'
  | 'freelance_com'
  | 'upwork'
  | 'creme_de_la_creme'
  | 'talent_io'
  | 'toptal'
  | 'direct'
  | 'autre';

export const PLATFORM_INFO: Record<FreelancePlatform, { name: string; url: string; commission: string }> = {
  malt: { name: 'Malt', url: 'https://www.malt.fr', commission: '10%' },
  comet: { name: 'Comet', url: 'https://www.comet.co', commission: '15%' },
  freelance_com: { name: 'Freelance.com', url: 'https://www.freelance.com', commission: 'Variable' },
  upwork: { name: 'Upwork', url: 'https://www.upwork.com', commission: '5-20%' },
  creme_de_la_creme: { name: 'Creme de la Creme', url: 'https://cremedelacreme.io', commission: '15%' },
  talent_io: { name: 'Talent.io', url: 'https://www.talent.io', commission: '15%' },
  toptal: { name: 'Toptal', url: 'https://www.toptal.com', commission: '0% (pre-negocie)' },
  direct: { name: 'Contact Direct', url: '', commission: '0%' },
  autre: { name: 'Autre', url: '', commission: 'Variable' },
};

// ── Mission ──

export interface Mission {
  id: string;
  userId: string;
  title: string;
  clientName: string | null;
  platform: FreelancePlatform;
  url: string | null;
  tjmCents: number | null;
  durationDays: number | null;
  status: MissionStatus;
  notes: string | null;
  appliedAt: Date | null;
  nextAction: string | null;
  nextActionDate: Date | null;
  tags: string[];
  remotePolicy: 'full_remote' | 'hybrid' | 'on_site' | null;
  location: string | null;
  contactName: string | null;
  contactEmail: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ── Pipeline Stats ──

export interface PipelineStats {
  total: number;
  byStatus: Record<MissionStatus, number>;
  avgTjmCents: number | null;
  totalPotentialRevenueCents: number;
  conversionRate: number;
  activeMissions: number;
}

// ── Task Payloads ──

export interface SearchPayload {
  type: 'search';
  userId: string;
  query: string;
  platforms?: FreelancePlatform[];
  minTjm?: number;
  maxTjm?: number;
  remoteOnly?: boolean;
  skills?: string[];
}

export interface ProposalPayload {
  type: 'proposal';
  userId: string;
  missionId?: string;
  missionDescription: string;
  clientName?: string;
  platform?: FreelancePlatform;
}

export interface PipelinePayload {
  type: 'pipeline';
  userId: string;
  action: 'list' | 'stats' | 'update_status';
  missionId?: string;
  newStatus?: MissionStatus;
  statusFilter?: MissionStatus;
}

export interface OptimizePayload {
  type: 'optimize';
  userId: string;
  profileDescription?: string;
  targetPlatforms?: FreelancePlatform[];
}

// ── LLM Response Shapes ──

export interface SearchResult {
  suggestions: Array<{
    title: string;
    platform: FreelancePlatform;
    estimatedTjm: string;
    matchScore: number;
    reasoning: string;
  }>;
  searchStrategy: string;
  keywords: string[];
}

export interface ProposalResult {
  proposal: string;
  subjectLine: string;
  keyPoints: string[];
  tone: string;
  estimatedWordCount: number;
}

export interface OptimizeResult {
  profileScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: Array<{
    platform: FreelancePlatform;
    actions: string[];
    priority: 'haute' | 'moyenne' | 'basse';
  }>;
  tagSuggestions: string[];
}
