import { v4 as uuidv4 } from 'uuid';
import { dbClient } from '../infra';
import { logger } from '../utils/logger';
import type { Campaign, CampaignPost, CreateCampaignInput, UpdateCampaignInput, CreatePostInput } from './campaign.types';

function rowToCampaign(row: Record<string, unknown>): Campaign {
  return {
    id: row['id'] as string,
    userId: row['user_id'] as string,
    title: row['title'] as string,
    description: (row['description'] as string) ?? '',
    status: row['status'] as Campaign['status'],
    campaignType: row['campaign_type'] as Campaign['campaignType'],
    platforms: (row['platforms'] as string[]) ?? [],
    content: (row['content'] as Record<string, unknown>) ?? {},
    schedule: (row['schedule'] as Record<string, unknown>) ?? {},
    targeting: (row['targeting'] as Record<string, unknown>) ?? {},
    budgetCredits: Number(row['budget_credits'] ?? 0),
    spentCredits: Number(row['spent_credits'] ?? 0),
    metrics: (row['metrics'] as Record<string, unknown>) ?? {},
    approvedBy: (row['approved_by'] as string) ?? null,
    approvedAt: row['approved_at'] ? new Date(row['approved_at'] as string) : null,
    createdAt: new Date(row['created_at'] as string),
    updatedAt: new Date(row['updated_at'] as string),
  };
}

function rowToPost(row: Record<string, unknown>): CampaignPost {
  return {
    id: row['id'] as string,
    campaignId: row['campaign_id'] as string,
    userId: row['user_id'] as string,
    platform: row['platform'] as string,
    content: row['content'] as string,
    mediaUrls: (row['media_urls'] as string[]) ?? [],
    hashtags: (row['hashtags'] as string[]) ?? [],
    scheduledAt: row['scheduled_at'] ? new Date(row['scheduled_at'] as string) : null,
    publishedAt: row['published_at'] ? new Date(row['published_at'] as string) : null,
    status: row['status'] as CampaignPost['status'],
    externalPostId: (row['external_post_id'] as string) ?? null,
    metrics: (row['metrics'] as Record<string, unknown>) ?? {},
    errorMessage: (row['error_message'] as string) ?? null,
    createdAt: new Date(row['created_at'] as string),
    updatedAt: new Date(row['updated_at'] as string),
  };
}

export class CampaignService {
  async create(userId: string, input: CreateCampaignInput): Promise<Campaign | null> {
    if (!dbClient.isConnected()) return null;

    const id = uuidv4();
    const result = await dbClient.query(
      `INSERT INTO campaigns (id, user_id, title, description, campaign_type, platforms, content, schedule, targeting, budget_credits)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        id, userId, input.title, input.description ?? '', input.campaignType ?? 'social',
        input.platforms ?? [], JSON.stringify(input.content ?? {}),
        JSON.stringify(input.schedule ?? {}), JSON.stringify(input.targeting ?? {}),
        input.budgetCredits ?? 0,
      ],
    );

    const campaign = result.rows[0] ? rowToCampaign(result.rows[0] as Record<string, unknown>) : null;
    if (campaign) logger.info('Campaign created', { campaignId: id, userId, title: input.title });
    return campaign;
  }

  async getById(id: string): Promise<Campaign | null> {
    if (!dbClient.isConnected()) return null;
    const result = await dbClient.query('SELECT * FROM campaigns WHERE id = $1', [id]);
    return result.rows[0] ? rowToCampaign(result.rows[0] as Record<string, unknown>) : null;
  }

  async listByUser(userId: string, status?: string): Promise<Campaign[]> {
    if (!dbClient.isConnected()) return [];
    let query = 'SELECT * FROM campaigns WHERE user_id = $1';
    const params: unknown[] = [userId];
    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    query += ' ORDER BY created_at DESC';
    const result = await dbClient.query(query, params);
    return result.rows.map((r) => rowToCampaign(r as Record<string, unknown>));
  }

  async update(id: string, input: UpdateCampaignInput): Promise<Campaign | null> {
    if (!dbClient.isConnected()) return null;

    const sets: string[] = ['updated_at = NOW()'];
    const params: unknown[] = [];
    let idx = 1;

    if (input.title !== undefined) { sets.push(`title = $${idx}`); params.push(input.title); idx++; }
    if (input.description !== undefined) { sets.push(`description = $${idx}`); params.push(input.description); idx++; }
    if (input.status !== undefined) { sets.push(`status = $${idx}`); params.push(input.status); idx++; }
    if (input.platforms !== undefined) { sets.push(`platforms = $${idx}`); params.push(input.platforms); idx++; }
    if (input.content !== undefined) { sets.push(`content = $${idx}`); params.push(JSON.stringify(input.content)); idx++; }
    if (input.schedule !== undefined) { sets.push(`schedule = $${idx}`); params.push(JSON.stringify(input.schedule)); idx++; }
    if (input.targeting !== undefined) { sets.push(`targeting = $${idx}`); params.push(JSON.stringify(input.targeting)); idx++; }
    if (input.budgetCredits !== undefined) { sets.push(`budget_credits = $${idx}`); params.push(input.budgetCredits); idx++; }

    params.push(id);
    const result = await dbClient.query(
      `UPDATE campaigns SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      params,
    );
    return result.rows[0] ? rowToCampaign(result.rows[0] as Record<string, unknown>) : null;
  }

