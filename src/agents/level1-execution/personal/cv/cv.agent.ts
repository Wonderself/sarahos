// ═══════════════════════════════════════════════════════
// CV Agent — Career Manager & CV Generator
// ═══════════════════════════════════════════════════════

import { BaseAgent } from '../../../base/base-agent';
import { LLMRouter } from '../../../../core/llm/llm-router';
import { eventBus } from '../../../../core/event-bus/event-bus';
import { memoryManager } from '../../../../core/memory/memory-manager';
import {
  CV_SYSTEM_PROMPT,
  buildInterviewPrompt,
  buildGenerationPrompt,
  buildTailorPrompt,
  buildEvolvePrompt,
} from './cv.prompts';
import {
  getProfile,
  upsertProfile,
  formatCVText,
} from './cv.tools';
import type { AgentTask, AgentConfig } from '../../../base/agent.types';
import type { SystemEvent } from '../../../../core/event-bus/event.types';
import type {
  CVTaskType,
  InterviewPayload,
  GeneratePayload,
  TailorPayload,
  EvolvePayload,
  InterviewStep,
  CVProfile,
} from './cv.types';

export const CV_AGENT_CONFIG: AgentConfig = {
  id: 'cv-agent',
  name: 'CV Agent',
  level: 1,
  modelTier: 'standard',
  capabilities: [
    'career-interview',
    'cv-generation',
    'cv-tailoring',
    'career-evolution',
  ],
  systemPrompt: CV_SYSTEM_PROMPT,
  maxRetries: 2,
  timeoutMs: 60_000,
  rateLimitPerMinute: 30,
};

export class CVAgent extends BaseAgent {
  constructor(config: AgentConfig = CV_AGENT_CONFIG) {
    super(config);
  }

  protected async onInitialize(): Promise<void> {
    eventBus.subscribe('CVProfileUpdated', async (event) => {
      await this.handleProfileUpdated(event);
    }, this.id);

    this.logger.info('CV Agent initialized — ready for career management');
  }

  protected async onExecute(task: AgentTask): Promise<Record<string, unknown>> {
    const taskType = (task.payload['type'] as CVTaskType | undefined) ?? 'interview';

    switch (taskType) {
      case 'interview':
        return this.handleInterview(task);
      case 'generate':
        return this.handleGenerate(task);
      case 'tailor':
        return this.handleTailor(task);
      case 'evolve':
        return this.handleEvolve(task);
      default:
        return { error: `Unknown CV task type: ${String(taskType)}` };
    }
  }

  protected async onEvent(event: SystemEvent): Promise<void> {
    switch (event.type) {
      case 'CVProfileUpdated':
        await this.handleProfileUpdated(event);
        break;
    }
  }

  protected async onShutdown(): Promise<void> {
    eventBus.unsubscribe('CVProfileUpdated', this.id);
    this.logger.info('CV Agent shut down');
  }

  // ── Interview Mode ──

