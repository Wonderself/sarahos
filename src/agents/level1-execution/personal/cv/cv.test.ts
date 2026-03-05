import { CVAgent, CV_AGENT_CONFIG } from './cv.agent';
import { getProfile, upsertProfile, formatCVText } from './cv.tools';
import {
  CV_SYSTEM_PROMPT,
  CV_GENERATION_PROMPT,
  CV_TAILOR_PROMPT,
  CV_EVOLVE_PROMPT,
  INTERVIEW_STEP_PROMPTS,
  buildInterviewPrompt,
  buildGenerationPrompt,
  buildTailorPrompt,
  buildEvolvePrompt,
} from './cv.prompts';
import type { AgentTask } from '../../../base/agent.types';
import type { CVProfile, CVTaskType, InterviewStep } from './cv.types';
import { INTERVIEW_STEPS } from './cv.types';

// ── Mocks ──

jest.mock('../../../../utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
  createAgentLogger: () => ({ info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

jest.mock('../../../../core/llm/llm-router', () => ({
  LLMRouter: {
    route: jest.fn().mockResolvedValue({
      content: JSON.stringify({
        questions: ['Quel est votre nom complet ?', 'Quel est votre titre professionnel ?'],
      }),
      model: 'claude-sonnet',
      inputTokens: 200,
      outputTokens: 150,
      totalTokens: 350,
      stopReason: 'end_turn',
      latencyMs: 800,
    }),
  },
}));

jest.mock('../../../../core/event-bus/event-bus', () => ({
  eventBus: {
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    publish: jest.fn().mockResolvedValue({
      id: 'evt-1', type: 'test', sourceAgent: 'test', payload: {}, timestamp: new Date().toISOString(),
    }),
  },
}));

jest.mock('../../../../core/memory/memory-manager', () => ({
  memoryManager: {
    store: jest.fn().mockResolvedValue({ id: 'mem-1', content: '', metadata: {}, source: '', createdAt: '' }),
    search: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock('../../../../infra', () => ({
  dbClient: {
    isConnected: jest.fn().mockReturnValue(true),
    query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
  },
}));

// ── Helpers ──

function makeTask(overrides: Partial<AgentTask> = {}): AgentTask {
  return {
    id: 'task-cv-1',
    title: 'CV Task',
    description: 'Test CV task',
    priority: 'MEDIUM',
    payload: {},
    assignedBy: 'orchestrator',
    correlationId: 'corr-cv-1',
    ...overrides,
  };
}

function makeMockProfile(): CVProfile {
  return {
    id: 'prof-1',
    userId: 'user-1',
    fullName: 'Jean Dupont',
    title: 'Developpeur Senior',
    summary: 'Developpeur avec 10 ans d\'experience en TypeScript et Node.js',
    contactInfo: {
      email: 'jean@example.com',
      phone: '+33612345678',
      linkedin: 'linkedin.com/in/jeandupont',
      github: 'github.com/jeandupont',
      website: null,
      city: 'Paris',
      country: 'France',
    },
    skills: [
      { name: 'TypeScript', level: 'expert', category: 'technique', yearsOfExperience: 8 },
      { name: 'Node.js', level: 'avance', category: 'technique', yearsOfExperience: 6 },
      { name: 'Leadership', level: 'avance', category: 'management', yearsOfExperience: 4 },
    ],
    experiences: [
      {
        company: 'TechCorp',
        role: 'Lead Developer',
        startDate: '2020-01',
        endDate: null,
        current: true,
        description: 'Direction technique d\'une equipe de 8 developpeurs',
        achievements: ['Reduction de 40% du temps de deploiement', 'Migration vers microservices'],
        technologies: ['TypeScript', 'Node.js', 'AWS', 'Docker'],
        location: 'Paris, France',
      },
      {
        company: 'StartupXYZ',
        role: 'Developpeur Full-Stack',
        startDate: '2016-03',
        endDate: '2019-12',
        current: false,
        description: 'Developpement de la plateforme SaaS principale',
        achievements: ['Augmentation de 200% des performances API'],
        technologies: ['JavaScript', 'React', 'PostgreSQL'],
        location: 'Lyon, France',
      },
    ],
    education: [
      {
        institution: 'Ecole 42',
        degree: 'Architecte en Technologies du Numerique',
        field: 'Informatique',
        startYear: 2013,
        endYear: 2016,
        current: false,
        honors: null,
      },
    ],
    certifications: [
      {
        name: 'AWS Solutions Architect Associate',
        issuer: 'Amazon Web Services',
        date: '2023-06',
        expiryDate: '2026-06',
        credentialId: 'AWS-SAA-123',
      },
    ],
    languages: [
      { language: 'Francais', level: 'natif' },
      { language: 'Anglais', level: 'C1' },
    ],
    interests: ['Open source', 'Mentorat', 'Course a pied'],
    careerGoals: 'Devenir CTO d\'une startup tech en 3 ans',
    targetRoles: ['CTO', 'VP Engineering', 'Staff Engineer'],
    lastAiAnalysis: null,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ── Agent Configuration Tests ──

describe('CVAgent', () => {
  let agent: CVAgent;

  beforeEach(() => {
    agent = new CVAgent();
    jest.clearAllMocks();
  });

  describe('Configuration', () => {
    it('has correct agent config', () => {
      expect(CV_AGENT_CONFIG.id).toBe('cv-agent');
      expect(CV_AGENT_CONFIG.name).toBe('CV Agent');
      expect(CV_AGENT_CONFIG.level).toBe(1);
      expect(CV_AGENT_CONFIG.modelTier).toBe('standard');
    });

    it('has required capabilities', () => {
      expect(CV_AGENT_CONFIG.capabilities).toContain('career-interview');
      expect(CV_AGENT_CONFIG.capabilities).toContain('cv-generation');
      expect(CV_AGENT_CONFIG.capabilities).toContain('cv-tailoring');
      expect(CV_AGENT_CONFIG.capabilities).toContain('career-evolution');
    });

    it('has 4 capabilities', () => {
      expect(CV_AGENT_CONFIG.capabilities).toHaveLength(4);
    });

    it('initializes with correct properties', () => {
      expect(agent.name).toBe('CV Agent');
      expect(agent.level).toBe(1);
      expect(agent.modelTier).toBe('standard');
    });

    it('has system prompt set', () => {
      expect(CV_AGENT_CONFIG.systemPrompt).toBe(CV_SYSTEM_PROMPT);
      expect(CV_AGENT_CONFIG.systemPrompt.length).toBeGreaterThan(100);
    });
  });

  describe('Lifecycle', () => {
    it('subscribes to CVProfileUpdated on initialize', async () => {
      const { eventBus } = jest.requireMock('../../../../core/event-bus/event-bus') as {
        eventBus: { subscribe: jest.Mock };
      };
      await agent.initialize();
      expect(eventBus.subscribe).toHaveBeenCalledWith('CVProfileUpdated', expect.any(Function), agent.id);
    });

    it('unsubscribes from events on shutdown', async () => {
      const { eventBus } = jest.requireMock('../../../../core/event-bus/event-bus') as {
        eventBus: { unsubscribe: jest.Mock };
      };
      await agent.initialize();
      await agent.shutdown();
      expect(eventBus.unsubscribe).toHaveBeenCalledWith('CVProfileUpdated', agent.id);
    });

    it('status is IDLE after initialization', async () => {
      await agent.initialize();
      expect(agent.status).toBe('IDLE');
    });

    it('status is DISABLED after shutdown', async () => {
      await agent.initialize();
      await agent.shutdown();
      expect(agent.status).toBe('DISABLED');
    });
  });

  describe('Interview Task', () => {
    it('handles interview task with default step', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'interview', userId: 'user-1' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('step', 'identity');
      expect(result.output).toHaveProperty('tokensUsed');
    });

    it('handles interview with specific step', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'interview', userId: 'user-1', step: 'skills' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('step', 'skills');
    });

    it('stores answers and publishes CVProfileUpdated', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { query: jest.Mock; isConnected: jest.Mock };
      };
      const { eventBus } = jest.requireMock('../../../../core/event-bus/event-bus') as {
        eventBus: { publish: jest.Mock; subscribe: jest.Mock; unsubscribe: jest.Mock };
      };

      // Simulate profile creation on upsert
      dbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // getProfile returns null
      dbClient.query.mockResolvedValueOnce({
        rows: [{
          id: 'prof-1', user_id: 'user-1', full_name: 'Jean', title: null,
          summary: null, contact_info: {}, skills: [], experiences: [],
          education: [], certifications: [], languages: [], interests: [],
          career_goals: null, target_roles: [], last_ai_analysis: null,
          version: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        }],
        rowCount: 1,
      }); // INSERT returns new profile

      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'interview',
          userId: 'user-1',
          step: 'identity',
          answers: { fullName: 'Jean Dupont' },
        },
      }));

      expect(result.success).toBe(true);
      expect(eventBus.publish).toHaveBeenCalledWith(
        'CVProfileUpdated', expect.any(String),
        expect.objectContaining({ userId: 'user-1', step: 'identity' }),
      );
    });

    it('handles interview when profile already exists', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { query: jest.Mock; isConnected: jest.Mock };
      };

      // getProfile for answer mapping
      dbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      // getProfile for context
      dbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'interview', userId: 'user-1', step: 'experience' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('profileExists', false);
    });
  });

  describe('Generate Task', () => {
    it('returns error when no profile exists', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'generate', userId: 'user-1' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('error');
      expect(String(result.output['error'])).toContain('profil');
    });

    it('generates CV when profile exists', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { query: jest.Mock; isConnected: jest.Mock };
      };

      const profile = makeMockProfile();
      dbClient.query.mockResolvedValueOnce({
        rows: [{
          id: profile.id, user_id: profile.userId, full_name: profile.fullName,
          title: profile.title, summary: profile.summary,
          contact_info: profile.contactInfo, skills: profile.skills,
          experiences: profile.experiences, education: profile.education,
          certifications: profile.certifications, languages: profile.languages,
          interests: profile.interests, career_goals: profile.careerGoals,
          target_roles: profile.targetRoles, last_ai_analysis: null,
          version: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        }],
        rowCount: 1,
      });
      // upsertProfile getProfile
      dbClient.query.mockResolvedValueOnce({
        rows: [{ id: profile.id, user_id: profile.userId, version: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }],
        rowCount: 1,
      });
      // upsertProfile UPDATE
      dbClient.query.mockResolvedValueOnce({
        rows: [{ id: profile.id, user_id: profile.userId, version: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }],
        rowCount: 1,
      });

      const { LLMRouter } = jest.requireMock('../../../../core/llm/llm-router') as {
        LLMRouter: { route: jest.Mock };
      };
      LLMRouter.route.mockResolvedValueOnce({
        content: JSON.stringify({ cv: 'Generated CV content', metadata: { wordCount: 350 } }),
        totalTokens: 500,
      });

      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'generate', userId: 'user-1', format: 'text', language: 'fr' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('tokensUsed');
    });
  });

  describe('Tailor Task', () => {
    it('returns error when no job description', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'tailor', userId: 'user-1' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('error');
    });

    it('returns error when no profile exists', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'tailor', userId: 'user-1', jobDescription: 'Senior dev needed' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('error');
    });

    it('tailors CV to job description', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { query: jest.Mock; isConnected: jest.Mock };
      };
      const { LLMRouter } = jest.requireMock('../../../../core/llm/llm-router') as {
        LLMRouter: { route: jest.Mock };
      };

      const profile = makeMockProfile();
      dbClient.query.mockResolvedValueOnce({
        rows: [{
          id: profile.id, user_id: profile.userId, full_name: profile.fullName,
          title: profile.title, summary: profile.summary,
          contact_info: profile.contactInfo, skills: profile.skills,
          experiences: profile.experiences, education: profile.education,
          certifications: profile.certifications, languages: profile.languages,
          interests: profile.interests, career_goals: profile.careerGoals,
          target_roles: profile.targetRoles, last_ai_analysis: null,
          version: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        }],
        rowCount: 1,
      });

      LLMRouter.route.mockResolvedValueOnce({
        content: JSON.stringify({ tailoredCV: 'Adapted CV', matchAnalysis: { matchScore: 85 } }),
        totalTokens: 600,
      });

      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'tailor', userId: 'user-1',
          jobDescription: 'Recherche CTO pour startup IA',
          companyName: 'AIStartup',
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('tokensUsed', 600);
    });
  });

  describe('Evolve Task', () => {
    it('returns error when no profile exists', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'evolve', userId: 'user-1' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('error');
    });

    it('generates career evolution paths', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { query: jest.Mock; isConnected: jest.Mock };
      };
      const { LLMRouter } = jest.requireMock('../../../../core/llm/llm-router') as {
        LLMRouter: { route: jest.Mock };
      };

      const profile = makeMockProfile();
      dbClient.query.mockResolvedValueOnce({
        rows: [{
          id: profile.id, user_id: profile.userId, full_name: profile.fullName,
          title: profile.title, summary: profile.summary,
          contact_info: profile.contactInfo, skills: profile.skills,
          experiences: profile.experiences, education: profile.education,
          certifications: profile.certifications, languages: profile.languages,
          interests: profile.interests, career_goals: profile.careerGoals,
          target_roles: profile.targetRoles, last_ai_analysis: null,
          version: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        }],
        rowCount: 1,
      });

      LLMRouter.route.mockResolvedValueOnce({
        content: JSON.stringify({
          currentProfile: 'Dev senior 10 ans',
          suggestedPaths: [{ role: 'CTO', timeline: '12-18 mois' }],
          recommendations: ['Certif management'],
          trainingPlan: ['Formation leadership'],
        }),
        totalTokens: 700,
      });

      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'evolve', userId: 'user-1', targetIndustry: 'IA', yearsHorizon: 5 },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('suggestedPaths');
      expect(result.output).toHaveProperty('tokensUsed', 700);
    });
  });

  describe('Unknown Task Type', () => {
    it('returns error for unknown task type', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'unknown_type' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('error');
      expect(String(result.output['error'])).toContain('Unknown');
    });
  });
});

