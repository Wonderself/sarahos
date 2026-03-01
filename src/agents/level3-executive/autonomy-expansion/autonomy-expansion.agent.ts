import { BaseAgent } from '../../base/base-agent';
import { LLMRouter } from '../../../core/llm/llm-router';
import { eventBus } from '../../../core/event-bus/event-bus';
import { humanOverride } from '../../../core/human-override/human-override';
import { memoryManager } from '../../../core/memory/memory-manager';
import { stateManager } from '../../../core/state/state-manager';
import { agentRegistry } from '../../../core/agent-registry/agent-registry';
import {
  AUTONOMY_EXPANSION_SYSTEM_PROMPT,
  AUTONOMY_ASSESSMENT_TEMPLATE,
  BLOCKER_ANALYSIS_TEMPLATE,
  AUTOMATION_DESIGN_TEMPLATE,
  CAPABILITY_EXPANSION_TEMPLATE,
} from './autonomy-expansion.prompts';
import { assessAutonomy, identifyBlockers, designAutomation, draftAutonomyUpgrade } from './autonomy-expansion.tools';
import type { AgentTask, AgentConfig } from '../../base/agent.types';
import type { SystemEvent } from '../../../core/event-bus/event.types';

export const AUTONOMY_EXPANSION_CONFIG: AgentConfig = {
  id: 'autonomy-expansion-agent',
  name: 'Autonomy Expansion Agent',
  level: 3,
  modelTier: 'advanced',
  capabilities: [
    'autonomy-assessment',
    'blocker-identification',
    'automation-design',
    'capability-expansion',
    'human-dependency-reduction',
  ],
  systemPrompt: AUTONOMY_EXPANSION_SYSTEM_PROMPT,
  maxRetries: 2,
  timeoutMs: 120_000,
  rateLimitPerMinute: 8,
};

type AutonomyTaskType = 'assess-autonomy' | 'find-blockers' | 'design-automation' | 'expand-capabilities' | 'upgrade-autonomy';

export class AutonomyExpansionAgent extends BaseAgent {
  constructor(config: AgentConfig = AUTONOMY_EXPANSION_CONFIG) {
    super(config);
  }

  protected async onInitialize(): Promise<void> {
    eventBus.subscribe('ApprovalRequested', async (event) => {
      await memoryManager.store({
        content: `ApprovalRequested: level=${String(event.payload['level'] ?? '')} title="${String(event.payload['title'] ?? '')}"`,
        source: this.name,
        agentId: this.id,
        metadata: { type: 'approval_pattern', level: event.payload['level'] },
      });
    }, this.id);

    eventBus.subscribe('ApprovalGranted', async (event) => {
      await memoryManager.store({
        content: `ApprovalGranted: requestId=${String(event.payload['requestId'] ?? '')} level=${String(event.payload['level'] ?? '')}`,
        source: this.name,
        agentId: this.id,
        metadata: { type: 'approval_granted', level: event.payload['level'] },
      });
    }, this.id);

    eventBus.subscribe('ApprovalDenied', async (event) => {
      await memoryManager.store({
        content: `ApprovalDenied: requestId=${String(event.payload['requestId'] ?? '')} level=${String(event.payload['level'] ?? '')}`,
        source: this.name,
        agentId: this.id,
        metadata: { type: 'approval_denied', level: event.payload['level'] },
      });
    }, this.id);

    eventBus.subscribe('TechDebtReport', async (event) => {
      const score = (event.payload['totalDebtScore'] as number) ?? 0;
      if (score > 60) {
        this.logger.warn('High tech debt blocking autonomy expansion', { score });
      }
      await memoryManager.store({
        content: `TechDebtReport: debtScore=${String(score)} — potential autonomy blocker`,
        source: this.name,
        agentId: this.id,
        metadata: { type: 'tech_blocker', debtScore: score },
      });
    }, this.id);

    eventBus.subscribe('EmbeddingsDeprecated', async (event) => {
      this.logger.warn('Stale knowledge base — autonomy limited', { freshnessScore: event.payload['freshnessScore'] });
      await memoryManager.store({
        content: `EmbeddingsDeprecated: stale=${String(event.payload['staleCount'] ?? 0)} expired=${String(event.payload['expiredCount'] ?? 0)}`,
        source: this.name,
        agentId: this.id,
        metadata: { type: 'knowledge_blocker' },
      });
    }, this.id);

    eventBus.subscribe('GlobalStateUpdate', async (event) => {
      await memoryManager.store({
        content: `GlobalStateUpdate: autonomyScore=${String(event.payload['autonomyScore'] ?? 'unknown')}`,
        source: this.name,
        agentId: this.id,
        metadata: { type: 'global_state' },
      });
    }, this.id);

    this.logger.info('Autonomy Expansion Agent initialized — maximizing system autonomy');
  }

