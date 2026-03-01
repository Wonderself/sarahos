import { logger } from '../../utils/logger';
import { stateManager } from '../state/state-manager';
import { agentRegistry } from '../agent-registry/agent-registry';
import { dbClient } from '../../infra/database/db-client';
import { redisClient } from '../../infra/redis/redis-client';

export interface AutonomyFactor {
  name: string;
  maxPoints: number;
  currentPoints: number;
  details: string;
}

export interface AutonomyBlockerInfo {
  id: string;
  category: 'infrastructure' | 'reliability' | 'automation' | 'improvement';
  description: string;
  impact: number;
  suggestion: string;
}

export interface AutonomyReport {
  score: number;
  factors: AutonomyFactor[];
  blockers: AutonomyBlockerInfo[];
  upgrades: string[];
  timestamp: string;
}

export class AutonomyEngine {
  calculateScore(): number {
    const factors = this.getFactors();
    return factors.reduce((sum, f) => sum + f.currentPoints, 0);
  }

  getFactors(): AutonomyFactor[] {
    return [
      this.calculatePersistenceFactor(),
      this.calculateAgentHealthFactor(),
      this.calculateAutomationFactor(),
      this.calculateSelfImprovementFactor(),
    ];
  }

  private calculatePersistenceFactor(): AutonomyFactor {
    let points = 0;
    const details: string[] = [];

    if (dbClient.isConnected()) {
      points += 13;
      details.push('PostgreSQL connected');
    } else {
      details.push('PostgreSQL NOT connected');
    }

    if (redisClient.isConnected()) {
      points += 12;
      details.push('Redis connected');
    } else {
      details.push('Redis NOT connected');
    }

    return {
      name: 'persistence_factor',
      maxPoints: 25,
      currentPoints: points,
      details: details.join(', '),
    };
  }

  private calculateAgentHealthFactor(): AutonomyFactor {
    const entries = agentRegistry.getAllEntries();
    const total = Math.max(entries.length, 1);
    const healthy = entries.filter((e) => e.status === 'IDLE' || e.status === 'BUSY').length;
    const ratio = healthy / total;
    const points = Math.round(ratio * 25);

    return {
      name: 'agent_health_factor',
      maxPoints: 25,
      currentPoints: points,
      details: `${healthy}/${total} agents healthy (${Math.round(ratio * 100)}%)`,
    };
  }

  private calculateAutomationFactor(): AutonomyFactor {
    const state = stateManager.getState();
    let points = 0;
    const details: string[] = [];

    // No blocked tasks = good automation
    if (state.blocked_tasks.length === 0) {
      points += 10;
      details.push('No blocked tasks');
    } else {
      details.push(`${state.blocked_tasks.length} blocked tasks`);
    }

    // No tasks in progress requiring manual intervention
    if (state.tasks_in_progress.length <= 3) {
      points += 8;
      details.push('Task queue manageable');
    } else {
      details.push(`${state.tasks_in_progress.length} tasks in progress`);
    }

    // Avatar pipeline operational
    if (state.avatar_system.pipeline_latency_avg_ms > 0 || state.avatar_system.asr_requests_today > 0) {
      points += 7;
      details.push('Avatar pipeline active');
    } else {
      details.push('Avatar pipeline idle');
    }

    return {
      name: 'automation_factor',
      maxPoints: 25,
      currentPoints: points,
      details: details.join(', '),
    };
  }

  private calculateSelfImprovementFactor(): AutonomyFactor {
    const state = stateManager.getState();
    let points = 0;
    const details: string[] = [];

    // Self-improvement loop has run
    if (state.last_self_improvement_cycle) {
      points += 15;
      details.push(`Last cycle: ${state.last_self_improvement_cycle}`);
    } else {
      details.push('No improvement cycle executed yet');
    }

    // Known bugs handled
    if (state.known_bugs.length === 0) {
      points += 10;
      details.push('No known bugs');
    } else {
      points += Math.max(0, 10 - state.known_bugs.length * 2);
      details.push(`${state.known_bugs.length} known bugs`);
    }

    return {
      name: 'self_improvement_factor',
      maxPoints: 25,
      currentPoints: Math.min(25, points),
      details: details.join(', '),
    };
  }

  identifyRealBlockers(): AutonomyBlockerInfo[] {
    const blockers: AutonomyBlockerInfo[] = [];
    const state = stateManager.getState();

    // Infrastructure blockers
    if (!dbClient.isConnected()) {
      blockers.push({
        id: 'no-database',
        category: 'infrastructure',
        description: 'PostgreSQL database not connected — no data persistence',
        impact: 13,
        suggestion: 'Start PostgreSQL via docker-compose and configure DATABASE_URL',
      });
    }

    if (!redisClient.isConnected()) {
      blockers.push({
        id: 'no-redis',
        category: 'infrastructure',
        description: 'Redis not connected — no cross-process event distribution',
        impact: 12,
        suggestion: 'Start Redis via docker-compose and configure REDIS_URL',
      });
    }

    // Reliability blockers
    const entries = agentRegistry.getAllEntries();
    const errorAgents = entries.filter((e) => e.status === 'ERROR');
    if (errorAgents.length > 0) {
      blockers.push({
        id: 'agents-in-error',
        category: 'reliability',
        description: `${errorAgents.length} agent(s) in ERROR state: ${errorAgents.map((a) => a.name).join(', ')}`,
        impact: Math.min(15, errorAgents.length * 5),
        suggestion: 'Investigate agent errors and restart affected agents',
      });
    }

    // Automation blockers
    if (state.blocked_tasks.length > 0) {
      blockers.push({
        id: 'blocked-tasks',
        category: 'automation',
        description: `${state.blocked_tasks.length} task(s) blocked requiring manual intervention`,
        impact: state.blocked_tasks.length * 3,
        suggestion: 'Review and resolve blocked tasks to enable autonomous execution',
      });
    }

    // Improvement blockers
    if (!state.last_self_improvement_cycle) {
      blockers.push({
        id: 'no-improvement-cycle',
        category: 'improvement',
        description: 'Self-improvement loop has never executed',
        impact: 15,
        suggestion: 'Enable recurring scheduler with self-improvement task',
      });
    }

    return blockers;
  }

  proposeAutonomyUpgrades(): string[] {
    const blockers = this.identifyRealBlockers();
    return blockers.map((b) => b.suggestion);
  }

  getAutonomyReport(): AutonomyReport {
    const factors = this.getFactors();
    const score = factors.reduce((sum, f) => sum + f.currentPoints, 0);
    const blockers = this.identifyRealBlockers();
    const upgrades = this.proposeAutonomyUpgrades();

    logger.info('Autonomy report generated', { score, blockerCount: blockers.length });

    return {
      score,
      factors,
      blockers,
      upgrades,
      timestamp: new Date().toISOString(),
    };
  }
}

export const autonomyEngine = new AutonomyEngine();
