export type PortfolioTaskType = 'linkedin' | 'content' | 'calendar' | 'brand';

export interface LinkedInProfile {
  headline: string;
  summary: string;
  experience: string[];
  skills: string[];
  recommendations: string[];
}

export interface EditorialCalendarEntry {
  week: number;
  date: string;
  topic: string;
  format: 'article' | 'post' | 'carousel' | 'video' | 'poll' | 'newsletter';
  platform: 'linkedin' | 'twitter' | 'blog' | 'medium';
  status: 'draft' | 'scheduled' | 'published';
  notes?: string;
}

export interface EditorialCalendar {
  month: string;
  theme: string;
  entries: EditorialCalendarEntry[];
}

export interface LinkedInPost {
  hook: string;
  body: string;
  callToAction: string;
  hashtags: string[];
  estimatedReach: string;
}

export interface BrandStrategy {
  positioning: string;
  uniqueValue: string;
  targetAudience: string;
  toneOfVoice: string;
  keyMessages: string[];
  channels: string[];
  contentPillars: string[];
}

export interface PortfolioResult {
  type: PortfolioTaskType;
  content: string;
  tokensUsed: number;
  metadata?: Record<string, unknown>;
}
