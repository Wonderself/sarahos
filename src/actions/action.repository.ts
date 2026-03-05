import { v4 as uuidv4 } from 'uuid';
import { dbClient } from '../infra';
import { logger } from '../utils/logger';
import type { Action, CreateActionInput, UpdateActionInput, ActionFilters, ActionStats } from './action.types';

function rowToAction(row: Record<string, unknown>): Action {
  return {
    id: row['id'] as string,
    userId: row['user_id'] as string,
    projectId: (row['project_id'] as string) ?? null,
    workspaceId: (row['workspace_id'] as string) ?? null,
    type: row['type'] as Action['type'],
    title: row['title'] as string,
    description: (row['description'] as string) ?? '',
    status: row['status'] as Action['status'],
    priority: row['priority'] as Action['priority'],
    sourceAgent: (row['source_agent'] as string) ?? null,
    sourceConversationId: (row['source_conversation_id'] as string) ?? null,
    sourceMessageIndex: row['source_message_index'] != null ? Number(row['source_message_index']) : null,
    assignedTo: (row['assigned_to'] as string) ?? null,
    dueDate: row['due_date'] ? new Date(row['due_date'] as string) : null,
    reminderAt: row['reminder_at'] ? new Date(row['reminder_at'] as string) : null,
    scheduledAt: row['scheduled_at'] ? new Date(row['scheduled_at'] as string) : null,
    payload: (row['payload'] as Record<string, unknown>) ?? {},
    completedAt: row['completed_at'] ? new Date(row['completed_at'] as string) : null,
    result: (row['result'] as Record<string, unknown>) ?? null,
    createdAt: new Date(row['created_at'] as string),
    updatedAt: new Date(row['updated_at'] as string),
  };
}

class ActionRepository {
  async create(userId: string, input: CreateActionInput): Promise<Action | null> {
    if (!dbClient.isConnected()) return null;

    const id = uuidv4();
    try {
      const result = await dbClient.query(
        `INSERT INTO actions (id, user_id, type, title, description, priority, status,
          source_agent, source_conversation_id, source_message_index,
          assigned_to, due_date, reminder_at, scheduled_at, payload, project_id, workspace_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
         RETURNING *`,
        [
          id, userId, input.type, input.title, input.description ?? '',
          input.priority ?? 'medium', 'proposed',
          input.sourceAgent ?? null, input.sourceConversationId ?? null,
          input.sourceMessageIndex ?? null, input.assignedTo ?? null,
          input.dueDate ?? null, input.reminderAt ?? null, input.scheduledAt ?? null,
          JSON.stringify(input.payload ?? {}), input.projectId ?? null, input.workspaceId ?? null,
        ],
      );
      return result.rows[0] ? rowToAction(result.rows[0] as Record<string, unknown>) : null;
    } catch (error) {
      logger.error('Failed to create action', { userId, title: input.title, error });
      return null;
    }
  }

  async createBatch(userId: string, inputs: CreateActionInput[]): Promise<Action[]> {
    if (!dbClient.isConnected() || inputs.length === 0) return [];

    const actions: Action[] = [];
    for (const input of inputs) {
      const action = await this.create(userId, input);
      if (action) actions.push(action);
    }
    return actions;
  }

  async getById(id: string, userId: string): Promise<Action | null> {
    if (!dbClient.isConnected()) return null;

    const result = await dbClient.query(
      'SELECT * FROM actions WHERE id = $1 AND user_id = $2',
      [id, userId],
    );
    return result.rows[0] ? rowToAction(result.rows[0] as Record<string, unknown>) : null;
  }

