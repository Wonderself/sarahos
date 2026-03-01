// Phase 5 — Avatar Pipeline Services barrel export
export { ASRService, asrService } from './asr/asr.service';
export type { ASRConfig, ASRRequest, ASRResult, ASRProvider, ASRLanguage, ASRWord, ASRHealthStatus } from './asr/asr.types';

export { TTSService, ttsService } from './tts/tts.service';
export type { TTSConfig, TTSRequest, TTSResult, TTSProvider, TTSCacheEntry, TTSHealthStatus } from './tts/tts.types';

export { VideoAvatarService, videoAvatarService } from './video/video.service';
export type { VideoSessionConfig, VideoSession, VideoFrameRequest, VideoFrameResult, VideoQuality, VideoDriverId, VideoHealthStatus } from './video/video.types';

export { TelephonyService, telephonyService } from './telephony/telephony.service';
export type { TelephonyConfig, CallSession, CallDirection, CallStatus, IncomingCallWebhook, OutboundCallRequest, TelephonyHealthStatus } from './telephony/telephony.types';

export { ConversationManager, conversationManager } from './conversation/conversation.service';
export type { ConversationConfig, ConversationSession, ConversationTurnInput, ConversationTurnResult, ConversationChannel, ConversationStatus, PipelineMetrics } from './conversation/conversation.types';

export { PersonaManager, personaManager } from './persona/persona.service';
export type { Persona, PersonaType, PersonaContext, PersonaSwitchRequest, PersonaSwitchResult, PersonaSessionBinding } from './persona/persona.types';
