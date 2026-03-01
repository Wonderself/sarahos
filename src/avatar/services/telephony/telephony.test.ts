import { TelephonyService } from './telephony.service';

let uuidCounter = 0;
jest.mock('uuid', () => ({ v4: () => `tel-uuid-${++uuidCounter}` }));

jest.mock('../../../utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

jest.mock('../../../core/event-bus/event-bus', () => ({
  eventBus: {
    publish: jest.fn().mockResolvedValue({ id: 'evt-1', type: 'test', sourceAgent: 'test', payload: {}, timestamp: '' }),
  },
}));

describe('TelephonyService', () => {
  let service: TelephonyService;

  beforeEach(() => {
    uuidCounter = 0;
    service = new TelephonyService({
      accountSid: 'AC-test',
      authToken: 'auth-test',
      phoneNumber: '+33612345678',
      webhookBaseUrl: 'https://sarah-os.test',
    });
    jest.clearAllMocks();
  });

  it('constructs with default config from env', () => {
    const defaultService = new TelephonyService();
    expect(defaultService).toBeInstanceOf(TelephonyService);
  });

  it('constructs with custom config', () => {
    expect(service).toBeInstanceOf(TelephonyService);
  });

  it('initiates outbound call and creates session', async () => {
    const session = await service.initiateOutboundCall({
      to: '+33698765432',
      avatarBase: 'sarah',
      sessionId: 'conv-1',
    });
    expect(session.direction).toBe('outbound');
    expect(session.to).toBe('+33698765432');
    expect(session.avatarBase).toBe('sarah');
    expect(session.status).toBe('in_progress');
    expect(session.callSid).toBeTruthy();
  });

  it('publishes TelephonyCallStarted on outbound call', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await service.initiateOutboundCall({ to: '+33698765432', avatarBase: 'sarah', sessionId: 'conv-1' });
    expect(eventBus.publish).toHaveBeenCalledWith('TelephonyCallStarted', 'telephony-service', expect.objectContaining({
      direction: 'outbound',
      avatarBase: 'sarah',
    }));
  });

  it('handles incoming call and creates inbound session', async () => {
    const session = await service.handleIncomingCall({
      CallSid: 'CA-incoming-1',
      From: '+33611111111',
      To: '+33612345678',
      Direction: 'inbound',
    });
    expect(session.direction).toBe('inbound');
    expect(session.from).toBe('+33611111111');
    expect(session.avatarBase).toBe('sarah');
    expect(session.status).toBe('in_progress');
  });

  it('publishes TelephonyCallStarted on incoming call', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await service.handleIncomingCall({ CallSid: 'CA-in-1', From: '+33600000000', To: '+33612345678', Direction: 'inbound' });
    expect(eventBus.publish).toHaveBeenCalledWith('TelephonyCallStarted', 'telephony-service', expect.objectContaining({
      direction: 'inbound',
    }));
  });

  it('ends call and publishes TelephonyCallEnded', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    const session = await service.initiateOutboundCall({ to: '+33698765432', avatarBase: 'emmanuel', sessionId: 'conv-2' });
    await service.endCall(session.callSid);

    expect(eventBus.publish).toHaveBeenCalledWith('TelephonyCallEnded', 'telephony-service', expect.objectContaining({
      callSid: session.callSid,
      direction: 'outbound',
    }));
    expect(service.getActiveCall(session.callSid)).toBeUndefined();
  });

  it('getActiveCall returns active call by SID', async () => {
    const session = await service.initiateOutboundCall({ to: '+33698765432', avatarBase: 'sarah', sessionId: 'conv-3' });
    const found = service.getActiveCall(session.callSid);
    expect(found).toBeDefined();
    expect(found!.sessionId).toBe('conv-3');
  });

  it('getActiveCalls returns only active calls', async () => {
    const s1 = await service.initiateOutboundCall({ to: '+33600000001', avatarBase: 'sarah', sessionId: 'conv-4' });
    await service.initiateOutboundCall({ to: '+33600000002', avatarBase: 'emmanuel', sessionId: 'conv-5' });
    await service.endCall(s1.callSid);

    const active = service.getActiveCalls();
    expect(active).toHaveLength(1);
    expect(active[0]!.sessionId).toBe('conv-5');
  });

  it('generateTwiMLResponse returns valid TwiML string', () => {
    const twiml = service.generateTwiMLResponse('sarah', 'Bonjour, je suis Sarah !');
    expect(twiml).toContain('<?xml version="1.0"');
    expect(twiml).toContain('<Response>');
    expect(twiml).toContain('<Say voice="alice" language="fr-FR">');
    expect(twiml).toContain('Bonjour, je suis Sarah !');
    expect(twiml).toContain('<Stream');
  });

  it('healthCheck returns Twilio status', async () => {
    const health = await service.healthCheck();
    expect(health.twilioAvailable).toBe(true);
    expect(health.phoneNumberActive).toBe(true);
    expect(health.activeCallCount).toBe(0);
  });
});
