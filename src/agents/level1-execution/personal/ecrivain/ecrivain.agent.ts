// ===============================================================
// Ecrivain Agent — "Mon Ecrivain" (Persona: Charlotte)
// Assistante d'ecriture creative — roman, scenario, essai, etc.
// ===============================================================

import { BaseAgent } from '../../../base/base-agent';
import { LLMRouter } from '../../../../core/llm/llm-router';
import { eventBus } from '../../../../core/event-bus/event-bus';
import { memoryManager } from '../../../../core/memory/memory-manager';
import {
  ECRIVAIN_SYSTEM_PROMPT,
  ECRIVAIN_DISCLAIMER,
  OUTLINE_TEMPLATE,
  WRITE_TEMPLATE,
  REVIEW_TEMPLATE,
  CHARACTERS_TEMPLATE,
  PROGRESS_TEMPLATE,
} from './ecrivain.prompts';
import {
  getProject,
  createProject,
  updateProject,
  getChapters,
  createChapter,
  getProjectProgress,
  formatProgressReport,
} from './ecrivain.tools';
import type { AgentTask, AgentConfig } from '../../../base/agent.types';
import type { SystemEvent } from '../../../../core/event-bus/event.types';
import type {
  EcrivainTaskType,
  OutlinePayload,
  WritePayload,
  ReviewPayload,
  CharactersPayload,
  ProgressPayload,
} from './ecrivain.types';

export const ECRIVAIN_AGENT_CONFIG: AgentConfig = {
  id: 'ecrivain-agent',
  name: 'Ecrivain Agent',
  level: 1,
  modelTier: 'standard',
  capabilities: [
    'writing-outline',
    'chapter-writing',
    'text-review',
    'character-development',
    'progress-tracking',
  ],
  systemPrompt: ECRIVAIN_SYSTEM_PROMPT,
  maxRetries: 2,
  timeoutMs: 45_000,
  rateLimitPerMinute: 30,
};

// Paliers de mots pour les milestones
const MILESTONES = [1000, 5000, 10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000];

export class EcrivainAgent extends BaseAgent {
  constructor(config: AgentConfig = ECRIVAIN_AGENT_CONFIG) {
    super(config);
  }

  protected async onInitialize(): Promise<void> {
    eventBus.subscribe('WritingMilestoneReached', async (event) => {
      await this.handleMilestoneEvent(event);
    }, this.id);

    this.logger.info('Ecrivain Agent initialized — Charlotte prete a ecrire');
  }

  protected async onExecute(task: AgentTask): Promise<Record<string, unknown>> {
    const taskType = (task.payload['type'] as EcrivainTaskType | undefined) ?? 'review';

    switch (taskType) {
      case 'outline':
        return this.handleOutline(task);
      case 'write':
        return this.handleWrite(task);
      case 'review':
        return this.handleReview(task);
      case 'characters':
        return this.handleCharacters(task);
      case 'progress':
        return this.handleProgress(task);
      default:
        return {
          error: `Type de tache ecrivain inconnu: ${String(taskType)}`,
          disclaimer: ECRIVAIN_DISCLAIMER,
        };
    }
  }

  protected async onEvent(event: SystemEvent): Promise<void> {
    if (event.type === 'WritingMilestoneReached') {
      await this.handleMilestoneEvent(event);
    }
  }

  protected async onShutdown(): Promise<void> {
    eventBus.unsubscribe('WritingMilestoneReached', this.id);
    this.logger.info('Ecrivain Agent shut down');
  }

  // ── Outline ──