  private async handleInterview(task: AgentTask): Promise<Record<string, unknown>> {
    const payload = task.payload as unknown as InterviewPayload;
    const userId = payload.userId;
    const step = (payload.step ?? 'identity') as InterviewStep;
    const answers = payload.answers ?? {};

    // If answers provided, store them in profile first
    if (Object.keys(answers).length > 0) {
      const profileUpdate = this.mapAnswersToProfile(step, answers);
      const updated = await upsertProfile(userId, profileUpdate);
      if (updated) {
        await eventBus.publish('CVProfileUpdated', this.id, {
          userId,
          step,
          version: updated.version,
        });
      }
    }

    // Get current profile for context
    const profile = await getProfile(userId);

    // Generate interview question for current step
    const stepPrompt = buildInterviewPrompt(step);

    const llmResponse = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: CV_SYSTEM_PROMPT,
      userMessage: [
        stepPrompt,
        '',
        profile ? `PROFIL ACTUEL : ${JSON.stringify(profile)}` : 'Aucun profil existant.',
        '',
        Object.keys(answers).length > 0
          ? `REPONSES FOURNIES : ${JSON.stringify(answers)}`
          : 'Premiere interaction pour cette etape.',
        '',
        'Genere les questions appropriees pour cette etape en JSON valide.',
      ].join('\n'),
    });

    let response: Record<string, unknown>;
    try {
      response = JSON.parse(llmResponse.content) as Record<string, unknown>;
    } catch {
      response = { questions: llmResponse.content, raw: true };
    }

    // Store in memory
    await memoryManager.store({
      content: `CV Interview [${step}] for user ${userId}`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'cv_interview', step, userId },
    });

    return {
      step,
      response,
      profileExists: profile !== null,
      tokensUsed: llmResponse.totalTokens,
    };
  }

  // ── Generate Mode ──

  private async handleGenerate(task: AgentTask): Promise<Record<string, unknown>> {
    const payload = task.payload as unknown as GeneratePayload;
    const userId = payload.userId;
    const format = payload.format ?? 'text';
    const language = payload.language ?? 'fr';

    const profile = await getProfile(userId);
    if (!profile) {
      return { error: 'Aucun profil trouve. Lancez d\'abord un entretien (mode interview).' };
    }

    const profileText = formatCVText(profile);
    const prompt = buildGenerationPrompt(profileText, format, language);

    const llmResponse = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: CV_SYSTEM_PROMPT,
      userMessage: prompt,
    });

    let generatedCV: Record<string, unknown>;
    try {
      generatedCV = JSON.parse(llmResponse.content) as Record<string, unknown>;
    } catch {
      generatedCV = { cv: llmResponse.content, metadata: { format, language } };
    }

    // Store AI analysis back to profile
    await upsertProfile(userId, {
      lastAiAnalysis: {
        generatedAt: new Date().toISOString(),
        format,
        language,
        tokensUsed: llmResponse.totalTokens,
      },
    });

    await memoryManager.store({
      content: `CV generated for user ${userId} (format: ${format}, lang: ${language})`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'cv_generation', userId, format, language },
    });

    return {
      ...generatedCV,
      tokensUsed: llmResponse.totalTokens,
    };
  }

  // ── Tailor Mode ──

  private async handleTailor(task: AgentTask): Promise<Record<string, unknown>> {
    const payload = task.payload as unknown as TailorPayload;
    const userId = payload.userId;
    const jobDescription = payload.jobDescription;
    const companyName = payload.companyName ?? 'Non precise';

    if (!jobDescription) {
      return { error: 'Description du poste requise pour adapter le CV.' };
    }

    const profile = await getProfile(userId);
    if (!profile) {
      return { error: 'Aucun profil trouve. Lancez d\'abord un entretien (mode interview).' };
    }

    const profileText = formatCVText(profile);
    const prompt = buildTailorPrompt(profileText, jobDescription, companyName);

    const llmResponse = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: CV_SYSTEM_PROMPT,
      userMessage: prompt,
    });

    let tailoredResult: Record<string, unknown>;
    try {
      tailoredResult = JSON.parse(llmResponse.content) as Record<string, unknown>;
    } catch {
      tailoredResult = { tailoredCV: llmResponse.content, matchAnalysis: null };
    }

    await memoryManager.store({
      content: `CV tailored for ${companyName} job by user ${userId}`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'cv_tailoring', userId, companyName },
    });

    return {
      ...tailoredResult,
      tokensUsed: llmResponse.totalTokens,
    };
  }

  // ── Evolve Mode ──

  private async handleEvolve(task: AgentTask): Promise<Record<string, unknown>> {
    const payload = task.payload as unknown as EvolvePayload;
    const userId = payload.userId;
    const targetIndustry = payload.targetIndustry ?? 'Tous secteurs';
    const yearsHorizon = payload.yearsHorizon ?? 3;

    const profile = await getProfile(userId);
    if (!profile) {
      return { error: 'Aucun profil trouve. Lancez d\'abord un entretien (mode interview).' };
    }

    const profileText = formatCVText(profile);
    const prompt = buildEvolvePrompt(profileText, targetIndustry, yearsHorizon);

    const llmResponse = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: CV_SYSTEM_PROMPT,
      userMessage: prompt,
    });

    let evolution: Record<string, unknown>;
    try {
      evolution = JSON.parse(llmResponse.content) as Record<string, unknown>;
    } catch {
      evolution = {
        currentProfile: profileText.slice(0, 200),
        suggestedPaths: [],
        recommendations: [llmResponse.content],
        trainingPlan: [],
      };
    }

    await memoryManager.store({
      content: `Career evolution analysis for user ${userId} (${targetIndustry}, ${yearsHorizon}y)`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'career_evolution', userId, targetIndustry, yearsHorizon },
    });

    return {
      ...evolution,
      tokensUsed: llmResponse.totalTokens,
    };
  }

  // ── Answer Mapping ──

  private mapAnswersToProfile(step: string, answers: Record<string, unknown>): Partial<CVProfile> {
    switch (step) {
      case 'identity':
        return {
          fullName: answers['fullName'] as string | undefined,
          title: answers['title'] as string | undefined,
          summary: answers['summary'] as string | undefined,
          contactInfo: answers['contactInfo'] as CVProfile['contactInfo'] | undefined,
        };
      case 'experience':
        return {
          experiences: answers['experiences'] as CVProfile['experiences'] | undefined,
        };
      case 'skills':
        return {
          skills: answers['skills'] as CVProfile['skills'] | undefined,
        };
      case 'education':
        return {
          education: answers['education'] as CVProfile['education'] | undefined,
        };
      case 'certifications':
        return {
          certifications: answers['certifications'] as CVProfile['certifications'] | undefined,
        };
      case 'languages':
        return {
          languages: answers['languages'] as CVProfile['languages'] | undefined,
        };
      case 'goals':
        return {
          careerGoals: answers['careerGoals'] as string | undefined,
          targetRoles: answers['targetRoles'] as string[] | undefined,
        };
      case 'interests':
        return {
          interests: answers['interests'] as string[] | undefined,
        };
      default:
        return {};
    }
  }

  // ── Event Handlers ──

  private async handleProfileUpdated(event: SystemEvent): Promise<void> {
    this.logger.debug('CV profile updated', {
      userId: event.payload['userId'],
      step: event.payload['step'],
    });
  }
}
