export type CallDirection = 'inbound' | 'outbound';

export type CallStatus = 'ringing' | 'in_progress' | 'completed' | 'failed' | 'no_answer' | 'busy';

export interface TelephonyConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
  webhookBaseUrl: string;
  recordCalls: boolean;
  maxCallDurationMs: number;
}

export interface CallSession {
  callSid: string;
  sessionId: string;
  direction: CallDirection;
  from: string;
  to: string;
  status: CallStatus;
  avatarBase: 'sarah' | 'emmanuel';
  startedAt: string;
  endedAt: string | null;
  durationMs: number;
  recordingUrl?: string;
}

export interface IncomingCallWebhook {
  CallSid: string;
  From: string;
  To: string;
  Direction: string;
}

export interface OutboundCallRequest {
  to: string;
  avatarBase: 'sarah' | 'emmanuel';
  sessionId: string;
  greeting?: string;
}

export interface TelephonyHealthStatus {
  twilioAvailable: boolean;
  phoneNumberActive: boolean;
  activeCallCount: number;
}
