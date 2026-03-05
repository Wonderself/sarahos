import { actionRepository } from './action.repository';
import { logger } from '../utils/logger';
import type {
  Action, CreateActionInput, UpdateActionInput, ActionFilters, ActionStats,
} from './action.types';

class ActionService {
  async createAction(userId: string, input: CreateActionInput): Promise<Action | null> {
    if (!input.title || input.title.trim().length === 0) {
      logger.warn('Action creation failed: title required', { userId });
      return null;
    }
    if (input.title.trim().length > 200) {
      logger.warn('Action creation failed: title too long', { userId });
      return null;
    }

    return actionRepository.create(userId, {
      ...input,
      title: input.title.trim(),
      description: input.description?.trim(),
    });
  }

  async createBatch(userId: string, inputs: CreateActionInput[]): Promise<Action[]> {
    const valid = inputs.filter((i) => i.title && i.title.trim().length > 0 && i.title.trim().length <= 200);
    if (valid.length === 0) return [];

    return actionRepository.createBatch(userId, valid.map((i) => ({
      ...i,
      title: i.title.trim(),
      description: i.description?.trim(),
    })));
  }

  async getAction(id: string, userId: string): Promise<Action | null> {
    return actionRepository.getById(id, userId);
  }

  async listActions(userId: string, filters: ActionFilters = {}): Promise<Action[]> {
    return actionRepository.listByUser(userId, filters);
  }

  async updateAction(id: string, userId: string, input: UpdateActionInput): Promise<Action | null> {
    if (input.title !== undefined) {
      if (input.title.trim().length === 0 || input.title.trim().length > 200) {
        logger.warn('Action update failed: invalid title', { id, userId });
        return null;
      }
      input.title = input.title.trim();
    }

    return actionRepository.update(id, userId, input);
  }

  async acceptProposal(id: string, userId: string): Promise<Action | null> {
    return actionRepository.update(id, userId, { status: 'accepted' });
  }

  async startAction(id: string, userId: string): Promise<Action | null> {
    return actionRepository.update(id, userId, { status: 'in_progress' });
  }

  async completeAction(id: string, userId: string, result?: Record<string, unknown>): Promise<Action | null> {
    return actionRepository.update(id, userId, { status: 'completed', result });
  }

  async deferAction(id: string, userId: string, newDueDate: string): Promise<Action | null> {
    return actionRepository.update(id, userId, { status: 'deferred', dueDate: newDueDate });
  }

  async cancelAction(id: string, userId: string): Promise<boolean> {
    return actionRepository.delete(id, userId);
  }

  async getStats(userId: string, workspaceId?: string): Promise<ActionStats> {
    return actionRepository.getStats(userId, workspaceId);
  }

  async getDueActions(beforeDate: Date): Promise<Action[]> {
    return actionRepository.getDueActions(beforeDate);
  }

  async getOverdueActions(): Promise<Action[]> {
    return actionRepository.getOverdueActions();
  }
}

export const actionService = new ActionService();
