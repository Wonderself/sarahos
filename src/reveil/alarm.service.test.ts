jest.mock('../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

jest.mock('../core/event-bus/event-bus', () => ({
  eventBus: {
    publish: jest.fn().mockResolvedValue({ id: 'evt-1', type: 'test', sourceAgent: 'test', payload: {}, timestamp: '' }),
  },
}));

const mockAlarmRepository = {
  getByUserId: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getAllEnabled: jest.fn(),
  getAlarmsToTrigger: jest.fn(),
  updateTriggerStatus: jest.fn(),
};

jest.mock('./alarm.repository', () => ({
  alarmRepository: mockAlarmRepository,
}));

jest.mock('../billing/llm-proxy.service', () => ({
  llmProxyService: {
    processRequest: jest.fn().mockResolvedValue({
      content: 'Bonjour ! C\'est l\'heure de se reveiller. Passez une belle journee !',
      model: 'claude-sonnet-4-20250514',
      inputTokens: 100,
      outputTokens: 80,
      totalTokens: 180,
      costCredits: 1200,
      billedCredits: 1200,
      durationMs: 400,
    }),
  },
}));

jest.mock('../avatar/services/telephony/telephony.service', () => ({
  telephonyService: {
    sendWhatsApp: jest.fn().mockResolvedValue({ messageSid: 'SM-alarm-test' }),
    sendSms: jest.fn().mockResolvedValue({ messageSid: 'SM-sms-alarm' }),
    initiateOutboundCall: jest.fn().mockResolvedValue({ callSid: 'CA-alarm-test' }),
  },
}));

jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [{ type: 'text', text: 'Bonjour, c\'est l\'heure !' }],
      }),
    },
  }));
});

import { alarmService } from './alarm.service';
import type { UserAlarm } from './alarm.types';

const now = new Date();

/** Helper: build a full UserAlarm object. */
function makeAlarm(overrides: Partial<UserAlarm> = {}): UserAlarm {
  return {
    id: 'alarm-1',
    userId: 'user-1',
    name: 'Mon reveil',
    isActive: true,
    alarmTime: '07:00',
    timezone: 'Europe/Paris',
    daysOfWeek: [1, 2, 3, 4, 5],
    mode: 'doux',
    rubrics: ['bonne_humeur'],
    voice: 'sarah',
    deliveryMethod: 'phone_call',
    phoneNumber: '+33600000000',
    customAnnouncement: null,
    birthDate: null,
    lastTriggeredAt: null,
    lastTriggerStatus: 'pending',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/** Get current time and day in a given timezone using Intl.DateTimeFormat (same as implementation). */
function getCurrentTimeInTz(tz: string): { time: string; day: number } {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    weekday: 'short',
  });
  const parts = formatter.formatToParts(new Date());
  const hour = parts.find(p => p.type === 'hour')?.value ?? '00';
  const minute = parts.find(p => p.type === 'minute')?.value ?? '00';
  const weekday = parts.find(p => p.type === 'weekday')?.value ?? '';

  const dayMap: Record<string, number> = {
    'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6,
  };
  return { time: `${hour}:${minute}`, day: dayMap[weekday] ?? new Date().getDay() };
}