  protected async onExecute(task: AgentTask): Promise<Record<string, unknown>> {
    const taskType = (task.payload['taskType'] as AutonomyTaskType | undefined) ?? 'assess-autonomy';

    switch (taskType) {
      case 'assess-autonomy':
        return this.handleAssessAutonomy();
      case 'find-blockers':
        return this.handleFindBlockers();
      case 'design-automation':
        return this.handleDesignAutomation(task);
      case 'expand-capabilities':
        return this.handleExpandCapabilities();
      case 'upgrade-autonomy':
        return this.handleUpgradeAutonomy(task);
      default:
        return { error: `Unknown autonomy expansion task: ${String(taskType)}` };
    }
  }

  protected async onEvent(event: SystemEvent): Promise<void> {
    if (event.type === 'ApprovalRequested') {
      this.logger.debug('Human dependency detected — tracking for autonomy analysis', { eventId: event.id });
    }
  }

  protected async onShutdown(): Promise<void> {
    eventBus.unsubscribe('ApprovalRequested', this.id);
    eventBus.unsubscribe('ApprovalGranted', this.id);
    eventBus.unsubscribe('ApprovalDenied', this.id);
    eventBus.unsubscribe('TechDebtReport', this.id);
    eventBus.unsubscribe('EmbeddingsDeprecated', this.id);
    eventBus.unsubscribe('GlobalStateUpdate', this.id);
    this.logger.info('Autonomy Expansion Agent shut down');
  }

  private async handleAssessAutonomy(): Promise<Record<string, unknown>> {
    const state = stateManager.getState();
    const pendingApprovals = humanOverride.getPendingApprovals();

    const approvalPatterns = await memoryManager.search({
      query: 'ApprovalRequested ApprovalGranted ApprovalDenied level',
      topK: 30,
      agentId: this.id,
      minScore: 0.3,
    });

    const assessment = assessAutonomy(state.autonomy_score, {});

    const prompt = AUTONOMY_ASSESSMENT_TEMPLATE
      .replace('{currentScore}', String(state.autonomy_score))
      .replace('{pendingApprovals}', String(pendingApprovals.length))
      .replace('{manualProcesses}', approvalPatterns.map((r) => r.entry.content).join(' | ') || 'None detected')
      .replace('{systemReliability}', 'Based on current reports');

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    return {
      action: 'assess-autonomy',
      assessment,
      pendingApprovals: pendingApprovals.length,
      approvalPatternsAnalyzed: approvalPatterns.length,
      llmAnalysis: response.content,
      tokensUsed: response.totalTokens,
    };
  }

  private async handleFindBlockers(): Promise<Record<string, unknown>> {
    const state = stateManager.getState();

    const approvalHistory = await memoryManager.search({
      query: 'ApprovalRequested approval level',
      topK: 30,
      agentId: this.id,
      minScore: 0.3,
    });

    const techBlockers = await memoryManager.search({
      query: 'TechDebtReport debt blocker',
      topK: 10,
      agentId: this.id,
      minScore: 0.3,
    });

    const knowledgeBlockers = await memoryManager.search({
      query: 'EmbeddingsDeprecated stale knowledge',
      topK: 10,
      agentId: this.id,
      minScore: 0.3,
    });

    const blockers = identifyBlockers([], state.blocked_tasks);

    const prompt = BLOCKER_ANALYSIS_TEMPLATE
      .replace('{approvalHistory}', approvalHistory.map((r) => r.entry.content).join(' | ') || 'None')
      .replace('{blockedTasks}', state.blocked_tasks.join(', ') || 'None')
      .replace('{techLimitations}', techBlockers.map((r) => r.entry.content).join(' | ') || 'None')
      .replace('{knowledgeQuality}', knowledgeBlockers.map((r) => r.entry.content).join(' | ') || 'No issues');

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    const result = {
      action: 'find-blockers',
      blockers,
      approvalPatternsAnalyzed: approvalHistory.length,
      techBlockersFound: techBlockers.length,
      knowledgeBlockersFound: knowledgeBlockers.length,
      llmAnalysis: response.content,
      tokensUsed: response.totalTokens,
    };

    await eventBus.publish('AutonomyBlockerFound', this.id, result);
    return result;
  }

