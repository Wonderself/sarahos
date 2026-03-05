import { v4 as uuidv4 } from 'uuid';
import { dbClient } from '../infra';
import { logger } from '../utils/logger';

export interface UserDocument {
  id: string;
  userId: string;
  agentContext: string;
  filename: string;
  originalFilename: string;
  fileType: string;
  mimeType: string;
  sizeBytes: number;
  contentText: string | null;
  tokenEstimate: number;
  metadata: Record<string, unknown>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDocumentInput {
  userId: string;
  agentContext?: string;
  originalFilename: string;
  fileType: string;
  mimeType: string;
  sizeBytes: number;
  contentText: string | null;
  tokenEstimate: number;
  metadata?: Record<string, unknown>;
}

function rowToDocument(row: Record<string, unknown>): UserDocument {
  return {
    id: row['id'] as string,
    userId: row['user_id'] as string,
    agentContext: row['agent_context'] as string,
    filename: row['filename'] as string,
    originalFilename: row['original_filename'] as string,
    fileType: row['file_type'] as string,
    mimeType: row['mime_type'] as string,
    sizeBytes: row['size_bytes'] as number,
    contentText: (row['content_text'] as string) ?? null,
    tokenEstimate: row['token_estimate'] as number,
    metadata: (row['metadata'] as Record<string, unknown>) ?? {},
    isActive: row['is_active'] as boolean,
    createdAt: new Date(row['created_at'] as string),
    updatedAt: new Date(row['updated_at'] as string),
  };
}

export class DocumentRepository {
  async create(input: CreateDocumentInput): Promise<UserDocument | null> {
    if (!dbClient.isConnected()) {
      logger.warn('DocumentRepository.create: DB not connected');
      return null;
    }

    const filename = `${uuidv4()}_${input.originalFilename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    const result = await dbClient.query(
      `INSERT INTO user_documents
        (user_id, agent_context, filename, original_filename, file_type, mime_type, size_bytes, content_text, token_estimate, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        input.userId,
        input.agentContext ?? 'general',
        filename,
        input.originalFilename,
        input.fileType,
        input.mimeType,
        input.sizeBytes,
        input.contentText,
        input.tokenEstimate,
        JSON.stringify(input.metadata ?? {}),
      ],
    );

    return result.rows[0] ? rowToDocument(result.rows[0] as Record<string, unknown>) : null;
  }

  async getByUser(userId: string, agentContext?: string): Promise<UserDocument[]> {
    if (!dbClient.isConnected()) return [];

    let sql = 'SELECT * FROM user_documents WHERE user_id = $1 AND is_active = TRUE';
    const params: unknown[] = [userId];

    if (agentContext) {
      sql += ' AND agent_context = $2';
      params.push(agentContext);
    }

    sql += ' ORDER BY created_at DESC';
    const result = await dbClient.query(sql, params);
    return result.rows.map(r => rowToDocument(r as Record<string, unknown>));
  }

  async getById(id: string, userId: string): Promise<UserDocument | null> {
    if (!dbClient.isConnected()) return null;

    const result = await dbClient.query(
      'SELECT * FROM user_documents WHERE id = $1 AND user_id = $2',
      [id, userId],
    );

    return result.rows[0] ? rowToDocument(result.rows[0] as Record<string, unknown>) : null;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    if (!dbClient.isConnected()) return false;

    const result = await dbClient.query(
      'DELETE FROM user_documents WHERE id = $1 AND user_id = $2',
      [id, userId],
    );

    return (result.rowCount ?? 0) > 0;
  }

  async getStorageUsed(userId: string): Promise<{ totalBytes: number; docCount: number }> {
    if (!dbClient.isConnected()) return { totalBytes: 0, docCount: 0 };

    const result = await dbClient.query(
      'SELECT COALESCE(SUM(size_bytes), 0)::int AS total_bytes, COUNT(*)::int AS doc_count FROM user_documents WHERE user_id = $1 AND is_active = TRUE',
      [userId],
    );

    const row = result.rows[0] as Record<string, unknown> | undefined;
    return {
      totalBytes: (row?.['total_bytes'] as number) ?? 0,
      docCount: (row?.['doc_count'] as number) ?? 0,
    };
  }

  async getTextForContext(userId: string, agentContext: string, maxTokens: number): Promise<string> {
    if (!dbClient.isConnected()) return '';

    // Get all active docs for context, prioritize by most recent
    const result = await dbClient.query(
      `SELECT original_filename, content_text, token_estimate
       FROM user_documents
       WHERE user_id = $1 AND (agent_context = $2 OR agent_context = 'general') AND is_active = TRUE AND content_text IS NOT NULL
       ORDER BY agent_context DESC, created_at DESC`,
      [userId, agentContext],
    );

    const parts: string[] = [];
    let tokensUsed = 0;

    for (const row of result.rows) {
      const r = row as Record<string, unknown>;
      const estimate = r['token_estimate'] as number;
      const text = r['content_text'] as string;
      const name = r['original_filename'] as string;

      if (tokensUsed + estimate > maxTokens) {
        // Truncate last doc to fit
        const remaining = maxTokens - tokensUsed;
        if (remaining > 100) {
          const truncated = text.slice(0, remaining * 4);
          parts.push(`--- ${name} (tronque) ---\n${truncated}`);
        }
        break;
      }

      parts.push(`--- ${name} ---\n${text}`);
      tokensUsed += estimate;
    }

    return parts.join('\n\n');
  }
}

export const documentRepository = new DocumentRepository();
