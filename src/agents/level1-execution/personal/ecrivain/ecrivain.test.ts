import { EcrivainAgent, ECRIVAIN_AGENT_CONFIG } from './ecrivain.agent';
import {
  ECRIVAIN_SYSTEM_PROMPT,
  ECRIVAIN_DISCLAIMER,
  OUTLINE_TEMPLATE,
  WRITE_TEMPLATE,
  REVIEW_TEMPLATE,
  CHARACTERS_TEMPLATE,
  PROGRESS_TEMPLATE,
} from './ecrivain.prompts';
import { formatProgressReport, rowToProject, rowToChapter } from './ecrivain.tools';
import type { AgentTask } from '../../../base/agent.types';
import type {
  EcrivainTaskType,
  ProjectType,
  ProjectStatus,
  ChapterStatus,
  WritingCharacter,
  ProjectProgress,
} from './ecrivain.types';
import { WORD_COUNT_MILESTONES } from './ecrivain.types';

// ── Mocks ──

jest.mock('../../../../utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
  createAgentLogger: () => ({ info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

jest.mock('../../../../core/llm/llm-router', () => ({
  LLMRouter: {
    route: jest.fn().mockResolvedValue({
      content: JSON.stringify({
        response: 'Analyse litteraire effectuee.',
        suggestions: ['Ajouter plus de tension'],
        encouragement: 'Continuez, vous etes sur la bonne voie !',
      }),
      model: 'claude-sonnet',
      inputTokens: 200,
      outputTokens: 100,
      totalTokens: 300,
      stopReason: 'end_turn',
      latencyMs: 500,
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

function makeTask(overrides: Partial<AgentTask> = {}): AgentTask {
  return {
    id: 'task-ecrivain-1',
    title: 'Ecrivain Task',
    description: 'Test ecrivain task',
    priority: 'MEDIUM',
    payload: {},
    assignedBy: 'orchestrator',
    correlationId: 'corr-1',
    ...overrides,
  };
}

// ── Agent Configuration Tests ──

describe('EcrivainAgent', () => {
  let agent: EcrivainAgent;

  beforeEach(() => {
    agent = new EcrivainAgent();
    jest.clearAllMocks();
  });

  describe('Configuration', () => {
    it('has correct agent id', () => {
      expect(ECRIVAIN_AGENT_CONFIG.id).toBe('ecrivain-agent');
    });

    it('has correct agent name', () => {
      expect(ECRIVAIN_AGENT_CONFIG.name).toBe('Ecrivain Agent');
    });

    it('is level 1 agent', () => {
      expect(ECRIVAIN_AGENT_CONFIG.level).toBe(1);
    });

    it('uses standard model tier', () => {
      expect(ECRIVAIN_AGENT_CONFIG.modelTier).toBe('standard');
    });

    it('has writing-outline capability', () => {
      expect(ECRIVAIN_AGENT_CONFIG.capabilities).toContain('writing-outline');
    });

    it('has chapter-writing capability', () => {
      expect(ECRIVAIN_AGENT_CONFIG.capabilities).toContain('chapter-writing');
    });

    it('has text-review capability', () => {
      expect(ECRIVAIN_AGENT_CONFIG.capabilities).toContain('text-review');
    });

    it('has character-development capability', () => {
      expect(ECRIVAIN_AGENT_CONFIG.capabilities).toContain('character-development');
    });

    it('has progress-tracking capability', () => {
      expect(ECRIVAIN_AGENT_CONFIG.capabilities).toContain('progress-tracking');
    });

    it('initializes with correct properties', () => {
      expect(agent.name).toBe('Ecrivain Agent');
      expect(agent.level).toBe(1);
      expect(agent.modelTier).toBe('standard');
    });
  });

  describe('Lifecycle', () => {
    it('subscribes to WritingMilestoneReached on initialize', async () => {
      const { eventBus } = jest.requireMock('../../../../core/event-bus/event-bus') as {
        eventBus: { subscribe: jest.Mock };
      };
      await agent.initialize();
      expect(eventBus.subscribe).toHaveBeenCalledWith(
        'WritingMilestoneReached',
        expect.any(Function),
        agent.id,
      );
    });

    it('unsubscribes from WritingMilestoneReached on shutdown', async () => {
      const { eventBus } = jest.requireMock('../../../../core/event-bus/event-bus') as {
        eventBus: { unsubscribe: jest.Mock };
      };
      await agent.initialize();
      await agent.shutdown();
      expect(eventBus.unsubscribe).toHaveBeenCalledWith('WritingMilestoneReached', agent.id);
    });

    it('sets status to IDLE after initialize', async () => {
      await agent.initialize();
      expect(agent.status).toBe('IDLE');
    });

    it('sets status to DISABLED after shutdown', async () => {
      await agent.initialize();
      await agent.shutdown();
      expect(agent.status).toBe('DISABLED');
    });
  });

  describe('Task Execution — Outline', () => {
    it('handles outline task type', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'outline',
          userId: 'user-1',
          title: 'Mon Roman',
          genre: 'thriller',
          projectType: 'roman',
          synopsis: 'Un detective enquete...',
          chapterCount: 12,
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('llmOutline');
    });

    it('creates project when title provided', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'outline',
          userId: 'user-1',
          title: 'Nouvelle Aventure',
          genre: 'fantastique',
        },
      }));
      expect(result.success).toBe(true);
    });

    it('handles outline without title or projectId', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'outline',
          userId: 'user-1',
        },
      }));
      expect(result.success).toBe(true);
    });
  });

  describe('Task Execution — Write', () => {
    it('handles write task type', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'write',
          userId: 'user-1',
          projectId: 'project-1',
          chapterNumber: 1,
          instructions: 'Ecris une scene de tension',
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('llmGuidance');
    });

    it('creates new chapter if not found', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'write',
          userId: 'user-1',
          projectId: 'project-1',
        },
      }));
      expect(result.success).toBe(true);
    });

    it('handles continuePrevious flag', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'write',
          userId: 'user-1',
          projectId: 'project-1',
          continuePrevious: true,
        },
      }));
      expect(result.success).toBe(true);
    });
  });

  describe('Task Execution — Review', () => {
    it('handles review task with no text found', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'review',
          userId: 'user-1',
          projectId: 'project-1',
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('error', 'Aucun texte trouve pour la relecture');
    });

    it('handles review task with chapterId', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'review',
          userId: 'user-1',
          projectId: 'project-1',
          chapterId: 'chapter-1',
          focusAreas: ['style', 'dialogue'],
        },
      }));
      expect(result.success).toBe(true);
    });

    it('handles review with focus areas', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'review',
          userId: 'user-1',
          projectId: 'project-1',
          focusAreas: ['pacing', 'characters'],
        },
      }));
      expect(result.success).toBe(true);
    });
  });

  describe('Task Execution — Characters', () => {
    it('handles characters list action (project not found)', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'characters',
          userId: 'user-1',
          projectId: 'project-1',
          action: 'list',
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('error', 'Projet non trouve');
    });

    it('handles characters create action (project not found)', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'characters',
          userId: 'user-1',
          projectId: 'project-1',
          action: 'create',
          characterData: { name: 'Jean', role: 'protagonist' },
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('error', 'Projet non trouve');
    });

    it('handles characters develop action', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'characters',
          userId: 'user-1',
          projectId: 'project-1',
          action: 'develop',
        },
      }));
      expect(result.success).toBe(true);
    });

    it('handles characters relationships action', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'characters',
          userId: 'user-1',
          projectId: 'project-1',
          action: 'relationships',
        },
      }));
      expect(result.success).toBe(true);
    });
  });

  describe('Task Execution — Progress', () => {
    it('handles progress task type', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'progress',
          userId: 'user-1',
          projectId: 'project-1',
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('progress');
      expect(result.output).toHaveProperty('llmEncouragement');
    });

    it('handles progress with addWords', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'progress',
          userId: 'user-1',
          projectId: 'project-1',
          addWords: 1500,
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('progress');
    });

    it('returns empty progress when project not found', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'progress',
          userId: 'user-1',
          projectId: 'nonexistent',
        },
      }));
      expect(result.success).toBe(true);
      const progress = result.output['progress'] as ProjectProgress;
      expect(progress.currentWordCount).toBe(0);
      expect(progress.percentComplete).toBe(0);
    });
  });

  describe('Task Execution — Unknown', () => {
    it('handles unknown task type gracefully', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'unknown_type' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('error');
      expect(result.output).toHaveProperty('disclaimer', ECRIVAIN_DISCLAIMER);
    });
  });

  describe('Disclaimer inclusion', () => {
    it('includes disclaimer in outline result', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'outline', userId: 'user-1', title: 'Test' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('disclaimer', ECRIVAIN_DISCLAIMER);
    });

    it('includes disclaimer in write result', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'write', userId: 'user-1', projectId: 'p-1' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('disclaimer', ECRIVAIN_DISCLAIMER);
    });

    it('includes disclaimer in review error', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'review', userId: 'user-1', projectId: 'p-1' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('disclaimer', ECRIVAIN_DISCLAIMER);
    });

    it('includes disclaimer in characters error', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'characters', userId: 'user-1', projectId: 'p-1', action: 'list' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('disclaimer', ECRIVAIN_DISCLAIMER);
    });

    it('includes disclaimer in progress result', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'progress', userId: 'user-1', projectId: 'p-1' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('disclaimer', ECRIVAIN_DISCLAIMER);
    });
  });
});

