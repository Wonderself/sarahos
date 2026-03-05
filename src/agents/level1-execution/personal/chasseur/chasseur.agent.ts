// ═══════════════════════════════════════════════════════
// Chasseur Agent — Freelance Mission Hunter
// ═══════════════════════════════════════════════════════

import { BaseAgent } from '../../../base/base-agent';
import { LLMRouter } from '../../../../core/llm/llm-router';
import { eventBus } from '../../../../core/event-bus/event-bus';
import { memoryManager } from '../../../../core/memory/memory-manager';
import {
  CHASSEUR_SYSTEM_PROMPT,
  buildSearchPrompt,
  buildProposalPrompt,
  buildOptimizePrompt,
} from './chasseur.prompts';
import {
  getMissions,
  updateMissionStatus,
  getPipelineStats,
} from './chasseur.tools';
import type { AgentTask, AgentConfig } from '../../../base/agent.types';
import type { SystemEvent } from '../../../../core/event-bus/event.types';
import type {
  ChasseurTaskType,
  SearchPayload,
  ProposalPayload,
  PipelinePayload,
  OptimizePayload,
  MissionStatus,
} from './chasseur.types';

export const CHASSEUR_AGENT_CONFIG: AgentConfig = {
  id: 'chasseur-agent',
  name: 'Chasseur Agent',
  level: 1,
  modelTier: 'standard',
  capabilities: [
    'mission-search',
    'proposal-writing',
    'pipeline-management',
    'profile-optimization',
  ],
  systemPrompt: CHASSEUR_SYSTEM_PROMPT,
  maxRetries: 2,
  timeoutMs: 45_000,
  rateLimitPerMinute: 30,
};

export class ChasseurAgent extends BaseAgent {
  constructor(config: AgentConfig = CHASSEUR_AGENT_CONFIG) {
    super(config);
  }

  protected async onInitialize(): Promise<void> {
    eventBus.subscribe('MissionStatusChanged', async (event) => {
      await this.handleMissionStatusChanged(event);
    }, this.id);

    eventBus.subscribe('FreelanceReminderDue', async (event) => {
      await this.handleReminderDue(event);
    }, this.id);

    this.logger.info('Chasseur Agent initialized — ready for mission hunting');
  }

  protected async onExecute(task: AgentTask): Promise<Record<string, unknown>> {
    const taskType = (task.payload['type'] as ChasseurTaskType | undefined) ?? 'search';

    switch (taskType) {
      case 'search':
        return this.handleSearch(task);
      case 'proposal':
        return this.handleProposal(task);
      case 'pipeline':
        return this.handlePipeline(task);
      case 'optimize':
        return this.handleOptimize(task);
      default:
        return { error: `Unknown chasseur task type: ${String(taskType)}` };
    }
  }

  protected async onEvent(event: SystemEvent): Promise<void> {
    switch (event.type) {
      case 'MissionStatusChanged':
        await this.handleMissionStatusChanged(event);
        break;
      case 'FreelanceReminderDue':
        await this.handleReminderDue(event);
        break;
    }
  }

  protected async onShutdown(): Promise<void> {
    eventBus.unsubscribe('MissionStatusChanged', this.id);
    eventBus.unsubscribe('FreelanceReminderDue', this.id);
    this.logger.info('Chasseur Agent shut down');
  }

  // ── Search Mode ──

