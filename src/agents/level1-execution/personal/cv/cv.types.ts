// ═══════════════════════════════════════════════════════
// CV Agent — Type Definitions
// ═══════════════════════════════════════════════════════

// ── Task Types ──

export type CVTaskType = 'interview' | 'generate' | 'tailor' | 'evolve';

// ── Profile Data Structures ──

export interface CVExperience {
  company: string;
  role: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string;
  achievements: string[];
  technologies: string[];
  location: string | null;
}

export interface CVSkill {
  name: string;
  level: 'debutant' | 'intermediaire' | 'avance' | 'expert';
  category: 'technique' | 'management' | 'communication' | 'methodologie' | 'outil' | 'autre';
  yearsOfExperience: number | null;
}

export interface CVEducation {
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear: number | null;
  current: boolean;
  honors: string | null;
}

export interface CVCertification {
  name: string;
  issuer: string;
  date: string;
  expiryDate: string | null;
  credentialId: string | null;
}

export interface CVLanguage {
  language: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'natif';
}

export interface CVContactInfo {
  email: string | null;
  phone: string | null;
  linkedin: string | null;
  github: string | null;
  website: string | null;
  city: string | null;
  country: string | null;
}

export interface CVProfile {
  id: string;
  userId: string;
  fullName: string | null;
  title: string | null;
  summary: string | null;
  contactInfo: CVContactInfo;
  skills: CVSkill[];
  experiences: CVExperience[];
  education: CVEducation[];
  certifications: CVCertification[];
  languages: CVLanguage[];
  interests: string[];
  careerGoals: string | null;
  targetRoles: string[];
  lastAiAnalysis: Record<string, unknown> | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

// ── Career Evolution ──

export interface CareerEvolution {
  currentProfile: string;
  suggestedPaths: Array<{
    role: string;
    timeline: string;
    requiredSkills: string[];
    gapAnalysis: string;
    salaryRange: string | null;
    marketDemand: 'faible' | 'moyen' | 'fort' | 'tres_fort';
  }>;
  recommendations: string[];
  trainingPlan: string[];
}

// ── Task Payloads ──

export interface InterviewPayload {
  type: 'interview';
  userId: string;
  step?: string;
  answers?: Record<string, unknown>;
}

export interface GeneratePayload {
  type: 'generate';
  userId: string;
  format?: 'text' | 'json' | 'markdown';
  language?: string;
}

export interface TailorPayload {
  type: 'tailor';
  userId: string;
  jobDescription: string;
  companyName?: string;
}

export interface EvolvePayload {
  type: 'evolve';
  userId: string;
  targetIndustry?: string;
  yearsHorizon?: number;
}

// ── Interview Steps ──

export type InterviewStep =
  | 'identity'
  | 'experience'
  | 'skills'
  | 'education'
  | 'certifications'
  | 'languages'
  | 'goals'
  | 'interests'
  | 'review';

export const INTERVIEW_STEPS: InterviewStep[] = [
  'identity',
  'experience',
  'skills',
  'education',
  'certifications',
  'languages',
  'goals',
  'interests',
  'review',
];
