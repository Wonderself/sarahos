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

// Mock the twilio SDK
let callCounter = 0;
const mockCallCreate = jest.fn().mockImplementation(() => Promise.resolve({ sid: `CA-mock-call-${++callCounter}` }));
const mockCallUpdate = jest.fn().mockResolvedValue({});
const mockAccountFetch = jest.fn().mockResolvedValue({ status: 'active', sid: 'AC-test' });
const mockMessageCreate = jest.fn().mockResolvedValue({ sid: 'SM-mock', to: '+33600000000', from: '+33612345678', status: 'queued', dateCreated: new Date() });
const mockCallsList = jest.fn().mockResolvedValue([]);
const mockMessagesList = jest.fn().mockResolvedValue([]);

jest.mock('twilio', () => {
  return jest.fn(() => ({
    calls: Object.assign(mockCallCreate, {
      create: mockCallCreate,
      list: mockCallsList,
    }),
    messages: {
      create: mockMessageCreate,
      list: mockMessagesList,
    },
    api: {
      accounts: () => ({ fetch: mockAccountFetch }),
    },
  }));
});

// Make calls(sid) work for endCall
beforeAll(() => {
  const twilioMock = jest.requireMock('twilio') as jest.Mock;
  const client = twilioMock();
  // Override calls to be both a function (for calls(sid).update()) and have .create()
  const callsFn = ((_sid: string) => ({ update: mockCallUpdate })) as unknown as typeof client.calls;
  Object.assign(callsFn, { create: mockCallCreate, list: mockCallsList });
  client.calls = callsFn;
  twilioMock.mockReturnValue(client);
});

describe('TelephonyService', () => {
  let service: TelephonyService;

  beforeEach(() => {
    uuidCounter = 0;
    callCounter = 0;
    service = new TelephonyService({
      accountSid: 'AC-test',
      authToken: 'auth-test',
      phoneNumber: '+33612345678',
      webhookBaseUrl: 'https://freenzy.test',
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
    const session = await service.initiateOutboundCallLegacy({
      to: '+33698765432',
      avatarBase: 'sarah',
      sessionId: 'conv-1',
    });
    expect(session).not.toBeNull();
    expect(session!.direction).toBe('outbound');
    expect(session!.to).toBe('+33698765432');
    expect(session!.avatarBase).toBe('sarah');
    expect(session!.callSid).toBeTruthy();
  });

  it('publishes TelephonyCallStarted on outbound call', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await service.initiateOutboundCallLegacy({ to: '+33698765432', avatarBase: 'sarah', sessionId: 'conv-1' });
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
    const session = await service.initiateOutboundCallLegacy({ to: '+33698765432', avatarBase: 'emmanuel', sessionId: 'conv-2' });
    expect(session).not.toBeNull();
    await service.endCall(session!.callSid);

    expect(eventBus.publish).toHaveBeenCalledWith('TelephonyCallEnded', 'telephony-service', expect.objectContaining({
      callSid: session!.callSid,
      direction: 'outbound',
    }));
    expect(service.getActiveCall(session!.callSid)).toBeUndefined();
  });

  it('getActiveCall returns active call by SID', async () => {
    const session = await service.initiateOutboundCallLegacy({ to: '+33698765432', avatarBase: 'sarah', sessionId: 'conv-3' });
    expect(session).not.toBeNull();
    const found = service.getActiveCall(session!.callSid);
    expect(found).toBeDefined();
  });

  it('getActiveCalls returns only active calls', async () => {
    const s1 = await service.initiateOutboundCallLegacy({ to: '+33600000001', avatarBase: 'sarah', sessionId: 'conv-4' });
    const s2 = await service.initiateOutboundCallLegacy({ to: '+33600000002', avatarBase: 'emmanuel', sessionId: 'conv-5' });
    expect(s1).not.toBeNull();
    expect(s2).not.toBeNull();
    await service.endCall(s1!.callSid);

    const active = service.getActiveCalls();
    expect(active).toHaveLength(1);
  });

  it('generateTwiMLResponse returns valid TwiML string', () => {
    const twiml = service.generateTwiMLResponse('sarah', 'Bonjour, je suis Sarah !');
    expect(twiml).toContain('<?xml version="1.0"');
    expect(twiml).toContain('<Response>');
    expect(twiml).toContain('<Say');
    expect(twiml).toContain('language="fr-FR"');
    expect(twiml).toContain('Bonjour, je suis Sarah !');
    expect(twiml).toContain('<Gather');
  });

  it('healthCheck returns Twilio status', async () => {
    const health = await service.healthCheck();
    expect(health.twilioAvailable).toBe(true);
    expect(health.phoneNumberActive).toBe(true);
    expect(health.activeCallCount).toBe(0);
  });

  it('sends SMS via Twilio', async () => {
    const result = await service.sendSms('+33600000000', 'Test SMS');
    expect(result).not.toBeNull();
    expect(result!.messageSid).toBe('SM-mock');
    expect(mockMessageCreate).toHaveBeenCalledWith(expect.objectContaining({
      to: '+33600000000',
      from: '+33612345678',
      body: 'Test SMS',
    }));
  });

  it('sends WhatsApp message via Twilio', async () => {
    const result = await service.sendWhatsApp('+33600000000', 'Test WhatsApp');
    expect(result).not.toBeNull();
    expect(mockMessageCreate).toHaveBeenCalledWith(expect.objectContaining({
      to: 'whatsapp:+33600000000',
      body: 'Test WhatsApp',
    }));
  });
});
