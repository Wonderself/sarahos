import fs from 'fs/promises';
import path from 'path';
import { logger } from '../../utils/logger';
import type { SystemState } from './state.types';

const STATE_FILE = path.resolve(process.cwd(), 'state', 'SYSTEM_STATE.json');

export class StateManager {
  private state: SystemState | null = null;

  async load(): Promise<SystemState> {
    try {
      const raw = await fs.readFile(STATE_FILE, 'utf-8');
      this.state = JSON.parse(raw) as SystemState;
      logger.info('System state loaded', { phase: this.state.current_phase });
      return this.state;
    } catch (error) {
      logger.error('Failed to load system state', { error });
      throw error;
    }
  }

  getState(): SystemState {
    if (!this.state) {
      throw new Error('State not loaded. Call load() first.');
    }
    return this.state;
  }

  async save(): Promise<void> {
    if (!this.state) {
      throw new Error('No state to save. Call load() first.');
    }

    this.state.timestamp = new Date().toISOString();

    const tempFile = `${STATE_FILE}.tmp`;
    try {
      await fs.writeFile(tempFile, JSON.stringify(this.state, null, 2), 'utf-8');
      await fs.rename(tempFile, STATE_FILE);
      logger.debug('System state saved');
    } catch (error) {
      // Clean up temp file on failure
      try {
        await fs.unlink(tempFile);
      } catch {
        // Ignore cleanup errors
      }
      throw error;
    }
  }

  async update(updater: (state: SystemState) => void): Promise<SystemState> {
    if (!this.state) {
      await this.load();
    }
    updater(this.state!);
    await this.save();
    return this.state!;
  }

  async addTaskInProgress(taskId: string): Promise<void> {
    await this.update((state) => {
      if (!state.tasks_in_progress.includes(taskId)) {
        state.tasks_in_progress.push(taskId);
      }
    });
  }

  async completeTask(taskId: string): Promise<void> {
    await this.update((state) => {
      state.tasks_in_progress = state.tasks_in_progress.filter((id) => id !== taskId);
    });
  }

  async blockTask(taskId: string): Promise<void> {
    await this.update((state) => {
      state.tasks_in_progress = state.tasks_in_progress.filter((id) => id !== taskId);
      if (!state.blocked_tasks.includes(taskId)) {
        state.blocked_tasks.push(taskId);
      }
    });
  }

  async addBug(bug: string): Promise<void> {
    await this.update((state) => {
      if (!state.known_bugs.includes(bug)) {
        state.known_bugs.push(bug);
      }
    });
  }

  async updateTokenBurn(agentName: string, tokens: number): Promise<void> {
    await this.update((state) => {
      const current = state.api_token_burn_rate.by_agent[agentName] ?? 0;
      state.api_token_burn_rate.by_agent[agentName] = current + tokens;
    });
  }
}

export const stateManager = new StateManager();
