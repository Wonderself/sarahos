import { RepondeurAgent, REPONDEUR_AGENT_CONFIG } from './repondeur.agent';
import {
  isScheduleActive,
  isContactBlocked,
  isContactVip,
} from './repondeur.tools';
import {
  REPONDEUR_SYSTEM_PROMPT,
  CLASSIFICATION_PROMPT,
  MODE_PROMPTS,
  STYLE_MODIFIERS,
  SKILL_FRAGMENTS,
  SUMMARY_GENERATION_PROMPT,
  buildModePrompt,
  buildStyleModifier,
  buildSkillFragments,
} from './repondeur.prompts';
import type { AgentTask } from '../../base/agent.types';
import type { ScheduleConfig, RepondeurMode, RepondeurStyle, RepondeurSkill, RepondeurConfig } from './repondeur.types';

// ── Mocks ──

jest.mock('../../../utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
  createAgentLogger: () => ({ info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

jest.mock('../../../core/llm/llm-router', () => ({
  LLMRouter: {
    route: jest.fn().mockResolvedValue({
      content: JSON.stringify({
        classification: 'general',
        priority: 'normal',
        sentiment: 'neutral',
        entities: {},
        skillsToTrigger: ['message_taking'],
        isUrgent: false,
        isBossMessage: false,
      }),
      model: 'claude-sonnet',
      inputTokens: 200,
      outputTokens: 100,
      totalTokens: 300,
      stopReason: 'end_turn',
      latencyMs: 600,
    }),
  },
}));

jest.mock('../../../core/event-bus/event-bus', () => ({
  eventBus: {
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    publish: jest.fn().mockResolvedValue({
      id: 'evt-1', type: 'test', sourceAgent: 'test', payload: {}, timestamp: new Date().toISOString(),
    }),
  },
}));

jest.mock('../../../core/memory/memory-manager', () => ({
  memoryManager: {
    store: jest.fn().mockResolvedValue({ id: 'mem-1', content: '', metadata: {}, source: '', createdAt: '' }),
    search: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock('../../../whatsapp/whatsapp.service', () => ({
  whatsAppService: {
    sendTextMessage: jest.fn().mockResolvedValue('wa-msg-id-123'),
    markAsRead: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../../../infra', () => ({
  dbClient: {
    isConnected: jest.fn().mockReturnValue(false),
    query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
  },
}));

function makeTask(overrides: Partial<AgentTask> = {}): AgentTask {
  return {
    id: 'task-repondeur-1',
    title: 'Repondeur Task',
    description: 'Test repondeur task',
    priority: 'MEDIUM',
    payload: {},
    assignedBy: 'orchestrator',
    correlationId: 'corr-1',
    ...overrides,
  };
}

// ── Agent Tests ──

describe('RepondeurAgent', () => {
  let agent: RepondeurAgent;

  beforeEach(() => {
    agent = new RepondeurAgent();
    jest.clearAllMocks();
  });

  describe('Configuration', () => {
    it('has correct agent config', () => {
      expect(REPONDEUR_AGENT_CONFIG.id).toBe('repondeur-agent');
      expect(REPONDEUR_AGENT_CONFIG.name).toBe('Repondeur Agent');
      expect(REPONDEUR_AGENT_CONFIG.level).toBe(1);
      expect(REPONDEUR_AGENT_CONFIG.modelTier).toBe('fast');
    });

    it('has required capabilities', () => {
      expect(REPONDEUR_AGENT_CONFIG.capabilities).toContain('answering-machine');
      expect(REPONDEUR_AGENT_CONFIG.capabilities).toContain('message-taking');
      expect(REPONDEUR_AGENT_CONFIG.capabilities).toContain('order-capture');
      expect(REPONDEUR_AGENT_CONFIG.capabilities).toContain('summary-generation');
      expect(REPONDEUR_AGENT_CONFIG.capabilities).toContain('vip-detection');
      expect(REPONDEUR_AGENT_CONFIG.capabilities).toContain('faq-answering');
      expect(REPONDEUR_AGENT_CONFIG.capabilities).toContain('complaint-handling');
      expect(REPONDEUR_AGENT_CONFIG.capabilities).toContain('spam-filtering');
    });

    it('initializes with correct properties', () => {
      expect(agent.name).toBe('Repondeur Agent');
      expect(agent.level).toBe(1);
      expect(agent.modelTier).toBe('fast');
    });
  });

  describe('Lifecycle', () => {
    it('subscribes to events on initialize', async () => {
      const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as {
        eventBus: { subscribe: jest.Mock };
      };
      await agent.initialize();
      expect(eventBus.subscribe).toHaveBeenCalledWith('RepondeurMessageReceived', expect.any(Function), agent.id);
      expect(eventBus.subscribe).toHaveBeenCalledWith('RepondeurSummaryRequested', expect.any(Function), agent.id);
    });

    it('unsubscribes from events on shutdown', async () => {
      const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as {
        eventBus: { unsubscribe: jest.Mock };
      };
      await agent.initialize();
      await agent.shutdown();
      expect(eventBus.unsubscribe).toHaveBeenCalledWith('RepondeurMessageReceived', agent.id);
      expect(eventBus.unsubscribe).toHaveBeenCalledWith('RepondeurSummaryRequested', agent.id);
    });
  });

  describe('Task Execution', () => {
    it('handles process_message task when config not found', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'process_message',
          senderPhone: '+33612345678',
          senderName: 'Test User',
          messageContent: 'Bonjour',
          messageType: 'text',
          userId: 'user-1',
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('skipped', true);
    });

    it('handles unknown task type gracefully', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'unknown_type' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('error');
    });

    it('handles generate_summary task when config not found', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'generate_summary',
          configId: 'cfg-1',
          userId: 'user-1',
          periodStart: '2026-03-01T00:00:00Z',
          periodEnd: '2026-03-01T23:59:59Z',
          summaryType: 'daily',
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('skipped', true);
    });

    it('handles send_summary task with missing params', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'send_summary' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('error');
    });

    it('handles cleanup_old_data task', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'cleanup_old_data' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('messagesDeleted', 0);
    });
  });
});

// ── Schedule Tests ──

describe('isScheduleActive', () => {
  it('returns true when alwaysOn is true', () => {
    const schedule: ScheduleConfig = { alwaysOn: true, timezone: 'Europe/Paris', rules: [] };
    expect(isScheduleActive(schedule)).toBe(true);
  });

  it('returns true when no rules', () => {
    const schedule: ScheduleConfig = { alwaysOn: false, timezone: 'Europe/Paris', rules: [] };
    expect(isScheduleActive(schedule)).toBe(true);
  });

  it('returns false when schedule has rules but none match today', () => {
    // Create a rule for a day that is definitely not today
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Paris',
      weekday: 'short',
    });
    const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    const currentDayStr = formatter.formatToParts(now).find(p => p.type === 'weekday')?.value ?? '';
    const currentDay = dayMap[currentDayStr] ?? 0;
    const otherDay = (currentDay + 3) % 7; // A day that is NOT today

    const schedule: ScheduleConfig = {
      alwaysOn: false,
      timezone: 'Europe/Paris',
      rules: [
        { dayOfWeek: otherDay, startTime: '00:00', endTime: '23:59', isActive: true },
      ],
    };
    expect(isScheduleActive(schedule)).toBe(false);
  });

  it('handles inactive rules', () => {
    const schedule: ScheduleConfig = {
      alwaysOn: false,
      timezone: 'Europe/Paris',
      rules: [
        { dayOfWeek: 0, startTime: '00:00', endTime: '23:59', isActive: false },
        { dayOfWeek: 1, startTime: '00:00', endTime: '23:59', isActive: false },
        { dayOfWeek: 2, startTime: '00:00', endTime: '23:59', isActive: false },
        { dayOfWeek: 3, startTime: '00:00', endTime: '23:59', isActive: false },
        { dayOfWeek: 4, startTime: '00:00', endTime: '23:59', isActive: false },
        { dayOfWeek: 5, startTime: '00:00', endTime: '23:59', isActive: false },
        { dayOfWeek: 6, startTime: '00:00', endTime: '23:59', isActive: false },
      ],
    };
    expect(isScheduleActive(schedule)).toBe(false);
  });
});

// ── Contact Check Tests ──

describe('isContactBlocked', () => {
  it('detects blocked contact by exact match', () => {
    expect(isContactBlocked('+33612345678', ['+33612345678'])).toBe(true);
  });

  it('normalizes phone numbers for comparison', () => {
    expect(isContactBlocked('+33 6 12 34 56 78', ['+33612345678'])).toBe(true);
  });

  it('returns false for non-blocked contact', () => {
    expect(isContactBlocked('+33699999999', ['+33612345678'])).toBe(false);
  });

  it('handles empty blocked list', () => {
    expect(isContactBlocked('+33612345678', [])).toBe(false);
  });
});

describe('isContactVip', () => {
  const vips = [
    { phone: '+33612345678', name: 'VIP User', relationship: 'client', notes: '' },
  ];

  it('detects VIP contact', () => {
    expect(isContactVip('+33612345678', vips)).toBe(true);
  });

  it('normalizes phone numbers for VIP check', () => {
    expect(isContactVip('+33 6 12 34 56 78', vips)).toBe(true);
  });

  it('returns false for non-VIP', () => {
    expect(isContactVip('+33699999999', vips)).toBe(false);
  });

  it('handles empty VIP list', () => {
    expect(isContactVip('+33612345678', [])).toBe(false);
  });
});

// ── Prompt Tests ──

describe('Repondeur Prompts', () => {
  describe('Master System Prompt', () => {
    it('is defined and non-empty', () => {
      expect(REPONDEUR_SYSTEM_PROMPT).toBeDefined();
      expect(REPONDEUR_SYSTEM_PROMPT.length).toBeGreaterThan(100);
    });

    it('contains identity instructions', () => {
      expect(REPONDEUR_SYSTEM_PROMPT).toContain('IDENTITE');
      expect(REPONDEUR_SYSTEM_PROMPT).toContain('REGLES ABSOLUES');
    });

    it('forbids outbound calls (RGPD)', () => {
      expect(REPONDEUR_SYSTEM_PROMPT).toContain('appels sortants');
    });

    it('forbids revealing AI identity', () => {
      expect(REPONDEUR_SYSTEM_PROMPT.toLowerCase()).toContain('ne dis jamais');
    });
  });

  describe('Classification Prompt', () => {
    it('is defined and non-empty', () => {
      expect(CLASSIFICATION_PROMPT).toBeDefined();
      expect(CLASSIFICATION_PROMPT.length).toBeGreaterThan(50);
    });

    it('contains template variables', () => {
      expect(CLASSIFICATION_PROMPT).toContain('{message}');
      expect(CLASSIFICATION_PROMPT).toContain('{senderPhone}');
      expect(CLASSIFICATION_PROMPT).toContain('{senderName}');
    });
  });

  describe('Mode Prompts', () => {
    const modes: RepondeurMode[] = [
      'professional', 'family_humor', 'order_taking', 'emergency',
      'concierge', 'support_technique', 'qualification',
    ];

    it('has all 7 modes defined', () => {
      expect(Object.keys(MODE_PROMPTS)).toHaveLength(7);
    });

    for (const mode of modes) {
      it(`has prompt for ${mode} mode`, () => {
        expect(MODE_PROMPTS[mode]).toBeDefined();
        expect(MODE_PROMPTS[mode].length).toBeGreaterThan(30);
      });
    }

    it('family_humor mode mentions humor/blagues', () => {
      const prompt = MODE_PROMPTS['family_humor'].toLowerCase();
      expect(prompt).toMatch(/humour|blague|taquin|drole/);
    });

    it('order_taking mode mentions commande/order', () => {
      const prompt = MODE_PROMPTS['order_taking'].toLowerCase();
      expect(prompt).toMatch(/commande|order|produit|item/);
    });

    it('emergency mode mentions urgence/alert', () => {
      const prompt = MODE_PROMPTS['emergency'].toLowerCase();
      expect(prompt).toMatch(/urgence|urgent|alert/);
    });
  });

  describe('Style Modifiers', () => {
    const styles: RepondeurStyle[] = [
      'formal_corporate', 'friendly_professional', 'casual_fun',
      'minimalist', 'luxe_concierge', 'tech_startup', 'medical_cabinet',
    ];

    it('has all 7 styles defined', () => {
      expect(Object.keys(STYLE_MODIFIERS)).toHaveLength(7);
    });

    for (const style of styles) {
      it(`has modifier for ${style} style`, () => {
        expect(STYLE_MODIFIERS[style]).toBeDefined();
        expect(STYLE_MODIFIERS[style].length).toBeGreaterThan(20);
      });
    }

    it('formal_corporate style mentions vouvoiement', () => {
      expect(STYLE_MODIFIERS['formal_corporate'].toLowerCase()).toContain('vouvoiement');
    });

    it('casual_fun style mentions tutoiement or emoji', () => {
      const prompt = STYLE_MODIFIERS['casual_fun'].toLowerCase();
      expect(prompt).toMatch(/tutoiement|emoji|decontract/);
    });
  });

  describe('Skill Fragments', () => {
    const skills: RepondeurSkill[] = [
      'message_taking', 'faq_answering', 'appointment_scheduling',
      'order_capture', 'complaint_handling', 'vip_detection',
      'spam_filtering', 'language_detection', 'callback_scheduling',
      'sentiment_analysis',
    ];

    it('has all 10 skills defined', () => {
      expect(Object.keys(SKILL_FRAGMENTS)).toHaveLength(10);
    });

    for (const skill of skills) {
      it(`has fragment for ${skill}`, () => {
        expect(SKILL_FRAGMENTS[skill]).toBeDefined();
        expect(SKILL_FRAGMENTS[skill].length).toBeGreaterThan(20);
      });
    }
  });

  describe('Summary Generation Prompt', () => {
    it('is defined and non-empty', () => {
      expect(SUMMARY_GENERATION_PROMPT).toBeDefined();
      expect(SUMMARY_GENERATION_PROMPT.length).toBeGreaterThan(50);
    });

    it('contains period template variables', () => {
      expect(SUMMARY_GENERATION_PROMPT).toContain('{periodStart}');
      expect(SUMMARY_GENERATION_PROMPT).toContain('{periodEnd}');
      expect(SUMMARY_GENERATION_PROMPT).toContain('{messages}');
    });
  });

  describe('Prompt Builders', () => {
    it('buildModePrompt returns content for valid mode', () => {
      const result = buildModePrompt('professional');
      expect(result.length).toBeGreaterThan(0);
    });

    it('buildStyleModifier returns content for valid style', () => {
      const result = buildStyleModifier('formal_corporate');
      expect(result.length).toBeGreaterThan(0);
    });

    it('buildSkillFragments returns joined fragments', () => {
      const mockConfig = {
        faqEntries: [{ id: '1', question: 'Test?', answer: 'Oui.', category: 'general', isActive: true }],
        vipContacts: [{ phone: '+33612345678', name: 'VIP', relationship: 'client', notes: 'important' }],
      } as unknown as RepondeurConfig;

      const result = buildSkillFragments(['message_taking', 'faq_answering', 'vip_detection'], mockConfig);
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('PRISE DE MESSAGE');
    });

    it('buildSkillFragments handles empty skills list', () => {
      const result = buildSkillFragments([], { faqEntries: [], vipContacts: [] } as unknown as RepondeurConfig);
      expect(result).toBeDefined();
    });

    it('buildSkillFragments injects FAQ entries for faq_answering skill', () => {
      const mockConfig = {
        faqEntries: [
          { id: '1', question: 'Horaires?', answer: '9h-18h', category: 'general', isActive: true },
          { id: '2', question: 'Prix?', answer: '10 EUR', category: 'tarifs', isActive: true },
        ],
        vipContacts: [],
      } as unknown as RepondeurConfig;

      const result = buildSkillFragments(['faq_answering'], mockConfig);
      expect(result).toContain('Horaires');
    });

    it('buildSkillFragments injects VIP contacts for vip_detection skill', () => {
      const mockConfig = {
        faqEntries: [],
        vipContacts: [
          { phone: '+33612345678', name: 'M. Important', relationship: 'PDG', notes: 'Traitement premium' },
        ],
      } as unknown as RepondeurConfig;

      const result = buildSkillFragments(['vip_detection'], mockConfig);
      expect(result).toContain('Important');
    });
  });
});

// ── Types Coverage ──

describe('Repondeur Types', () => {
  it('exports expected type definitions', () => {
    // Verify types exist by importing them (compile-time check)
    const config: Partial<RepondeurConfig> = {
      isActive: true,
      activeMode: 'professional',
      activeStyle: 'friendly_professional',
    };
    expect(config.isActive).toBe(true);
    expect(config.activeMode).toBe('professional');
  });

  it('validates mode type union', () => {
    const modes: RepondeurMode[] = [
      'professional', 'family_humor', 'order_taking',
      'emergency', 'concierge', 'support_technique', 'qualification',
    ];
    expect(modes).toHaveLength(7);
  });

  it('validates style type union', () => {
    const styles: RepondeurStyle[] = [
      'formal_corporate', 'friendly_professional', 'casual_fun',
      'minimalist', 'luxe_concierge', 'tech_startup', 'medical_cabinet',
    ];
    expect(styles).toHaveLength(7);
  });

  it('validates skill type union', () => {
    const skills: RepondeurSkill[] = [
      'message_taking', 'faq_answering', 'appointment_scheduling',
      'order_capture', 'complaint_handling', 'vip_detection',
      'spam_filtering', 'language_detection', 'callback_scheduling',
      'sentiment_analysis',
    ];
    expect(skills).toHaveLength(10);
  });
});
