import { v4 as uuidv4 } from 'uuid';
import { dbClient } from '../infra';
import { logger } from '../utils/logger';

export const ALLOWED_NAMESPACES = [
  'journee', 'journee_visibility',
  'chat_history', 'chat_faq',
  'strategy', 'strategy_project',
  'social_posts', 'social_calendar',
  'documents',
  'agent_configs',
  'marketplace_installed',
  'personal_agents_active',
  // Actions & Workspace
  'actions',
  'workspace_actions',
  'workspace_members',
  'workspace_activity',
] as const;

export type UserDataNamespace = typeof ALLOWED_NAMESPACES[number];

class UserDataRepository {
  isAllowedNamespace(ns: string): ns is UserDataNamespace {
    return (ALLOWED_NAMESPACES as readonly string[]).includes(ns);
  }

  async get(userId: string, namespace: UserDataNamespace): Promise<unknown | null> {
    if (!dbClient.isConnected()) return null;
    try {
      const result = await dbClient.query(
        'SELECT data FROM user_data WHERE user_id = $1 AND namespace = $2',
        [userId, namespace],
      );
      return result.rows[0]?.['data'] ?? null;
    } catch (error) {
      logger.error('user_data get failed', { userId, namespace, error });
      return null;
    }
  }

  async upsert(userId: string, namespace: UserDataNamespace, data: unknown): Promise<boolean> {
    if (!dbClient.isConnected()) return false;
    try {
      await dbClient.query(
        `INSERT INTO user_data (id, user_id, namespace, data, updated_at)
         VALUES ($1, $2, $3, $4::jsonb, NOW())
         ON CONFLICT (user_id, namespace)
         DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
        [uuidv4(), userId, namespace, JSON.stringify(data)],
      );
      return true;
    } catch (error) {
      logger.error('user_data upsert failed', { userId, namespace, error });
      return false;
    }
  }

  async delete(userId: string, namespace: UserDataNamespace): Promise<void> {
    if (!dbClient.isConnected()) return;
    try {
      await dbClient.query(
        'DELETE FROM user_data WHERE user_id = $1 AND namespace = $2',
        [userId, namespace],
      );
    } catch (error) {
      logger.error('user_data delete failed', { userId, namespace, error });
    }
  }
}

export const userDataRepository = new UserDataRepository();
