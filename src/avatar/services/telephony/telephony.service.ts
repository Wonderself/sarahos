import twilio from 'twilio';
import type { Twilio } from 'twilio';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../../utils/logger';
import { eventBus } from '../../../core/event-bus/event-bus';
import type {
  TelephonyConfig,
  CallSession,
  IncomingCallWebhook,
  OutboundCallRequest,
  TelephonyHealthStatus,
  SmsResult,
  CallRecord,
  MessageRecord,
} from './telephony.types';

const DEFAULT_CONFIG: TelephonyConfig = {
  accountSid: process.env['TWILIO_ACCOUNT_SID'] ?? '',
  authToken: process.env['TWILIO_AUTH_TOKEN'] ?? '',
  phoneNumber: process.env['TWILIO_PHONE_NUMBER'] ?? '',
  whatsappFrom: process.env['TWILIO_WHATSAPP_FROM'] ?? '',
  webhookBaseUrl: process.env['WEBHOOK_BASE_URL'] ?? 'https://freenzy.local',
  recordCalls: false,
  maxCallDurationMs: 1_800_000, // 30 min
};

export class TelephonyService {
  private readonly config: TelephonyConfig;
  private readonly client: Twilio | null;
  private readonly configured: boolean;
  private activeCalls = new Map<string, CallSession>();

  constructor(config?: Partial<TelephonyConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Create Twilio client only if credentials are provided
    if (this.config.accountSid && this.config.authToken) {
      try {
        this.client = twilio(this.config.accountSid, this.config.authToken);
        this.configured = true;
        logger.info('Telephony Service initialized with real Twilio SDK', {
          phoneNumber: this.config.phoneNumber || '(not set)',
          whatsappFrom: this.config.whatsappFrom || '(not set)',
        });
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Failed to initialize Twilio client', { error: msg });
        this.client = null;
        this.configured = false;
      }
    } else {
      this.client = null;
      this.configured = false;
      logger.warn('Telephony Service initialized WITHOUT Twilio credentials — all calls will be stubbed');
    }
  }

  /** Whether the Twilio client is configured and ready */
  isConfigured(): boolean {
    return this.configured && this.client !== null;
  }

  // ---------------------------------------------------------------------------
  // OUTBOUND CALLS
  // ---------------------------------------------------------------------------

  /**
   * Initiate a real outbound call via Twilio REST API.
   * If Twilio is not configured, falls back to a stub session.
   */
  async initiateOutboundCall(
    to: string,
    twimlUrl: string,
    statusCallback?: string,
  ): Promise<CallSession | null> {
    if (!this.config.phoneNumber) {
      logger.warn('initiateOutboundCall: TWILIO_PHONE_NUMBER not set, skipping');
      return null;
    }

    if (!this.client) {
      logger.warn('initiateOutboundCall: Twilio client not configured, returning stub session');
      return this.createStubSession('outbound', this.config.phoneNumber, to);
    }

    try {
      const callParams: Record<string, unknown> = {
        to,
        from: this.config.phoneNumber,
        url: twimlUrl,
        method: 'POST' as const,
        timeout: Math.floor(this.config.maxCallDurationMs / 1000),
        record: this.config.recordCalls,
      };

      if (statusCallback) {
        callParams['statusCallback'] = statusCallback;
        callParams['statusCallbackMethod'] = 'POST';
        callParams['statusCallbackEvent'] = ['initiated', 'ringing', 'answered', 'completed'];
      }

      const call = await this.client.calls.create(callParams as unknown as Parameters<typeof this.client.calls.create>[0]);

      const session: CallSession = {
        callSid: call.sid,
        sessionId: uuidv4(),
        direction: 'outbound',
        from: this.config.phoneNumber,
        to,
        status: 'ringing',
        avatarBase: 'sarah',
        startedAt: new Date().toISOString(),
        endedAt: null,
        durationMs: 0,
      };

      this.activeCalls.set(call.sid, session);

      await eventBus.publish('TelephonyCallStarted', 'telephony-service', {
        callSid: call.sid,
        direction: 'outbound',
        avatarBase: 'sarah',
        to,
      });

      logger.info('Outbound call initiated via Twilio', { callSid: call.sid, to });
      return session;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Twilio initiateOutboundCall failed', { to, error: msg });
      return null;
    }
  }