  private async handleOutline(task: AgentTask): Promise<Record<string, unknown>> {
    const payload = task.payload as unknown as OutlinePayload;

    // Recuperer ou creer le projet
    let project = null;
    if (payload.projectId) {
      project = await getProject(payload.projectId, payload.userId);
    }

    if (!project && payload.title) {
      project = await createProject(payload.userId, {
        title: payload.title,
        genre: payload.genre,
        projectType: payload.projectType,
        synopsis: payload.synopsis,
      });
    }

    const prompt = OUTLINE_TEMPLATE
      .replace('{title}', payload.title ?? project?.title ?? 'Sans titre')
      .replace('{genre}', payload.genre ?? project?.genre ?? 'fiction')
      .replace('{synopsis}', payload.synopsis ?? project?.synopsis ?? 'A definir')
      .replace('{chapterCount}', String(payload.chapterCount ?? 10));

    const llmResponse = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: ECRIVAIN_SYSTEM_PROMPT,
      userMessage: prompt,
    });

    // Stocker en memoire
    await memoryManager.store({
      content: `Projet d'ecriture "${payload.title ?? project?.title}" — outline genere`,
      source: this.name,
      agentId: this.id,
      metadata: {
        type: 'writing_outline',
        projectId: project?.id,
      },
    });

    // Create initial chapters if chapterCount is specified
    if (payload.chapterCount && project) {
      for (let i = 1; i <= payload.chapterCount; i++) {
        await createChapter(project.id, {
          chapterNumber: i,
          title: `Chapitre ${i}`,
          status: 'draft',
        });
      }
    }

    return {
      project,
      llmOutline: llmResponse.content,
      disclaimer: ECRIVAIN_DISCLAIMER,
    };
  }

  // ── Write ──

  private async handleWrite(task: AgentTask): Promise<Record<string, unknown>> {
    const payload = task.payload as unknown as WritePayload;

    const project = await getProject(payload.projectId, payload.userId);
    const chapters = await getChapters(payload.projectId);

    // Find or create the target chapter
    let chapter = null;
    if (payload.chapterId) {
      chapter = chapters.find((c) => c.id === payload.chapterId) ?? null;
    } else if (payload.chapterNumber) {
      chapter = chapters.find((c) => c.chapterNumber === payload.chapterNumber) ?? null;
    }

    if (!chapter) {
      const nextNumber = payload.chapterNumber ?? (chapters.length + 1);
      chapter = await createChapter(payload.projectId, {
        chapterNumber: nextNumber,
        title: `Chapitre ${nextNumber}`,
        status: 'in_progress',
      });
    }

    const projectContext = JSON.stringify({
      title: project?.title,
      genre: project?.genre,
      synopsis: project?.synopsis,
      characters: project?.characters,
      styleNotes: project?.styleNotes,
    });

    const chapterInfo = JSON.stringify({
      chapterNumber: chapter?.chapterNumber,
      title: chapter?.title,
      content: (chapter?.content ?? '').slice(0, 2000),
      wordCount: chapter?.wordCount,
    });

    const prompt = WRITE_TEMPLATE
      .replace('{projectContext}', projectContext)
      .replace('{chapterInfo}', chapterInfo)
      .replace('{instructions}', payload.instructions ?? 'Continue naturellement');

    const llmResponse = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: ECRIVAIN_SYSTEM_PROMPT,
      userMessage: prompt,
    });

    // Stocker en memoire
    await memoryManager.store({
      content: `Ecriture chapitre ${chapter?.chapterNumber} — "${project?.title}"`,
      source: this.name,
      agentId: this.id,
      metadata: {
        type: 'writing_chapter',
        projectId: payload.projectId,
        chapterId: chapter?.id,
      },
    });

    return {
      chapter,
      project,
      llmGuidance: llmResponse.content,
      disclaimer: ECRIVAIN_DISCLAIMER,
    };
  }

  // ── Review — Relecture et critique constructive ──

  private async handleReview(task: AgentTask): Promise<Record<string, unknown>> {
    const payload = task.payload as unknown as ReviewPayload;

    const project = await getProject(payload.projectId, payload.userId);

    let textToReview = '';

    // If a chapterId is provided, get the chapter content
    if (payload.chapterId) {
      const chapters = await getChapters(payload.projectId);
      const chapter = chapters.find((c) => c.id === payload.chapterId);
      textToReview = chapter?.content ?? '';
    }

    if (!textToReview) {
      const chapters = await getChapters(payload.projectId);
      const lastChapter = chapters.filter((c) => c.content).pop();
      textToReview = lastChapter?.content ?? '';
    }

    if (!textToReview) {
      return { error: 'Aucun texte trouve pour la relecture', disclaimer: ECRIVAIN_DISCLAIMER };
    }

    const focusAreas = payload.focusAreas?.join(', ') ?? 'general';

    const prompt = REVIEW_TEMPLATE
      .replace('{text}', textToReview.slice(0, 5000))
      .replace('{focusAreas}', focusAreas)
      .replace('{styleNotes}', project?.styleNotes ?? 'Aucune note de style');

    const llmResponse = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: ECRIVAIN_SYSTEM_PROMPT,
      userMessage: prompt,
    });

    return {
      feedback: llmResponse.content,
      focusAreas: payload.focusAreas ?? ['general'],
      textLength: textToReview.length,
      wordCount: countWords(textToReview),
      disclaimer: ECRIVAIN_DISCLAIMER,
    };
  }

  // ── Characters ──

  private async handleCharacters(task: AgentTask): Promise<Record<string, unknown>> {
    const payload = task.payload as unknown as CharactersPayload;

    const project = await getProject(payload.projectId, payload.userId);

    if (!project) {
      return { error: 'Projet non trouve', disclaimer: ECRIVAIN_DISCLAIMER };
    }

    switch (payload.action) {
      case 'list': {
        return {
          characters: project.characters,
          count: project.characters.length,
          disclaimer: ECRIVAIN_DISCLAIMER,
        };
      }

      case 'create':
      case 'develop':
      case 'relationships': {
        const projectContext = JSON.stringify({
          title: project.title,
          genre: project.genre,
          synopsis: project.synopsis,
          styleNotes: project.styleNotes,
        });

        const prompt = CHARACTERS_TEMPLATE
          .replace('{action}', payload.action)
          .replace('{characters}', JSON.stringify(project.characters))
          .replace('{projectContext}', projectContext);

        const llmResponse = await LLMRouter.route({
          agentId: this.id,
          agentName: this.name,
          modelTier: this.modelTier,
          systemPrompt: ECRIVAIN_SYSTEM_PROMPT,
          userMessage: prompt,
        });

        // Stocker en memoire
        await memoryManager.store({
          content: `Personnages ${payload.action} — "${project.title}"`,
          source: this.name,
          agentId: this.id,
          metadata: {
            type: 'writing_characters',
            projectId: payload.projectId,
            action: payload.action,
          },
        });

        return {
          existingCharacters: project.characters,
          llmAnalysis: llmResponse.content,
          disclaimer: ECRIVAIN_DISCLAIMER,
        };
      }

      default:
        return { error: `Action personnage inconnue: ${String(payload.action)}`, disclaimer: ECRIVAIN_DISCLAIMER };
    }
  }

  // ── Progress ──

  private async handleProgress(task: AgentTask): Promise<Record<string, unknown>> {
    const payload = task.payload as unknown as ProgressPayload;

    // Si addWords est specifie, mettre a jour le compteur du projet
    if (payload.addWords && payload.addWords > 0) {
      const project = await getProject(payload.projectId, payload.userId);
      if (project) {
        const newWordCount = project.currentWordCount + payload.addWords;
        await updateProject(payload.projectId, payload.userId, {
          currentWordCount: newWordCount,
        });
        await this.checkMilestones(
          payload.projectId,
          payload.userId,
          project.currentWordCount,
          newWordCount,
          project.title,
        );
      }
    }

    const progress = await getProjectProgress(payload.projectId, payload.userId);
    const project = await getProject(payload.projectId, payload.userId);
    const chapters = await getChapters(payload.projectId);

    // Generer le rapport de progression formate
    let report = '';
    if (project) {
      report = formatProgressReport(project, chapters);
    }

    const prompt = PROGRESS_TEMPLATE
      .replace('{projectTitle}', project?.title ?? 'Projet')
      .replace('{currentWords}', String(progress.currentWordCount))
      .replace('{targetWords}', String(progress.targetWordCount))
      .replace('{chapters}', JSON.stringify(chapters.map((c) => ({
        number: c.chapterNumber,
        title: c.title,
        wordCount: c.wordCount,
        status: c.status,
      }))));

    const llmResponse = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: ECRIVAIN_SYSTEM_PROMPT,
      userMessage: prompt,
    });

    return {
      progress,
      report,
      llmEncouragement: llmResponse.content,
      disclaimer: ECRIVAIN_DISCLAIMER,
    };
  }

  // ── Helpers ──

  private async checkMilestones(
    projectId: string,
    userId: string,
    previousWords: number,
    currentWords: number,
    projectTitle: string,
  ): Promise<void> {
    for (const milestone of MILESTONES) {
      if (previousWords < milestone && currentWords >= milestone) {
        await eventBus.publish('WritingMilestoneReached', this.id, {
          projectId,
          userId,
          milestone,
          currentWordCount: currentWords,
          projectTitle,
        });
        this.logger.info(`Writing milestone reached: ${milestone} words`, {
          projectId,
          userId,
          milestone,
        });
        break; // Only publish the first crossed milestone
      }
    }
  }

  private async handleMilestoneEvent(event: SystemEvent): Promise<void> {
    this.logger.info('Writing milestone event received', {
      projectId: event.payload['projectId'],
      milestone: event.payload['milestone'],
      currentWordCount: event.payload['currentWordCount'],
    });
  }
}

// ── Utility ──

function countWords(text: string): number {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}