// ── Prompts Tests ──

describe('Ecrivain Prompts', () => {
  it('system prompt is defined and long', () => {
    expect(ECRIVAIN_SYSTEM_PROMPT).toBeDefined();
    expect(ECRIVAIN_SYSTEM_PROMPT.length).toBeGreaterThan(200);
  });

  it('system prompt mentions Charlotte', () => {
    expect(ECRIVAIN_SYSTEM_PROMPT).toContain('Charlotte');
  });

  it('system prompt mentions ecriture', () => {
    expect(ECRIVAIN_SYSTEM_PROMPT.toLowerCase()).toContain('ecriture');
  });

  it('system prompt contains disclaimer', () => {
    expect(ECRIVAIN_SYSTEM_PROMPT).toContain(ECRIVAIN_DISCLAIMER);
  });

  it('disclaimer is not empty', () => {
    expect(ECRIVAIN_DISCLAIMER.length).toBeGreaterThan(10);
  });

  it('outline template contains template variables', () => {
    expect(OUTLINE_TEMPLATE).toContain('{title}');
    expect(OUTLINE_TEMPLATE).toContain('{genre}');
    expect(OUTLINE_TEMPLATE).toContain('{synopsis}');
  });

  it('write template contains template variables', () => {
    expect(WRITE_TEMPLATE).toContain('{projectContext}');
    expect(WRITE_TEMPLATE).toContain('{chapterInfo}');
    expect(WRITE_TEMPLATE).toContain('{instructions}');
  });

  it('review template contains template variables', () => {
    expect(REVIEW_TEMPLATE).toContain('{text}');
    expect(REVIEW_TEMPLATE).toContain('{focusAreas}');
    expect(REVIEW_TEMPLATE).toContain('{styleNotes}');
  });

  it('characters template contains template variables', () => {
    expect(CHARACTERS_TEMPLATE).toContain('{action}');
    expect(CHARACTERS_TEMPLATE).toContain('{characters}');
    expect(CHARACTERS_TEMPLATE).toContain('{projectContext}');
  });

  it('progress template contains template variables', () => {
    expect(PROGRESS_TEMPLATE).toContain('{projectTitle}');
    expect(PROGRESS_TEMPLATE).toContain('{currentWords}');
    expect(PROGRESS_TEMPLATE).toContain('{targetWords}');
    expect(PROGRESS_TEMPLATE).toContain('{chapters}');
  });

  it('outline template mentions chapterCount', () => {
    expect(OUTLINE_TEMPLATE).toContain('{chapterCount}');
  });

  it('system prompt mentions roman', () => {
    expect(ECRIVAIN_SYSTEM_PROMPT).toContain('roman');
  });

  it('system prompt mentions scenario', () => {
    expect(ECRIVAIN_SYSTEM_PROMPT).toContain('scenario');
  });

  it('disclaimer mentions Charlotte', () => {
    expect(ECRIVAIN_DISCLAIMER).toContain('Charlotte');
  });
});