  /**
   * Legacy overload: accepts an OutboundCallRequest object for backward compatibility.
   */
  async initiateOutboundCallLegacy(request: OutboundCallRequest): Promise<CallSession | null> {
    const twimlUrl = `${this.config.webhookBaseUrl}/webhooks/twilio/voice`;
    const statusCallback = `${this.config.webhookBaseUrl}/webhooks/twilio/voice/status`;
    return this.initiateOutboundCall(request.to, twimlUrl, statusCallback);
  }

  // ---------------------------------------------------------------------------
  // END CALL
  // ---------------------------------------------------------------------------

  /**
   * End an active call by updating its status to 'completed' via the Twilio API.
   */
  async endCall(callSid: string): Promise<boolean> {
    // Always update local session tracking
    const session = this.activeCalls.get(callSid);

    if (this.client) {
      try {
        await this.client.calls(callSid).update({ status: 'completed' });
        logger.info('Call ended via Twilio', { callSid });
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Twilio endCall failed', { callSid, error: msg });
        // Still clean up local state even if API call fails
      }
    } else {
      logger.warn('endCall: Twilio not configured, only local state updated', { callSid });
    }

    if (session) {
      session.status = 'completed';
      session.endedAt = new Date().toISOString();
      session.durationMs = new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime();
      this.activeCalls.delete(callSid);

      await eventBus.publish('TelephonyCallEnded', 'telephony-service', {
        callSid,
        direction: session.direction,
        durationMs: session.durationMs,
        avatarBase: session.avatarBase,
      });
    }

    return true;
  }

  // ---------------------------------------------------------------------------
  // SMS
  // ---------------------------------------------------------------------------

