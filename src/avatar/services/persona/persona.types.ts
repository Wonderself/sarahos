import type { AvatarBase, VoiceProfile, DIDConfig } from '../../config/avatar.types';
import type { ConversationMessage } from '../../../core/llm/llm.types';

export type PersonaType = 'founder' | 'client';

export interface PersonaContext {
  recentTopics: string[];
  userPreferences: Record<string, unknown>;
  sessionCount: number;
  lastInteraction: string | null;
}

export interface Persona {
  id: string;
  type: PersonaType;
  avatarBase: AvatarBase;
  displayName: string;
  systemPrompt: string;
  voiceProfile: VoiceProfile;
  didConfig: DIDConfig;
  context: PersonaContext;
  isActive: boolean;
  createdAt: string;
}

export interface PersonaSwitchRequest {
  sessionId: string;
  fromPersonaId: string;
  toPersonaId: string;
  reason: string;
}

export interface PersonaSwitchResult {
  sessionId: string;
  previousPersonaId: string;
  newPersonaId: string;
  transitionMessage: string;
  success: boolean;
}

export interface PersonaSessionBinding {
  sessionId: string;
  personaId: string;
  boundAt: string;
  conversationHistory: ConversationMessage[];
}