// ── Tools Tests ──

describe('CV Tools', () => {
  describe('getProfile', () => {
    it('returns null when DB not connected', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { isConnected: jest.Mock; query: jest.Mock };
      };
      dbClient.isConnected.mockReturnValueOnce(false);
      const result = await getProfile('user-1');
      expect(result).toBeNull();
    });

    it('returns null when no profile found', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { isConnected: jest.Mock; query: jest.Mock };
      };
      dbClient.isConnected.mockReturnValue(true);
      dbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      const result = await getProfile('user-1');
      expect(result).toBeNull();
    });

    it('returns profile when found', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { isConnected: jest.Mock; query: jest.Mock };
      };
      dbClient.isConnected.mockReturnValue(true);
      dbClient.query.mockResolvedValueOnce({
        rows: [{
          id: 'prof-1', user_id: 'user-1', full_name: 'Test',
          title: 'Dev', summary: 'Test dev', contact_info: {},
          skills: [], experiences: [], education: [],
          certifications: [], languages: [], interests: [],
          career_goals: null, target_roles: [], last_ai_analysis: null,
          version: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        }],
        rowCount: 1,
      });
      const result = await getProfile('user-1');
      expect(result).not.toBeNull();
      expect(result!.fullName).toBe('Test');
    });

    it('handles query errors gracefully', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { isConnected: jest.Mock; query: jest.Mock };
      };
      dbClient.isConnected.mockReturnValue(true);
      dbClient.query.mockRejectedValueOnce(new Error('DB error'));
      const result = await getProfile('user-1');
      expect(result).toBeNull();
    });
  });

  describe('upsertProfile', () => {
    it('returns null when DB not connected', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { isConnected: jest.Mock; query: jest.Mock };
      };
      dbClient.isConnected.mockReturnValueOnce(false);
      const result = await upsertProfile('user-1', { fullName: 'Test' });
      expect(result).toBeNull();
    });

    it('creates new profile when none exists', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { isConnected: jest.Mock; query: jest.Mock };
      };
      dbClient.isConnected.mockReturnValue(true);
      // getProfile returns null
      dbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      // INSERT returns new profile
      dbClient.query.mockResolvedValueOnce({
        rows: [{
          id: 'prof-new', user_id: 'user-1', full_name: 'Jean',
          title: null, summary: null, contact_info: {},
          skills: [], experiences: [], education: [],
          certifications: [], languages: [], interests: [],
          career_goals: null, target_roles: [], last_ai_analysis: null,
          version: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        }],
        rowCount: 1,
      });

      const result = await upsertProfile('user-1', { fullName: 'Jean' });
      expect(result).not.toBeNull();
      expect(result!.fullName).toBe('Jean');
    });

    it('updates existing profile', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { isConnected: jest.Mock; query: jest.Mock };
      };
      dbClient.isConnected.mockReturnValue(true);
      // getProfile returns existing
      dbClient.query.mockResolvedValueOnce({
        rows: [{
          id: 'prof-1', user_id: 'user-1', full_name: 'Old Name',
          title: 'Dev', summary: null, contact_info: {},
          skills: [], experiences: [], education: [],
          certifications: [], languages: [], interests: [],
          career_goals: null, target_roles: [], last_ai_analysis: null,
          version: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        }],
        rowCount: 1,
      });
      // UPDATE returns updated
      dbClient.query.mockResolvedValueOnce({
        rows: [{
          id: 'prof-1', user_id: 'user-1', full_name: 'New Name',
          title: 'Dev', summary: null, contact_info: {},
          skills: [], experiences: [], education: [],
          certifications: [], languages: [], interests: [],
          career_goals: null, target_roles: [], last_ai_analysis: null,
          version: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        }],
        rowCount: 1,
      });

      const result = await upsertProfile('user-1', { fullName: 'New Name' });
      expect(result).not.toBeNull();
      expect(result!.fullName).toBe('New Name');
      expect(result!.version).toBe(2);
    });

    it('returns existing profile when no fields to update', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { isConnected: jest.Mock; query: jest.Mock };
      };
      dbClient.isConnected.mockReturnValue(true);
      dbClient.query.mockResolvedValueOnce({
        rows: [{
          id: 'prof-1', user_id: 'user-1', full_name: 'Existing',
          title: null, summary: null, contact_info: {},
          skills: [], experiences: [], education: [],
          certifications: [], languages: [], interests: [],
          career_goals: null, target_roles: [], last_ai_analysis: null,
          version: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        }],
        rowCount: 1,
      });

      const result = await upsertProfile('user-1', {});
      expect(result).not.toBeNull();
      expect(result!.fullName).toBe('Existing');
    });
  });

  describe('formatCVText', () => {
    it('formats a complete profile into text', () => {
      const profile = makeMockProfile();
      const text = formatCVText(profile);

      expect(text).toContain('Jean Dupont');
      expect(text).toContain('Developpeur Senior');
      expect(text).toContain('Experiences professionnelles');
      expect(text).toContain('TechCorp');
      expect(text).toContain('Lead Developer');
      expect(text).toContain('Competences');
      expect(text).toContain('TypeScript');
      expect(text).toContain('Formation');
      expect(text).toContain('Ecole 42');
      expect(text).toContain('Certifications');
      expect(text).toContain('AWS');
      expect(text).toContain('Langues');
      expect(text).toContain('Francais');
      expect(text).toContain('Centres d\'interet');
    });

    it('handles profile with minimal data', () => {
      const profile: CVProfile = {
        id: 'prof-2', userId: 'user-2', fullName: 'Minimal User',
        title: null, summary: null,
        contactInfo: { email: null, phone: null, linkedin: null, github: null, website: null, city: null, country: null },
        skills: [], experiences: [], education: [],
        certifications: [], languages: [], interests: [],
        careerGoals: null, targetRoles: [],
        lastAiAnalysis: null, version: 1,
        createdAt: new Date(), updatedAt: new Date(),
      };
      const text = formatCVText(profile);
      expect(text).toContain('Minimal User');
      expect(text).not.toContain('Experiences');
      expect(text).not.toContain('Competences');
    });

    it('handles current experience with no end date', () => {
      const profile = makeMockProfile();
      const text = formatCVText(profile);
      expect(text).toContain('Actuel');
    });

    it('includes contact info', () => {
      const profile = makeMockProfile();
      const text = formatCVText(profile);
      expect(text).toContain('jean@example.com');
      expect(text).toContain('Paris');
    });
  });
});