  async submitForApproval(id: string): Promise<Campaign | null> {
    return this.update(id, { status: 'pending_approval' });
  }

  async approve(id: string, approvedBy: string): Promise<Campaign | null> {
    if (!dbClient.isConnected()) return null;
    const result = await dbClient.query(
      `UPDATE campaigns SET status = 'approved', approved_by = $1, approved_at = NOW(), updated_at = NOW() WHERE id = $2 RETURNING *`,
      [approvedBy, id],
    );
    const campaign = result.rows[0] ? rowToCampaign(result.rows[0] as Record<string, unknown>) : null;
    if (campaign) logger.info('Campaign approved', { campaignId: id, approvedBy });
    return campaign;
  }

  async delete(id: string): Promise<boolean> {
    if (!dbClient.isConnected()) return false;
    const result = await dbClient.query('DELETE FROM campaigns WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // ── Posts ──

  async createPost(userId: string, input: CreatePostInput): Promise<CampaignPost | null> {
    if (!dbClient.isConnected()) return null;

    const id = uuidv4();
    const result = await dbClient.query(
      `INSERT INTO campaign_posts (id, campaign_id, user_id, platform, content, media_urls, hashtags, scheduled_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [id, input.campaignId, userId, input.platform, input.content, input.mediaUrls ?? [], input.hashtags ?? [], input.scheduledAt ?? null],
    );
    return result.rows[0] ? rowToPost(result.rows[0] as Record<string, unknown>) : null;
  }

  async getPostsByCampaign(campaignId: string): Promise<CampaignPost[]> {
    if (!dbClient.isConnected()) return [];
    const result = await dbClient.query(
      'SELECT * FROM campaign_posts WHERE campaign_id = $1 ORDER BY scheduled_at ASC NULLS LAST',
      [campaignId],
    );
    return result.rows.map((r) => rowToPost(r as Record<string, unknown>));
  }

  async updatePostStatus(postId: string, status: string, externalId?: string, errorMessage?: string): Promise<CampaignPost | null> {
    if (!dbClient.isConnected()) return null;

    const sets = [`status = $1`, 'updated_at = NOW()'];
    const params: unknown[] = [status];
    let idx = 2;

    if (status === 'published') { sets.push(`published_at = NOW()`); }
    if (externalId) { sets.push(`external_post_id = $${idx}`); params.push(externalId); idx++; }
    if (errorMessage) { sets.push(`error_message = $${idx}`); params.push(errorMessage); idx++; }

    params.push(postId);
    const result = await dbClient.query(
      `UPDATE campaign_posts SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      params,
    );
    return result.rows[0] ? rowToPost(result.rows[0] as Record<string, unknown>) : null;
  }
}

export const campaignService = new CampaignService();