describe('AlarmService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---- listAlarms ----

  describe('listAlarms', () => {
    it('should delegate to alarmRepository.getByUserId', async () => {
      const alarms = [makeAlarm(), makeAlarm({ id: 'alarm-2' })];
      mockAlarmRepository.getByUserId.mockResolvedValue(alarms);

      const result = await alarmService.listAlarms('user-1');

      expect(result).toEqual(alarms);
      expect(mockAlarmRepository.getByUserId).toHaveBeenCalledWith('user-1');
    });

    it('should return empty array when user has no alarms', async () => {
      mockAlarmRepository.getByUserId.mockResolvedValue([]);

      const result = await alarmService.listAlarms('user-1');

      expect(result).toEqual([]);
    });
  });

  // ---- getAlarm ----

  describe('getAlarm', () => {
    it('should return alarm when it belongs to the user', async () => {
      mockAlarmRepository.getById.mockResolvedValue(makeAlarm());

      const result = await alarmService.getAlarm('alarm-1', 'user-1');

      expect(result).not.toBeNull();
      expect(result!.id).toBe('alarm-1');
    });

    it('should return null when alarm belongs to another user', async () => {
      mockAlarmRepository.getById.mockResolvedValue(makeAlarm({ userId: 'other-user' }));

      const result = await alarmService.getAlarm('alarm-1', 'user-1');

      expect(result).toBeNull();
    });

    it('should return null when alarm does not exist', async () => {
      mockAlarmRepository.getById.mockResolvedValue(null);

      const result = await alarmService.getAlarm('nonexistent', 'user-1');

      expect(result).toBeNull();
    });
  });

  // ---- createAlarm ----

  describe('createAlarm', () => {
    it('should call repository.create and log on success', async () => {
      const created = makeAlarm({ id: 'new-alarm', mode: 'motivant' });
      mockAlarmRepository.create.mockResolvedValue(created);

      const result = await alarmService.createAlarm('user-1', {
        name: 'Morning boost',
        mode: 'motivant',
        alarmTime: '06:30',
      });

      expect(result).not.toBeNull();
      expect(result!.id).toBe('new-alarm');
      expect(mockAlarmRepository.create).toHaveBeenCalledWith('user-1', {
        name: 'Morning boost',
        mode: 'motivant',
        alarmTime: '06:30',
      });

      const { logger } = jest.requireMock('../utils/logger') as { logger: { info: jest.Mock } };
      expect(logger.info).toHaveBeenCalledWith('Alarm created', expect.objectContaining({
        alarmId: 'new-alarm',
        userId: 'user-1',
      }));
    });

    it('should return null when repository.create fails', async () => {
      mockAlarmRepository.create.mockResolvedValue(null);

      const result = await alarmService.createAlarm('user-1', { name: 'Fail' });

      expect(result).toBeNull();
    });
  });

  // ---- updateAlarm ----

  describe('updateAlarm', () => {
    it('should call repository.update and log on success', async () => {
      const updated = makeAlarm({ name: 'Updated alarm', mode: 'zen' });
      mockAlarmRepository.update.mockResolvedValue(updated);

      const result = await alarmService.updateAlarm('alarm-1', 'user-1', {
        name: 'Updated alarm',
        mode: 'zen',
      });

      expect(result).not.toBeNull();
      expect(result!.name).toBe('Updated alarm');
      expect(mockAlarmRepository.update).toHaveBeenCalledWith('alarm-1', 'user-1', {
        name: 'Updated alarm',
        mode: 'zen',
      });

      const { logger } = jest.requireMock('../utils/logger') as { logger: { info: jest.Mock } };
      expect(logger.info).toHaveBeenCalledWith('Alarm updated', expect.objectContaining({
        alarmId: 'alarm-1',
        userId: 'user-1',
        fields: ['name', 'mode'],
      }));
    });

    it('should return null when alarm not found or not owned', async () => {
      mockAlarmRepository.update.mockResolvedValue(null);

      const result = await alarmService.updateAlarm('alarm-1', 'user-1', { name: 'X' });

      expect(result).toBeNull();
    });
  });

  // ---- deleteAlarm ----

  describe('deleteAlarm', () => {
    it('should call repository.delete and log on success', async () => {
      mockAlarmRepository.delete.mockResolvedValue(true);

      const result = await alarmService.deleteAlarm('alarm-1', 'user-1');

      expect(result).toBe(true);
      expect(mockAlarmRepository.delete).toHaveBeenCalledWith('alarm-1', 'user-1');

      const { logger } = jest.requireMock('../utils/logger') as { logger: { info: jest.Mock } };
      expect(logger.info).toHaveBeenCalledWith('Alarm deleted', expect.objectContaining({
        alarmId: 'alarm-1',
        userId: 'user-1',
      }));
    });

    it('should return false when alarm not found', async () => {
      mockAlarmRepository.delete.mockResolvedValue(false);

      const result = await alarmService.deleteAlarm('nonexistent', 'user-1');

      expect(result).toBe(false);
    });
  });

  // ---- testAlarm ----

  describe('testAlarm', () => {
    it('should generate content and deliver via WhatsApp', async () => {
      const alarm = makeAlarm({ deliveryMethod: 'whatsapp_message', phoneNumber: '+33600000000' });
      mockAlarmRepository.getById.mockResolvedValue(alarm);

      const { telephonyService } = jest.requireMock('../avatar/services/telephony/telephony.service') as {
        telephonyService: { sendWhatsApp: jest.Mock; sendSms: jest.Mock; initiateOutboundCall: jest.Mock };
      };

      const result = await alarmService.testAlarm('alarm-1', 'user-1');

      expect(result.content).toBeTruthy();
      expect(result.delivered).toBe(true);
      expect(telephonyService.sendWhatsApp).toHaveBeenCalledWith(
        '+33600000000',
        expect.any(String),
      );
    });

    it('should generate content and deliver via phone call', async () => {
      const alarm = makeAlarm({ deliveryMethod: 'phone_call', phoneNumber: '+33600000000' });
      mockAlarmRepository.getById.mockResolvedValue(alarm);

      const { telephonyService } = jest.requireMock('../avatar/services/telephony/telephony.service') as {
        telephonyService: { sendWhatsApp: jest.Mock; sendSms: jest.Mock; initiateOutboundCall: jest.Mock };
      };

      const result = await alarmService.testAlarm('alarm-1', 'user-1');

      expect(result.content).toBeTruthy();
      expect(result.delivered).toBe(true);
      expect(telephonyService.sendSms).toHaveBeenCalled();
      expect(telephonyService.initiateOutboundCall).toHaveBeenCalled();
    });

    it('should return content without delivery when no phone number', async () => {
      const alarm = makeAlarm({ phoneNumber: null });
      mockAlarmRepository.getById.mockResolvedValue(alarm);

      const result = await alarmService.testAlarm('alarm-1', 'user-1');

      expect(result.content).toBeTruthy();
      expect(result.delivered).toBe(false);
    });

    it('should return error message when alarm not found', async () => {
      mockAlarmRepository.getById.mockResolvedValue(null);

      const result = await alarmService.testAlarm('nonexistent', 'user-1');

      expect(result.content).toBe('Alarme introuvable.');
      expect(result.delivered).toBe(false);
    });
  });

  // ---- generateAlarmContent (via testAlarm) ----

  describe('generateAlarmContent (tested via testAlarm)', () => {
    it('should call llmProxyService with correct system prompt for mode', async () => {
      const alarm = makeAlarm({ mode: 'dur', phoneNumber: null, rubrics: ['bonne_humeur'] });
      mockAlarmRepository.getById.mockResolvedValue(alarm);

      const { llmProxyService } = jest.requireMock('../billing/llm-proxy.service') as {
        llmProxyService: { processRequest: jest.Mock };
      };

      await alarmService.testAlarm('alarm-1', 'user-1');

      expect(llmProxyService.processRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          model: 'sonnet',
          agentName: 'alarm-service',
          endpoint: '/reveil/generate',
          maxTokens: 1024,
          temperature: 0.9,
        }),
      );

      // Verify the system message contains mode-specific tone
      const callArgs = llmProxyService.processRequest.mock.calls[0]![0] as {
        messages: { role: string; content: string }[];
      };
      const systemMsg = callArgs.messages.find((m) => m.role === 'system');
      expect(systemMsg).toBeDefined();
      expect(systemMsg!.content).toContain('DUR');
      expect(systemMsg!.content).toContain('sergent instructeur');
    });

    it('should include astrologie rubric with zodiac sign when birthDate is set', async () => {
      // March 25 -> Belier
      const alarm = makeAlarm({
        mode: 'doux',
        phoneNumber: null,
        rubrics: ['astrologie'],
        birthDate: '1990-03-25',
      });
      mockAlarmRepository.getById.mockResolvedValue(alarm);

      const { llmProxyService } = jest.requireMock('../billing/llm-proxy.service') as {
        llmProxyService: { processRequest: jest.Mock };
      };

      await alarmService.testAlarm('alarm-1', 'user-1');

      const callArgs = llmProxyService.processRequest.mock.calls[0]![0] as {
        messages: { role: string; content: string }[];
      };
      const systemMsg = callArgs.messages.find((m) => m.role === 'system');
      expect(systemMsg!.content).toContain('Belier');
    });

    it('should include annonce_perso rubric with custom text', async () => {
      const alarm = makeAlarm({
        mode: 'sympa',
        phoneNumber: null,
        rubrics: ['annonce_perso'],
        customAnnouncement: 'N\'oublie pas le rendez-vous a 10h !',
      });
      mockAlarmRepository.getById.mockResolvedValue(alarm);

      const { llmProxyService } = jest.requireMock('../billing/llm-proxy.service') as {
        llmProxyService: { processRequest: jest.Mock };
      };

      await alarmService.testAlarm('alarm-1', 'user-1');

      const callArgs = llmProxyService.processRequest.mock.calls[0]![0] as {
        messages: { role: string; content: string }[];
      };
      const systemMsg = callArgs.messages.find((m) => m.role === 'system');
      expect(systemMsg!.content).toContain('N\'oublie pas le rendez-vous a 10h !');
    });

    it('should fall back to default content when LLM returns error', async () => {
      const alarm = makeAlarm({ mode: 'dur', phoneNumber: null, rubrics: [] });
      mockAlarmRepository.getById.mockResolvedValue(alarm);

      const { llmProxyService } = jest.requireMock('../billing/llm-proxy.service') as {
        llmProxyService: { processRequest: jest.Mock };
      };
      llmProxyService.processRequest.mockResolvedValueOnce({ error: 'No credits' });

      const result = await alarmService.testAlarm('alarm-1', 'user-1');

      // Fallback content for 'dur' mode
      expect(result.content).toContain('DEBOUT');
    });

    it('should fall back to default content when LLM throws', async () => {
      const alarm = makeAlarm({ mode: 'zen', phoneNumber: null, rubrics: [] });
      mockAlarmRepository.getById.mockResolvedValue(alarm);

      const { llmProxyService } = jest.requireMock('../billing/llm-proxy.service') as {
        llmProxyService: { processRequest: jest.Mock };
      };
      llmProxyService.processRequest.mockRejectedValueOnce(new Error('API down'));

      const result = await alarmService.testAlarm('alarm-1', 'user-1');

      // Fallback content for 'zen' mode
      expect(result.content).toContain('Inspirez');
    });

    it('should include multiple rubrics in the system prompt', async () => {
      const alarm = makeAlarm({
        mode: 'drole',
        phoneNumber: null,
        rubrics: ['meteo', 'blague', 'citation', 'defi_jour'],
      });
      mockAlarmRepository.getById.mockResolvedValue(alarm);

      const { llmProxyService } = jest.requireMock('../billing/llm-proxy.service') as {
        llmProxyService: { processRequest: jest.Mock };
      };

      await alarmService.testAlarm('alarm-1', 'user-1');

      const callArgs = llmProxyService.processRequest.mock.calls[0]![0] as {
        messages: { role: string; content: string }[];
      };
      const systemMsg = callArgs.messages.find((m) => m.role === 'system');
      expect(systemMsg!.content).toContain('METEO');
      expect(systemMsg!.content).toContain('BLAGUE');
      expect(systemMsg!.content).toContain('CITATION');
      expect(systemMsg!.content).toContain('DEFI');
    });
  });

  // ---- checkAndTriggerAlarms ----

  describe('checkAndTriggerAlarms', () => {
    it('should process matching alarms and deliver them', async () => {
      // Get current time in UTC to build a matching alarm
      const { time } = getCurrentTimeInTz('UTC');

      const alarm = makeAlarm({
        alarmTime: time,
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // all days to ensure match
        deliveryMethod: 'whatsapp_message',
        phoneNumber: '+33600000000',
        timezone: 'UTC',
        lastTriggeredAt: null,
      });

      mockAlarmRepository.getAllEnabled.mockResolvedValue([alarm]);
      mockAlarmRepository.updateTriggerStatus.mockResolvedValue(undefined);

      await alarmService.checkAndTriggerAlarms();

      expect(mockAlarmRepository.getAllEnabled).toHaveBeenCalled();
      expect(mockAlarmRepository.updateTriggerStatus).toHaveBeenCalledWith(alarm.id, 'delivered');
    });

    it('should handle empty results gracefully', async () => {
      mockAlarmRepository.getAllEnabled.mockResolvedValue([]);

      await alarmService.checkAndTriggerAlarms();

      expect(mockAlarmRepository.updateTriggerStatus).not.toHaveBeenCalled();
    });

    it('should mark alarm as failed when delivery throws', async () => {
      const { time } = getCurrentTimeInTz('UTC');

      const alarm = makeAlarm({
        alarmTime: time,
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        deliveryMethod: 'whatsapp_message',
        phoneNumber: '+33600000000',
        timezone: 'UTC',
        lastTriggeredAt: null,
      });

      mockAlarmRepository.getAllEnabled.mockResolvedValue([alarm]);

      const { telephonyService } = jest.requireMock('../avatar/services/telephony/telephony.service') as {
        telephonyService: { sendWhatsApp: jest.Mock; sendSms: jest.Mock; initiateOutboundCall: jest.Mock };
      };
      telephonyService.sendWhatsApp.mockRejectedValue(new Error('WhatsApp down'));

      mockAlarmRepository.updateTriggerStatus.mockResolvedValue(undefined);

      await alarmService.checkAndTriggerAlarms();

      // When delivery throws, the alarm should be marked as failed
      expect(mockAlarmRepository.updateTriggerStatus).toHaveBeenCalledWith(alarm.id, 'failed');
    });

    it('should skip alarms on wrong day of week', async () => {
      const { time, day } = getCurrentTimeInTz('UTC');
      // Use a day that is NOT today
      const wrongDay = (day + 3) % 7;

      const alarm = makeAlarm({
        alarmTime: time,
        daysOfWeek: [wrongDay],
        timezone: 'UTC',
        lastTriggeredAt: null,
      });

      mockAlarmRepository.getAllEnabled.mockResolvedValue([alarm]);

      await alarmService.checkAndTriggerAlarms();

      expect(mockAlarmRepository.updateTriggerStatus).not.toHaveBeenCalled();
    });

    it('should skip recently triggered alarms', async () => {
      const { time } = getCurrentTimeInTz('UTC');

      const alarm = makeAlarm({
        alarmTime: time,
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        timezone: 'UTC',
        lastTriggeredAt: new Date().toISOString(), // just triggered
      });

      mockAlarmRepository.getAllEnabled.mockResolvedValue([alarm]);

      await alarmService.checkAndTriggerAlarms();

      expect(mockAlarmRepository.updateTriggerStatus).not.toHaveBeenCalled();
    });
  });
});
