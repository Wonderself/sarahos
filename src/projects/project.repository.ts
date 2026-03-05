import { v4 as uuidv4 } from 'uuid';
import { dbClient } from '../infra';
import { logger } from '../utils/logger';
import type { Project, CreateProjectInput, UpdateProjectInput } from './project.types';

function rowToProject(row: Record<string, unknown>): Project {
  return {
    id: row['id'] as string,
    userId: row['user_id'] as string,
    name: row['name'] as string,
    description: (row['description'] as string) ?? '',
    isDefault: row['is_default'] as boolean,
    isActive: row['is_active'] as boolean,
    settings: (row['settings'] as Record<string, unknown>) ?? {},
    createdAt: new Date(row['created_at'] as string),
    updatedAt: new Date(row['updated_at'] as string),
  };
}

class ProjectRepository {
  async listByUser(userId: string): Promise<Project[]> {
    if (!dbClient.isConnected()) return [];

    const result = await dbClient.query(
      'SELECT * FROM projects WHERE user_id = $1 ORDER BY is_default DESC, created_at ASC',
      [userId],
    );
    return result.rows.map((row) => rowToProject(row as Record<string, unknown>));
  }

  async getById(id: string, userId: string): Promise<Project | null> {
    if (!dbClient.isConnected()) return null;

    const result = await dbClient.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [id, userId],
    );
    return result.rows[0] ? rowToProject(result.rows[0] as Record<string, unknown>) : null;
  }

  async getDefaultProject(userId: string): Promise<Project | null> {
    if (!dbClient.isConnected()) return null;

    const result = await dbClient.query(
      'SELECT * FROM projects WHERE user_id = $1 AND is_default = TRUE LIMIT 1',
      [userId],
    );
    return result.rows[0] ? rowToProject(result.rows[0] as Record<string, unknown>) : null;
  }

  async create(userId: string, input: CreateProjectInput): Promise<Project | null> {
    if (!dbClient.isConnected()) return null;

    const id = uuidv4();
    try {
      const result = await dbClient.query(
        `INSERT INTO projects (id, user_id, name, description)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [id, userId, input.name, input.description ?? ''],
      );
      return result.rows[0] ? rowToProject(result.rows[0] as Record<string, unknown>) : null;
    } catch (error) {
      logger.error('Failed to create project', { userId, name: input.name, error });
      return null;
    }
  }

  async update(id: string, userId: string, input: UpdateProjectInput): Promise<Project | null> {
    if (!dbClient.isConnected()) return null;

    const fieldMap: Record<string, string> = {
      name: 'name',
      description: 'description',
      settings: 'settings',
      isActive: 'is_active',
    };

    const setClauses: string[] = ['updated_at = NOW()'];
    const values: unknown[] = [];
    let paramIdx = 1;

    for (const [key, value] of Object.entries(input)) {
      const col = fieldMap[key];
      if (!col) continue;
      setClauses.push(`${col} = $${paramIdx}`);
      values.push(typeof value === 'object' ? JSON.stringify(value) : value);
      paramIdx++;
    }

    values.push(id, userId);
    const result = await dbClient.query(
      `UPDATE projects SET ${setClauses.join(', ')} WHERE id = $${paramIdx} AND user_id = $${paramIdx + 1} RETURNING *`,
      values,
    );
    return result.rows[0] ? rowToProject(result.rows[0] as Record<string, unknown>) : null;
  }

  async setDefault(id: string, userId: string): Promise<boolean> {
    if (!dbClient.isConnected()) return false;

    try {
      // Unset all other defaults for this user
      await dbClient.query(
        'UPDATE projects SET is_default = FALSE, updated_at = NOW() WHERE user_id = $1 AND is_default = TRUE',
        [userId],
      );

      // Set the new default
      const result = await dbClient.query(
        'UPDATE projects SET is_default = TRUE, updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, userId],
      );
      return (result.rows.length ?? 0) > 0;
    } catch (error) {
      logger.error('Failed to set default project', { id, userId, error });
      return false;
    }
  }

  async delete(id: string, userId: string): Promise<boolean> {
    if (!dbClient.isConnected()) return false;

    // Check if it's the default project
    const project = await this.getById(id, userId);
    if (!project) return false;
    if (project.isDefault) return false;

    try {
      const result = await dbClient.query(
        'DELETE FROM projects WHERE id = $1 AND user_id = $2 AND is_default = FALSE RETURNING id',
        [id, userId],
      );
      return (result.rows.length ?? 0) > 0;
    } catch (error) {
      logger.error('Failed to delete project', { id, userId, error });
      return false;
    }
  }

  async createDefaultForUser(userId: string, name?: string): Promise<Project | null> {
    if (!dbClient.isConnected()) return null;

    const id = uuidv4();
    const projectName = name ?? 'Projet principal';
    try {
      const result = await dbClient.query(
        `INSERT INTO projects (id, user_id, name, description, is_default)
         VALUES ($1, $2, $3, $4, TRUE)
         ON CONFLICT (user_id, name) DO UPDATE SET updated_at = NOW()
         RETURNING *`,
        [id, userId, projectName, 'Projet par d\u00e9faut'],
      );
      return result.rows[0] ? rowToProject(result.rows[0] as Record<string, unknown>) : null;
    } catch (error) {
      logger.error('Failed to create default project', { userId, error });
      return null;
    }
  }
}

export const projectRepository = new ProjectRepository();