  private async handleSearch(task: AgentTask): Promise<Record<string, unknown>> {
    const payload = task.payload as unknown as SearchPayload;
    const userId = payload.userId;

    if (!payload.query) {
      return { error: 'Une requete de recherche est requise.' };
    }

    const prompt = buildSearchPrompt(
      payload.query,
      payload.platforms ?? [],
      payload.minTjm ?? 0,
      payload.maxTjm ?? 9999,
      payload.remoteOnly ?? false,
      payload.skills ?? [],
    );

    const llmResponse = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: CHASSEUR_SYSTEM_PROMPT,
      userMessage: prompt,
    });

    let searchResult: Record<string, unknown>;
    try {
      searchResult = JSON.parse(llmResponse.content) as Record<string, unknown>;
    } catch {
      searchResult = { suggestions: [], searchStrategy: llmResponse.content, keywords: [] };
    }

    // Store in memory
    await memoryManager.store({
      content: `Mission search by user ${userId}: ${payload.query.slice(0, 100)}`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'mission_search', userId, query: payload.query },
    });

    return {
      ...searchResult,
      tokensUsed: llmResponse.totalTokens,
    };
  }

  // ── Proposal Mode ──

  private async handleProposal(task: AgentTask): Promise<Record<string, unknown>> {
    const payload = task.payload as unknown as ProposalPayload;
    const userId = payload.userId;

    if (!payload.missionDescription) {
      return { error: 'La description de la mission est requise pour rediger une proposition.' };
    }

    const prompt = buildProposalPrompt(
      payload.missionDescription,
      payload.clientName ?? 'Non precise',
      payload.platform ?? 'autre',
    );

    const llmResponse = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: CHASSEUR_SYSTEM_PROMPT,
      userMessage: prompt,
    });

    let proposalResult: Record<string, unknown>;
    try {
      proposalResult = JSON.parse(llmResponse.content) as Record<string, unknown>;
    } catch {
      proposalResult = {
        proposal: llmResponse.content,
        subjectLine: 'Candidature freelance',
        keyPoints: [],
        tone: 'professionnel',
        estimatedWordCount: llmResponse.content.split(/\s+/).length,
      };
    }

    // If missionId provided, update status to applied
    if (payload.missionId) {
      const updated = await updateMissionStatus(payload.missionId, userId, 'applied');
      if (updated) {
        await eventBus.publish('MissionStatusChanged', this.id, {
          userId,
          missionId: payload.missionId,
          oldStatus: 'discovered',
          newStatus: 'applied',
        });
      }
    }

    await memoryManager.store({
      content: `Proposal written for mission at ${payload.clientName ?? 'unknown client'}`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'proposal_written', userId, clientName: payload.clientName },
    });

    return {
      ...proposalResult,
      tokensUsed: llmResponse.totalTokens,
    };
  }

  // ── Pipeline Mode ──

  private async handlePipeline(task: AgentTask): Promise<Record<string, unknown>> {
    const payload = task.payload as unknown as PipelinePayload;
    const userId = payload.userId;
    const action = payload.action ?? 'list';

    switch (action) {
      case 'list': {
        const missions = await getMissions(userId, payload.statusFilter);
        return {
          missions: missions.map(m => ({
            id: m.id,
            title: m.title,
            clientName: m.clientName,
            platform: m.platform,
            tjmCents: m.tjmCents,
            status: m.status,
            nextAction: m.nextAction,
            nextActionDate: m.nextActionDate,
            updatedAt: m.updatedAt,
          })),
          total: missions.length,
          statusFilter: payload.statusFilter ?? 'all',
        };
      }

      case 'stats': {
        const stats = await getPipelineStats(userId);
        return { stats };
      }

      case 'update_status': {
        if (!payload.missionId || !payload.newStatus) {
          return { error: 'missionId et newStatus sont requis pour mettre a jour le statut.' };
        }

        const updated = await updateMissionStatus(
          payload.missionId,
          userId,
          payload.newStatus,
        );

        if (!updated) {
          return { error: 'Mission non trouvee ou mise a jour impossible.' };
        }

        await eventBus.publish('MissionStatusChanged', this.id, {
          userId,
          missionId: payload.missionId,
          newStatus: payload.newStatus,
        });

        return {
          updated: true,
          mission: {
            id: updated.id,
            title: updated.title,
            status: updated.status,
          },
        };
      }

      default:
        return { error: `Action pipeline inconnue: ${String(action)}` };
    }
  }

  // ── Optimize Mode ──

  private async handleOptimize(task: AgentTask): Promise<Record<string, unknown>> {
    const payload = task.payload as unknown as OptimizePayload;
    const userId = payload.userId;

    const profileDescription = payload.profileDescription ?? 'Profil non fourni';
    const targetPlatforms = payload.targetPlatforms ?? ['malt', 'comet'];

    const prompt = buildOptimizePrompt(profileDescription, targetPlatforms);

    const llmResponse = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: CHASSEUR_SYSTEM_PROMPT,
      userMessage: prompt,
    });

    let optimizeResult: Record<string, unknown>;
    try {
      optimizeResult = JSON.parse(llmResponse.content) as Record<string, unknown>;
    } catch {
      optimizeResult = {
        profileScore: 0,
        strengths: [],
        weaknesses: [],
        recommendations: [{ platform: 'general', actions: [llmResponse.content], priority: 'haute' }],
        tagSuggestions: [],
      };
    }

    await memoryManager.store({
      content: `Profile optimization for user ${userId}`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'profile_optimization', userId, platforms: targetPlatforms },
    });

    return {
      ...optimizeResult,
      tokensUsed: llmResponse.totalTokens,
    };
  }

  // ── Event Handlers ──

  private async handleMissionStatusChanged(event: SystemEvent): Promise<void> {
    this.logger.debug('Mission status changed', {
      missionId: event.payload['missionId'],
      newStatus: event.payload['newStatus'],
    });

    // Auto-suggest next actions based on status
    const newStatus = event.payload['newStatus'] as MissionStatus;
    const nextActions: Record<string, string> = {
      applied: 'Relancer dans 3 jours si pas de reponse',
      interview: 'Preparer l\'entretien, rechercher l\'entreprise',
      negotiation: 'Preparer les arguments TJM, definir le plancher',
      won: 'Signer le contrat, planifier le demarrage',
      lost: 'Demander un feedback, archiver les enseignements',
    };

    if (nextActions[newStatus]) {
      this.logger.info(`Suggested next action for ${String(newStatus)}: ${nextActions[newStatus]}`);
    }
  }

  private async handleReminderDue(event: SystemEvent): Promise<void> {
    this.logger.info('Freelance reminder due', {
      missionId: event.payload['missionId'],
      action: event.payload['action'],
    });
  }
}
