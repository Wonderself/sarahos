export type CampaignStatus = 'draft' | 'pending_approval' | 'approved' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';
export type CampaignType = 'social' | 'email' | 'sms' | 'whatsapp' | 'multi_channel';
export type PostStatus = 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed' | 'cancelled';

export interface Campaign {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: CampaignStatus;
  campaignType: CampaignType;
  platforms: string[];
  content: Record<string, unknown>;
  schedule: Record<string, unknown>;
  targeting: Record<string, unknown>;
  budgetCredits: number;
  spentCredits: number;
  metrics: Record<string, unknown>;
  approvedBy: string | null;
  approvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignPost {
  id: string;
  campaignId: string;
  userId: string;
  platform: string;
  content: string;
  mediaUrls: string[];
  hashtags: string[];
  scheduledAt: Date | null;
  publishedAt: Date | null;
  status: PostStatus;
  externalPostId: string | null;
  metrics: Record<string, unknown>;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCampaignInput {
  title: string;
  description?: string;
  campaignType?: CampaignType;
  platforms?: string[];
  content?: Record<string, unknown>;
  schedule?: Record<string, unknown>;
  targeting?: Record<string, unknown>;
  budgetCredits?: number;
}

export interface UpdateCampaignInput {
  title?: string;
  description?: string;
  status?: CampaignStatus;
  platforms?: string[];
  content?: Record<string, unknown>;
  schedule?: Record<string, unknown>;
  targeting?: Record<string, unknown>;
  budgetCredits?: number;
}

export interface CreatePostInput {
  campaignId: string;
  platform: string;
  content: string;
  mediaUrls?: string[];
  hashtags?: string[];
  scheduledAt?: Date;
}
