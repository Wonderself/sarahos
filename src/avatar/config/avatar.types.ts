export type AvatarBase = 'sarah' | 'emmanuel';

export type AvatarType = 'standard' | 'custom';

export type AvatarGender = 'female' | 'male';

export interface AvatarPreset {
  baseName: AvatarBase;
  displayName: string;
  gender: AvatarGender;
  title: string;
  personality: string;
  defaultGreeting: string;
  systemPrompt: string;
  voiceProfile: VoiceProfile;
  didConfig: DIDConfig;
}

export interface VoiceProfile {
  provider: 'telnyx' | 'inworld';
  voiceId: string;
  language: string;
  speed: number;
  pitch: number;
  style: string;
}

export interface DIDConfig {
  sourceUrl: string;
  driverId: string;
  sessionConfig: Record<string, unknown>;
}

export interface ClientAvatarConfig {
  id: string;
  clientId: string;
  avatarBase: AvatarBase;
  avatarType: AvatarType;
  avatarName: string;
  companyName: string;
  industry?: string;
  greetingMessage?: string;
  toneOverride?: string;
  brandColors?: {
    primary: string;
    secondary?: string;
  };
  customAvatarAssets: Record<string, unknown> | null;
  isActive: boolean;
}

export interface AvatarSession {
  sessionId: string;
  clientId: string;
  avatarBase: AvatarBase;
  avatarName: string;
  startedAt: string;
  lastActivity: string;
  messageCount: number;
}