// ── Tools Tests ──

describe('Ecrivain Tools', () => {
  it('formatProgressReport returns a non-empty string', () => {
    const project = {
      id: 'p-1', userId: 'u-1', title: 'Mon Roman', genre: 'thriller',
      projectType: 'roman' as ProjectType, synopsis: null, targetWordCount: 80000,
      currentWordCount: 20000, status: 'in_progress' as ProjectStatus,
      characters: [], styleNotes: null,
      createdAt: new Date(), updatedAt: new Date(),
    };
    const chapters = [
      { id: 'ch-1', projectId: 'p-1', chapterNumber: 1, title: 'Prologue',
        content: 'Du texte...', wordCount: 5000, status: 'completed' as ChapterStatus,
        aiNotes: null, createdAt: new Date(), updatedAt: new Date() },
      { id: 'ch-2', projectId: 'p-1', chapterNumber: 2, title: 'Chapitre 2',
        content: null, wordCount: 3000, status: 'in_progress' as ChapterStatus,
        aiNotes: null, createdAt: new Date(), updatedAt: new Date() },
    ];
    const report = formatProgressReport(project, chapters);
    expect(report.length).toBeGreaterThan(0);
    expect(report).toContain('Mon Roman');
    expect(report).toContain('RAPPORT DE PROGRESSION');
  });

  it('formatProgressReport shows milestone info', () => {
    const project = {
      id: 'p-1', userId: 'u-1', title: 'Test', genre: null,
      projectType: 'roman' as ProjectType, synopsis: null, targetWordCount: 50000,
      currentWordCount: 12000, status: 'in_progress' as ProjectStatus,
      characters: [], styleNotes: null,
      createdAt: new Date(), updatedAt: new Date(),
    };
    const chapters = [
      { id: 'ch-1', projectId: 'p-1', chapterNumber: 1, title: null,
        content: 'text', wordCount: 12000, status: 'completed' as ChapterStatus,
        aiNotes: null, createdAt: new Date(), updatedAt: new Date() },
    ];
    const report = formatProgressReport(project, chapters);
    expect(report).toContain('PALIERS ATTEINTS');
    expect(report).toContain('10000 mots');
  });

  it('formatProgressReport handles empty chapters', () => {
    const project = {
      id: 'p-1', userId: 'u-1', title: 'Vide', genre: null,
      projectType: 'roman' as ProjectType, synopsis: null, targetWordCount: 50000,
      currentWordCount: 0, status: 'draft' as ProjectStatus,
      characters: [], styleNotes: null,
      createdAt: new Date(), updatedAt: new Date(),
    };
    const report = formatProgressReport(project, []);
    expect(report).toContain('0%');
  });

  it('rowToProject maps database row correctly', () => {
    const row = {
      id: 'p-1', user_id: 'u-1', title: 'Test',
      genre: 'SF', project_type: 'nouvelle',
      synopsis: 'Un test', target_word_count: 30000,
      current_word_count: 5000, status: 'in_progress',
      characters: [], style_notes: 'Style direct',
      created_at: '2026-01-01', updated_at: '2026-03-01',
    };
    const project = rowToProject(row);
    expect(project.id).toBe('p-1');
    expect(project.title).toBe('Test');
    expect(project.genre).toBe('SF');
    expect(project.targetWordCount).toBe(30000);
  });

  it('rowToChapter maps database row correctly', () => {
    const row = {
      id: 'ch-1', project_id: 'p-1', chapter_number: 3,
      title: 'Le debut', content: 'Il etait une fois...',
      word_count: 2500, status: 'draft', ai_notes: null,
      created_at: '2026-01-15', updated_at: '2026-02-15',
    };
    const chapter = rowToChapter(row);
    expect(chapter.id).toBe('ch-1');
    expect(chapter.chapterNumber).toBe(3);
    expect(chapter.wordCount).toBe(2500);
  });

  it('rowToProject handles null genre', () => {
    const row = {
      id: 'p-1', user_id: 'u-1', title: 'Test', genre: null,
      project_type: 'roman', synopsis: null, target_word_count: 0,
      current_word_count: 0, status: 'draft', characters: [],
      style_notes: null, created_at: '2026-01-01', updated_at: '2026-01-01',
    };
    const project = rowToProject(row);
    expect(project.genre).toBeNull();
    expect(project.styleNotes).toBeNull();
  });

  it('rowToChapter handles null title and content', () => {
    const row = {
      id: 'ch-2', project_id: 'p-1', chapter_number: 1, title: null,
      content: null, word_count: 0, status: 'draft', ai_notes: null,
      created_at: '2026-01-01', updated_at: '2026-01-01',
    };
    const chapter = rowToChapter(row);
    expect(chapter.title).toBeNull();
    expect(chapter.content).toBeNull();
    expect(chapter.wordCount).toBe(0);
  });

  it('formatProgressReport shows progress bar', () => {
    const project = {
      id: 'p-1', userId: 'u-1', title: 'Test', genre: 'SF',
      projectType: 'roman' as ProjectType, synopsis: null, targetWordCount: 100,
      currentWordCount: 50, status: 'in_progress' as ProjectStatus,
      characters: [], styleNotes: null,
      createdAt: new Date(), updatedAt: new Date(),
    };
    const chapters = [
      { id: 'ch-1', projectId: 'p-1', chapterNumber: 1, title: 'Ch1',
        content: 'text', wordCount: 50, status: 'completed' as ChapterStatus,
        aiNotes: null, createdAt: new Date(), updatedAt: new Date() },
    ];
    const report = formatProgressReport(project, chapters);
    expect(report).toContain('50%');
    expect(report).toContain('Termines  : 1');
  });

  it('formatProgressReport shows next milestone', () => {
    const project = {
      id: 'p-1', userId: 'u-1', title: 'Test', genre: null,
      projectType: 'roman' as ProjectType, synopsis: null, targetWordCount: 100000,
      currentWordCount: 3000, status: 'in_progress' as ProjectStatus,
      characters: [], styleNotes: null,
      createdAt: new Date(), updatedAt: new Date(),
    };
    const chapters = [
      { id: 'ch-1', projectId: 'p-1', chapterNumber: 1, title: null,
        content: 'text', wordCount: 3000, status: 'in_progress' as ChapterStatus,
        aiNotes: null, createdAt: new Date(), updatedAt: new Date() },
    ];
    const report = formatProgressReport(project, chapters);
    expect(report).toContain('Prochain palier');
    expect(report).toContain('1000 mots');
  });
});