  /**
   * Send an SMS message via Twilio.
   * Returns the message SID on success, or null on failure/not configured.
   */
  async sendSms(to: string, body: string): Promise<SmsResult | null> {
    if (!this.config.phoneNumber) {
      logger.warn('sendSms: TWILIO_PHONE_NUMBER not set, skipping');
      return null;
    }

    if (!this.client) {
      logger.warn('sendSms: Twilio client not configured, SMS not sent', { to });
      return null;
    }

    try {
      const message = await this.client.messages.create({
        to,
        from: this.config.phoneNumber,
        body,
      });

      logger.info('SMS sent via Twilio', { messageSid: message.sid, to, status: message.status });

      return {
        messageSid: message.sid,
        to: message.to,
        from: message.from,
        status: message.status,
        dateCreated: message.dateCreated?.toISOString() ?? new Date().toISOString(),
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Twilio sendSms failed', { to, error: msg });
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // WHATSAPP (via Twilio)
  // ---------------------------------------------------------------------------

  /**
   * Send a WhatsApp message via Twilio's WhatsApp Business API.
   * The 'to' number is automatically prefixed with 'whatsapp:' if not already.
   * Returns the message SID on success, or null on failure/not configured.
   */
  async sendWhatsApp(to: string, body: string): Promise<SmsResult | null> {
    const whatsappFrom = this.config.whatsappFrom || this.config.phoneNumber;
    if (!whatsappFrom) {
      logger.warn('sendWhatsApp: No WhatsApp sender number configured, skipping');
      return null;
    }

    if (!this.client) {
      logger.warn('sendWhatsApp: Twilio client not configured, WhatsApp not sent', { to });
      return null;
    }

    // Ensure whatsapp: prefix
    const whatsappTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    const whatsappFromPrefixed = whatsappFrom.startsWith('whatsapp:') ? whatsappFrom : `whatsapp:${whatsappFrom}`;

    try {
      const message = await this.client.messages.create({
        to: whatsappTo,
        from: whatsappFromPrefixed,
        body,
      });

      logger.info('WhatsApp message sent via Twilio', { messageSid: message.sid, to: whatsappTo, status: message.status });

      return {
        messageSid: message.sid,
        to: message.to,
        from: message.from,
        status: message.status,
        dateCreated: message.dateCreated?.toISOString() ?? new Date().toISOString(),
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Twilio sendWhatsApp failed', { to: whatsappTo, error: msg });
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // INCOMING CALL HANDLING
  // ---------------------------------------------------------------------------

  /**
   * Handle an incoming call webhook from Twilio.
   * Creates a local call session and publishes an event.
   */
  async handleIncomingCall(webhook: IncomingCallWebhook): Promise<CallSession> {
    const session: CallSession = {
      callSid: webhook.CallSid,
      sessionId: uuidv4(),
      direction: 'inbound',
      from: webhook.From,
      to: webhook.To,
      status: 'in_progress',
      avatarBase: 'sarah', // Sarah answers incoming calls by default
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

  /**
   * Generate a TwiML response for voice interactions.
   */
  generateTwiMLResponse(avatarBase: 'sarah' | 'emmanuel', greeting: string): string {
    const voiceName = avatarBase === 'sarah' ? 'Polly.Lea' : 'Polly.Mathieu';
    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<Response>',
      `  <Say voice="${voiceName}" language="fr-FR">${this.escapeXml(greeting)}</Say>`,
      `  <Gather input="speech" language="fr-FR" timeout="5" action="${this.config.webhookBaseUrl}/webhooks/twilio/voice/gather">`,
      `    <Say voice="${voiceName}" language="fr-FR">Dites quelque chose apres le bip.</Say>`,
      `  </Gather>`,
      `  <Say voice="${voiceName}" language="fr-FR">Je n'ai rien entendu. Au revoir.</Say>`,
      '</Response>',
    ].join('\n');
  }

  // ---------------------------------------------------------------------------
  // CALL & MESSAGE HISTORY
  // ---------------------------------------------------------------------------

  /**
   * Retrieve call history from Twilio API.
   * Falls back to local active calls if Twilio is not configured.
   */
  async getCallHistory(limit = 50): Promise<CallRecord[]> {
    if (!this.client) {
      logger.warn('getCallHistory: Twilio not configured, returning empty list');
      return [];
    }

    try {
      const calls = await this.client.calls.list({ limit });

      return calls.map((call) => ({
        callSid: call.sid,
        from: call.from,
        to: call.to,
        status: call.status,
        direction: call.direction,
        duration: call.duration ?? '0',
        startTime: call.startTime?.toISOString() ?? '',
        endTime: call.endTime?.toISOString() ?? null,
      }));
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Twilio getCallHistory failed', { error: msg });
      return [];
    }
  }

  /**
   * Retrieve SMS/message history from Twilio API.
   */
  async getSmsHistory(limit = 50): Promise<MessageRecord[]> {
    if (!this.client) {
      logger.warn('getSmsHistory: Twilio not configured, returning empty list');
      return [];
    }

    try {
      const messages = await this.client.messages.list({ limit });

      return messages.map((msg) => ({
        messageSid: msg.sid,
        from: msg.from,
        to: msg.to,
        body: msg.body ?? '',
        status: msg.status,
        direction: msg.direction,
        dateSent: msg.dateSent?.toISOString() ?? null,
      }));
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Twilio getSmsHistory failed', { error: msg });
      return [];
    }
  }

  // ---------------------------------------------------------------------------
  // HEALTH CHECK
  // ---------------------------------------------------------------------------

  /**
   * Validate Twilio connectivity by fetching account info.
   */
  async healthCheck(): Promise<TelephonyHealthStatus> {
    const base: TelephonyHealthStatus = {
      twilioAvailable: false,
      twilioConfigured: this.configured,
      phoneNumberActive: !!this.config.phoneNumber,
      activeCallCount: this.activeCalls.size,
    };

    if (!this.client) {
      return base;
    }

    try {
      const account = await this.client.api.accounts(this.config.accountSid).fetch();
      base.twilioAvailable = account.status === 'active';
      base.accountSid = account.sid;
      logger.debug('Twilio health check passed', { status: account.status, sid: account.sid });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Twilio health check failed', { error: msg });
      base.twilioAvailable = false;
    }

    return base;
  }

  // ---------------------------------------------------------------------------
  // LOCAL SESSION MANAGEMENT
  // ---------------------------------------------------------------------------

  getActiveCall(callSid: string): CallSession | undefined {
    return this.activeCalls.get(callSid);
  }

  getActiveCalls(): CallSession[] {
    return Array.from(this.activeCalls.values());
  }

  // ---------------------------------------------------------------------------
  // PRIVATE HELPERS
  // ---------------------------------------------------------------------------

  private createStubSession(direction: 'inbound' | 'outbound', from: string, to: string): CallSession {
    const callSid = `CA${uuidv4().replace(/-/g, '').substring(0, 32)}`;
    const session: CallSession = {
      callSid,
      sessionId: uuidv4(),
      direction,
      from,
      to,
      status: 'in_progress',
      avatarBase: 'sarah',
      startedAt: new Date().toISOString(),
      endedAt: null,
      durationMs: 0,
    };
    this.activeCalls.set(callSid, session);
    return session;
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