  async listByUser(userId: string, filters: ActionFilters = {}): Promise<Action[]> {
    if (!dbClient.isConnected()) return [];

    const conditions = ['user_id = $1'];
    const values: unknown[] = [userId];
    let paramIdx = 2;

    if (filters.status) {
      conditions.push(`status = $${paramIdx}`);
      values.push(filters.status);
      paramIdx++;
    }
    if (filters.type) {
      conditions.push(`type = $${paramIdx}`);
      values.push(filters.type);
      paramIdx++;
    }
    if (filters.priority) {
      conditions.push(`priority = $${paramIdx}`);
      values.push(filters.priority);
      paramIdx++;
    }
    if (filters.from) {
      conditions.push(`created_at >= $${paramIdx}`);
      values.push(filters.from);
      paramIdx++;
    }
    if (filters.to) {
      conditions.push(`created_at <= $${paramIdx}`);
      values.push(filters.to);
      paramIdx++;
    }
    if (filters.assignedTo) {
      conditions.push(`assigned_to = $${paramIdx}`);
      values.push(filters.assignedTo);
      paramIdx++;
    }
    if (filters.workspaceId) {
      conditions.push(`workspace_id = $${paramIdx}`);
      values.push(filters.workspaceId);
      paramIdx++;
    }
    if (filters.projectId) {
      conditions.push(`project_id = $${paramIdx}`);
      values.push(filters.projectId);
      paramIdx++;
    }

    const limit = Math.min(filters.limit ?? 100, 500);
    const offset = filters.offset ?? 0;

    const result = await dbClient.query(
      `SELECT * FROM actions WHERE ${conditions.join(' AND ')}
       ORDER BY
         CASE priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
         due_date ASC NULLS LAST,
         created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      values,
    );
    return result.rows.map((row) => rowToAction(row as Record<string, unknown>));
  }

  async update(id: string, userId: string, input: UpdateActionInput): Promise<Action | null> {
    if (!dbClient.isConnected()) return null;

    const fieldMap: Record<string, string> = {
      title: 'title',
      description: 'description',
      status: 'status',
      priority: 'priority',
      assignedTo: 'assigned_to',
      dueDate: 'due_date',
      reminderAt: 'reminder_at',
      scheduledAt: 'scheduled_at',
      payload: 'payload',
      result: 'result',
    };

    const setClauses: string[] = ['updated_at = NOW()'];
    const values: unknown[] = [];
    let paramIdx = 1;

    for (const [key, value] of Object.entries(input)) {
      const col = fieldMap[key];
      if (!col) continue;
      setClauses.push(`${col} = $${paramIdx}`);
      values.push(typeof value === 'object' && value !== null ? JSON.stringify(value) : value);
      paramIdx++;
    }

    // Auto-set completed_at when status changes to completed
    if (input.status === 'completed') {
      setClauses.push(`completed_at = NOW()`);
    }

    values.push(id, userId);
    const result = await dbClient.query(
      `UPDATE actions SET ${setClauses.join(', ')} WHERE id = $${paramIdx} AND user_id = $${paramIdx + 1} RETURNING *`,
      values,
    );
    return result.rows[0] ? rowToAction(result.rows[0] as Record<string, unknown>) : null;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    if (!dbClient.isConnected()) return false;

    try {
      const result = await dbClient.query(
        `UPDATE actions SET status = 'cancelled', updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING id`,
        [id, userId],
      );
      return (result.rows.length ?? 0) > 0;
    } catch (error) {
      logger.error('Failed to cancel action', { id, userId, error });
      return false;
    }
  }

  async getStats(userId: string, workspaceId?: string): Promise<ActionStats> {
    if (!dbClient.isConnected()) {
      return { total: 0, proposed: 0, accepted: 0, inProgress: 0, completed: 0, cancelled: 0, deferred: 0, overdue: 0 };
    }

    const conditions = ['user_id = $1'];
    const values: unknown[] = [userId];
    if (workspaceId) {
      conditions.push('workspace_id = $2');
      values.push(workspaceId);
    }

    const where = conditions.join(' AND ');
    const result = await dbClient.query(
      `SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'proposed') as proposed,
        COUNT(*) FILTER (WHERE status = 'accepted') as accepted,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
        COUNT(*) FILTER (WHERE status = 'deferred') as deferred,
        COUNT(*) FILTER (WHERE due_date < NOW() AND status NOT IN ('completed', 'cancelled')) as overdue
       FROM actions WHERE ${where}`,
      values,
    );

    const row = result.rows[0] as Record<string, unknown> | undefined;
    if (!row) {
      return { total: 0, proposed: 0, accepted: 0, inProgress: 0, completed: 0, cancelled: 0, deferred: 0, overdue: 0 };
    }

    return {
      total: Number(row['total'] ?? 0),
      proposed: Number(row['proposed'] ?? 0),
      accepted: Number(row['accepted'] ?? 0),
      inProgress: Number(row['in_progress'] ?? 0),
      completed: Number(row['completed'] ?? 0),
      cancelled: Number(row['cancelled'] ?? 0),
      deferred: Number(row['deferred'] ?? 0),
      overdue: Number(row['overdue'] ?? 0),
    };
  }

  async getDueActions(beforeDate: Date): Promise<Action[]> {
    if (!dbClient.isConnected()) return [];

    const result = await dbClient.query(
      `SELECT * FROM actions
       WHERE reminder_at <= $1
         AND status NOT IN ('completed', 'cancelled')
       ORDER BY reminder_at ASC
       LIMIT 100`,
      [beforeDate.toISOString()],
    );
    return result.rows.map((row) => rowToAction(row as Record<string, unknown>));
  }

  async getOverdueActions(): Promise<Action[]> {
    if (!dbClient.isConnected()) return [];

    const result = await dbClient.query(
      `SELECT * FROM actions
       WHERE due_date < NOW()
         AND status NOT IN ('completed', 'cancelled')
       ORDER BY due_date ASC
       LIMIT 100`,
    );
    return result.rows.map((row) => rowToAction(row as Record<string, unknown>));
  }
}

export const actionRepository = new ActionRepository();
