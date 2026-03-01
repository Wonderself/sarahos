export interface CustomAvatarRequest {
  id: string;
  clientId: string;
  clientEmail: string;
  companyName: string;
  status: 'waitlisted' | 'processing' | 'ready' | 'failed';
  photoUrl?: string;
  voiceSampleUrl?: string;
  requestedAt: string;
  completedAt?: string;
}

export interface CustomAvatarAssets {
  photoProcessed: boolean;
  didSourceUrl?: string;
  voiceCloneId?: string;
  readyForDeployment: boolean;
}
