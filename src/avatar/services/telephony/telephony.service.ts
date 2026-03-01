import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../../utils/logger';
import { eventBus } from '../../../core/event-bus/event-bus';
import type {
  TelephonyConfig,
  CallSession,
  IncomingCallWebhook,
  OutboundCallRequest,
  TelephonyHealthStatus,
} from './telephony.types';

const DEFAULT_CONFIG: TelephonyConfig = {
  accountSid: process.env['TWILIO_ACCOUNT_SID'] ?? '',
  authToken: process.env['TWILIO_AUTH_TOKEN'] ?? '',
  phoneNumber: process.env['TWILIO_PHONE_NUMBER'] ?? '',
  webhookBaseUrl: process.env['WEBHOOK_BASE_URL'] ?? 'https://sarah-os.local',
  recordCalls: false,
  maxCallDurationMs: 1_800_000, // 30 min
};

export class TelephonyService {
  private readonly config: TelephonyConfig;
  private activeCalls = new Map<string, CallSession>();
  private callHistory: CallSession[] = [];

  constructor(config?: Partial<TelephonyConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    logger.info('Telephony Service initialized', { phoneNumber: this.config.phoneNumber });
  }

  async initiateOutboundCall(request: OutboundCallRequest): Promise<CallSession> {
    // Stub — intégration Twilio REST API en production
    const callSid = `CA${uuidv4().replace(/-/g, '').substring(0, 32)}`;
    const session: CallSession = {
      callSid,
      sessionId: request.sessionId,
      direction: 'outbound',
      from: this.config.phoneNumber,
      to: request.to,
      status: 'in_progress',
      avatarBase: request.avatarBase,
      startedAt: new Date().toISOString(),
      endedAt: null,
      durationMs: 0,
    };

    this.activeCalls.set(callSid, session);

    await eventBus.publish('TelephonyCallStarted', 'telephony-service', {
      callSid,
      direction: 'outbound',
      avatarBase: request.avatarBase,
      to: request.to,
    });

    logger.info('Outbound call initiated', { callSid, to: request.to, avatarBase: request.avatarBase });
    return session;
  }

  async handleIncomingCall(webhook: IncomingCallWebhook): Promise<CallSession> {
    const session: CallSession = {
      callSid: webhook.CallSid,
      sessionId: uuidv4(),
      direction: 'inbound',
      from: webhook.From,
      to: webhook.To,
      status: 'in_progress',
      avatarBase: 'sarah', // Sarah répond par défaut aux appels entrants
      startedAt: new Date().toISOString(),
      endedAt: null,
      durationMs: 0,
    };

    this.activeCalls.set(webhook.CallSid, session);

    await eventBus.publish('TelephonyCallStarted', 'telephony-service', {
      callSid: webhook.CallSid,
      direction: 'inbound',
      from: webhook.From,
      avatarBase: 'sarah',
    });

    logger.info('Incoming call handled', { callSid: webhook.CallSid, from: webhook.From });
    return session;
  }

  async endCall(callSid: string): Promise<void> {
    const session = this.activeCalls.get(callSid);
    if (!session) return;

    session.status = 'completed';
    session.endedAt = new Date().toISOString();
    session.durationMs = new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime();

    this.callHistory.push(session);
    this.activeCalls.delete(callSid);

    await eventBus.publish('TelephonyCallEnded', 'telephony-service', {
      callSid,
      direction: session.direction,
      durationMs: session.durationMs,
      avatarBase: session.avatarBase,
    });

    logger.info('Call ended', { callSid, durationMs: session.durationMs });
  }

  getActiveCall(callSid: string): CallSession | undefined {
    return this.activeCalls.get(callSid);
  }

  getActiveCalls(): CallSession[] {
    return Array.from(this.activeCalls.values());
  }

  generateTwiMLResponse(avatarBase: 'sarah' | 'emmanuel', greeting: string): string {
    const voiceName = avatarBase === 'sarah' ? 'alice' : 'thomas';
    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<Response>',
      `  <Say voice="${voiceName}" language="fr-FR">${this.escapeXml(greeting)}</Say>`,
      `  <Connect>`,
      `    <Stream url="${this.config.webhookBaseUrl}/avatar/telephony/stream" />`,
      `  </Connect>`,
      '</Response>',
    ].join('\n');
  }

  getCallHistory(limit = 50): CallSession[] {
    return this.callHistory.slice(-limit);
  }

  async healthCheck(): Promise<TelephonyHealthStatus> {
    return {
      twilioAvailable: true,
      phoneNumberActive: this.config.phoneNumber.length > 0,
      activeCallCount: this.activeCalls.size,
    };
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

export const telephonyService = new TelephonyService();