// ── Types Tests ──

describe('Ecrivain Types', () => {
  it('validates task types', () => {
    const types: EcrivainTaskType[] = ['outline', 'write', 'review', 'characters', 'progress'];
    expect(types).toHaveLength(5);
  });

  it('validates project types', () => {
    const types: ProjectType[] = ['roman', 'nouvelle', 'scenario', 'essai', 'poesie', 'blog', 'autre'];
    expect(types).toHaveLength(7);
  });

  it('validates project statuses', () => {
    const statuses: ProjectStatus[] = ['draft', 'in_progress', 'revision', 'completed', 'abandoned'];
    expect(statuses).toHaveLength(5);
  });

  it('validates chapter statuses', () => {
    const statuses: ChapterStatus[] = ['draft', 'in_progress', 'revised', 'completed'];
    expect(statuses).toHaveLength(4);
  });

  it('validates word count milestones', () => {
    expect(WORD_COUNT_MILESTONES).toHaveLength(12);
    expect(WORD_COUNT_MILESTONES[0]).toBe(1000);
    expect(WORD_COUNT_MILESTONES[WORD_COUNT_MILESTONES.length - 1]).toBe(100000);
  });

  it('milestones are in ascending order', () => {
    for (let i = 1; i < WORD_COUNT_MILESTONES.length; i++) {
      expect(WORD_COUNT_MILESTONES[i]!).toBeGreaterThan(WORD_COUNT_MILESTONES[i - 1]!);
    }
  });

  it('WritingCharacter interface has required fields', () => {
    const char: WritingCharacter = {
      name: 'Jean',
      role: 'protagonist',
      description: 'Un detective parisien',
      arc: 'De cynique a optimiste',
      traits: ['intelligent', 'obstine', 'solitaire'],
    };
    expect(char.name).toBe('Jean');
    expect(char.traits).toHaveLength(3);
  });

  it('ProjectProgress interface has required fields', () => {
    const progress: ProjectProgress = {
      projectId: 'p-1',
      title: 'Test',
      targetWordCount: 80000,
      currentWordCount: 20000,
      percentComplete: 25,
      totalChapters: 20,
      completedChapters: 5,
      inProgressChapters: 2,
      draftChapters: 13,
      averageWordsPerChapter: 4000,
      estimatedChaptersRemaining: 15,
    };
    expect(progress.percentComplete).toBe(25);
    expect(progress.estimatedChaptersRemaining).toBe(15);
  });
});