  private async handleDesignAutomation(task: AgentTask): Promise<Record<string, unknown>> {
    const process = String(task.payload['process'] ?? 'general process');
    const currentState = String(task.payload['currentState'] ?? 'manual');
    const replacesApproval = Boolean(task.payload['replacesApproval']);

    const automation = designAutomation(process, currentState);

    const prompt = AUTOMATION_DESIGN_TEMPLATE
      .replace('{process}', process)
      .replace('{currentState}', currentState)
      .replace('{requestVolume}', String(task.payload['requestVolume'] ?? 'unknown'))
      .replace('{risks}', String(task.payload['risks'] ?? 'standard'));

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    if (replacesApproval) {
      await humanOverride.requestApproval(
        'STRATEGIC',
        `Automation replacing approval process: ${process}`,
        `Proposed automation to replace manual approval: ${process}. Current state: ${currentState}`,
        this.id,
        { automation, process },
      );
    }

    const result = {
      action: 'design-automation',
      automation,
      process,
      currentState,
      replacesApproval,
      llmDesign: response.content,
      tokensUsed: response.totalTokens,
    };

    await eventBus.publish('AutomationCreated', this.id, result);
    return result;
  }

  private async handleExpandCapabilities(): Promise<Record<string, unknown>> {
    const entries = agentRegistry.getAllEntries();
    const currentCapabilities = entries.flatMap((e) => e.capabilities);

    const gaps = await memoryManager.search({
      query: 'blocker limitation missing capability',
      topK: 15,
      agentId: this.id,
      minScore: 0.3,
    });

    const prompt = CAPABILITY_EXPANSION_TEMPLATE
      .replace('{currentCapabilities}', currentCapabilities.join(', '))
      .replace('{gaps}', gaps.map((r) => r.entry.content).join(' | ') || 'None identified')
      .replace('{marketTrends}', 'Based on current strategy analysis');

    const response = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: this.systemPrompt,
      userMessage: prompt,
    });

    const result = {
      action: 'expand-capabilities',
      currentCapabilityCount: currentCapabilities.length,
      gapsAnalyzed: gaps.length,
      llmProposals: response.content,
      tokensUsed: response.totalTokens,
    };

    await eventBus.publish('UpgradeDrafted', this.id, result);
    return result;
  }

  private async handleUpgradeAutonomy(task: AgentTask): Promise<Record<string, unknown>> {
    const state = stateManager.getState();
    const currentScore = state.autonomy_score;
    const targetScore = (task.payload['targetScore'] as number) ?? currentScore + 5;
    const changes = (task.payload['changes'] as string[]) ?? [];

    const upgrade = draftAutonomyUpgrade(currentScore, targetScore, changes);

    // Autonomy upgrades always require strategic approval
    await humanOverride.requestApproval(
      'STRATEGIC',
      `Autonomy Level Increase: ${currentScore} → ${targetScore}`,
      `Proposed autonomy score increase from ${currentScore} to ${targetScore}. Changes: ${changes.join(', ') || 'LLM-determined'}`,
      this.id,
      { upgrade, currentScore, targetScore },
    );

    // Update state (in real system, would wait for approval)
    await stateManager.update((s) => {
      s.autonomy_score = targetScore;
    });

    const result = {
      action: 'upgrade-autonomy',
      upgrade,
      previousScore: currentScore,
      newScore: targetScore,
    };

    await eventBus.publish('AutonomyLevelIncreased', this.id, result);
    return result;
  }
}