// ── Prompts Tests ──

describe('CV Prompts', () => {
  describe('System Prompt', () => {
    it('is defined and substantial', () => {
      expect(CV_SYSTEM_PROMPT).toBeDefined();
      expect(CV_SYSTEM_PROMPT.length).toBeGreaterThan(200);
    });

    it('mentions the four modes', () => {
      expect(CV_SYSTEM_PROMPT).toContain('INTERVIEW');
      expect(CV_SYSTEM_PROMPT).toContain('GENERATE');
      expect(CV_SYSTEM_PROMPT).toContain('TAILOR');
      expect(CV_SYSTEM_PROMPT).toContain('EVOLVE');
    });

    it('mentions ATS compatibility', () => {
      expect(CV_SYSTEM_PROMPT).toContain('ATS');
    });
  });

  describe('Interview Step Prompts', () => {
    const steps: InterviewStep[] = INTERVIEW_STEPS;

    it('has all 9 interview steps defined', () => {
      expect(Object.keys(INTERVIEW_STEP_PROMPTS)).toHaveLength(9);
    });

    for (const step of steps) {
      it(`has prompt for ${step} step`, () => {
        expect(INTERVIEW_STEP_PROMPTS[step]).toBeDefined();
        expect(INTERVIEW_STEP_PROMPTS[step].length).toBeGreaterThan(20);
      });
    }

    it('identity step asks for name and contact', () => {
      const prompt = INTERVIEW_STEP_PROMPTS.identity.toLowerCase();
      expect(prompt).toMatch(/nom|prenom|name/);
      expect(prompt).toMatch(/email|telephone|contact/);
    });

    it('experience step asks for quantified achievements', () => {
      const prompt = INTERVIEW_STEP_PROMPTS.experience.toLowerCase();
      expect(prompt).toMatch(/quantifi|chiffr|pourcentage/);
    });
  });

  describe('Generation Prompt', () => {
    it('contains template variables', () => {
      expect(CV_GENERATION_PROMPT).toContain('{profile}');
      expect(CV_GENERATION_PROMPT).toContain('{format}');
      expect(CV_GENERATION_PROMPT).toContain('{language}');
    });
  });

  describe('Tailor Prompt', () => {
    it('contains template variables', () => {
      expect(CV_TAILOR_PROMPT).toContain('{profile}');
      expect(CV_TAILOR_PROMPT).toContain('{jobDescription}');
      expect(CV_TAILOR_PROMPT).toContain('{companyName}');
    });
  });

  describe('Evolve Prompt', () => {
    it('contains template variables', () => {
      expect(CV_EVOLVE_PROMPT).toContain('{profile}');
      expect(CV_EVOLVE_PROMPT).toContain('{targetIndustry}');
      expect(CV_EVOLVE_PROMPT).toContain('{yearsHorizon}');
    });
  });

  describe('Prompt Builders', () => {
    it('buildInterviewPrompt returns content for valid step', () => {
      const result = buildInterviewPrompt('identity');
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('IDENTITE');
    });

    it('buildInterviewPrompt falls back to identity for unknown step', () => {
      const result = buildInterviewPrompt('nonexistent' as InterviewStep);
      expect(result).toBe(INTERVIEW_STEP_PROMPTS.identity);
    });

    it('buildGenerationPrompt replaces all placeholders', () => {
      const result = buildGenerationPrompt('mon profil', 'markdown', 'fr');
      expect(result).toContain('mon profil');
      expect(result).toContain('markdown');
      expect(result).toContain('fr');
      expect(result).not.toContain('{profile}');
    });

    it('buildTailorPrompt replaces all placeholders', () => {
      const result = buildTailorPrompt('profil', 'offre CTO', 'MaCorp');
      expect(result).toContain('profil');
      expect(result).toContain('offre CTO');
      expect(result).toContain('MaCorp');
    });

    it('buildEvolvePrompt replaces all placeholders', () => {
      const result = buildEvolvePrompt('profil', 'Tech', 5);
      expect(result).toContain('profil');
      expect(result).toContain('Tech');
      expect(result).toContain('5');
    });
  });
});

// ── Types Coverage ──

describe('CV Types', () => {
  it('has 9 interview steps in correct order', () => {
    expect(INTERVIEW_STEPS).toHaveLength(9);
    expect(INTERVIEW_STEPS[0]).toBe('identity');
    expect(INTERVIEW_STEPS[INTERVIEW_STEPS.length - 1]).toBe('review');
  });

  it('validates CVTaskType values', () => {
    const types: CVTaskType[] = ['interview', 'generate', 'tailor', 'evolve'];
    expect(types).toHaveLength(4);
  });
});
